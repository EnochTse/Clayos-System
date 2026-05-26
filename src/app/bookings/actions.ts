"use server";

import { redirect } from "next/navigation";

import {
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  refreshGoogleAccessToken,
  updateGoogleCalendarEvent,
} from "@/lib/google-calendar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const bookingStatuses = new Set([
  "draft",
  "confirmed",
  "completed",
  "cancelled",
  "rescheduled",
  "no_show",
  "pending_payment",
]);

function optionalValue(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return value.length > 0 ? value : null;
}

function hongKongDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00+08:00`);
}

async function getCalendarSyncContext(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  ownerId: string,
) {
  const { data: integration } = await supabase
    .from("google_integrations")
    .select(
      "calendar_id, encrypted_access_token, encrypted_refresh_token, token_expiry, active",
    )
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (
    !integration ||
    !integration.active ||
    !integration.encrypted_access_token
  ) {
    return null;
  }

  const now = Date.now();
  const expiry = integration.token_expiry
    ? new Date(integration.token_expiry).getTime()
    : 0;

  let accessToken = integration.encrypted_access_token;

  if (
    integration.encrypted_refresh_token &&
    expiry > 0 &&
    expiry - now < 60_000
  ) {
    try {
      const refreshed = await refreshGoogleAccessToken(
        integration.encrypted_refresh_token,
      );
      accessToken = refreshed.access_token;
      await supabase
        .from("google_integrations")
        .update({
          encrypted_access_token: refreshed.access_token,
          token_expiry: new Date(
            Date.now() + refreshed.expires_in * 1000,
          ).toISOString(),
          scopes: refreshed.scope ? refreshed.scope.split(" ") : [],
        })
        .eq("owner_id", ownerId);
    } catch {
      return null;
    }
  }

  return {
    accessToken,
    calendarId: integration.calendar_id || "primary",
  };
}

async function buildBookingCalendarPayload(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  booking: {
    id: string;
    student_id: string;
    course_id: string | null;
    start_at: string;
    end_at: string;
    notes: string | null;
    status: string;
  },
) {
  const [{ data: student }, { data: course }] = await Promise.all([
    supabase
      .from("students")
      .select("display_name, phone, whatsapp_number")
      .eq("id", booking.student_id)
      .maybeSingle(),
    booking.course_id
      ? supabase
          .from("courses")
          .select("name_zh")
          .eq("id", booking.course_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const studentName = student?.display_name ?? "未命名學生";
  const courseName = course?.name_zh ?? "其他 / TBC";
  const title = `Clayos｜${studentName}｜${courseName}`;
  const description = [
    `Student: ${studentName}`,
    student?.phone ? `Phone: ${student.phone}` : null,
    student?.whatsapp_number ? `WhatsApp: ${student.whatsapp_number}` : null,
    `Course: ${courseName}`,
    `Status: ${booking.status}`,
    `Booking ID: ${booking.id}`,
    booking.notes ? `Notes: ${booking.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    summary: title,
    description,
    start: {
      dateTime: booking.start_at,
      timeZone: "Asia/Hong_Kong",
    },
    end: {
      dateTime: booking.end_at,
      timeZone: "Asia/Hong_Kong",
    },
  };
}

async function syncBookingCalendarEvent(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  ownerId: string,
  booking: {
    id: string;
    student_id: string;
    course_id: string | null;
    start_at: string;
    end_at: string;
    notes: string | null;
    status: string;
    google_calendar_event_id: string | null;
  },
) {
  const context = await getCalendarSyncContext(supabase, ownerId);
  if (!context) {
    return;
  }

  if (booking.status === "confirmed") {
    const payload = await buildBookingCalendarPayload(supabase, booking);
    if (booking.google_calendar_event_id) {
      const updated = await updateGoogleCalendarEvent(
        context.accessToken,
        context.calendarId,
        booking.google_calendar_event_id,
        payload,
      );
      await supabase
        .from("bookings")
        .update({
          google_calendar_link: updated.htmlLink ?? null,
        })
        .eq("id", booking.id);
      return;
    }

    const created = await createGoogleCalendarEvent(
      context.accessToken,
      context.calendarId,
      payload,
    );
    await supabase
      .from("bookings")
      .update({
        google_calendar_event_id: created.id,
        google_calendar_link: created.htmlLink ?? null,
      })
      .eq("id", booking.id);
    return;
  }

  if (booking.status === "cancelled" && booking.google_calendar_event_id) {
    await deleteGoogleCalendarEvent(
      context.accessToken,
      context.calendarId,
      booking.google_calendar_event_id,
    );
    await supabase
      .from("bookings")
      .update({
        google_calendar_event_id: null,
        google_calendar_link: null,
      })
      .eq("id", booking.id);
  }
}

export async function createBooking(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/bookings/new");
  }

  await supabase.rpc("ensure_current_user_profile");

  const studentId = String(formData.get("student_id") ?? "").trim();
  const courseId = optionalValue(formData, "course_id");
  const bookingDate = String(formData.get("booking_date") ?? "").trim();
  const startTime = String(formData.get("start_time") ?? "").trim();
  const endTime = String(formData.get("end_time") ?? "").trim();
  const status = String(formData.get("status") ?? "draft").trim();
  const creditsToDeduct = Number(formData.get("credits_to_deduct") ?? 1);

  if (!studentId) {
    redirect("/bookings/new?error=請選擇學生");
  }

  if (!bookingDate || !startTime || !endTime) {
    redirect("/bookings/new?error=請輸入日期、開始時間和結束時間");
  }

  if (!bookingStatuses.has(status)) {
    redirect("/bookings/new?error=預約狀態不正確");
  }

  if (!Number.isInteger(creditsToDeduct) || creditsToDeduct <= 0) {
    redirect("/bookings/new?error=預計扣堂必須是正整數");
  }

  const startAt = hongKongDateTime(bookingDate, startTime);
  const endAt = hongKongDateTime(bookingDate, endTime);

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    redirect("/bookings/new?error=日期或時間格式不正確");
  }

  if (endAt <= startAt) {
    redirect("/bookings/new?error=結束時間必須晚於開始時間");
  }

  const { data: inserted, error } = await supabase
    .from("bookings")
    .insert({
      student_id: studentId,
      course_id: courseId,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      timezone: "Asia/Hong_Kong",
      status,
      credits_to_deduct: creditsToDeduct,
      notes: optionalValue(formData, "notes"),
      created_by: user.id,
    })
    .select(
      "id, student_id, course_id, start_at, end_at, notes, status, google_calendar_event_id",
    )
    .single();

  if (error) {
    redirect(`/bookings/new?error=${encodeURIComponent(error.message)}`);
  }

  try {
    await syncBookingCalendarEvent(supabase, user.id, inserted);
  } catch {
    // Do not block booking save if external sync fails.
  }

  redirect("/bookings?created=1");
}

export async function updateBooking(bookingId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/bookings/${bookingId}/edit`);
  }

  await supabase.rpc("ensure_current_user_profile");

  const studentId = String(formData.get("student_id") ?? "").trim();
  const courseId = optionalValue(formData, "course_id");
  const bookingDate = String(formData.get("booking_date") ?? "").trim();
  const startTime = String(formData.get("start_time") ?? "").trim();
  const endTime = String(formData.get("end_time") ?? "").trim();
  const status = String(formData.get("status") ?? "draft").trim();
  const creditsToDeduct = Number(formData.get("credits_to_deduct") ?? 1);

  if (!studentId) {
    redirect(`/bookings/${bookingId}/edit?error=請選擇學生`);
  }

  if (!bookingDate || !startTime || !endTime) {
    redirect(`/bookings/${bookingId}/edit?error=請輸入日期、開始時間和結束時間`);
  }

  if (!bookingStatuses.has(status)) {
    redirect(`/bookings/${bookingId}/edit?error=預約狀態不正確`);
  }

  if (!Number.isInteger(creditsToDeduct) || creditsToDeduct <= 0) {
    redirect(`/bookings/${bookingId}/edit?error=預計扣堂必須是正整數`);
  }

  const startAt = hongKongDateTime(bookingDate, startTime);
  const endAt = hongKongDateTime(bookingDate, endTime);

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    redirect(`/bookings/${bookingId}/edit?error=日期或時間格式不正確`);
  }

  if (endAt <= startAt) {
    redirect(`/bookings/${bookingId}/edit?error=結束時間必須晚於開始時間`);
  }

  const { data: updated, error } = await supabase
    .from("bookings")
    .update({
      student_id: studentId,
      course_id: courseId,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      status,
      credits_to_deduct: creditsToDeduct,
      notes: optionalValue(formData, "notes"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .select(
      "id, student_id, course_id, start_at, end_at, notes, status, google_calendar_event_id",
    )
    .single();

  if (error) {
    redirect(`/bookings/${bookingId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  try {
    await syncBookingCalendarEvent(supabase, user.id, updated);
  } catch {
    // Do not block booking update if external sync fails.
  }

  redirect("/bookings?updated=1");
}

"use server";

import { redirect } from "next/navigation";

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

  const { error } = await supabase.from("bookings").insert({
    student_id: studentId,
    course_id: courseId,
    start_at: startAt.toISOString(),
    end_at: endAt.toISOString(),
    timezone: "Asia/Hong_Kong",
    status,
    credits_to_deduct: creditsToDeduct,
    notes: optionalValue(formData, "notes"),
    created_by: user.id,
  });

  if (error) {
    redirect(`/bookings/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/bookings?created=1");
}

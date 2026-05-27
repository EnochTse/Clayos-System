import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type BookingsPageProps = {
  searchParams?: Promise<{
    created?: string;
    updated?: string;
  }>;
};

type StudentLookup = {
  id: string;
  display_name: string;
};

type CourseLookup = {
  id: string;
  name_zh: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-HK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Hong_Kong",
  }).format(new Date(value));
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/bookings");
  }

  await supabase.rpc("ensure_current_user_profile");

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(
      "id, student_id, course_id, start_at, end_at, status, credits_to_deduct, notes, google_calendar_link",
    )
    .order("start_at", { ascending: false });

  const studentIds = Array.from(
    new Set((bookings ?? []).map((booking) => booking.student_id).filter(Boolean)),
  );
  const courseIds = Array.from(
    new Set((bookings ?? []).map((booking) => booking.course_id).filter(Boolean)),
  );

  const [{ data: students }, { data: courses }] = await Promise.all([
    studentIds.length > 0
      ? supabase.from("students").select("id, display_name").in("id", studentIds)
      : Promise.resolve({ data: [] as StudentLookup[] }),
    courseIds.length > 0
      ? supabase.from("courses").select("id, name_zh").in("id", courseIds)
      : Promise.resolve({ data: [] as CourseLookup[] }),
  ]);

  const studentNameById = new Map(
    (students ?? []).map((student) => [student.id, student.display_name]),
  );
  const courseNameById = new Map(
    (courses ?? []).map((course) => [course.id, course.name_zh]),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="studio-kicker">Workspace</p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
            Bookings
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted-gray)]">
            管理課堂預約時間、狀態與扣堂資訊。
          </p>
        </div>
        <Button asChild className="h-9 rounded-[10px] px-4 text-[13px]">
          <Link href="/bookings/new">新增預約</Link>
        </Button>
      </div>

      {params?.created ? (
        <div className="studio-alert studio-alert-success">
          預約已成功儲存到 Supabase。
        </div>
      ) : null}
      {params?.updated ? (
        <div className="studio-alert studio-alert-success">
          預約資料已更新。
        </div>
      ) : null}

      {bookingsError ? (
        <div className="studio-alert studio-alert-error">
          無法讀取預約資料：{bookingsError.message}
        </div>
      ) : null}

      <section className="studio-card overflow-hidden">
        {bookings && bookings.length > 0 ? (
          <div className="divide-y divide-[var(--color-fog)]">
            {bookings.map((booking) => (
              <article className="p-4 sm:p-5" key={booking.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-[var(--color-ink)]">
                      {studentNameById.get(booking.student_id) ?? "未命名學生"}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--color-muted-gray)]">
                      {booking.course_id
                        ? (courseNameById.get(booking.course_id) ?? "其他 / TBC")
                        : "其他 / TBC"}
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-cool-gray)]">
                      {formatDateTime(booking.start_at)} - {formatDateTime(booking.end_at)}
                    </p>
                    {booking.notes ? (
                      <p className="mt-2 text-sm text-[var(--color-muted-gray)]">
                        {booking.notes}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="studio-badge">{booking.status}</span>
                    <span className="studio-badge">扣堂 {booking.credits_to_deduct}</span>
                    {booking.google_calendar_link ? (
                      <Button asChild className="h-8 rounded-[10px] px-3 text-xs" size="sm" variant="outline">
                        <a href={booking.google_calendar_link} rel="noreferrer" target="_blank">
                          Google Calendar
                          <ArrowUpRight className="size-3.5" />
                        </a>
                      </Button>
                    ) : null}
                    <Button asChild className="h-8 rounded-[10px] px-3 text-xs" size="sm" variant="outline">
                      <Link href={`/bookings/${booking.id}/edit`}>編輯</Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="font-medium text-[var(--color-ink)]">暫時未有預約</p>
            <p className="mt-2 text-sm text-[var(--color-muted-gray)]">
              新增第一個預約後會在這裡顯示。
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

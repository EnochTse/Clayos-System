import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type BookingsPageProps = {
  searchParams?: Promise<{
    created?: string;
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
      "id, student_id, course_id, start_at, end_at, status, credits_to_deduct, notes",
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
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 text-[#241711] sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link className="text-sm font-medium text-stone-500 hover:text-stone-900" href="/">
            ← 返回總覽
          </Link>
          <h1 className="mt-4 text-3xl font-semibold">預約</h1>
          <p className="mt-2 text-sm text-stone-500">
            已連接 Supabase bookings table。
          </p>
        </div>
        <Button asChild className="h-11 rounded-full px-6">
          <Link href="/bookings/new">新增預約</Link>
        </Button>
      </div>

      {params?.created ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          預約已成功儲存到 Supabase。
        </div>
      ) : null}

      {bookingsError ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          無法讀取預約資料：{bookingsError.message}
        </div>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-[2rem] bg-white shadow-sm">
        {bookings && bookings.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {bookings.map((booking) => (
              <article className="p-5" key={booking.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {studentNameById.get(booking.student_id) ?? "未命名學生"}
                    </h2>
                    <p className="mt-1 text-sm text-stone-500">
                      {booking.course_id
                        ? (courseNameById.get(booking.course_id) ?? "其他 / TBC")
                        : "其他 / TBC"}
                    </p>
                    <p className="mt-2 text-sm text-stone-600">
                      {formatDateTime(booking.start_at)} - {formatDateTime(booking.end_at)}
                    </p>
                    {booking.notes ? (
                      <p className="mt-2 text-sm text-stone-500">{booking.notes}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                      {booking.status}
                    </span>
                    <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                      扣堂 {booking.credits_to_deduct}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="font-medium">暫時未有預約</p>
            <p className="mt-2 text-sm text-stone-500">新增第一個預約後會在這裡顯示。</p>
          </div>
        )}
      </section>
    </main>
  );
}

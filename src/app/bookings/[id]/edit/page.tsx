import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { updateBooking } from "../../actions";

type EditBookingPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

const fieldClassName =
  "min-h-11 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-[#4a2f24] focus:bg-white focus:ring-4 focus:ring-[#4a2f24]/10";

function toDateInput(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function toTimeInput(value: string) {
  return new Date(value)
    .toLocaleTimeString("en-GB", {
      timeZone: "Asia/Hong_Kong",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .slice(0, 5);
}

export default async function EditBookingPage({
  params,
  searchParams,
}: EditBookingPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/bookings/${id}/edit`);
  }

  const [{ data: booking }, { data: students }, { data: courses }] = await Promise.all([
    supabase
      .from("bookings")
      .select(
        "id, student_id, course_id, start_at, end_at, status, credits_to_deduct, notes",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("students")
      .select("id, display_name, status")
      .neq("status", "archived")
      .order("display_name", { ascending: true }),
    supabase
      .from("courses")
      .select("id, name_zh, active")
      .eq("active", true)
      .order("name_zh", { ascending: true }),
  ]);

  if (!booking) {
    redirect("/bookings?error=找不到預約資料");
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 text-[#241711] sm:px-6">
      <Link className="text-sm font-medium text-stone-500 hover:text-stone-900" href="/bookings">
        ← 返回預約列表
      </Link>
      <div className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-semibold">編輯預約</h1>
        <p className="mt-2 text-sm text-stone-500">
          當狀態是 confirmed 時，系統會同步 Google Calendar 事件。
        </p>

        {query?.error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {query.error}
          </div>
        ) : null}

        <form action={updateBooking.bind(null, id)} className="mt-8 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">學生</span>
            <select className={fieldClassName} defaultValue={booking.student_id} name="student_id" required>
              <option value="">請選擇學生</option>
              {students?.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.display_name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">課程</span>
            <select className={fieldClassName} defaultValue={booking.course_id ?? ""} name="course_id">
              <option value="">其他 / TBC</option>
              {courses?.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name_zh}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-5 sm:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">日期</span>
              <input className={fieldClassName} defaultValue={toDateInput(booking.start_at)} name="booking_date" required type="date" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">開始時間</span>
              <input className={fieldClassName} defaultValue={toTimeInput(booking.start_at)} name="start_time" required type="time" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">結束時間</span>
              <input className={fieldClassName} defaultValue={toTimeInput(booking.end_at)} name="end_time" required type="time" />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">預約狀態</span>
              <select className={fieldClassName} defaultValue={booking.status} name="status">
                <option value="draft">草稿</option>
                <option value="confirmed">已確認</option>
                <option value="pending_payment">待付款</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">預計扣堂</span>
              <input
                className={fieldClassName}
                defaultValue={booking.credits_to_deduct}
                min="1"
                name="credits_to_deduct"
                required
                type="number"
              />
            </label>
          </div>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">備註</span>
            <textarea className={`${fieldClassName} min-h-28 resize-y`} defaultValue={booking.notes ?? ""} name="notes" />
          </label>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button className="h-11 rounded-full px-6" type="submit">
              儲存變更
            </Button>
            <Button asChild className="h-11 rounded-full px-6" type="button" variant="outline">
              <Link href="/bookings">取消</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

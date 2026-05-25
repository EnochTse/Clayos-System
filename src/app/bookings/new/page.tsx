import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { createBooking } from "../actions";

type NewBookingPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const fieldClassName =
  "min-h-11 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-[#4a2f24] focus:bg-white focus:ring-4 focus:ring-[#4a2f24]/10";

export default async function NewBookingPage({ searchParams }: NewBookingPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/bookings/new");
  }

  await supabase.rpc("ensure_current_user_profile");

  const [{ data: students }, { data: courses }] = await Promise.all([
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

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 text-[#241711] sm:px-6">
      <Link className="text-sm font-medium text-stone-500 hover:text-stone-900" href="/">
        ← 返回總覽
      </Link>

      <div className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
        <div>
          <p className="text-sm font-medium tracking-[0.25em] text-stone-400">
            CLAYOS STUDIO
          </p>
          <h1 className="mt-3 text-3xl font-semibold">新增預約</h1>
          <p className="mt-3 text-sm leading-7 text-stone-500">
            這個表單已接上 Supabase，送出後會正式寫入 bookings table。
          </p>
        </div>

        {params?.error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {params.error}
          </div>
        ) : null}

        {!students || students.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
            你需要先建立至少一位學生，才可以新增預約。
            <Link className="ml-2 font-semibold underline" href="/students/new">
              新增學生
            </Link>
          </div>
        ) : null}

        <form action={createBooking} className="mt-8 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">
              學生 <span className="text-red-600">*</span>
            </span>
            <select className={fieldClassName} name="student_id" required>
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
            <select className={fieldClassName} name="course_id">
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
              <span className="text-sm font-medium text-stone-700">
                日期 <span className="text-red-600">*</span>
              </span>
              <input className={fieldClassName} name="booking_date" required type="date" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">
                開始時間 <span className="text-red-600">*</span>
              </span>
              <input className={fieldClassName} name="start_time" required type="time" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">
                結束時間 <span className="text-red-600">*</span>
              </span>
              <input className={fieldClassName} name="end_time" required type="time" />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">
                預約狀態 <span className="text-red-600">*</span>
              </span>
              <select className={fieldClassName} name="status" required>
                <option value="draft">草稿</option>
                <option value="confirmed">已確認</option>
                <option value="pending_payment">待付款</option>
                <option value="cancelled">已取消</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">
                預計扣堂 <span className="text-red-600">*</span>
              </span>
              <input
                className={fieldClassName}
                defaultValue="1"
                min="1"
                name="credits_to_deduct"
                required
                type="number"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">備註</span>
            <textarea
              className={`${fieldClassName} min-h-28 resize-y`}
              name="notes"
              placeholder="學生要求、導師、房間、改期原因..."
            />
          </label>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button className="h-11 rounded-full px-6" type="submit">
              儲存預約
            </Button>
            <Button
              asChild
              className="h-11 rounded-full px-6"
              type="button"
              variant="outline"
            >
              <Link href="/">取消</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

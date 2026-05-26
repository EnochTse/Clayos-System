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
  "studio-field";

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
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <Link className="studio-link" href="/bookings">
        ← 返回總覽
      </Link>

      <div className="studio-card p-5 sm:p-6">
        <div>
          <p className="studio-kicker">
            CLAYOS STUDIO
          </p>
          <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
            新增預約
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--color-muted-gray)]">
            這個表單已接上 Supabase，送出後會正式寫入 bookings table。
          </p>
          <div className="mt-4">
            <Button asChild className="h-9 rounded-[10px] px-4 text-[13px]" variant="outline">
              <Link href="/bookings">查看已儲存預約並編輯</Link>
            </Button>
          </div>
        </div>

        {params?.error ? (
          <div className="studio-alert studio-alert-error mt-5">
            {params.error}
          </div>
        ) : null}

        {!students || students.length === 0 ? (
          <div className="studio-alert studio-alert-warning mt-5 leading-7">
            你需要先建立至少一位學生，才可以新增預約。
            <Link className="ml-2 font-semibold underline" href="/students/new">
              新增學生
            </Link>
          </div>
        ) : null}

        <form action={createBooking} className="mt-6 grid gap-5">
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
            <Button className="h-9 rounded-[10px] px-4 text-[13px]" type="submit">
              儲存預約
            </Button>
            <Button
              asChild
              className="h-9 rounded-[10px] px-4 text-[13px]"
              type="button"
              variant="outline"
            >
              <Link href="/bookings">取消</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

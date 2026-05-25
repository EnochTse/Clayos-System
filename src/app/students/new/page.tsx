import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { createStudent } from "../actions";

type NewStudentPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const fieldClassName =
  "min-h-11 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-[#4a2f24] focus:bg-white focus:ring-4 focus:ring-[#4a2f24]/10";

export default async function NewStudentPage({ searchParams }: NewStudentPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/students/new");
  }

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
          <h1 className="mt-3 text-3xl font-semibold">新增學生</h1>
          <p className="mt-3 text-sm leading-7 text-stone-500">
            這個表單已接上 Supabase，送出後會正式寫入 students table。
          </p>
        </div>

        {params?.error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {params.error}
          </div>
        ) : null}

        <form action={createStudent} className="mt-8 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">
              學生顯示名稱 <span className="text-red-600">*</span>
            </span>
            <input
              className={fieldClassName}
              name="display_name"
              placeholder="例如：陳小明"
              required
              type="text"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">電話</span>
              <input
                className={fieldClassName}
                name="phone"
                placeholder="+852 9123 4567"
                type="tel"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">WhatsApp</span>
              <input
                className={fieldClassName}
                name="whatsapp_number"
                placeholder="+852 9123 4567"
                type="tel"
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">Instagram</span>
              <input
                className={fieldClassName}
                name="instagram_handle"
                placeholder="@clayos_student"
                type="text"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">Email</span>
              <input
                className={fieldClassName}
                name="email"
                placeholder="student@example.com"
                type="email"
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">來源渠道</span>
              <select className={fieldClassName} name="source_channel">
                <option value="">請選擇</option>
                <option value="instagram">Instagram</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="google_form">Google Form</option>
                <option value="walk_in">Walk-in</option>
                <option value="referral">Referral</option>
                <option value="other">其他</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">
                學生狀態 <span className="text-red-600">*</span>
              </span>
              <select className={fieldClassName} name="status" required>
                <option value="lead">潛在客戶</option>
                <option value="active">活躍</option>
                <option value="inactive">非活躍</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">備註</span>
            <textarea
              className={`${fieldClassName} min-h-28 resize-y`}
              name="notes"
              placeholder="偏好聯絡時間、課程興趣、特別注意事項..."
            />
          </label>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button className="h-11 rounded-full px-6" type="submit">
              儲存學生
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

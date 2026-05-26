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
  "studio-field";

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
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <Link className="studio-link" href="/students">
        ← 返回總覽
      </Link>

      <div className="studio-card p-5 sm:p-6">
        <div>
          <p className="studio-kicker">
            CLAYOS STUDIO
          </p>
          <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
            新增學生
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--color-muted-gray)]">
            這個表單已接上 Supabase，送出後會正式寫入 students table。
          </p>
          <div className="mt-4">
            <Button asChild className="h-9 rounded-[10px] px-4 text-[13px]" variant="outline">
              <Link href="/students">查看已儲存學生並編輯</Link>
            </Button>
          </div>
        </div>

        {params?.error ? (
          <div className="studio-alert studio-alert-error mt-5">
            {params.error}
          </div>
        ) : null}

        <form action={createStudent} className="mt-6 grid gap-5">
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
            <Button className="h-9 rounded-[10px] px-4 text-[13px]" type="submit">
              儲存學生
            </Button>
            <Button
              asChild
              className="h-9 rounded-[10px] px-4 text-[13px]"
              type="button"
              variant="outline"
            >
              <Link href="/students">取消</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

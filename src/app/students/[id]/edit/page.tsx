import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { updateStudent } from "../../actions";

type EditStudentPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

const fieldClassName =
  "studio-field";

export default async function EditStudentPage({
  params,
  searchParams,
}: EditStudentPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/students/${id}/edit`);
  }

  const { data: student } = await supabase
    .from("students")
    .select(
      "id, display_name, phone, whatsapp_number, instagram_handle, email, source_channel, status, notes",
    )
    .eq("id", id)
    .maybeSingle();

  if (!student) {
    redirect("/students?error=找不到學生資料");
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <Link className="studio-link" href="/students">
        ← 返回學生列表
      </Link>
      <div className="studio-card p-5 sm:p-6">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
          編輯學生
        </h1>

        {query?.error ? (
          <div className="studio-alert studio-alert-error mt-5">
            {query.error}
          </div>
        ) : null}

        <form action={updateStudent.bind(null, id)} className="mt-6 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">
              學生顯示名稱 <span className="text-red-600">*</span>
            </span>
            <input className={fieldClassName} defaultValue={student.display_name} name="display_name" required type="text" />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">電話</span>
              <input className={fieldClassName} defaultValue={student.phone ?? ""} name="phone" type="tel" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">WhatsApp</span>
              <input
                className={fieldClassName}
                defaultValue={student.whatsapp_number ?? ""}
                name="whatsapp_number"
                type="tel"
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">Instagram</span>
              <input
                className={fieldClassName}
                defaultValue={student.instagram_handle ?? ""}
                name="instagram_handle"
                type="text"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">Email</span>
              <input className={fieldClassName} defaultValue={student.email ?? ""} name="email" type="email" />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">來源渠道</span>
              <select className={fieldClassName} defaultValue={student.source_channel ?? ""} name="source_channel">
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
              <span className="text-sm font-medium text-stone-700">學生狀態</span>
              <select className={fieldClassName} defaultValue={student.status} name="status">
                <option value="lead">潛在客戶</option>
                <option value="active">活躍</option>
                <option value="inactive">非活躍</option>
                <option value="archived">封存</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">備註</span>
            <textarea className={`${fieldClassName} min-h-28 resize-y`} defaultValue={student.notes ?? ""} name="notes" />
          </label>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button className="h-9 rounded-[10px] px-4 text-[13px]" type="submit">
              儲存變更
            </Button>
            <Button asChild className="h-9 rounded-[10px] px-4 text-[13px]" type="button" variant="outline">
              <Link href="/students">取消</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { createAiImportDraft } from "../actions";

type NewAiImportPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const fieldClassName =
  "studio-field";

export default async function NewAiImportPage({ searchParams }: NewAiImportPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/ai-imports/new");
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <Link className="studio-link" href="/ai-imports">
        ← 返回總覽
      </Link>

      <div className="studio-card p-5 sm:p-6">
        <p className="studio-kicker">
          CLAYOS STUDIO
        </p>
        <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
          上傳截圖 / AI 匯入
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--color-muted-gray)]">
          這個表單會正式建立 ai_imports 待審核草稿，不會自動建立預約、扣堂或記錄付款。
        </p>
        <div className="mt-4">
          <Button asChild className="h-9 rounded-[10px] px-4 text-[13px]" variant="outline">
            <Link href="/ai-imports">查看已儲存 AI 匯入紀錄並檢視</Link>
          </Button>
        </div>

        {params?.error ? (
          <div className="studio-alert studio-alert-error mt-5">
            {params.error}
          </div>
        ) : null}

        <form action={createAiImportDraft} className="mt-6 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">
              截圖來源 <span className="text-red-600">*</span>
            </span>
            <select className={fieldClassName} name="source_channel" required>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="google_form">Google Form</option>
              <option value="other">其他</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">學生名稱線索</span>
            <input className={fieldClassName} name="student_guess" placeholder="截圖中看到的名稱" type="text" />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">截圖文字 / 備註</span>
            <textarea
              className={`${fieldClassName} min-h-32 resize-y`}
              name="raw_message"
              placeholder="暫時可先貼上對話內容；下一步會改成圖片上傳與 AI 擷取。"
            />
          </label>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button className="h-9 rounded-[10px] px-4 text-[13px]" type="submit">
              建立 AI 匯入草稿
            </Button>
            <Button asChild className="h-9 rounded-[10px] px-4 text-[13px]" type="button" variant="outline">
              <Link href="/ai-imports">取消</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

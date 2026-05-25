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
  "min-h-11 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-[#4a2f24] focus:bg-white focus:ring-4 focus:ring-[#4a2f24]/10";

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
    <div className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 text-[#241711] sm:px-6">
      <Link className="text-sm font-medium text-stone-500 hover:text-stone-900" href="/">
        ← 返回總覽
      </Link>

      <div className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium tracking-[0.25em] text-stone-400">
          CLAYOS STUDIO
        </p>
        <h1 className="mt-3 text-3xl font-semibold">上傳截圖 / AI 匯入</h1>
        <p className="mt-3 text-sm leading-7 text-stone-500">
          這個表單會正式建立 ai_imports 待審核草稿，不會自動建立預約、扣堂或記錄付款。
        </p>

        {params?.error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {params.error}
          </div>
        ) : null}

        <form action={createAiImportDraft} className="mt-8 grid gap-5">
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
            <Button className="h-11 rounded-full px-6" type="submit">
              建立 AI 匯入草稿
            </Button>
            <Button asChild className="h-11 rounded-full px-6" type="button" variant="outline">
              <Link href="/">取消</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

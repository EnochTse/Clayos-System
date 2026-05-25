import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AiImportsPageProps = {
  searchParams?: Promise<{
    created?: string;
  }>;
};

export default async function AiImportsPage({ searchParams }: AiImportsPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/ai-imports");
  }

  await supabase.rpc("ensure_current_user_profile");

  const { data: imports, error } = await supabase
    .from("ai_imports")
    .select("id, source_channel, raw_text, confidence, status, warnings, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 text-[#241711] sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link className="text-sm font-medium text-stone-500 hover:text-stone-900" href="/">
            ← 返回總覽
          </Link>
          <h1 className="mt-4 text-3xl font-semibold">AI 匯入</h1>
          <p className="mt-2 text-sm text-stone-500">已連接 Supabase ai_imports table。</p>
        </div>
        <Button asChild className="h-11 rounded-full px-6">
          <Link href="/ai-imports/new">新增 AI 匯入</Link>
        </Button>
      </div>

      {params?.created ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          AI 匯入草稿已成功儲存到 Supabase。
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          無法讀取 AI 匯入資料：{error.message}
        </div>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-[2rem] bg-white shadow-sm">
        {imports && imports.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {imports.map((item) => (
              <article className="p-5" key={item.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{item.source_channel}</h2>
                    <p className="mt-1 text-sm text-stone-500">
                      {item.raw_text || "未填截圖文字"}
                    </p>
                    {item.warnings && item.warnings.length > 0 ? (
                      <p className="mt-2 text-sm text-amber-700">{item.warnings[0]}</p>
                    ) : null}
                  </div>
                  <span className="w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                    {item.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="font-medium">暫時未有 AI 匯入草稿</p>
            <p className="mt-2 text-sm text-stone-500">建立第一個草稿後會在這裡顯示。</p>
          </div>
        )}
      </section>
    </main>
  );
}

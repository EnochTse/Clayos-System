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
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="studio-kicker">Workspace</p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
            AI Imports
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted-gray)]">
            查看 AI 匯入草稿，逐筆人工檢查與跟進。
          </p>
        </div>
        <Button asChild className="h-9 rounded-[10px] px-4 text-[13px]">
          <Link href="/ai-imports/new">新增 AI 匯入</Link>
        </Button>
      </div>

      {params?.created ? (
        <div className="studio-alert studio-alert-success">
          AI 匯入草稿已成功儲存到 Supabase。
        </div>
      ) : null}

      {error ? (
        <div className="studio-alert studio-alert-error">
          無法讀取 AI 匯入資料：{error.message}
        </div>
      ) : null}

      <section className="studio-card overflow-hidden">
        {imports && imports.length > 0 ? (
          <div className="divide-y divide-[var(--color-fog)]">
            {imports.map((item) => (
              <article className="p-4 sm:p-5" key={item.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-[var(--color-ink)]">
                      {item.source_channel}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--color-muted-gray)]">
                      {item.raw_text || "未填截圖文字"}
                    </p>
                    {item.warnings && item.warnings.length > 0 ? (
                      <p className="mt-2 text-sm text-[#6a572a]">{item.warnings[0]}</p>
                    ) : null}
                  </div>
                  <span className="studio-badge">
                    {item.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="font-medium text-[var(--color-ink)]">暫時未有 AI 匯入草稿</p>
            <p className="mt-2 text-sm text-[var(--color-muted-gray)]">
              建立第一個草稿後會在這裡顯示。
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

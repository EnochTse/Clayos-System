import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ExpensesPageProps = {
  searchParams?: Promise<{
    created?: string;
    updated?: string;
  }>;
};

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/expenses");
  }

  await supabase.rpc("ensure_current_user_profile");

  const { data: expenses, error } = await supabase
    .from("expenses")
    .select("id, expense_date, category, vendor, item, amount_hkd, method, notes, created_at")
    .order("expense_date", { ascending: false });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="studio-kicker">Workspace</p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
            Expenses
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted-gray)]">
            管理營運成本、供應商與付款方式。
          </p>
        </div>
        <Button asChild className="h-9 rounded-[10px] px-4 text-[13px]">
          <Link href="/expenses/new">記錄支出</Link>
        </Button>
      </div>

      {params?.created ? (
        <div className="studio-alert studio-alert-success">
          支出已成功儲存到 Supabase。
        </div>
      ) : null}
      {params?.updated ? (
        <div className="studio-alert studio-alert-success">
          支出資料已更新。
        </div>
      ) : null}

      {error ? (
        <div className="studio-alert studio-alert-error">
          無法讀取支出資料：{error.message}
        </div>
      ) : null}

      <section className="studio-card overflow-hidden">
        {expenses && expenses.length > 0 ? (
          <div className="divide-y divide-[var(--color-fog)]">
            {expenses.map((expense) => (
              <article className="p-4 sm:p-5" key={expense.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-[var(--color-ink)]">
                      HK${expense.amount_hkd}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--color-cool-gray)]">
                      {expense.item}
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-muted-gray)]">
                      {expense.expense_date}｜{expense.category}
                      {expense.vendor ? `｜${expense.vendor}` : ""}
                    </p>
                    {expense.notes ? (
                      <p className="mt-2 text-sm text-[var(--color-muted-gray)]">
                        {expense.notes}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="studio-badge">
                      {expense.method ?? "未指定付款方式"}
                    </span>
                    <Button asChild className="h-8 rounded-[10px] px-3 text-xs" size="sm" variant="outline">
                      <Link href={`/expenses/${expense.id}/edit`}>編輯</Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="font-medium text-[var(--color-ink)]">暫時未有支出資料</p>
            <p className="mt-2 text-sm text-[var(--color-muted-gray)]">
              記錄第一筆支出後會在這裡顯示。
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

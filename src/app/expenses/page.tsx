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
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 text-[#241711] sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link className="text-sm font-medium text-stone-500 hover:text-stone-900" href="/">
            ← 返回總覽
          </Link>
          <h1 className="mt-4 text-3xl font-semibold">支出</h1>
          <p className="mt-2 text-sm text-stone-500">已連接 Supabase expenses table。</p>
        </div>
        <Button asChild className="h-11 rounded-full px-6">
          <Link href="/expenses/new">記錄支出</Link>
        </Button>
      </div>

      {params?.created ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          支出已成功儲存到 Supabase。
        </div>
      ) : null}
      {params?.updated ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          支出資料已更新。
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          無法讀取支出資料：{error.message}
        </div>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-[2rem] bg-white shadow-sm">
        {expenses && expenses.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {expenses.map((expense) => (
              <article className="p-5" key={expense.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">HK${expense.amount_hkd}</h2>
                    <p className="mt-1 text-sm text-stone-600">{expense.item}</p>
                    <p className="mt-2 text-sm text-stone-500">
                      {expense.expense_date}｜{expense.category}
                      {expense.vendor ? `｜${expense.vendor}` : ""}
                    </p>
                    {expense.notes ? <p className="mt-2 text-sm text-stone-500">{expense.notes}</p> : null}
                  </div>
                  <span className="w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                    {expense.method ?? "未指定付款方式"}
                  </span>
                  <Link
                    className="w-fit rounded-full border border-stone-200 px-3 py-1 text-xs font-medium text-stone-700"
                    href={`/expenses/${expense.id}/edit`}
                  >
                    編輯
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="font-medium">暫時未有支出資料</p>
            <p className="mt-2 text-sm text-stone-500">記錄第一筆支出後會在這裡顯示。</p>
          </div>
        )}
      </section>
    </main>
  );
}

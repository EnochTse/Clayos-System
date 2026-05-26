import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { updateExpense } from "../../actions";

type EditExpensePageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

const fieldClassName =
  "min-h-11 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-[#4a2f24] focus:bg-white focus:ring-4 focus:ring-[#4a2f24]/10";

export default async function EditExpensePage({
  params,
  searchParams,
}: EditExpensePageProps) {
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/expenses/${id}/edit`);
  }

  const { data: expense } = await supabase
    .from("expenses")
    .select("id, expense_date, category, vendor, item, amount_hkd, method, notes")
    .eq("id", id)
    .maybeSingle();

  if (!expense) {
    redirect("/expenses?error=找不到支出資料");
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 text-[#241711] sm:px-6">
      <Link className="text-sm font-medium text-stone-500 hover:text-stone-900" href="/expenses">
        ← 返回支出列表
      </Link>
      <div className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-semibold">編輯支出</h1>

        {query?.error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {query.error}
          </div>
        ) : null}

        <form action={updateExpense.bind(null, id)} className="mt-8 grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">支出日期</span>
              <input className={fieldClassName} defaultValue={expense.expense_date} name="expense_date" required type="date" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">分類</span>
              <select className={fieldClassName} defaultValue={expense.category} name="category">
                <option value="clay">陶泥</option>
                <option value="glaze">釉藥</option>
                <option value="tools">工具</option>
                <option value="firing">燒窯</option>
                <option value="rent">租金</option>
                <option value="utilities">水電</option>
                <option value="salary">薪金</option>
                <option value="marketing">市場推廣</option>
                <option value="repair">維修</option>
                <option value="packaging">包裝</option>
                <option value="other">其他</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">供應商</span>
            <input className={fieldClassName} defaultValue={expense.vendor ?? ""} name="vendor" type="text" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">項目 / 描述</span>
            <input className={fieldClassName} defaultValue={expense.item} name="item" required type="text" />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">金額 HKD</span>
              <input
                className={fieldClassName}
                defaultValue={expense.amount_hkd}
                min="0"
                name="amount_hkd"
                required
                step="0.01"
                type="number"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">付款方式</span>
              <select className={fieldClassName} defaultValue={expense.method ?? ""} name="method">
                <option value="">請選擇</option>
                <option value="cash">現金</option>
                <option value="fps">FPS</option>
                <option value="payme">PayMe</option>
                <option value="bank_transfer">銀行轉帳</option>
                <option value="credit_card">信用卡</option>
                <option value="other">其他</option>
              </select>
            </label>
          </div>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">備註</span>
            <textarea className={`${fieldClassName} min-h-28 resize-y`} defaultValue={expense.notes ?? ""} name="notes" />
          </label>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button className="h-11 rounded-full px-6" type="submit">
              儲存變更
            </Button>
            <Button asChild className="h-11 rounded-full px-6" type="button" variant="outline">
              <Link href="/expenses">取消</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { createExpense } from "../actions";

type NewExpensePageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const fieldClassName =
  "min-h-11 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-[#4a2f24] focus:bg-white focus:ring-4 focus:ring-[#4a2f24]/10";

export default async function NewExpensePage({ searchParams }: NewExpensePageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/expenses/new");
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
        <h1 className="mt-3 text-3xl font-semibold">記錄支出</h1>
        <p className="mt-3 text-sm leading-7 text-stone-500">
          這個表單已接上 Supabase，送出後會正式寫入 expenses table。
        </p>
        <div className="mt-4">
          <Button asChild className="h-10 rounded-full px-5" variant="outline">
            <Link href="/expenses">查看已儲存支出並編輯</Link>
          </Button>
        </div>

        {params?.error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {params.error}
          </div>
        ) : null}

        <form action={createExpense} className="mt-8 grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">
                支出日期 <span className="text-red-600">*</span>
              </span>
              <input className={fieldClassName} name="expense_date" required type="date" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">
                分類 <span className="text-red-600">*</span>
              </span>
              <select className={fieldClassName} name="category" required>
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
            <input className={fieldClassName} name="vendor" placeholder="供應商 / 店舖名稱" type="text" />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">
              項目 / 描述 <span className="text-red-600">*</span>
            </span>
            <input className={fieldClassName} name="item" placeholder="例如：白泥 10kg" required type="text" />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">
                金額 HKD <span className="text-red-600">*</span>
              </span>
              <input className={fieldClassName} min="0" name="amount_hkd" required step="0.01" type="number" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">付款方式</span>
              <select className={fieldClassName} name="method">
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
            <textarea className={`${fieldClassName} min-h-28 resize-y`} name="notes" placeholder="收據、用途、內部備註..." />
          </label>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button className="h-11 rounded-full px-6" type="submit">
              儲存支出
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

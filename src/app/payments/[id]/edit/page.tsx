import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { updatePayment } from "../../actions";

type EditPaymentPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

const fieldClassName =
  "min-h-11 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-[#4a2f24] focus:bg-white focus:ring-4 focus:ring-[#4a2f24]/10";

function toDateInput(value: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default async function EditPaymentPage({
  params,
  searchParams,
}: EditPaymentPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/payments/${id}/edit`);
  }

  const [{ data: payment }, { data: students }] = await Promise.all([
    supabase
      .from("payments")
      .select("id, student_id, amount_hkd, method, status, paid_at, reference, notes")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("students")
      .select("id, display_name")
      .order("display_name", { ascending: true }),
  ]);

  if (!payment) {
    redirect("/payments?error=找不到付款資料");
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 text-[#241711] sm:px-6">
      <Link className="text-sm font-medium text-stone-500 hover:text-stone-900" href="/payments">
        ← 返回付款列表
      </Link>
      <div className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-semibold">編輯付款</h1>

        {query?.error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {query.error}
          </div>
        ) : null}

        <form action={updatePayment.bind(null, id)} className="mt-8 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">學生</span>
            <select className={fieldClassName} defaultValue={payment.student_id ?? ""} name="student_id">
              <option value="">不指定學生</option>
              {students?.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.display_name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">金額 HKD</span>
            <input className={fieldClassName} defaultValue={payment.amount_hkd} min="0" name="amount_hkd" required step="0.01" type="number" />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">付款方式</span>
              <select className={fieldClassName} defaultValue={payment.method ?? ""} name="method">
                <option value="">請選擇</option>
                <option value="cash">現金</option>
                <option value="fps">FPS</option>
                <option value="payme">PayMe</option>
                <option value="bank_transfer">銀行轉帳</option>
                <option value="credit_card">信用卡</option>
                <option value="other">其他</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">付款狀態</span>
              <select className={fieldClassName} defaultValue={payment.status} name="status">
                <option value="pending">待確認</option>
                <option value="paid">已付款</option>
                <option value="unpaid">未付款</option>
                <option value="refunded">已退款</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">付款日期</span>
            <input className={fieldClassName} defaultValue={toDateInput(payment.paid_at)} name="paid_date" type="date" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">參考編號</span>
            <input className={fieldClassName} defaultValue={payment.reference ?? ""} name="reference" type="text" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">備註</span>
            <textarea className={`${fieldClassName} min-h-28 resize-y`} defaultValue={payment.notes ?? ""} name="notes" />
          </label>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button className="h-11 rounded-full px-6" type="submit">
              儲存變更
            </Button>
            <Button asChild className="h-11 rounded-full px-6" type="button" variant="outline">
              <Link href="/payments">取消</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

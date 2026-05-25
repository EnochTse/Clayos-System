import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PaymentsPageProps = {
  searchParams?: Promise<{
    created?: string;
  }>;
};

type StudentLookup = {
  id: string;
  display_name: string;
};

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/payments");
  }

  await supabase.rpc("ensure_current_user_profile");

  const { data: payments, error } = await supabase
    .from("payments")
    .select("id, student_id, amount_hkd, method, status, paid_at, reference, notes, created_at")
    .order("created_at", { ascending: false });

  const studentIds = Array.from(
    new Set((payments ?? []).map((payment) => payment.student_id).filter(Boolean)),
  );

  const { data: students } =
    studentIds.length > 0
      ? await supabase.from("students").select("id, display_name").in("id", studentIds)
      : { data: [] as StudentLookup[] };

  const studentNameById = new Map(
    (students ?? []).map((student) => [student.id, student.display_name]),
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 text-[#241711] sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link className="text-sm font-medium text-stone-500 hover:text-stone-900" href="/">
            ← 返回總覽
          </Link>
          <h1 className="mt-4 text-3xl font-semibold">付款</h1>
          <p className="mt-2 text-sm text-stone-500">已連接 Supabase payments table。</p>
        </div>
        <Button asChild className="h-11 rounded-full px-6">
          <Link href="/payments/new">記錄付款</Link>
        </Button>
      </div>

      {params?.created ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          付款已成功儲存到 Supabase。
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          無法讀取付款資料：{error.message}
        </div>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-[2rem] bg-white shadow-sm">
        {payments && payments.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {payments.map((payment) => (
              <article className="p-5" key={payment.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">HK${payment.amount_hkd}</h2>
                    <p className="mt-1 text-sm text-stone-500">
                      {payment.student_id
                        ? (studentNameById.get(payment.student_id) ?? "未命名學生")
                        : "未指定學生"}
                    </p>
                    <p className="mt-2 text-sm text-stone-600">
                      {payment.method ?? "未指定付款方式"}
                      {payment.reference ? `｜${payment.reference}` : ""}
                    </p>
                    {payment.notes ? <p className="mt-2 text-sm text-stone-500">{payment.notes}</p> : null}
                  </div>
                  <span className="w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                    {payment.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="font-medium">暫時未有付款資料</p>
            <p className="mt-2 text-sm text-stone-500">記錄第一筆付款後會在這裡顯示。</p>
          </div>
        )}
      </section>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PaymentsPageProps = {
  searchParams?: Promise<{
    created?: string;
    updated?: string;
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
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="studio-kicker">Workspace</p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
            Payments
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted-gray)]">
            管理收款狀態、方式與參考編號。
          </p>
        </div>
        <Button asChild className="h-9 rounded-[10px] px-4 text-[13px]">
          <Link href="/payments/new">記錄付款</Link>
        </Button>
      </div>

      {params?.created ? (
        <div className="studio-alert studio-alert-success">
          付款已成功儲存到 Supabase。
        </div>
      ) : null}
      {params?.updated ? (
        <div className="studio-alert studio-alert-success">
          付款資料已更新。
        </div>
      ) : null}

      {error ? (
        <div className="studio-alert studio-alert-error">
          無法讀取付款資料：{error.message}
        </div>
      ) : null}

      <section className="studio-card overflow-hidden">
        {payments && payments.length > 0 ? (
          <div className="divide-y divide-[var(--color-fog)]">
            {payments.map((payment) => (
              <article className="p-4 sm:p-5" key={payment.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-[var(--color-ink)]">
                      HK${payment.amount_hkd}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--color-muted-gray)]">
                      {payment.student_id
                        ? (studentNameById.get(payment.student_id) ?? "未命名學生")
                        : "未指定學生"}
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-cool-gray)]">
                      {payment.method ?? "未指定付款方式"}
                      {payment.reference ? `｜${payment.reference}` : ""}
                    </p>
                    {payment.notes ? (
                      <p className="mt-2 text-sm text-[var(--color-muted-gray)]">
                        {payment.notes}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="studio-badge">{payment.status}</span>
                    <Button asChild className="h-8 rounded-[10px] px-3 text-xs" size="sm" variant="outline">
                      <Link href={`/payments/${payment.id}/edit`}>編輯</Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="font-medium text-[var(--color-ink)]">暫時未有付款資料</p>
            <p className="mt-2 text-sm text-[var(--color-muted-gray)]">
              記錄第一筆付款後會在這裡顯示。
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

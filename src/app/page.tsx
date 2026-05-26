import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthStatus } from "@/components/auth/auth-status";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  dashboardBoardColumns,
  dashboardCards,
  implementationPhases,
  manageRecordItems,
  quickActionItems,
  seedCourse,
} from "@/lib/constants";

function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function formatCurrency(value: number) {
  return `HK$${value.toLocaleString("en-HK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  await supabase.rpc("ensure_current_user_profile");

  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = addDays(todayStart, 1);
  const monthStart = startOfMonth(now);
  const nextMonthStart = addMonths(monthStart, 1);

  const [
    { count: bookingsToday },
    { count: bookingsInProgress },
    { count: activeStudents },
    { count: pendingPayments },
    { count: pendingAiImports },
    { data: monthExpensesRows },
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .gte("start_at", todayStart.toISOString())
      .lt("start_at", tomorrowStart.toISOString()),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .in("status", ["draft", "pending_payment", "confirmed"]),
    supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("payments")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "unpaid"]),
    supabase
      .from("ai_imports")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_review"),
    supabase
      .from("expenses")
      .select("amount_hkd")
      .gte("expense_date", monthStart.toISOString().slice(0, 10))
      .lt("expense_date", nextMonthStart.toISOString().slice(0, 10)),
  ]);

  const monthExpensesAmount = (monthExpensesRows ?? []).reduce(
    (sum, row) => sum + Number(row.amount_hkd ?? 0),
    0,
  );

  const metricMap: Record<(typeof dashboardCards)[number]["value"], string> = {
    bookingsToday: String(bookingsToday ?? 0),
    bookingsInProgress: String(bookingsInProgress ?? 0),
    activeStudents: String(activeStudents ?? 0),
    pendingPayments: String(pendingPayments ?? 0),
    monthExpenses: formatCurrency(monthExpensesAmount),
    pendingAiImports: String(pendingAiImports ?? 0),
  };

  return (
    <div className="space-y-6">
      <section className="studio-card p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="studio-kicker">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-[var(--color-ink)] sm:text-4xl">
              Actions
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--color-muted-gray)]">
              以看板方式集中管理學生、預約、付款、支出與 AI 匯入流程。
            </p>
          </div>
          <div className="w-full max-w-sm">
            <AuthStatus />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Board</h2>
          <p className="text-xs text-[var(--color-subtle-gray)]">
            根據目前營運流程分組
          </p>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {dashboardBoardColumns.map((column) => (
            <section className="studio-card p-4" key={column.key}>
              <div className="flex items-center justify-between border-b border-[var(--color-fog)] pb-3">
                <div>
                  <p className="text-base font-semibold text-[var(--color-ink)]">
                    {column.title}
                  </p>
                  <p className="text-xs text-[var(--color-muted-gray)]">
                    {column.subtitle}
                  </p>
                </div>
                <span className="studio-badge">{column.actions.length}</span>
              </div>
              <div className="mt-4 space-y-3">
                {column.actions.map((action) => (
                  <Link
                    className="block rounded-[12px] border border-[var(--color-fog)] bg-[var(--surface-canvas-white)] p-3 transition hover:border-[var(--color-border-silver)] hover:bg-white"
                    href={action.href}
                    key={action.href}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-[var(--color-ink)]">
                        {action.label}
                      </p>
                      <span className="studio-badge">{action.tag}</span>
                    </div>
                    <p className="mt-2 text-xs text-[var(--color-muted-gray)]">
                      {action.hint}
                    </p>
                  </Link>
                ))}
                <Button
                  asChild
                  className="h-9 w-full justify-start rounded-[10px] px-3 text-[13px]"
                  variant="ghost"
                >
                  <Link href={column.actions[0].href}>+ Create new</Link>
                </Button>
              </div>
            </section>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Key Metrics</h2>
          <p className="text-xs text-[var(--color-subtle-gray)]">Supabase 即時統計</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {dashboardCards.map((card) => (
            <article className="studio-card p-4" key={card.label}>
              <p className="text-[13px] text-[var(--color-muted-gray)]">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
                {metricMap[card.value]}
              </p>
              <p className="mt-1 text-xs text-[var(--color-subtle-gray)]">{card.helper}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="studio-card p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Quick Create</h2>
            <Button asChild className="h-9 rounded-[10px] px-3 text-[13px]">
              <Link href="/students/new">新增學生</Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickActionItems.map((action) => (
              <Link
                className="rounded-[12px] border border-[var(--color-fog)] bg-[var(--surface-canvas-white)] p-3.5 transition hover:border-[var(--color-border-silver)] hover:bg-white"
                href={action.href}
                key={action.href}
              >
                <action.icon className="size-4 text-[var(--color-cool-gray)]" />
                <p className="mt-3 text-sm font-medium text-[var(--color-ink)]">
                  {action.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-muted-gray)]">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
          <h3 className="mt-5 text-sm font-semibold text-[var(--color-ink)]">
            View & Edit Records
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {manageRecordItems.map((item) => (
              <Link
                className="rounded-[12px] border border-[var(--color-fog)] bg-white p-3.5 transition hover:border-[var(--color-border-silver)] hover:bg-[var(--surface-canvas-white)]"
                href={item.href}
                key={item.href}
              >
                <item.icon className="size-4 text-[var(--color-cool-gray)]" />
                <p className="mt-3 text-sm font-medium text-[var(--color-ink)]">
                  {item.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-muted-gray)]">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="studio-card p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Roadmap</h2>
          <div className="mt-4 grid gap-3">
            {implementationPhases.map((phase, index) => (
              <div className="flex items-start gap-3" key={phase}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-fog)] bg-[var(--surface-canvas-white)] text-[11px] font-semibold text-[var(--color-muted-gray)]">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-[var(--color-muted-gray)]">
                  {phase}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 studio-card-muted p-4">
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              {seedCourse.name_zh}
            </p>
            <p className="mt-1 text-xs text-[var(--color-muted-gray)]">
              {seedCourse.name_en}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-muted-gray)]">
              {seedCourse.description_zh}
            </p>
          </div>
        </section>
      </section>
    </div>
  );
}

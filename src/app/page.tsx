import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { AuthStatus } from "@/components/auth/auth-status";
import { Button } from "@/components/ui/button";
import { buildGoogleCalendarWebUrl } from "@/lib/google-calendar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import {
  dashboardBoardColumns,
  dashboardCards,
  manageRecordItems,
  quickActionItems,
} from "@/lib/constants";

type CalendarBookingRow = {
  id: string;
  student_id: string;
  start_at: string;
  end_at: string;
  status: string;
  google_calendar_link: string | null;
};

type StudentLookup = {
  id: string;
  display_name: string;
};

type CalendarItem = {
  id: string;
  studentName: string;
  startAt: string;
  status: string;
  href: string;
  external: boolean;
};

const weekDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

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

function buildMonthGrid(referenceDate: Date) {
  const monthStart = startOfMonth(referenceDate);
  const offset = (monthStart.getDay() + 6) % 7;
  const gridStart = addDays(monthStart, -offset);
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

function isSameMonth(date: Date, monthReference: Date) {
  return (
    date.getFullYear() === monthReference.getFullYear() &&
    date.getMonth() === monthReference.getMonth()
  );
}

function toDateKey(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatMonthTitle(value: Date) {
  return new Intl.DateTimeFormat("zh-HK", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "long",
  }).format(value);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("zh-HK", {
    timeZone: "Asia/Hong_Kong",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function formatStatus(status: string) {
  switch (status) {
    case "confirmed":
      return "已確認";
    case "pending_payment":
      return "待付款";
    case "completed":
      return "已完成";
    case "cancelled":
      return "已取消";
    case "rescheduled":
      return "已改期";
    case "no_show":
      return "缺席";
    default:
      return "草稿";
  }
}

function calendarItemTone(status: string) {
  switch (status) {
    case "confirmed":
      return "border-[#d8e5d7] bg-[#f4faf4] text-[#24472d]";
    case "pending_payment":
      return "border-[#eddcb8] bg-[#fffaf0] text-[#5e4e23]";
    case "completed":
      return "border-[#d6e5f0] bg-[#f5f9ff] text-[#214466]";
    case "cancelled":
      return "border-[#ececec] bg-[#f7f7f7] text-[#6a6a6a]";
    default:
      return "border-[var(--color-fog)] bg-white text-[var(--color-cool-gray)]";
  }
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
  const calendarDays = buildMonthGrid(monthStart);
  const calendarRangeStart = calendarDays[0];
  const calendarRangeEnd = addDays(calendarDays[calendarDays.length - 1], 1);

  const [
    { count: bookingsToday },
    { count: bookingsInProgress },
    { count: activeStudents },
    { count: pendingPayments },
    { count: pendingAiImports },
    { data: monthExpensesRows },
    { data: calendarBookingsRows },
    { data: integration },
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
      .eq("status", "needs_review"),
    supabase
      .from("expenses")
      .select("amount_hkd")
      .gte("expense_date", monthStart.toISOString().slice(0, 10))
      .lt("expense_date", nextMonthStart.toISOString().slice(0, 10)),
    supabase
      .from("bookings")
      .select("id, student_id, start_at, end_at, status, google_calendar_link")
      .gte("start_at", calendarRangeStart.toISOString())
      .lt("start_at", calendarRangeEnd.toISOString())
      .order("start_at", { ascending: true }),
    supabase
      .from("google_integrations")
      .select("calendar_id, active, encrypted_access_token")
      .eq("owner_id", user.id)
      .maybeSingle(),
  ]);

  const bookingStudentIds = Array.from(
    new Set((calendarBookingsRows ?? []).map((booking) => booking.student_id).filter(Boolean)),
  );

  const { data: bookingStudents } =
    bookingStudentIds.length > 0
      ? await supabase
          .from("students")
          .select("id, display_name")
          .in("id", bookingStudentIds)
      : { data: [] as StudentLookup[] };

  const studentNameById = new Map(
    (bookingStudents ?? []).map((student) => [student.id, student.display_name]),
  );

  const calendarItemsByDate = new Map<string, CalendarItem[]>();
  for (const booking of (calendarBookingsRows ?? []) as CalendarBookingRow[]) {
    const dateKey = toDateKey(booking.start_at);
    const items = calendarItemsByDate.get(dateKey) ?? [];
    items.push({
      id: booking.id,
      studentName: studentNameById.get(booking.student_id) ?? "未命名學生",
      startAt: booking.start_at,
      status: booking.status,
      href: booking.google_calendar_link ?? `/bookings/${booking.id}/edit`,
      external: Boolean(booking.google_calendar_link),
    });
    calendarItemsByDate.set(dateKey, items);
  }
  for (const items of calendarItemsByDate.values()) {
    items.sort((a, b) => a.startAt.localeCompare(b.startAt));
  }

  const googleCalendarWebUrl = buildGoogleCalendarWebUrl(
    integration?.calendar_id ?? "primary",
  );
  const isGoogleConnected =
    Boolean(integration?.active) && Boolean(integration?.encrypted_access_token);
  const todayKey = toDateKey(now);

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

      <section className="studio-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="studio-kicker">Appointments Calendar</p>
            <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
              {formatMonthTitle(monthStart)}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-muted-gray)]">
              月曆直接顯示預約，點選項目可編輯或跳轉到 Google Calendar。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isGoogleConnected ? (
              <Button asChild className="h-9 rounded-[10px] px-4 text-[13px]" variant="outline">
                <a href={googleCalendarWebUrl} rel="noreferrer" target="_blank">
                  開啟 Google Calendar
                  <ArrowUpRight className="size-3.5" />
                </a>
              </Button>
            ) : (
              <Button asChild className="h-9 rounded-[10px] px-4 text-[13px]" variant="outline">
                <Link href="/settings/integrations/google-calendar">
                  連接 Google Calendar
                </Link>
              </Button>
            )}
            <Button asChild className="h-9 rounded-[10px] px-4 text-[13px]">
              <Link href="/bookings/new">新增預約</Link>
            </Button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-7 gap-2">
              {weekDayLabels.map((label) => (
                <div
                  className="rounded-[10px] border border-[var(--color-fog)] bg-[var(--surface-canvas-white)] px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-muted-gray)]"
                  key={label}
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {calendarDays.map((day) => {
                const dayKey = toDateKey(day);
                const dayItems = calendarItemsByDate.get(dayKey) ?? [];
                const currentMonth = isSameMonth(day, monthStart);
                const isToday = dayKey === todayKey;
                const visibleItems = dayItems.slice(0, 4);

                return (
                  <div
                    className={cn(
                      "min-h-[162px] rounded-[12px] border p-2.5",
                      currentMonth
                        ? "border-[var(--color-fog)] bg-white"
                        : "border-[var(--color-fog)] bg-[var(--surface-canvas-white)]",
                      isToday && "border-[var(--color-border-silver)]",
                    )}
                    key={dayKey}
                  >
                    <div className="flex items-center justify-between">
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          currentMonth
                            ? "text-[var(--color-ink)]"
                            : "text-[var(--color-subtle-gray)]",
                        )}
                      >
                        {day.getDate()}
                      </p>
                      {dayItems.length > 0 ? (
                        <span className="text-[10px] text-[var(--color-subtle-gray)]">
                          {dayItems.length} 筆
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2 space-y-1.5">
                      {visibleItems.map((item) =>
                        item.external ? (
                          <a
                            className={cn(
                              "flex items-start justify-between gap-2 rounded-[8px] border px-2 py-1.5 text-[11px] transition hover:brightness-[0.98]",
                              calendarItemTone(item.status),
                            )}
                            href={item.href}
                            key={item.id}
                            rel="noreferrer"
                            target="_blank"
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-semibold">
                                {formatTime(item.startAt)} {item.studentName}
                              </span>
                              <span className="block truncate text-[10px] opacity-90">
                                {formatStatus(item.status)}
                              </span>
                            </span>
                            <ArrowUpRight className="mt-0.5 size-3.5 shrink-0" />
                          </a>
                        ) : (
                          <Link
                            className={cn(
                              "block rounded-[8px] border px-2 py-1.5 text-[11px] transition hover:brightness-[0.98]",
                              calendarItemTone(item.status),
                            )}
                            href={item.href}
                            key={item.id}
                          >
                            <span className="block truncate font-semibold">
                              {formatTime(item.startAt)} {item.studentName}
                            </span>
                            <span className="block truncate text-[10px] opacity-90">
                              {formatStatus(item.status)}
                            </span>
                          </Link>
                        ),
                      )}

                      {dayItems.length > visibleItems.length ? (
                        <p className="text-[10px] text-[var(--color-subtle-gray)]">
                          +{dayItems.length - visibleItems.length} more
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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

      <section className="studio-card p-4 sm:p-5">
        <section>
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
      </section>
    </div>
  );
}

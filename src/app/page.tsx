import Link from "next/link";

import { AuthStatus } from "@/components/auth/auth-status";
import { Button } from "@/components/ui/button";
import {
  dashboardCards,
  implementationPhases,
  navigationItems,
  quickActionItems,
  seedCourse,
  studioBrand,
} from "@/lib/constants";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fbf7ef] pb-24 text-[#241711]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-[#4a2f24] p-6 text-white shadow-xl shadow-stone-300/40 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <p className="text-sm font-medium tracking-[0.3em] text-[#f5d49a]">
              {studioBrand.name.toUpperCase()}
            </p>
            <AuthStatus />
          </div>
          <div className="mt-6 max-w-3xl space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Clayos Studio Manager
            </h1>
            <p className="text-lg leading-8 text-stone-100">
              {studioBrand.tagline}
            </p>
            <p className="text-sm leading-7 text-stone-200">
              行動優先的內部 PWA，用來管理學生、預約、套票堂數、付款支出、AI
              截圖匯入、Google Calendar 同步與 Excel / Google Sheets 匯出。
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-11 rounded-full bg-[#f5d49a] px-6 text-[#241711] hover:bg-[#f1c574]">
              <Link href="/students/new">新增第一位學生</Link>
            </Button>
            <Button
              asChild
              className="h-11 rounded-full border-white/30 px-6 text-white hover:bg-white/10"
              variant="outline"
            >
              <Link href="/bookings/new">新增預約</Link>
            </Button>
          </div>
        </div>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">快速新增</h2>
              <p className="mt-1 text-sm text-stone-500">
                先輸入草稿資料；接上 Supabase Auth 後會改為正式儲存。
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {quickActionItems.map((action) => (
              <Link
                className="rounded-2xl border border-stone-200 bg-stone-50 p-4 transition hover:-translate-y-0.5 hover:border-[#4a2f24] hover:bg-white hover:shadow-sm"
                href={action.href}
                key={action.href}
              >
                <action.icon className="size-5 text-[#4a2f24]" />
                <p className="mt-3 font-medium">{action.label}</p>
                <p className="mt-2 text-xs leading-5 text-stone-500">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardCards.map((card) => (
            <article
              className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"
              key={card.label}
            >
              <p className="text-sm text-stone-500">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold">{card.value}</p>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                {card.helper}
              </p>
            </article>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">MVP 開發計劃</h2>
            <div className="mt-5 space-y-4">
              {implementationPhases.map((phase, index) => (
                <div className="flex gap-4" key={phase}>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#4a2f24] text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-7 text-stone-600">
                    {phase}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">已驗證種子課程</h2>
            <div className="mt-5 rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p className="font-medium">{seedCourse.name_zh}</p>
              <p className="mt-1 text-sm text-stone-500">
                {seedCourse.name_en}
              </p>
              <p className="mt-4 text-sm leading-7 text-stone-600">
                {seedCourse.description_zh}
              </p>
              <p className="mt-4 text-xs leading-6 text-stone-500">
                價格與課堂長度暫以 TBC / nullable 保存，避免寫入未驗證資料。
              </p>
            </div>
          </section>
        </div>
      </section>

      <nav className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-white/95 px-3 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {navigationItems.slice(0, 5).map((item) => (
            <a
              className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs text-stone-500"
              href={item.href}
              key={item.href}
            >
              <item.icon className="size-5" />
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </nav>
    </main>
  );
}

import { Button } from "@/components/ui/button";

import { signInWithPassword } from "./actions";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params?.next ?? "/";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbf7ef] px-4 py-10 text-[#241711]">
      <section className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium tracking-[0.25em] text-stone-400">
          CLAYOS STUDIO
        </p>
        <h1 className="mt-3 text-3xl font-semibold">登入管理系統</h1>
        <p className="mt-3 text-sm leading-7 text-stone-500">
          使用 Supabase email + password 登入。登入成功後會自動建立或補齊你的 profile 與角色。
        </p>

        {params?.error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {params.error}
          </div>
        ) : null}

        {params?.message ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {params.message}
          </div>
        ) : null}

        <form action={signInWithPassword} className="mt-8 grid gap-5">
          <input name="next" type="hidden" value={next} />
          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">Email</span>
            <input
              autoComplete="email"
              className="min-h-11 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-[#4a2f24] focus:bg-white focus:ring-4 focus:ring-[#4a2f24]/10"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">密碼</span>
            <input
              autoComplete="current-password"
              className="min-h-11 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-[#4a2f24] focus:bg-white focus:ring-4 focus:ring-[#4a2f24]/10"
              name="password"
              placeholder="輸入密碼"
              required
              type="password"
            />
          </label>

          <Button className="h-11 rounded-full px-6" type="submit">
            登入
          </Button>
        </form>
      </section>
    </main>
  );
}

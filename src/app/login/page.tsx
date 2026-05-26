import { Button } from "@/components/ui/button";

import { signInWithPassword } from "./actions";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

const fieldClassName = "studio-field";

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params?.next ?? "/";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--surface-canvas-white)] px-4 py-10 text-[var(--color-ink)]">
      <section className="studio-card w-full max-w-md p-6 sm:p-8">
        <p className="studio-kicker">
          CLAYOS STUDIO
        </p>
        <h1 className="mt-3 text-[30px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
          登入管理系統
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--color-muted-gray)]">
          使用 Supabase email + password 登入。登入成功後會自動建立或補齊你的 profile 與角色。
        </p>

        {params?.error ? (
          <div className="studio-alert studio-alert-error mt-5">
            {params.error}
          </div>
        ) : null}

        {params?.message ? (
          <div className="studio-alert studio-alert-success mt-5">
            {params.message}
          </div>
        ) : null}

        <form action={signInWithPassword} className="mt-6 grid gap-5">
          <input name="next" type="hidden" value={next} />
          <label className="grid gap-2">
            <span className="text-sm font-medium text-[var(--color-cool-gray)]">Email</span>
            <input
              autoComplete="email"
              className={fieldClassName}
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-[var(--color-cool-gray)]">密碼</span>
            <input
              autoComplete="current-password"
              className={fieldClassName}
              name="password"
              placeholder="輸入密碼"
              required
              type="password"
            />
          </label>

          <Button className="h-9 rounded-[10px] px-4 text-[13px]" type="submit">
            登入
          </Button>
        </form>
      </section>
    </main>
  );
}

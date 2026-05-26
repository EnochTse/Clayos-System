import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/settings");
  }

  await supabase.rpc("ensure_current_user_profile");

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8 text-[#241711] sm:px-6">
      <Link className="text-sm font-medium text-stone-500 hover:text-stone-900" href="/">
        ← 返回總覽
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">設定</h1>
      <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">整合</h2>
        <p className="mt-2 text-sm text-stone-500">
          連接外部服務，讓預約可同步到 Google Calendar。
        </p>
        <Link
          className="mt-4 inline-flex rounded-full bg-[#4a2f24] px-5 py-2.5 text-sm font-medium text-white"
          href="/settings/integrations/google-calendar"
        >
          Google Calendar 連線設定
        </Link>
      </section>
    </main>
  );
}

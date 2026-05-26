import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
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
    <div className="space-y-5">
      <div>
        <p className="studio-kicker">Workspace</p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
          Settings
        </h1>
      </div>
      <section className="studio-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Integrations</h2>
        <p className="mt-2 text-sm text-[var(--color-muted-gray)]">
          連接外部服務，讓預約可同步到 Google Calendar。
        </p>
        <Button asChild className="mt-4 h-9 rounded-[10px] px-4 text-[13px]">
          <Link href="/settings/integrations/google-calendar">
            Google Calendar 連線設定
          </Link>
        </Button>
      </section>
    </div>
  );
}

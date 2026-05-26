import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  disconnectGoogleCalendar,
  updateGoogleCalendarSettings,
} from "./actions";

type GoogleCalendarSettingsPageProps = {
  searchParams?: Promise<{
    connected?: string;
    saved?: string;
    disconnected?: string;
    error?: string;
  }>;
};

export default async function GoogleCalendarSettingsPage({
  searchParams,
}: GoogleCalendarSettingsPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/settings/integrations/google-calendar");
  }

  await supabase.rpc("ensure_current_user_profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "owner") {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 text-[#241711] sm:px-6">
        <Link
          className="text-sm font-medium text-stone-500 hover:text-stone-900"
          href="/settings"
        >
          ← 返回設定
        </Link>
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          只有 owner 可以管理 Google Calendar 連線。
        </div>
      </main>
    );
  }

  const { data: integration } = await supabase
    .from("google_integrations")
    .select("calendar_id, active, token_expiry, encrypted_access_token")
    .eq("owner_id", user.id)
    .maybeSingle();

  const isConnected =
    Boolean(integration?.active) &&
    Boolean(integration?.encrypted_access_token);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 text-[#241711] sm:px-6">
      <Link
        className="text-sm font-medium text-stone-500 hover:text-stone-900"
        href="/settings"
      >
        ← 返回設定
      </Link>

      <div className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-semibold">Google Calendar</h1>
        <p className="mt-3 text-sm leading-7 text-stone-500">
          連線後，`confirmed` 的預約會同步到 Google Calendar，之後編輯預約也會更新事件。
        </p>

        {params?.error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {params.error}
          </div>
        ) : null}

        {params?.connected || params?.saved ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            設定已更新。
          </div>
        ) : null}

        {params?.disconnected ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            已中斷 Google Calendar 連線。
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm">
          狀態：{isConnected ? "已連線" : "未連線"}
          {integration?.token_expiry ? (
            <span className="block text-stone-500">
              token 到期：{new Date(integration.token_expiry).toLocaleString("zh-HK")}
            </span>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-11 rounded-full px-6">
            <a href="/api/google/oauth/start">連接 Google 帳號</a>
          </Button>
          <form action={disconnectGoogleCalendar}>
            <Button className="h-11 rounded-full px-6" type="submit" variant="outline">
              中斷連線
            </Button>
          </form>
        </div>

        <form action={updateGoogleCalendarSettings} className="mt-8 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">
              Calendar ID（預設 primary）
            </span>
            <input
              className="min-h-11 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-[#4a2f24] focus:bg-white focus:ring-4 focus:ring-[#4a2f24]/10"
              defaultValue={integration?.calendar_id ?? "primary"}
              name="calendar_id"
              placeholder="primary"
              type="text"
            />
          </label>
          <Button className="h-11 rounded-full px-6" type="submit">
            儲存 Calendar 設定
          </Button>
        </form>
      </div>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildGoogleCalendarWebUrl } from "@/lib/google-calendar";
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

const fieldClassName = "studio-field";

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
      <div className="space-y-4">
        <Link className="studio-link" href="/settings">
          ← 返回設定
        </Link>
        <div className="studio-alert studio-alert-error">
          只有 owner 可以管理 Google Calendar 連線。
        </div>
      </div>
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
  const googleCalendarWebUrl = buildGoogleCalendarWebUrl(
    integration?.calendar_id ?? "primary",
  );
  const hasGoogleClientId = Boolean(process.env.GOOGLE_CLIENT_ID?.trim());
  const hasGoogleClientSecret = Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim());
  const configuredRedirectUri =
    process.env.GOOGLE_REDIRECT_URI?.trim() ||
    (process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "")
      ? `${process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "")}/api/google/oauth/callback`
      : "");
  const oauthSetupComplete = hasGoogleClientId && hasGoogleClientSecret;

  return (
    <div className="space-y-5">
      <div>
        <p className="studio-kicker">Integrations</p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
          Google Calendar
        </h1>
        <p className="mt-2 text-sm leading-7 text-[var(--color-muted-gray)]">
          連線後，`confirmed` 的預約會同步到 Google Calendar，之後編輯預約也會更新事件。
        </p>
      </div>

      <div className="studio-card p-5 sm:p-6">
        <Link className="studio-link" href="/settings">
          ← 返回設定
        </Link>

        {params?.error ? (
          <div className="studio-alert studio-alert-error mt-5">
            {params.error}
          </div>
        ) : null}

        {params?.connected || params?.saved ? (
          <div className="studio-alert studio-alert-success mt-5">
            設定已更新。
          </div>
        ) : null}

        {params?.disconnected ? (
          <div className="studio-alert studio-alert-warning mt-5">
            已中斷 Google Calendar 連線。
          </div>
        ) : null}

        {!oauthSetupComplete ? (
          <div className="studio-alert studio-alert-warning mt-5 space-y-2">
            <p className="font-semibold">
              尚未完成 Google OAuth 環境設定，所以「連接 Google 帳號」會失敗。
            </p>
            <p className="text-xs">
              請在 Netlify 設定 `GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`，
              並重新部署。
            </p>
          </div>
        ) : null}

        <div className="studio-card-muted mt-5 p-4 text-sm text-[var(--color-ink)]">
          狀態：{isConnected ? "已連線" : "未連線"}
          {integration?.token_expiry ? (
            <span className="mt-1 block text-[var(--color-muted-gray)]">
              token 到期：{new Date(integration.token_expiry).toLocaleString("zh-HK")}
            </span>
          ) : null}
        </div>

        <div className="studio-card-muted mt-4 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-subtle-gray)]">
            OAuth Setup Check
          </p>
          <div className="mt-3 grid gap-2 text-sm">
            <p>
              GOOGLE_CLIENT_ID：{hasGoogleClientId ? "已設定" : "未設定"}
            </p>
            <p>
              GOOGLE_CLIENT_SECRET：{hasGoogleClientSecret ? "已設定" : "未設定"}
            </p>
            <p className="break-all text-xs text-[var(--color-muted-gray)]">
              Redirect URI（在 Google Cloud Console 授權網址要一致）：
              {configuredRedirectUri || "未能推導，請設定 NEXT_PUBLIC_APP_URL 或 GOOGLE_REDIRECT_URI"}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-9 rounded-[10px] px-4 text-[13px]">
            <a href="/api/google/oauth/start">連接 Google 帳號</a>
          </Button>
          {isConnected ? (
            <Button asChild className="h-9 rounded-[10px] px-4 text-[13px]" variant="outline">
              <a href={googleCalendarWebUrl} rel="noreferrer" target="_blank">
                開啟 Google Calendar
                <ArrowUpRight className="size-3.5" />
              </a>
            </Button>
          ) : null}
          <form action={disconnectGoogleCalendar}>
            <Button className="h-9 rounded-[10px] px-4 text-[13px]" type="submit" variant="outline">
              中斷連線
            </Button>
          </form>
        </div>

        <form action={updateGoogleCalendarSettings} className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-[var(--color-cool-gray)]">
              Calendar ID（預設 primary）
            </span>
            <input
              className={fieldClassName}
              defaultValue={integration?.calendar_id ?? "primary"}
              name="calendar_id"
              placeholder="primary"
              type="text"
            />
          </label>
          <Button className="h-9 rounded-[10px] px-4 text-[13px]" type="submit">
            儲存 Calendar 設定
          </Button>
        </form>
      </div>
    </div>
  );
}

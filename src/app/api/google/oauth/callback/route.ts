import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { exchangeCodeForGoogleTokens } from "@/lib/google-calendar";

function appUrl(request: NextRequest) {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "") ??
    new URL(request.url).origin
  );
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      `${appUrl(request)}/settings/integrations/google-calendar?error=Google OAuth callback 缺少 code`,
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      `${appUrl(request)}/login?next=/settings/integrations/google-calendar`,
    );
  }

  await supabase.rpc("ensure_current_user_profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "owner") {
    return NextResponse.redirect(
      `${appUrl(request)}/settings/integrations/google-calendar?error=只有 owner 可以連接 Google Calendar`,
    );
  }

  try {
    const tokens = await exchangeCodeForGoogleTokens(code);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    const { error } = await supabase.from("google_integrations").upsert(
      {
        owner_id: user.id,
        provider: "google",
        calendar_id: "primary",
        encrypted_access_token: tokens.access_token,
        encrypted_refresh_token: tokens.refresh_token ?? null,
        token_expiry: expiresAt,
        scopes: tokens.scope ? tokens.scope.split(" ") : [],
        active: true,
      },
      {
        onConflict: "owner_id",
      },
    );

    if (error) {
      return NextResponse.redirect(
        `${appUrl(request)}/settings/integrations/google-calendar?error=${encodeURIComponent(error.message)}`,
      );
    }

    return NextResponse.redirect(
      `${appUrl(request)}/settings/integrations/google-calendar?connected=1`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown OAuth error";
    return NextResponse.redirect(
      `${appUrl(request)}/settings/integrations/google-calendar?error=${encodeURIComponent(message)}`,
    );
  }
}

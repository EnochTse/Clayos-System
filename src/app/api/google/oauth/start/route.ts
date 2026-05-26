import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildGoogleOAuthUrl } from "@/lib/google-calendar";

function appUrl(request: NextRequest) {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "") ??
    new URL(request.url).origin
  );
}

export async function GET(request: NextRequest) {
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

  return NextResponse.redirect(buildGoogleOAuthUrl());
}

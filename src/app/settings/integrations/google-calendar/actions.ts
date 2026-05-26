"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireOwner(next: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "owner") {
    redirect(`${next}?error=只有 owner 可以管理 Google Calendar`);
  }

  return { supabase, userId: user.id };
}

export async function updateGoogleCalendarSettings(formData: FormData) {
  const { supabase, userId } = await requireOwner(
    "/settings/integrations/google-calendar",
  );

  const calendarId =
    String(formData.get("calendar_id") ?? "").trim() || "primary";

  const { error } = await supabase
    .from("google_integrations")
    .upsert(
      {
        owner_id: userId,
        provider: "google",
        calendar_id: calendarId,
        active: true,
      },
      { onConflict: "owner_id" },
    );

  if (error) {
    redirect(
      `/settings/integrations/google-calendar?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect("/settings/integrations/google-calendar?saved=1");
}

export async function disconnectGoogleCalendar() {
  const { supabase, userId } = await requireOwner(
    "/settings/integrations/google-calendar",
  );

  const { error } = await supabase
    .from("google_integrations")
    .update({
      active: false,
      encrypted_access_token: null,
      encrypted_refresh_token: null,
      token_expiry: null,
    })
    .eq("owner_id", userId);

  if (error) {
    redirect(
      `/settings/integrations/google-calendar?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect("/settings/integrations/google-calendar?disconnected=1");
}

"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const contactChannels = new Set([
  "instagram",
  "whatsapp",
  "google_form",
  "walk_in",
  "referral",
  "email",
  "phone",
  "other",
]);

const studentStatuses = new Set(["lead", "active", "inactive", "archived"]);

function optionalValue(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return value.length > 0 ? value : null;
}

export async function createStudent(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/students/new");
  }

  await supabase.rpc("ensure_current_user_profile");

  const displayName = String(formData.get("display_name") ?? "").trim();
  const sourceChannel = optionalValue(formData, "source_channel");
  const status = String(formData.get("status") ?? "lead").trim();

  if (!displayName) {
    redirect("/students/new?error=請輸入學生顯示名稱");
  }

  if (sourceChannel && !contactChannels.has(sourceChannel)) {
    redirect("/students/new?error=來源渠道不正確");
  }

  if (!studentStatuses.has(status)) {
    redirect("/students/new?error=學生狀態不正確");
  }

  const { error } = await supabase.from("students").insert({
    display_name: displayName,
    phone: optionalValue(formData, "phone"),
    whatsapp_number: optionalValue(formData, "whatsapp_number"),
    instagram_handle: optionalValue(formData, "instagram_handle"),
    email: optionalValue(formData, "email"),
    source_channel: sourceChannel,
    status,
    notes: optionalValue(formData, "notes"),
    created_by: user.id,
  });

  if (error) {
    redirect(`/students/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/students?created=1");
}

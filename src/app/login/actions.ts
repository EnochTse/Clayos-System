"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/").trim() || "/";

  if (!email) {
    redirect("/login?error=請輸入 Email");
  }

  if (!password) {
    redirect("/login?error=請輸入密碼");
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const { error: profileError } = await supabase.rpc("ensure_current_user_profile");

  if (profileError) {
    redirect(`/login?error=${encodeURIComponent(profileError.message)}`);
  }

  redirect(next);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login?message=已登出");
}

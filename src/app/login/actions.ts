"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function getAppUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");

  if (!appUrl) {
    redirect("/login?error=Missing NEXT_PUBLIC_APP_URL");
  }

  return appUrl;
}

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const next = String(formData.get("next") ?? "/").trim() || "/";

  if (!email) {
    redirect("/login?error=請輸入 Email");
  }

  const appUrl = getAppUrl();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `/login?message=${encodeURIComponent("已寄出登入連結，請檢查你的 Email。")}`,
  );
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login?message=已登出");
}

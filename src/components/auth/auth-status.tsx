import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { signOut } from "@/app/login/actions";

export async function AuthStatus() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Button asChild className="h-9 rounded-[10px] px-4 text-[13px]">
        <Link href="/login">登入</Link>
      </Button>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="studio-card-muted flex flex-col gap-3 p-4 text-sm text-[var(--color-ink)] sm:flex-row sm:items-center">
      <div>
        <p className="font-medium">{profile?.full_name ?? user.email}</p>
        <p className="text-xs text-[var(--color-muted-gray)]">
          角色：{profile?.role ?? "未設定"}
        </p>
      </div>
      <form action={signOut}>
        <Button className="h-8 rounded-[10px] px-3 text-[12px]" type="submit" variant="outline">
          登出
        </Button>
      </form>
    </div>
  );
}

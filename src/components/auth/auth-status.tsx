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
      <Button
        asChild
        className="h-11 rounded-full bg-[#f5d49a] px-6 text-[#241711] hover:bg-[#f1c574]"
      >
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
    <div className="flex flex-col gap-3 rounded-3xl bg-white/10 p-4 text-sm text-stone-100 sm:flex-row sm:items-center">
      <div>
        <p className="font-medium">{profile?.full_name ?? user.email}</p>
        <p className="text-xs text-stone-300">角色：{profile?.role ?? "未設定"}</p>
      </div>
      <form action={signOut}>
        <Button
          className="h-9 rounded-full border-white/30 px-4 text-white hover:bg-white/10"
          type="submit"
          variant="outline"
        >
          登出
        </Button>
      </form>
    </div>
  );
}

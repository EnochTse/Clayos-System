import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type StudentsPageProps = {
  searchParams?: Promise<{
    created?: string;
    updated?: string;
  }>;
};

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/students");
  }

  await supabase.rpc("ensure_current_user_profile");

  const { data: students, error } = await supabase
    .from("students")
    .select("id, display_name, phone, whatsapp_number, instagram_handle, email, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="studio-kicker">Workspace</p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
            Students
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted-gray)]">
            查看、搜尋並編輯學生資料。
          </p>
        </div>
        <Button asChild className="h-9 rounded-[10px] px-4 text-[13px]">
          <Link href="/students/new">新增學生</Link>
        </Button>
      </div>

      {params?.created ? (
        <div className="studio-alert studio-alert-success">
          學生已成功儲存到 Supabase。
        </div>
      ) : null}
      {params?.updated ? (
        <div className="studio-alert studio-alert-success">
          學生資料已更新。
        </div>
      ) : null}

      {error ? (
        <div className="studio-alert studio-alert-error">
          無法讀取學生資料：{error.message}
        </div>
      ) : null}

      <section className="studio-card overflow-hidden">
        {students && students.length > 0 ? (
          <div className="divide-y divide-[var(--color-fog)]">
            {students.map((student) => (
              <article className="p-4 sm:p-5" key={student.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-[var(--color-ink)]">
                      {student.display_name}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--color-muted-gray)]">
                      {student.phone || student.whatsapp_number || student.email || "未填聯絡資料"}
                    </p>
                    {student.instagram_handle ? (
                      <p className="mt-1 text-sm text-[var(--color-muted-gray)]">
                        {student.instagram_handle}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="studio-badge">{student.status}</span>
                    <Button asChild className="h-8 rounded-[10px] px-3 text-xs" size="sm" variant="outline">
                      <Link href={`/students/${student.id}/edit`}>編輯</Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="font-medium text-[var(--color-ink)]">暫時未有學生資料</p>
            <p className="mt-2 text-sm text-[var(--color-muted-gray)]">
              新增第一位學生後會在這裡顯示。
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

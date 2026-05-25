"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const sourceChannels = new Set(["whatsapp", "instagram", "google_form", "other"]);

function optionalValue(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return value.length > 0 ? value : null;
}

export async function createAiImportDraft(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/ai-imports/new");
  }

  await supabase.rpc("ensure_current_user_profile");

  const sourceChannel = String(formData.get("source_channel") ?? "").trim();
  const studentGuess = optionalValue(formData, "student_guess");
  const rawMessage = optionalValue(formData, "raw_message");

  if (!sourceChannels.has(sourceChannel)) {
    redirect("/ai-imports/new?error=截圖來源不正確");
  }

  const extractedJson = {
    student: {
      display_name: studentGuess,
    },
    notes: rawMessage,
    missing_required_fields: ["AI extraction provider not connected yet"],
    confidence: 0,
    warnings: ["這是人手建立的 AI 匯入草稿，尚未執行圖片 AI 擷取。"],
  };

  const { error } = await supabase.from("ai_imports").insert({
    source_channel: sourceChannel,
    raw_text: rawMessage,
    extracted_json: extractedJson,
    confidence: 0,
    status: "needs_review",
    warnings: ["這是待審核草稿，不會自動寫入正式預約或付款。"],
    created_by: user.id,
  });

  if (error) {
    redirect(`/ai-imports/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/ai-imports?created=1");
}

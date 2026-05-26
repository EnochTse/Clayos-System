"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const paymentMethods = new Set([
  "cash",
  "fps",
  "payme",
  "bank_transfer",
  "credit_card",
  "stripe",
  "other",
]);

const paymentStatuses = new Set([
  "unpaid",
  "pending",
  "paid",
  "refunded",
  "partially_refunded",
]);

function optionalValue(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return value.length > 0 ? value : null;
}

export async function createPayment(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/payments/new");
  }

  await supabase.rpc("ensure_current_user_profile");

  const studentId = optionalValue(formData, "student_id");
  const amount = Number(formData.get("amount_hkd") ?? 0);
  const method = optionalValue(formData, "method");
  const status = String(formData.get("status") ?? "pending").trim();
  const paidDate = optionalValue(formData, "paid_date");

  if (!Number.isFinite(amount) || amount < 0) {
    redirect("/payments/new?error=付款金額不正確");
  }

  if (method && !paymentMethods.has(method)) {
    redirect("/payments/new?error=付款方式不正確");
  }

  if (!paymentStatuses.has(status)) {
    redirect("/payments/new?error=付款狀態不正確");
  }

  const { error } = await supabase.from("payments").insert({
    student_id: studentId,
    amount_hkd: amount,
    method,
    status,
    paid_at: paidDate ? new Date(`${paidDate}T00:00:00+08:00`).toISOString() : null,
    reference: optionalValue(formData, "reference"),
    notes: optionalValue(formData, "notes"),
    created_by: user.id,
  });

  if (error) {
    redirect(`/payments/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/payments?created=1");
}

export async function updatePayment(paymentId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/payments/${paymentId}/edit`);
  }

  await supabase.rpc("ensure_current_user_profile");

  const studentId = optionalValue(formData, "student_id");
  const amount = Number(formData.get("amount_hkd") ?? 0);
  const method = optionalValue(formData, "method");
  const status = String(formData.get("status") ?? "pending").trim();
  const paidDate = optionalValue(formData, "paid_date");

  if (!Number.isFinite(amount) || amount < 0) {
    redirect(`/payments/${paymentId}/edit?error=付款金額不正確`);
  }

  if (method && !paymentMethods.has(method)) {
    redirect(`/payments/${paymentId}/edit?error=付款方式不正確`);
  }

  if (!paymentStatuses.has(status)) {
    redirect(`/payments/${paymentId}/edit?error=付款狀態不正確`);
  }

  const { error } = await supabase
    .from("payments")
    .update({
      student_id: studentId,
      amount_hkd: amount,
      method,
      status,
      paid_at: paidDate ? new Date(`${paidDate}T00:00:00+08:00`).toISOString() : null,
      reference: optionalValue(formData, "reference"),
      notes: optionalValue(formData, "notes"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId);

  if (error) {
    redirect(`/payments/${paymentId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/payments?updated=1");
}

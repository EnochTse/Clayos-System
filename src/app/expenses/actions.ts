"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const expenseCategories = new Set([
  "clay",
  "glaze",
  "tools",
  "firing",
  "rent",
  "utilities",
  "salary",
  "marketing",
  "repair",
  "packaging",
  "other",
]);

const paymentMethods = new Set([
  "cash",
  "fps",
  "payme",
  "bank_transfer",
  "credit_card",
  "stripe",
  "other",
]);

function optionalValue(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return value.length > 0 ? value : null;
}

export async function createExpense(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/expenses/new");
  }

  await supabase.rpc("ensure_current_user_profile");

  const expenseDate = String(formData.get("expense_date") ?? "").trim();
  const category = String(formData.get("category") ?? "other").trim();
  const item = String(formData.get("item") ?? "").trim();
  const amount = Number(formData.get("amount_hkd") ?? 0);
  const method = optionalValue(formData, "method");

  if (!expenseDate) {
    redirect("/expenses/new?error=請輸入支出日期");
  }

  if (!expenseCategories.has(category)) {
    redirect("/expenses/new?error=支出分類不正確");
  }

  if (!item) {
    redirect("/expenses/new?error=請輸入項目或描述");
  }

  if (!Number.isFinite(amount) || amount < 0) {
    redirect("/expenses/new?error=支出金額不正確");
  }

  if (method && !paymentMethods.has(method)) {
    redirect("/expenses/new?error=付款方式不正確");
  }

  const { error } = await supabase.from("expenses").insert({
    expense_date: expenseDate,
    category,
    vendor: optionalValue(formData, "vendor"),
    item,
    amount_hkd: amount,
    method,
    notes: optionalValue(formData, "notes"),
    created_by: user.id,
  });

  if (error) {
    redirect(`/expenses/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/expenses?created=1");
}

export async function updateExpense(expenseId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/expenses/${expenseId}/edit`);
  }

  await supabase.rpc("ensure_current_user_profile");

  const expenseDate = String(formData.get("expense_date") ?? "").trim();
  const category = String(formData.get("category") ?? "other").trim();
  const item = String(formData.get("item") ?? "").trim();
  const amount = Number(formData.get("amount_hkd") ?? 0);
  const method = optionalValue(formData, "method");

  if (!expenseDate) {
    redirect(`/expenses/${expenseId}/edit?error=請輸入支出日期`);
  }
  if (!expenseCategories.has(category)) {
    redirect(`/expenses/${expenseId}/edit?error=支出分類不正確`);
  }
  if (!item) {
    redirect(`/expenses/${expenseId}/edit?error=請輸入項目或描述`);
  }
  if (!Number.isFinite(amount) || amount < 0) {
    redirect(`/expenses/${expenseId}/edit?error=支出金額不正確`);
  }
  if (method && !paymentMethods.has(method)) {
    redirect(`/expenses/${expenseId}/edit?error=付款方式不正確`);
  }

  const { error } = await supabase
    .from("expenses")
    .update({
      expense_date: expenseDate,
      category,
      vendor: optionalValue(formData, "vendor"),
      item,
      amount_hkd: amount,
      method,
      notes: optionalValue(formData, "notes"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", expenseId);

  if (error) {
    redirect(`/expenses/${expenseId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/expenses?updated=1");
}

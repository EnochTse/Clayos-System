"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type SelectOption = {
  label: string;
  value: string;
};

export type DraftEntryField = {
  name: string;
  label: string;
  type: "text" | "tel" | "email" | "date" | "time" | "number" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
};

type DraftEntryFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  fields: DraftEntryField[];
};

export function DraftEntryForm({
  title,
  description,
  submitLabel,
  fields,
}: DraftEntryFormProps) {
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedAt(new Date().toLocaleString("zh-HK"));
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 text-[#241711] sm:px-6">
      <Link className="text-sm font-medium text-stone-500 hover:text-stone-900" href="/">
        ← 返回總覽
      </Link>

      <div className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
        <div>
          <p className="text-sm font-medium tracking-[0.25em] text-stone-400">
            CLAYOS STUDIO
          </p>
          <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
          <p className="mt-3 text-sm leading-7 text-stone-500">{description}</p>
        </div>

        {submittedAt ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
            已收到這份草稿輸入（{submittedAt}）。下一步接上 Supabase 後，這裡會改為正式儲存並建立 audit log。
          </div>
        ) : null}

        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <label className="grid gap-2" key={field.name}>
              <span className="text-sm font-medium text-stone-700">
                {field.label}
                {field.required ? <span className="text-red-600"> *</span> : null}
              </span>
              <FieldControl field={field} />
            </label>
          ))}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button className="h-11 rounded-full px-6" type="submit">
              {submitLabel}
            </Button>
            <Button
              asChild
              className="h-11 rounded-full px-6"
              type="button"
              variant="outline"
            >
              <Link href="/">取消</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldControl({ field }: { field: DraftEntryField }) {
  const controlClassName =
    "min-h-11 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-[#4a2f24] focus:bg-white focus:ring-4 focus:ring-[#4a2f24]/10";

  if (field.type === "textarea") {
    return (
      <textarea
        className={`${controlClassName} min-h-28 resize-y`}
        name={field.name}
        placeholder={field.placeholder}
        required={field.required}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        className={controlClassName}
        name={field.name}
        required={field.required}
      >
        <option value="">請選擇</option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      className={controlClassName}
      name={field.name}
      placeholder={field.placeholder}
      required={field.required}
      type={field.type}
    />
  );
}

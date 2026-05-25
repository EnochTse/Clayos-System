import { DraftEntryForm, type DraftEntryField } from "@/components/forms/draft-entry-form";

const fields: DraftEntryField[] = [
  { name: "student_name", label: "學生名稱", type: "text", placeholder: "付款學生", required: true },
  { name: "amount_hkd", label: "金額 HKD", type: "number", placeholder: "680", required: true },
  {
    name: "method",
    label: "付款方式",
    type: "select",
    required: true,
    options: [
      { label: "現金", value: "cash" },
      { label: "FPS", value: "fps" },
      { label: "PayMe", value: "payme" },
      { label: "銀行轉帳", value: "bank_transfer" },
      { label: "信用卡", value: "credit_card" },
      { label: "其他", value: "other" },
    ],
  },
  {
    name: "status",
    label: "付款狀態",
    type: "select",
    required: true,
    options: [
      { label: "未付款", value: "unpaid" },
      { label: "待確認", value: "pending" },
      { label: "已付款", value: "paid" },
    ],
  },
  { name: "paid_date", label: "付款日期", type: "date" },
  { name: "reference", label: "參考編號", type: "text", placeholder: "FPS / PayMe / bank reference" },
  { name: "notes", label: "備註", type: "textarea", placeholder: "關聯課程、套票、收據備註..." },
];

export default function NewPaymentPage() {
  return (
    <DraftEntryForm
      description="記錄收入與付款狀態。付款狀態會和出席扣堂分開處理。"
      fields={fields}
      submitLabel="儲存付款草稿"
      title="記錄付款"
    />
  );
}

import { DraftEntryForm, type DraftEntryField } from "@/components/forms/draft-entry-form";

const fields: DraftEntryField[] = [
  { name: "expense_date", label: "支出日期", type: "date", required: true },
  {
    name: "category",
    label: "支出分類",
    type: "select",
    required: true,
    options: [
      { label: "陶泥", value: "clay" },
      { label: "釉藥", value: "glaze" },
      { label: "工具", value: "tools" },
      { label: "燒窯", value: "firing" },
      { label: "租金", value: "rent" },
      { label: "水電", value: "utilities" },
      { label: "薪金", value: "salary" },
      { label: "市場推廣", value: "marketing" },
      { label: "維修", value: "repair" },
      { label: "包裝", value: "packaging" },
      { label: "其他", value: "other" },
    ],
  },
  { name: "vendor", label: "供應商", type: "text", placeholder: "供應商 / 店舖名稱" },
  { name: "item", label: "項目 / 描述", type: "text", placeholder: "例如：白泥 10kg", required: true },
  { name: "amount_hkd", label: "金額 HKD", type: "number", placeholder: "250", required: true },
  {
    name: "method",
    label: "付款方式",
    type: "select",
    options: [
      { label: "現金", value: "cash" },
      { label: "FPS", value: "fps" },
      { label: "PayMe", value: "payme" },
      { label: "銀行轉帳", value: "bank_transfer" },
      { label: "信用卡", value: "credit_card" },
      { label: "其他", value: "other" },
    ],
  },
  { name: "notes", label: "備註", type: "textarea", placeholder: "收據、用途、內部備註..." },
];

export default function NewExpensePage() {
  return (
    <DraftEntryForm
      description="記錄工作室支出。正式版本會支援收據上傳與月結報表。"
      fields={fields}
      submitLabel="儲存支出草稿"
      title="記錄支出"
    />
  );
}

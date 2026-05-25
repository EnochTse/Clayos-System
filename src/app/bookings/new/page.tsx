import { DraftEntryForm, type DraftEntryField } from "@/components/forms/draft-entry-form";

const fields: DraftEntryField[] = [
  { name: "student_name", label: "學生名稱", type: "text", placeholder: "搜尋或輸入學生名稱", required: true },
  {
    name: "course",
    label: "課程",
    type: "select",
    required: true,
    options: [
      { label: "咖啡濾杯工作坊", value: "coffee-dripper-workshop" },
      { label: "其他 / TBC", value: "other" },
    ],
  },
  { name: "booking_date", label: "日期", type: "date", required: true },
  { name: "start_time", label: "開始時間", type: "time", required: true },
  { name: "end_time", label: "結束時間", type: "time", required: true },
  {
    name: "status",
    label: "預約狀態",
    type: "select",
    required: true,
    options: [
      { label: "草稿", value: "draft" },
      { label: "已確認", value: "confirmed" },
      { label: "待付款", value: "pending_payment" },
    ],
  },
  { name: "credits_to_deduct", label: "預計扣堂", type: "number", placeholder: "1", required: true },
  { name: "notes", label: "備註", type: "textarea", placeholder: "學生要求、導師、房間、改期原因..." },
];

export default function NewBookingPage() {
  return (
    <DraftEntryForm
      description="建立預約草稿。正式版本只會在確認預約後同步 Google Calendar。"
      fields={fields}
      submitLabel="儲存預約草稿"
      title="新增預約"
    />
  );
}

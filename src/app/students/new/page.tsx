import { DraftEntryForm, type DraftEntryField } from "@/components/forms/draft-entry-form";

const fields: DraftEntryField[] = [
  { name: "display_name", label: "學生顯示名稱", type: "text", placeholder: "例如：陳小明", required: true },
  { name: "phone", label: "電話", type: "tel", placeholder: "+852 9123 4567" },
  { name: "whatsapp_number", label: "WhatsApp", type: "tel", placeholder: "+852 9123 4567" },
  { name: "instagram_handle", label: "Instagram", type: "text", placeholder: "@clayos_student" },
  { name: "email", label: "Email", type: "email", placeholder: "student@example.com" },
  {
    name: "source_channel",
    label: "來源渠道",
    type: "select",
    options: [
      { label: "Instagram", value: "instagram" },
      { label: "WhatsApp", value: "whatsapp" },
      { label: "Google Form", value: "google_form" },
      { label: "Walk-in", value: "walk_in" },
      { label: "Referral", value: "referral" },
      { label: "其他", value: "other" },
    ],
  },
  {
    name: "status",
    label: "學生狀態",
    type: "select",
    required: true,
    options: [
      { label: "潛在客戶", value: "lead" },
      { label: "活躍", value: "active" },
      { label: "非活躍", value: "inactive" },
    ],
  },
  { name: "notes", label: "備註", type: "textarea", placeholder: "偏好聯絡時間、課程興趣、特別注意事項..." },
];

export default function NewStudentPage() {
  return (
    <DraftEntryForm
      description="建立學生基本資料。這些欄位會對應到 Supabase 的 students table。"
      fields={fields}
      submitLabel="儲存學生草稿"
      title="新增學生"
    />
  );
}

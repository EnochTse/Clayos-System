import { DraftEntryForm, type DraftEntryField } from "@/components/forms/draft-entry-form";

const fields: DraftEntryField[] = [
  {
    name: "source_channel",
    label: "截圖來源",
    type: "select",
    required: true,
    options: [
      { label: "WhatsApp", value: "whatsapp" },
      { label: "Instagram", value: "instagram" },
      { label: "Google Form", value: "google_form" },
      { label: "其他", value: "other" },
    ],
  },
  { name: "student_guess", label: "學生名稱線索", type: "text", placeholder: "截圖中看到的名稱" },
  { name: "raw_message", label: "截圖文字 / 備註", type: "textarea", placeholder: "暫時可先貼上對話內容；下一步會改成圖片上傳與 AI 擷取。" },
];

export default function NewAiImportPage() {
  return (
    <DraftEntryForm
      description="AI 匯入只會建立待確認草稿，不會自動建立預約、扣堂或記錄付款。"
      fields={fields}
      submitLabel="建立 AI 匯入草稿"
      title="上傳截圖 / AI 匯入"
    />
  );
}

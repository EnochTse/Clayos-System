export type AiBookingExtraction = {
  source_channel: "whatsapp" | "instagram" | "google_form" | "other";
  language_detected?: "zh-Hant" | "en" | "mixed" | "unknown";
  student: {
    display_name?: string;
    phone?: string;
    whatsapp_number?: string;
    instagram_handle?: string;
    email?: string;
    is_existing_student_guess?: boolean;
  };
  intent:
    | "new_booking"
    | "reschedule"
    | "cancel"
    | "payment_update"
    | "general_inquiry"
    | "unknown";
  course: {
    name_guess?: string;
    course_id_guess?: string;
    package_guess?: string;
  };
  booking: {
    date_text?: string;
    date_iso?: string;
    start_time_text?: string;
    start_time_iso?: string;
    end_time_iso?: string;
    timezone?: "Asia/Hong_Kong" | string;
    is_confirmed_by_customer?: boolean;
  };
  payment: {
    amount_hkd?: number;
    method_guess?:
      | "cash"
      | "fps"
      | "payme"
      | "bank_transfer"
      | "credit_card"
      | "other";
    status_guess?: "unpaid" | "pending" | "paid" | "unknown";
    reference?: string;
  };
  notes?: string;
  missing_required_fields: string[];
  confidence: number;
  warnings: string[];
};

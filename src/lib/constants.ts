import {
  BarChart3,
  BookOpen,
  Bot,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  Download,
  Home,
  Package,
  ReceiptText,
  Settings,
  Users,
} from "lucide-react";

export const studioBrand = {
  name: "Clayos Studio",
  tagline: "在混亂與秩序之間 找到屬於自己的節奏",
  idea: "在 Clayos，我們相信每一種混亂，都有自己的秩序。",
};

export const navigationItems = [
  { label: "總覽", href: "/dashboard", icon: Home },
  { label: "今日課堂", href: "/attendance", icon: ClipboardCheck },
  { label: "預約", href: "/bookings", icon: CalendarDays },
  { label: "學生", href: "/students", icon: Users },
  { label: "課程", href: "/courses", icon: BookOpen },
  { label: "套票", href: "/packages", icon: Package },
  { label: "AI 匯入", href: "/ai-imports", icon: Bot },
  { label: "收入", href: "/payments", icon: CircleDollarSign },
  { label: "支出", href: "/expenses", icon: ReceiptText },
  { label: "報表", href: "/reports", icon: BarChart3 },
  { label: "匯出", href: "/exports", icon: Download },
  { label: "設定", href: "/settings", icon: Settings },
] as const;

export const dashboardCards = [
  { label: "今日課堂", value: "0", helper: "等待連接 Supabase 預約資料" },
  { label: "本週預約", value: "0", helper: "即將建立預約 CRUD" },
  { label: "待確認 AI 匯入", value: "0", helper: "AI 只會產生可審核草稿" },
  { label: "未付款", value: "HK$0", helper: "付款狀態會與出席分開追蹤" },
  { label: "即將到期套票", value: "0", helper: "依套票到期日與剩餘堂數計算" },
  { label: "本月收入", value: "HK$0", helper: "只計入已付款收入" },
  { label: "本月支出", value: "HK$0", helper: "材料、租金、薪金等支出" },
  { label: "本月淨額", value: "HK$0", helper: "收入扣除支出後顯示" },
] as const;

export const courseCategories = [
  { nameZh: "體驗工作坊", nameEn: "Trial Workshop", type: "workshop" },
  { nameZh: "常規課程", nameEn: "Regular Course", type: "regular_course" },
  { nameZh: "私人班", nameEn: "Private Class", type: "private_class" },
  { nameZh: "團體工作坊", nameEn: "Group Workshop", type: "group_workshop" },
  { nameZh: "企業活動", nameEn: "Corporate Workshop", type: "corporate_workshop" },
  { nameZh: "開放工作室", nameEn: "Open Studio", type: "open_studio" },
] as const;

export const seedCourse = {
  name_zh: "咖啡濾杯工作坊",
  name_en: "Coffee Dripper Workshop",
  slug: "coffee-dripper-workshop",
  course_type: "workshop",
  level: "beginner",
  description_zh:
    "即使無陶藝經驗，都可以親自打造獨特的咖啡濾杯。此工作坊教授運用泥板技法製作，完成後由導師代為上一款釉。",
  description_en:
    "A beginner-friendly workshop where students create a unique coffee dripper using slab-building technique. After completion, the instructor applies one glaze.",
  technique_tags: ["泥板技法", "手捏", "上釉"],
  duration_minutes: null,
  default_price_hkd: null,
  default_credits_required: 1,
  validity_days: 90,
  includes_materials: true,
  includes_firing: true,
  source_note:
    "Verified from public Clayos Studio courses search snippet; price and duration TBC.",
} as const;

export const implementationPhases = [
  "專案基礎：Next.js、Tailwind、Supabase client、資料庫 schema、RLS、seed data",
  "核心營運：學生、課程、套票、預約 CRUD 與行動版導覽",
  "堂數與財務：出席扣堂、付款、支出、審計紀錄與報表",
  "匯出整合：Excel workbook、Google Sheets 匯出、Google Calendar 同步",
  "AI 與 PWA：截圖草稿匯入、人手確認流程、manifest、離線/安裝支援與 QA",
] as const;

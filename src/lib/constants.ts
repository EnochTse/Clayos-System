import {
  Bot,
  CalendarDays,
  CircleDollarSign,
  Home,
  Plus,
  ReceiptText,
  Settings,
  Users,
} from "lucide-react";

export const studioBrand = {
  name: "Clayos Studio Manager",
  tagline: "Operational Workspace",
  idea: "讓學生、預約、付款、支出與 AI 匯入流程集中在同一個營運工作台。",
};

export const navigationItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Students", href: "/students", icon: Users },
  { label: "Bookings", href: "/bookings", icon: CalendarDays },
  { label: "Payments", href: "/payments", icon: CircleDollarSign },
  { label: "Expenses", href: "/expenses", icon: ReceiptText },
  { label: "AI Imports", href: "/ai-imports", icon: Bot },
] as const;

export const workspaceUtilityItems = [
  { label: "Google Calendar", href: "/settings/integrations/google-calendar", icon: CalendarDays },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

export const quickActionItems = [
  {
    label: "新增學生",
    description: "建立學生資料",
    href: "/students/new",
    icon: Users,
  },
  {
    label: "新增預約",
    description: "建立課堂預約",
    href: "/bookings/new",
    icon: CalendarDays,
  },
  {
    label: "記錄付款",
    description: "新增收入紀錄",
    href: "/payments/new",
    icon: CircleDollarSign,
  },
  {
    label: "記錄支出",
    description: "新增成本紀錄",
    href: "/expenses/new",
    icon: ReceiptText,
  },
  {
    label: "上傳截圖",
    description: "建立 AI 草稿",
    href: "/ai-imports/new",
    icon: Plus,
  },
] as const;

export const dashboardCards = [
  { label: "今日預約", value: "bookingsToday", helper: "今日排程" },
  { label: "進行中預約", value: "bookingsInProgress", helper: "待跟進預約" },
  { label: "活躍學生", value: "activeStudents", helper: "目前可預約學生" },
  { label: "待確認付款", value: "pendingPayments", helper: "需要確認收款" },
  { label: "本月支出", value: "monthExpenses", helper: "營運成本追蹤" },
  { label: "待審核 AI", value: "pendingAiImports", helper: "需人工確認資料" },
] as const;

export const dashboardBoardColumns = [
  {
    key: "open",
    title: "Open",
    subtitle: "待處理",
    actions: [
      { label: "新增學生資料", href: "/students/new", tag: "Student", hint: "建立新聯絡人" },
      { label: "建立新預約", href: "/bookings/new", tag: "Booking", hint: "排入課堂時段" },
    ],
  },
  {
    key: "inProgress",
    title: "In Progress",
    subtitle: "進行中",
    actions: [
      { label: "追蹤待付款", href: "/payments", tag: "Payment", hint: "查看 pending / unpaid" },
      { label: "記錄本日支出", href: "/expenses/new", tag: "Expense", hint: "補齊營運成本" },
    ],
  },
  {
    key: "resolved",
    title: "Resolved",
    subtitle: "已處理",
    actions: [
      { label: "審核 AI 匯入草稿", href: "/ai-imports", tag: "AI Import", hint: "確認資料可用性" },
      { label: "檢查日曆同步", href: "/settings/integrations/google-calendar", tag: "Calendar", hint: "確認連線狀態" },
    ],
  },
] as const;

export const manageRecordItems = [
  {
    label: "學生紀錄",
    description: "查看、搜尋與編輯學生資料",
    href: "/students",
    icon: Users,
  },
  {
    label: "預約紀錄",
    description: "查看與編輯已建立的預約",
    href: "/bookings",
    icon: CalendarDays,
  },
  {
    label: "付款紀錄",
    description: "查看與編輯已記錄付款資料",
    href: "/payments",
    icon: CircleDollarSign,
  },
  {
    label: "支出紀錄",
    description: "查看與編輯已記錄支出資料",
    href: "/expenses",
    icon: ReceiptText,
  },
  {
    label: "AI 匯入紀錄",
    description: "查看與審核 AI 匯入草稿",
    href: "/ai-imports",
    icon: Bot,
  },
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
  "全站導覽改為 Dashboard App Shell（固定側欄 + 操作區 + 工作畫布）",
  "學生、預約、付款、支出、AI 匯入統一為可搜尋可編輯的營運頁面",
  "Google Calendar 同步與角色權限（owner 控制整合設定）",
  "營運資料輸出（Excel / Google Sheets）與財務視圖",
  "AI 匯入自動化 + 行動版 PWA 優化與最終 QA",
] as const;

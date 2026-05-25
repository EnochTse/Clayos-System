# Clayos Studio Manager MVP 開發計劃

## 目標

建立一個行動優先、可安裝到手機主畫面的內部 PWA，協助 Clayos Studio 管理學生、預約、套票堂數、付款、支出、AI 截圖匯入、Google Calendar 同步，以及 Excel / Google Sheets 匯出。

## 實作順序

1. 專案基礎
   - Next.js App Router、TypeScript strict、Tailwind、ESLint。
   - Supabase client、環境變數範例、資料庫 migration、RLS helper、初始 seed data。
   - 繁體中文 mobile-first layout、底部導覽、首頁總覽。

2. 核心營運資料
   - 學生 CRM：新增、編輯、封存、搜尋、聯絡渠道、學生詳情分頁。
   - 課程與套票：可編輯課程、套票、有效期、堂數規則。
   - 預約：草稿、確認、完成、取消、改期、no-show 與衝突檢查。

3. 堂數、付款與支出
   - 出席紀錄驅動扣堂，禁止未留紀錄直接改剩餘堂數。
   - 手動堂數調整必須帶原因與 audit log。
   - 收入、未付款、退款、支出、月結報表。

4. 匯出與報表
   - 全資料 Excel workbook，一個主要資料表一個 sheet。
   - Google Sheets 建立或更新既有 spreadsheet。
   - 每次匯出建立 export job 與 audit log。

5. 整合與安全
   - Google Calendar OAuth，只同步 confirmed booking，更新/取消同步回 Google Calendar。
   - AI 截圖匯入只產生 draft，必須人手確認才可寫入學生、預約、付款或套票。
   - Auth、RLS、角色權限、PWA manifest、QA 與手動驗收。

## 第一個可交付版本

- Supabase schema 與 seed data 可套用。
- 首頁總覽可顯示 MVP 模組與初始狀態。
- Navigation、環境變數與 Supabase client 已準備好。
- 下一步開始做 Auth 與 protected dashboard layout，然後進入學生 CRUD。

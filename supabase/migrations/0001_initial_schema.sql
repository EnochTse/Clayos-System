create extension if not exists pgcrypto;

create type app_role as enum ('owner', 'admin', 'staff', 'instructor');
create type contact_channel as enum ('instagram', 'whatsapp', 'google_form', 'walk_in', 'referral', 'email', 'phone', 'other');
create type student_status as enum ('lead', 'active', 'inactive', 'archived');
create type course_type as enum ('workshop', 'regular_course', 'private_class', 'group_workshop', 'corporate_workshop', 'open_studio', 'other');
create type booking_status as enum ('draft', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'no_show', 'pending_payment');
create type attendance_status as enum ('attended', 'absent_no_deduct', 'no_show_deduct', 'cancelled_no_deduct', 'make_up');
create type payment_status as enum ('unpaid', 'pending', 'paid', 'refunded', 'partially_refunded');
create type payment_method as enum ('cash', 'fps', 'payme', 'bank_transfer', 'credit_card', 'stripe', 'other');
create type expense_category as enum ('clay', 'glaze', 'tools', 'firing', 'rent', 'utilities', 'salary', 'marketing', 'repair', 'packaging', 'other');
create type ai_import_status as enum ('uploaded', 'extracted', 'needs_review', 'confirmed', 'rejected', 'error');
create type export_format as enum ('xlsx', 'csv', 'google_sheets');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role app_role not null default 'staff',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table students (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  legal_name text,
  phone text,
  whatsapp_number text,
  instagram_handle text,
  email text,
  preferred_channel contact_channel,
  source_channel contact_channel,
  birthday date,
  emergency_contact text,
  status student_status not null default 'lead',
  tags text[] not null default '{}',
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table courses (
  id uuid primary key default gen_random_uuid(),
  name_zh text not null,
  name_en text,
  slug text unique,
  course_type course_type not null default 'workshop',
  level text,
  description_zh text,
  description_en text,
  technique_tags text[] not null default '{}',
  duration_minutes integer,
  default_price_hkd numeric(12,2),
  default_credits_required integer not null default 1,
  validity_days integer,
  includes_materials boolean not null default true,
  includes_firing boolean not null default true,
  active boolean not null default true,
  source_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table course_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course_id uuid references courses(id) on delete set null,
  included_credits integer not null,
  price_hkd numeric(12,2),
  validity_days integer not null default 90,
  starts_from_first_class boolean not null default true,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table package_purchases (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  package_id uuid references course_packages(id) on delete set null,
  purchase_date date not null default current_date,
  first_class_date date,
  expiry_date date,
  total_credits integer not null,
  used_credits integer not null default 0,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint used_credits_not_negative check (used_credits >= 0),
  constraint total_credits_positive check (total_credits > 0)
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  course_id uuid references courses(id) on delete set null,
  package_purchase_id uuid references package_purchases(id) on delete set null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  timezone text not null default 'Asia/Hong_Kong',
  status booking_status not null default 'draft',
  credits_to_deduct integer not null default 1,
  instructor_id uuid references profiles(id) on delete set null,
  room text,
  google_calendar_event_id text,
  google_calendar_link text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_end_after_start check (end_at > start_at),
  constraint credits_to_deduct_positive check (credits_to_deduct > 0)
);

create table attendance_records (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references bookings(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  package_purchase_id uuid references package_purchases(id) on delete set null,
  status attendance_status not null,
  attended_at timestamptz not null default now(),
  credits_deducted integer not null default 0,
  notes text,
  marked_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table credit_adjustments (
  id uuid primary key default gen_random_uuid(),
  package_purchase_id uuid not null references package_purchases(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  adjustment integer not null,
  reason text not null,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete set null,
  package_purchase_id uuid references package_purchases(id) on delete set null,
  booking_id uuid references bookings(id) on delete set null,
  amount_hkd numeric(12,2) not null,
  method payment_method,
  status payment_status not null default 'pending',
  paid_at timestamptz,
  reference text,
  receipt_url text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_amount_nonnegative check (amount_hkd >= 0)
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null default current_date,
  category expense_category not null default 'other',
  vendor text,
  item text not null,
  amount_hkd numeric(12,2) not null,
  method payment_method,
  receipt_url text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expense_amount_nonnegative check (amount_hkd >= 0)
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  contact text,
  channel contact_channel,
  raw_message text,
  status text not null default 'new',
  converted_student_id uuid references students(id) on delete set null,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table ai_imports (
  id uuid primary key default gen_random_uuid(),
  source_channel contact_channel,
  image_urls text[] not null default '{}',
  raw_text text,
  extracted_json jsonb,
  confidence numeric(5,4),
  status ai_import_status not null default 'uploaded',
  warnings text[] not null default '{}',
  created_student_id uuid references students(id) on delete set null,
  created_booking_id uuid references bookings(id) on delete set null,
  created_payment_id uuid references payments(id) on delete set null,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table google_integrations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  provider text not null default 'google',
  calendar_id text,
  spreadsheet_id text,
  encrypted_access_token text,
  encrypted_refresh_token text,
  token_expiry timestamptz,
  scopes text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table export_jobs (
  id uuid primary key default gen_random_uuid(),
  format export_format not null,
  scope text not null default 'all',
  filters jsonb,
  file_url text,
  google_spreadsheet_id text,
  status text not null default 'pending',
  error_message text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table studio_settings (
  id uuid primary key default gen_random_uuid(),
  studio_name text not null default 'Clayos Studio',
  timezone text not null default 'Asia/Hong_Kong',
  default_currency text not null default 'HKD',
  allow_staff_finance_export boolean not null default false,
  calendar_event_include_finance boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create view student_credit_balances as
select
  pp.student_id,
  s.display_name,
  sum(pp.total_credits) as total_credits,
  sum(pp.used_credits) as used_credits,
  coalesce(sum(ca.adjustment), 0) as adjusted_credits,
  sum(pp.total_credits - pp.used_credits) + coalesce(sum(ca.adjustment), 0) as remaining_credits,
  min(pp.expiry_date) filter (where pp.total_credits > pp.used_credits) as next_expiry_date
from package_purchases pp
join students s on s.id = pp.student_id
left join credit_adjustments ca on ca.package_purchase_id = pp.id
where pp.status = 'active'
group by pp.student_id, s.display_name;

create view monthly_finance_summary as
with revenue as (
  select
    date_trunc('month', coalesce(paid_at, created_at))::date as month,
    sum(amount_hkd) filter (where status = 'paid') as paid_revenue_hkd,
    sum(amount_hkd) filter (where status in ('unpaid', 'pending')) as outstanding_hkd,
    0::numeric as expenses_hkd
  from payments
  group by 1
),
expenses_by_month as (
  select
    date_trunc('month', expense_date)::date as month,
    0::numeric as paid_revenue_hkd,
    0::numeric as outstanding_hkd,
    sum(amount_hkd) as expenses_hkd
  from expenses
  group by 1
)
select
  month,
  coalesce(sum(paid_revenue_hkd), 0) as paid_revenue_hkd,
  coalesce(sum(expenses_hkd), 0) as expenses_hkd,
  coalesce(sum(paid_revenue_hkd), 0) - coalesce(sum(expenses_hkd), 0) as net_profit_hkd,
  coalesce(sum(outstanding_hkd), 0) as outstanding_hkd
from (
  select * from revenue
  union all
  select * from expenses_by_month
) finance
group by month;

create or replace function public.current_user_role()
returns app_role
language sql
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

alter table profiles enable row level security;
alter table students enable row level security;
alter table courses enable row level security;
alter table course_packages enable row level security;
alter table package_purchases enable row level security;
alter table bookings enable row level security;
alter table attendance_records enable row level security;
alter table credit_adjustments enable row level security;
alter table payments enable row level security;
alter table expenses enable row level security;
alter table leads enable row level security;
alter table ai_imports enable row level security;
alter table google_integrations enable row level security;
alter table export_jobs enable row level security;
alter table studio_settings enable row level security;
alter table audit_logs enable row level security;

create policy "authenticated read profiles" on profiles for select to authenticated using (true);
create policy "owners manage profiles" on profiles for all to authenticated using (current_user_role() = 'owner') with check (current_user_role() = 'owner');

create policy "authenticated read operational data" on students for select to authenticated using (true);
create policy "staff manage students" on students for insert to authenticated with check (current_user_role() in ('owner', 'admin', 'staff'));
create policy "staff update students" on students for update to authenticated using (current_user_role() in ('owner', 'admin', 'staff')) with check (current_user_role() in ('owner', 'admin', 'staff'));

create policy "authenticated read courses" on courses for select to authenticated using (true);
create policy "admin manage courses" on courses for all to authenticated using (current_user_role() in ('owner', 'admin')) with check (current_user_role() in ('owner', 'admin'));

create policy "authenticated read packages" on course_packages for select to authenticated using (true);
create policy "admin manage packages" on course_packages for all to authenticated using (current_user_role() in ('owner', 'admin')) with check (current_user_role() in ('owner', 'admin'));

create policy "authenticated read package purchases" on package_purchases for select to authenticated using (true);
create policy "admin manage package purchases" on package_purchases for all to authenticated using (current_user_role() in ('owner', 'admin')) with check (current_user_role() in ('owner', 'admin'));

create policy "authenticated read bookings" on bookings for select to authenticated using (true);
create policy "staff create bookings" on bookings for insert to authenticated with check (current_user_role() in ('owner', 'admin', 'staff'));
create policy "staff update bookings" on bookings for update to authenticated using (current_user_role() in ('owner', 'admin', 'staff')) with check (current_user_role() in ('owner', 'admin', 'staff'));

create policy "authenticated read attendance" on attendance_records for select to authenticated using (true);
create policy "staff mark attendance" on attendance_records for insert to authenticated with check (current_user_role() in ('owner', 'admin', 'staff', 'instructor'));
create policy "admin update attendance" on attendance_records for update to authenticated using (current_user_role() in ('owner', 'admin')) with check (current_user_role() in ('owner', 'admin'));

create policy "authenticated read ai imports" on ai_imports for select to authenticated using (true);
create policy "staff create ai imports" on ai_imports for insert to authenticated with check (current_user_role() in ('owner', 'admin', 'staff'));
create policy "staff update ai imports" on ai_imports for update to authenticated using (current_user_role() in ('owner', 'admin', 'staff')) with check (current_user_role() in ('owner', 'admin', 'staff'));

create policy "admin manage finance tables" on payments for all to authenticated using (current_user_role() in ('owner', 'admin')) with check (current_user_role() in ('owner', 'admin'));
create policy "admin manage expenses" on expenses for all to authenticated using (current_user_role() in ('owner', 'admin')) with check (current_user_role() in ('owner', 'admin'));
create policy "admin manage credit adjustments" on credit_adjustments for all to authenticated using (current_user_role() in ('owner', 'admin')) with check (current_user_role() in ('owner', 'admin'));
create policy "staff read payments" on payments for select to authenticated using (current_user_role() in ('owner', 'admin', 'staff'));
create policy "staff read expenses" on expenses for select to authenticated using (current_user_role() in ('owner', 'admin') or (current_user_role() = 'staff' and false));

create policy "authenticated read leads" on leads for select to authenticated using (true);
create policy "staff manage leads" on leads for all to authenticated using (current_user_role() in ('owner', 'admin', 'staff')) with check (current_user_role() in ('owner', 'admin', 'staff'));

create policy "owner manage google integrations" on google_integrations for all to authenticated using (current_user_role() = 'owner') with check (current_user_role() = 'owner');
create policy "admin manage export jobs" on export_jobs for all to authenticated using (current_user_role() in ('owner', 'admin')) with check (current_user_role() in ('owner', 'admin'));
create policy "authenticated read settings" on studio_settings for select to authenticated using (true);
create policy "admin manage settings" on studio_settings for all to authenticated using (current_user_role() in ('owner', 'admin')) with check (current_user_role() in ('owner', 'admin'));
create policy "admin read audit logs" on audit_logs for select to authenticated using (current_user_role() in ('owner', 'admin'));
create policy "admin create audit logs" on audit_logs for insert to authenticated with check (current_user_role() in ('owner', 'admin'));

insert into studio_settings (studio_name, timezone, default_currency)
values ('Clayos Studio', 'Asia/Hong_Kong', 'HKD');

insert into courses (
  name_zh,
  name_en,
  slug,
  course_type,
  level,
  description_zh,
  description_en,
  technique_tags,
  duration_minutes,
  default_price_hkd,
  default_credits_required,
  validity_days,
  includes_materials,
  includes_firing,
  source_note
) values (
  '咖啡濾杯工作坊',
  'Coffee Dripper Workshop',
  'coffee-dripper-workshop',
  'workshop',
  'beginner',
  '即使無陶藝經驗，都可以親自打造獨特的咖啡濾杯。此工作坊教授運用泥板技法製作，完成後由導師代為上一款釉。',
  'A beginner-friendly workshop where students create a unique coffee dripper using slab-building technique. After completion, the instructor applies one glaze.',
  array['泥板技法', '手捏', '上釉'],
  null,
  null,
  1,
  90,
  true,
  true,
  'Verified from public Clayos Studio courses search snippet; price and duration TBC.'
);

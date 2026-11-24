-- ============================================================================
-- MetricGrid Dashboard Starter — Supabase Schema, Triggers & RLS Policies
-- Run this entire script in the Supabase SQL Editor.
-- ============================================================================

-- Enable UUID extension (usually enabled by default in Supabase)
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. PROFILES TABLE (Linked to auth.users)
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'viewer' check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'User profiles with RBAC role (admin | viewer) synced from auth.users.';

-- Generic updated_at trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 2. AUTO-CREATE PROFILE ON NEW USER (auth.users -> public.profiles)
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    'viewer' -- Always default new accounts to least-privilege 'viewer'
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles if you already created users in auth.users before running this script
insert into public.profiles (id, email, full_name, role)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data->>'full_name', split_part(coalesce(u.email, ''), '@', 1)),
  'viewer'
from auth.users u
on conflict (id) do nothing;

-- ============================================================================
-- 3. RBAC HELPER FUNCTION (Avoids recursive RLS lookups)
-- ============================================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ============================================================================
-- 4. RLS POLICIES FOR PROFILES
-- ============================================================================
alter table public.profiles enable row level security;

-- Authenticated users can read their own profile; admins can read all profiles
drop policy if exists "Users can view own profile or admin views all" on public.profiles;
create policy "Users can view own profile or admin views all"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

-- Prevent self-escalation: users can update their own full_name only if role stays unchanged,
-- or an admin can update any profile.
drop policy if exists "Users can update own non-role fields or admin updates all" on public.profiles;
create policy "Users can update own non-role fields or admin updates all"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (
    public.is_admin()
    or (
      auth.uid() = id
      and role = (select p.role from public.profiles p where p.id = auth.uid())
    )
  );

-- ============================================================================
-- 5. SAMPLE TABLE: DASHBOARD_METRICS
-- ============================================================================
create table if not exists public.dashboard_metrics (
  id uuid primary key default gen_random_uuid(),
  month text not null,                 -- e.g., 'Jan', 'Feb', ...
  period_order int not null default 1, -- 1..12 for deterministic chronological sorting
  category text not null,              -- e.g., 'SaaS', 'Enterprise', 'Services', 'Add-ons'
  channel text not null default 'Direct', -- e.g., 'Direct', 'Organic', 'Partner', 'Outbound'
  revenue numeric(12, 2) not null default 0 check (revenue >= 0),
  expenses numeric(12, 2) not null default 0 check (expenses >= 0),
  orders int not null default 0 check (orders >= 0),
  active_users int not null default 0 check (active_users >= 0),
  conversion_rate numeric(5, 2) not null default 0 check (conversion_rate >= 0 and conversion_rate <= 100),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_dashboard_metrics_updated_at on public.dashboard_metrics;
create trigger trg_dashboard_metrics_updated_at
  before update on public.dashboard_metrics
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 6. RLS POLICIES FOR DASHBOARD_METRICS
--    - Both 'admin' and 'viewer' (any authenticated user) can SELECT
--    - ONLY 'admin' can INSERT, UPDATE, DELETE
-- ============================================================================
alter table public.dashboard_metrics enable row level security;

drop policy if exists "Authenticated users can read dashboard metrics" on public.dashboard_metrics;
create policy "Authenticated users can read dashboard metrics"
  on public.dashboard_metrics
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role in ('admin', 'viewer')
    )
  );

drop policy if exists "Only admins can insert dashboard metrics" on public.dashboard_metrics;
create policy "Only admins can insert dashboard metrics"
  on public.dashboard_metrics
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Only admins can update dashboard metrics" on public.dashboard_metrics;
create policy "Only admins can update dashboard metrics"
  on public.dashboard_metrics
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Only admins can delete dashboard metrics" on public.dashboard_metrics;
create policy "Only admins can delete dashboard metrics"
  on public.dashboard_metrics
  for delete
  to authenticated
  using (public.is_admin());

-- ============================================================================
-- 7. SEED SAMPLE DATA (Optional — safe to re-run only when table is empty)
-- ============================================================================
insert into public.dashboard_metrics (
  month, period_order, category, channel, revenue, expenses, orders, active_users, conversion_rate, notes
)
select * from (
  values
    ('Jan', 1, 'SaaS',       'Organic',  42500.00, 18200.00, 312, 1840, 3.40, 'Q1 launch cohort'),
    ('Feb', 2, 'Enterprise', 'Outbound', 48900.00, 20100.00, 285, 1960, 3.65, 'Annual contracts expansion'),
    ('Mar', 3, 'Services',   'Partner',  53200.00, 21400.00, 340, 2180, 3.90, 'Onboarding sprint revenue'),
    ('Apr', 4, 'SaaS',       'Direct',   58400.00, 22800.00, 392, 2410, 4.15, 'Self-serve tier growth'),
    ('May', 5, 'Enterprise', 'Partner',  64100.00, 24600.00, 418, 2650, 4.30, 'Mid-market pipeline close'),
    ('Jun', 6, 'Add-ons',    'Organic',  69800.00, 25900.00, 465, 2890, 4.55, 'API usage add-on adoption'),
    ('Jul', 7, 'SaaS',       'Direct',   73400.00, 27100.00, 490, 3120, 4.70, 'Summer retention peak'),
    ('Aug', 8, 'Services',   'Outbound', 78200.00, 28400.00, 515, 3340, 4.85, 'Dedicated SLA renewals')
) as seed(month, period_order, category, channel, revenue, expenses, orders, active_users, conversion_rate, notes)
where not exists (select 1 from public.dashboard_metrics limit 1);

-- ============================================================================
-- 9. ADMIN-CONFIGURABLE DASHBOARD CHARTS
-- Apply this section to existing projects, or run the full script for new ones.
-- The source/column/type checks prevent arbitrary SQL and unapproved tables.
-- ============================================================================
create table if not exists public.dashboard_charts (
  id uuid primary key default gen_random_uuid(),
  title text not null default '' check (char_length(title) <= 100),
  source_table text not null default 'dashboard_metrics' check (source_table = 'dashboard_metrics'),
  x_field text not null check (x_field in ('month', 'category', 'channel')),
  y_field text not null check (y_field in ('revenue', 'expenses', 'orders', 'active_users', 'conversion_rate')),
  aggregation text not null default 'sum' check (aggregation in ('sum', 'avg', 'count')),
  chart_type text not null default 'bar' check (chart_type in ('bar', 'line', 'area', 'pie')),
  color text not null default 'indigo' check (color in ('indigo', 'teal', 'amber', 'rose')),
  size text not null default 'half' check (size in ('half', 'full')),
  filter_category text not null default 'All' check (filter_category in ('All', 'SaaS', 'Enterprise', 'Services', 'Add-ons')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_dashboard_charts_updated_at on public.dashboard_charts;
create trigger trg_dashboard_charts_updated_at
  before update on public.dashboard_charts
  for each row execute function public.set_updated_at();

alter table public.dashboard_charts enable row level security;

drop policy if exists "Authenticated users can read dashboard charts" on public.dashboard_charts;
create policy "Authenticated users can read dashboard charts"
  on public.dashboard_charts for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'viewer')));

drop policy if exists "Only admins can insert dashboard charts" on public.dashboard_charts;
create policy "Only admins can insert dashboard charts"
  on public.dashboard_charts for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Only admins can update dashboard charts" on public.dashboard_charts;
create policy "Only admins can update dashboard charts"
  on public.dashboard_charts for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Only admins can delete dashboard charts" on public.dashboard_charts;
create policy "Only admins can delete dashboard charts"
  on public.dashboard_charts for delete to authenticated
  using (public.is_admin());

-- ============================================================================
-- 10. PROMOTING A USER TO ADMIN
--    Create users via Supabase Dashboard -> Authentication -> Users -> Add User.
--    Disable "Allow new users to sign up" in Authentication -> Providers / Settings
--    to enforce invite-only / pre-authorized access.
--    Then run:
--
--    update public.profiles
--    set role = 'admin'
--    where email = 'admin@yourcompany.com';
-- ============================================================================

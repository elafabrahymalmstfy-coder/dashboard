-- Run this once in the Supabase SQL Editor for existing projects.
-- Requires profiles, is_admin() and set_updated_at() from supabase_setup.sql.

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

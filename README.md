# ATECH — Automation Technology | Production Dashboard Starter (React + Vite + Tailwind + Recharts + Supabase RBAC)

Branded with the ATECH “Automation Technology” identity (steel-blue/navy symbol and ink wordmark, applied via a remapped `indigo` palette in `src/index.css`). A clean, modular, production-ready analytics dashboard starter featuring strict Supabase Email/Password authentication, PostgreSQL Row Level Security (RLS), role-based UI (`admin` vs `viewer`), Light/Dark mode persistence, and reusable Recharts visualizations.

## Project Structure

```text
├── .env.example
├── supabase_setup.sql
├── index.html
└── src/
    ├── App.tsx                              # Router & route protection setup
    ├── index.css                            # Tailwind v4 + class-based dark mode
    ├── main.tsx
    ├── lib/
    │   └── supabase.js                      # Supabase client & env guard
    ├── context/
    │   ├── AuthContext.jsx                  # Session, profile role & signOut state
    │   └── ThemeContext.jsx                 # Light / Dark mode persisted in localStorage
    ├── hooks/
    │   └── useDashboardData.js              # Centralized Supabase query, CRUD & fallback mock data
    ├── components/
    │   ├── auth/
    │   │   ├── ProtectedRoute.jsx           # Redirects unauthenticated users to /login
    │   │   └── AdminOnly.jsx                # Conditionally renders admin-only controls
    │   ├── charts/
    │   │   ├── RevenueAreaChart.jsx         # Recharts AreaChart (Revenue vs Expenses)
    │   │   ├── CategoryBarChart.jsx         # Recharts BarChart (Revenue by Category)
    │   │   └── DistributionPieChart.jsx     # Recharts Donut PieChart (Channel Share)
    │   ├── dashboard/
    │   │   └── MetricFormModal.jsx          # Reusable Add / Edit metric modal
    │   ├── layout/
    │   │   ├── Sidebar.jsx                  # Responsive collapsible navigation
    │   │   ├── Topbar.jsx                   # User email, RoleBadge, ThemeToggle, Logout
    │   │   └── DashboardLayout.jsx          # Main authenticated shell
    │   └── ui/
    │       ├── KpiCard.jsx                  # Reusable KPI metric card
    │       ├── RoleBadge.jsx                # Admin / Viewer role pill
    │       └── ThemeToggle.jsx              # Light / Dark mode button
    └── pages/
        ├── Login.jsx                        # Restricted Email & Password login (no public Sign-Up)
        ├── Dashboard.jsx                    # KPIs, 3 Recharts charts & metrics table
        └── ManageData.jsx                   # Admin-only CRUD management console
```

## Bilingual Support (English LTR / Arabic RTL)

- `src/context/LanguageContext.jsx` exposes `lang` (`en` | `ar`), `dir` (`ltr` | `rtl`), `isRtl`, `t(key, values, fallback)` and `toggleLanguage()`.
- The choice is persisted in `localStorage` (`dashboard_lang`) and applied to `<html lang>` / `<html dir>` — an inline script in `index.html` applies it before React mounts, so there is no LTR flash.
- **All UI strings live in `src/locales/translations.js`** (flat dot-namespaced keys, e.g. `sidebar.manageData`). Interpolation uses `{placeholders}`:
  ```js
  t('manage.rowCount', { shown: 12, total: 40 }); // "12 of 40 rows" / "12 من 40 صف"
  ```
  Enum values are translated too via dynamic keys: `month.Jan`, `category.Enterprise`, `channel.Organic`.
- `src/components/ui/LanguageToggle.jsx` renders a Globe + `AR`/`EN` button. It sits in the **Topbar** next to `ThemeToggle` and in the corner of the **Login** page.
- Layout uses Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `text-end`, `border-s-`, `border-e-`) so the Sidebar, Topbar, tables and icons mirror cleanly. `Cairo` is loaded from Google Fonts and applied on `html[dir='rtl']`.
- Recharts tooltips use `dir="auto"`, chart titles/legends/axis ticks are translated, and legend alignment flips with `isRtl`.

## Setup Instructions

### Admin chart builder and main filters

The dashboard now has a shared main filter bar (category, month, channel). It filters KPIs, built-in charts, custom charts, and the breakdown table together. Admins can use **Add chart** to select an approved data source (`dashboard_metrics`), group-by field, measure, sum/average/count aggregation, bar/line/area/donut type, color, width, and an optional chart-only category filter. Admins can edit and remove custom charts; viewers can see them but cannot change them. Source and column values are allowlisted and never turned into arbitrary SQL.

- **Existing Supabase project:** Run `supabase_charts_migration.sql` in the Supabase SQL Editor once to add `dashboard_charts` and admin-only RLS write policies.
- **New Supabase project:** Run the updated `supabase_setup.sql`; the migration is already included. Do not run both unless reapplying policies intentionally.
- **Local preview:** Chart configurations are saved in browser `localStorage` until Supabase is configured. The demo account can add/edit charts, and viewer preview sees the same charts read-only.

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase
1. Create a new project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase Dashboard and execute the entire contents of `supabase_setup.sql`.
3. In **Authentication -> Providers -> Email** (and **Authentication -> Settings**), disable **"Allow new users to sign up"** so only pre-authorized users can authenticate.
4. Create users manually in **Authentication -> Users -> Add User** (e.g., an admin account and a viewer account).
5. Promote your admin user in the SQL Editor:
   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'admin@yourcompany.com';
   ```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and add your Supabase URL and Anon Key:
```bash
cp .env.example .env
```

### 4. Run Locally & Build
```bash
npm run dev
npm run build
```

## Demo Accounts (Preview Mode only — no Supabase required)

| Role   | Email                    | Password     |
|--------|--------------------------|--------------|
| Admin  | `admin@metricgrid.io`    | `Admin@123`  |
| Viewer | `viewer@metricgrid.io`   | `Viewer@123` |

These credentials are only accepted while `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are **not** configured. Once Supabase is connected, only real users created in Supabase Auth can log in.

> **Preview Mode:** If `.env` credentials are not yet set, the login screen offers a local Preview Mode (`Preview as Admin` / `Preview as Viewer`) using in-memory sample data so you can inspect both roles immediately. Once `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured, strict Supabase Email/Password authentication is enforced.

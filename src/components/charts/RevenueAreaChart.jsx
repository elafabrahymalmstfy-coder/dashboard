import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val || 0);

function CustomTooltip({ active, payload, label, t }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      dir="auto"
      className="rounded-lg border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95"
    >
      <p className="mb-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
        {t(`month.${label}`, undefined, label)}
      </p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div
            key={entry.dataKey}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span
              className="tabular-nums font-medium text-slate-900 dark:text-slate-100"
              dir="ltr"
            >
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RevenueAreaChart({ data = [], loading = false }) {
  const { isDark } = useTheme();
  const { t, isRtl } = useLanguage();
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const tickColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          {t('chart.titleTrend')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('chart.subTrend')}
        </p>
      </div>

      {loading ? (
        <div className="h-72 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60" />
      ) : data.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-center text-sm text-slate-400">
          {t('chart.noData')}
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 12, left: 12, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2F7CC4" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#2F7CC4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expensesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8CA3B8" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#8CA3B8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={gridColor}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: tickColor, fontSize: 12 }}
                tickFormatter={(v) => t(`month.${v}`, undefined, v)}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: tickColor, fontSize: 12 }}
                tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                width={54}
              />
              <Tooltip
                content={<CustomTooltip t={t} />}
                cursor={{ stroke: gridColor }}
              />
              <Legend
                verticalAlign="top"
                align={isRtl ? 'left' : 'right'}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', paddingBottom: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name={t('chart.revenue')}
                stroke="#2F7CC4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#revenueFill)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name={t('chart.expenses')}
                stroke="#8CA3B8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#expensesFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

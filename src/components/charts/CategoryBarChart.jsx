import {
  Bar,
  BarChart,
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
        {t(`category.${label}`, undefined, label)}
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
              {entry.dataKey === 'revenue'
                ? formatCurrency(entry.value)
                : Number(entry.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CategoryBarChart({ data = [], loading = false }) {
  const { isDark } = useTheme();
  const { t, isRtl } = useLanguage();
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const tickColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          {t('chart.titleCategory')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('chart.subCategory')}
        </p>
      </div>

      {loading ? (
        <div className="h-72 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60" />
      ) : data.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-center text-sm text-slate-400">
          {t('chart.noCategoryData')}
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 12, left: 12, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={gridColor}
              />
              <XAxis
                dataKey="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: tickColor, fontSize: 12 }}
                tickFormatter={(v) => t(`category.${v}`, undefined, v)}
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
                cursor={{
                  fill: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(15,23,42,0.04)',
                }}
              />
              <Legend
                verticalAlign="top"
                align={isRtl ? 'left' : 'right'}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', paddingBottom: '12px' }}
              />
              <Bar
                dataKey="revenue"
                name={t('chart.revenue')}
                fill="#2563A6"
                radius={[6, 6, 0, 0]}
                maxBarSize={44}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

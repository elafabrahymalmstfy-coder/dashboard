import { useMemo } from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext';

const COLORS = ['#1F5A93', '#2F7CC4', '#63B0DD', '#94A3B8', '#FBBF24'];

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val || 0);

function CustomTooltip({ active, payload, total, t }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';

  return (
    <div
      dir="auto"
      className="rounded-lg border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95"
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: item.payload?.fill }}
        />
        {item.name}
      </div>
      <div
        className="mt-1 tabular-nums text-xs text-slate-600 dark:text-slate-300"
        dir="ltr"
      >
        {formatCurrency(item.value)} ({pct}%)
      </div>
    </div>
  );
}

export default function DistributionPieChart({ data = [], loading = false }) {
  const { t } = useLanguage();

  // Translate channel names for the legend + tooltip without mutating source data.
  const displayData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        name: t(`channel.${d.name}`, undefined, d.name),
      })),
    [data, t]
  );

  const total = displayData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          {t('chart.titleChannel')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('chart.subChannel')}
        </p>
      </div>

      {loading ? (
        <div className="h-72 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60" />
      ) : displayData.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-center text-sm text-slate-400">
          {t('chart.noChannelData')}
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={56}
                outerRadius={86}
                paddingAngle={3}
                strokeWidth={0}
              >
                {displayData.map((entry, idx) => (
                  <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip total={total} t={t} />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

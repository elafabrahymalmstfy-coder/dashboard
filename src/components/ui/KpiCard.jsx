import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function KpiCard({
  title,
  value,
  change,
  changeLabel,
  trend = 'up', // 'up' | 'down' | 'neutral'
  icon: Icon,
  loading = false,
}) {
  const { t } = useLanguage();
  const resolvedChangeLabel = changeLabel ?? t('kpi.vsLastPeriod');

  const trendStyles = {
    up: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    down: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
    neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };

  const TrendIcon =
    trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-300">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="h-8 w-28 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
        ) : (
          <div className="tabular-nums text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {value}
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium ${trendStyles[trend] || trendStyles.neutral}`}
          >
            <TrendIcon className="h-3 w-3" />
            {change}
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            {resolvedChangeLabel}
          </span>
        </div>
      )}
    </div>
  );
}

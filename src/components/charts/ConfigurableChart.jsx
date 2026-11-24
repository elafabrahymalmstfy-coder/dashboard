import { useMemo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line,
  LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import AdminOnly from '../auth/AdminOnly';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { CHART_FIELDS } from '../../hooks/useChartConfigurations';

const PALETTE = {
  indigo: ['#1F5A93', '#2F7CC4', '#63B0DD', '#9CC7E4'],
  teal: ['#0d9488', '#2dd4bf', '#5eead4', '#99f6e4'],
  amber: ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d'],
  rose: ['#e11d48', '#fb7185', '#fda4af', '#fecdd3'],
};

export default function ConfigurableChart({ chart, metrics, onEdit, onDelete }) {
  const { t, isRtl } = useLanguage();
  const { isDark } = useTheme();
  const colors = PALETTE[chart.color] || PALETTE.indigo;
  const label = (value) => t(`${chart.x_field}.${value}`, undefined, String(value));
  const measureLabel = CHART_FIELDS[chart.y_field] ? t(CHART_FIELDS[chart.y_field].label) : chart.y_field;
  const title = chart.title || `${measureLabel} / ${CHART_FIELDS[chart.x_field] ? t(CHART_FIELDS[chart.x_field].label) : chart.x_field}`;

  const data = useMemo(() => {
    const grouped = new Map();
    const source = chart.filter_category === 'All'
      ? metrics : metrics.filter((row) => row.category === chart.filter_category);
    for (const row of source) {
      const key = row[chart.x_field];
      if (key == null || typeof row[chart.y_field] !== 'number') continue;
      const current = grouped.get(key) || { key, total: 0, count: 0 };
      current.total += row[chart.y_field];
      current.count += 1;
      grouped.set(key, current);
    }
    const results = Array.from(grouped.values()).map((item) => ({
      name: item.key,
      value: chart.aggregation === 'count' ? item.count
        : chart.aggregation === 'avg' ? Number((item.total / item.count).toFixed(2)) : item.total,
    }));
    if (chart.x_field === 'month') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      results.sort((a, b) => months.indexOf(a.name) - months.indexOf(b.name));
    } else results.sort((a, b) => b.value - a.value);
    return results;
  }, [metrics, chart]);

  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const tickColor = isDark ? '#94a3b8' : '#64748b';
  const tooltip = <Tooltip content={({ active, payload, label: tooltipLabel }) => active && payload?.length ? <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
    <p className="font-semibold text-slate-900 dark:text-white">{label(tooltipLabel ?? payload[0]?.payload?.name)}</p>
    <p className="mt-1 text-slate-600 dark:text-slate-300" dir="auto">{measureLabel}: {Number(payload[0].value).toLocaleString()}</p>
  </div> : null} />;

  const cartesian = <>
    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={gridColor} />
    <XAxis dataKey="name" tickFormatter={label} tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} interval={0} />
    <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} width={48} tickFormatter={(value) => value >= 1000 ? `${Math.round(value / 1000)}k` : value} />
    {tooltip}
    <Legend verticalAlign="top" align={isRtl ? 'left' : 'right'} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingBottom: 12 }} />
  </>;

  return <article className={`min-w-0 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 ${chart.size === 'full' ? 'lg:col-span-2' : ''}`}>
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0"><h4 className="truncate text-base font-semibold text-slate-900 dark:text-white">{title}</h4><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t(`builder.${chart.aggregation}`)} · {measureLabel} · {t(`builder.${chart.chart_type}`)}</p></div>
      <AdminOnly><div className="flex shrink-0 gap-1">
        <button type="button" onClick={onEdit} aria-label={t('builder.editChart')} className="rounded-md p-1.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-800"><Pencil className="h-4 w-4" /></button>
        <button type="button" onClick={onDelete} aria-label={t('builder.deleteChart')} className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-800"><Trash2 className="h-4 w-4" /></button>
      </div></AdminOnly>
    </div>
    {data.length === 0 ? <div className="flex h-64 items-center justify-center text-sm text-slate-500">{t('builder.noData')}</div> : <div className="h-64 w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        {chart.chart_type === 'pie' ? <PieChart><Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={48} outerRadius={80} strokeWidth={0} paddingAngle={2}>{data.map((item, index) => <Cell key={item.name} fill={colors[index % colors.length]} />)}</Pie>{tooltip}<Legend verticalAlign="bottom" iconType="circle" formatter={(value) => label(value)} wrapperStyle={{ fontSize: 12 }} /></PieChart>
          : chart.chart_type === 'area' ? <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>{cartesian}<Area dataKey="value" name={measureLabel} stroke={colors[0]} fill={colors[0]} fillOpacity={0.14} strokeWidth={2} /></AreaChart>
          : chart.chart_type === 'line' ? <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>{cartesian}<Line dataKey="value" name={measureLabel} stroke={colors[0]} strokeWidth={2.5} dot={{ r: 3 }} /></LineChart>
          : <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>{cartesian}<Bar dataKey="value" name={measureLabel} fill={colors[0]} radius={[5, 5, 0, 0]} maxBarSize={48} /></BarChart>}
      </ResponsiveContainer>
    </div>}
  </article>;
}
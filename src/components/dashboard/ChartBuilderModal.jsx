import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CHART_FIELDS } from '../../hooks/useChartConfigurations';
import { METRIC_CATEGORIES } from '../../hooks/useDashboardData';

const DEFAULTS = {
  title: '', source_table: 'dashboard_metrics', x_field: 'month', y_field: 'revenue',
  aggregation: 'sum', chart_type: 'bar', color: 'indigo', size: 'half', filter_category: 'All',
};

const input = 'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';
const label = 'mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200';

export default function ChartBuilderModal({ open, initialData, saving, onClose, onSubmit }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(DEFAULTS);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) { setForm(initialData ? { ...DEFAULTS, ...initialData } : DEFAULTS); setError(''); }
  }, [open, initialData]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => { if (event.key === 'Escape' && !saving) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, saving, onClose]);

  if (!open) return null;
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    setError('');
    const result = await onSubmit(form);
    if (result?.error) { setError(result.error.message); return; }
    onClose();
  }

  const fieldOptions = (kind) => Object.entries(CHART_FIELDS)
    .filter(([, definition]) => definition.kind === kind)
    .map(([value, definition]) => <option key={value} value={value}>{t(definition.label)}</option>);

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" role="presentation">
    <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={saving ? undefined : onClose} />
    <div role="dialog" aria-modal="true" aria-labelledby="chart-builder-title" className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-7 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div><h2 id="chart-builder-title" className="text-xl font-semibold text-slate-900 dark:text-white">{t(initialData ? 'builder.editChart' : 'builder.addChart')}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('builder.description')}</p></div>
        <button type="button" onClick={onClose} aria-label={t('form.cancel')} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <div><label htmlFor="chart-title" className={label}>{t('builder.title')}</label><input id="chart-title" autoFocus maxLength={100} value={form.title} onChange={(e) => update('title', e.target.value)} placeholder={t('builder.titlePlaceholder')} className={input} /></div>
        <div><label htmlFor="chart-source" className={label}>{t('builder.source')}</label><select id="chart-source" value={form.source_table} disabled className={input}><option value="dashboard_metrics">dashboard_metrics</option></select><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('builder.sourceNote')}</p></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="chart-x" className={label}>{t('builder.dimension')}</label><select id="chart-x" value={form.x_field} onChange={(e) => update('x_field', e.target.value)} className={input}>{fieldOptions('dimension')}</select></div>
          <div><label htmlFor="chart-y" className={label}>{t('builder.measure')}</label><select id="chart-y" value={form.y_field} onChange={(e) => update('y_field', e.target.value)} className={input}>{fieldOptions('measure')}</select></div>
          <div><label htmlFor="chart-aggregation" className={label}>{t('builder.aggregation')}</label><select id="chart-aggregation" value={form.aggregation} onChange={(e) => update('aggregation', e.target.value)} className={input}>{['sum', 'avg', 'count'].map((value) => <option value={value} key={value}>{t(`builder.${value}`)}</option>)}</select></div>
          <div><label htmlFor="chart-type" className={label}>{t('builder.chartType')}</label><select id="chart-type" value={form.chart_type} onChange={(e) => update('chart_type', e.target.value)} className={input}>{['bar', 'line', 'area', 'pie'].map((value) => <option value={value} key={value}>{t(`builder.${value}`)}</option>)}</select></div>
          <div><label htmlFor="chart-color" className={label}>{t('builder.color')}</label><select id="chart-color" value={form.color} onChange={(e) => update('color', e.target.value)} className={input}>{['indigo', 'teal', 'amber', 'rose'].map((value) => <option value={value} key={value}>{t(`builder.${value}`)}</option>)}</select></div>
          <div><label htmlFor="chart-size" className={label}>{t('builder.size')}</label><select id="chart-size" value={form.size} onChange={(e) => update('size', e.target.value)} className={input}>{['half', 'full'].map((value) => <option value={value} key={value}>{t(`builder.${value}`)}</option>)}</select></div>
          <div><label htmlFor="chart-filter" className={label}>{t('builder.localFilter')}</label><select id="chart-filter" value={form.filter_category} onChange={(e) => update('filter_category', e.target.value)} className={input}><option value="All">{t('builder.noFilter')}</option>{METRIC_CATEGORIES.map((value) => <option value={value} key={value}>{t(`category.${value}`)}</option>)}</select></div>
        </div>
        {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-5 dark:border-slate-800">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200">{t('form.cancel')}</button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"><Plus className="h-4 w-4" />{saving ? t('common.loading') : t(initialData ? 'builder.saveChanges' : 'builder.saveChart')}</button>
        </div>
      </form>
    </div>
  </div>;
}
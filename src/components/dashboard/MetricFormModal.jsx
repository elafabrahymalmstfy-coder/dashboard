import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  METRIC_CATEGORIES,
  METRIC_CHANNELS,
  MONTHS_ORDER,
} from '../../hooks/useDashboardData';

const INITIAL_FORM = {
  month: 'Sep',
  period_order: 9,
  category: 'SaaS',
  channel: 'Direct',
  revenue: '',
  expenses: '',
  orders: '',
  active_users: '',
  conversion_rate: '',
  notes: '',
};

export default function MetricFormModal({
  open,
  onClose,
  onSubmit,
  initialData = null,
  saving = false,
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!open) return;
    setFormError('');
    if (initialData) {
      setForm({
        month: initialData.month || 'Jan',
        period_order: initialData.period_order ?? 1,
        category: initialData.category || 'SaaS',
        channel: initialData.channel || 'Direct',
        revenue: String(initialData.revenue ?? ''),
        expenses: String(initialData.expenses ?? ''),
        orders: String(initialData.orders ?? ''),
        active_users: String(initialData.active_users ?? ''),
        conversion_rate: String(initialData.conversion_rate ?? ''),
        notes: initialData.notes || '',
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleMonthChange = (e) => {
    const nextMonth = e.target.value;
    const monthIndex = MONTHS_ORDER.indexOf(nextMonth);
    setForm((prev) => ({
      ...prev,
      month: nextMonth,
      period_order: monthIndex >= 0 ? monthIndex + 1 : prev.period_order,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (Number(form.revenue) < 0 || Number(form.expenses) < 0) {
      setFormError(t('form.invalidNumbers'));
      return;
    }

    const result = await onSubmit(form);
    if (result?.error) {
      setFormError(result.error.message || t('form.saveError'));
      return;
    }
    onClose();
  };

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500';
  const labelClass =
    'mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {initialData ? t('form.editTitle') : t('form.addTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {initialData ? t('form.editSubtitle') : t('form.addSubtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('form.cancel')}
            className="-m-1.5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {formError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
          >
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>{t('form.month')}</label>
              <select
                value={form.month}
                onChange={handleMonthChange}
                className={inputClass}
              >
                {MONTHS_ORDER.map((m) => (
                  <option key={m} value={m}>
                    {t(`month.${m}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>{t('form.category')}</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value }))
                }
                className={inputClass}
              >
                {METRIC_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {t(`category.${cat}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>{t('form.channel')}</label>
              <select
                value={form.channel}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, channel: e.target.value }))
                }
                className={inputClass}
              >
                {METRIC_CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>
                    {t(`channel.${ch}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>{t('form.revenue')}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="65000"
                value={form.revenue}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, revenue: e.target.value }))
                }
                className={inputClass}
                dir="ltr"
              />
            </div>

            <div>
              <label className={labelClass}>{t('form.expenses')}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="24000"
                value={form.expenses}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, expenses: e.target.value }))
                }
                className={inputClass}
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>{t('form.orders')}</label>
              <input
                type="number"
                min="0"
                required
                placeholder="420"
                value={form.orders}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, orders: e.target.value }))
                }
                className={inputClass}
                dir="ltr"
              />
            </div>

            <div>
              <label className={labelClass}>{t('form.activeUsers')}</label>
              <input
                type="number"
                min="0"
                required
                placeholder="2500"
                value={form.active_users}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, active_users: e.target.value }))
                }
                className={inputClass}
                dir="ltr"
              />
            </div>

            <div>
              <label className={labelClass}>{t('form.conversion')}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                placeholder="4.25"
                value={form.conversion_rate}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    conversion_rate: e.target.value,
                  }))
                }
                className={inputClass}
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t('form.notes')}</label>
            <input
              type="text"
              placeholder={t('form.notesPlaceholder')}
              value={form.notes}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              className={inputClass}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t('form.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {initialData ? t('form.saveChanges') : t('form.createRecord')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import {
  Download,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import MetricFormModal from '../components/dashboard/MetricFormModal';
import { useLanguage } from '../context/LanguageContext';
import {
  METRIC_CATEGORIES,
  useDashboardData,
} from '../hooks/useDashboardData';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val || 0);

export default function ManageData() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const { t } = useLanguage();

  const {
    rawMetrics,
    loading,
    saving,
    error,
    usingFallback,
    createMetric,
    updateMetric,
    deleteMetric,
  } = useDashboardData();

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rawMetrics.filter((row) => {
      const matchesCategory =
        categoryFilter === 'All' || row.category === categoryFilter;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        row.month.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q) ||
        row.channel.toLowerCase().includes(q) ||
        (row.notes || '').toLowerCase().includes(q)
      );
    });
  }, [rawMetrics, search, categoryFilter]);

  const handleOpenCreate = () => {
    setEditingRow(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (row) => {
    setEditingRow(row);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    const monthLabel = t(`month.${values.month}`);
    const categoryLabel = t(`category.${values.category}`);

    const res = editingRow
      ? await updateMetric(editingRow.id, values)
      : await createMetric(values);

    if (!res.error) {
      setFeedback({
        type: 'success',
        text: editingRow
          ? t('manage.updated', { month: monthLabel, category: categoryLabel })
          : t('manage.added', { month: monthLabel, category: categoryLabel }),
      });
    }
    return res;
  };

  const handleDelete = async (row) => {
    const message = t('manage.deleteConfirm', {
      month: t(`month.${row.month}`),
      category: t(`category.${row.category}`),
    });
    if (!window.confirm(message)) return;

    const res = await deleteMetric(row.id);
    if (!res.error) {
      setFeedback({
        type: 'success',
        text: t('manage.deleted', {
          month: t(`month.${row.month}`),
          category: t(`category.${row.category}`),
        }),
      });
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'month',
      'category',
      'channel',
      'revenue',
      'expenses',
      'orders',
      'active_users',
      'conversion_rate',
      'notes',
    ];
    const csvRows = [
      headers.join(','),
      ...filteredRows.map((row) =>
        [
          row.month,
          row.category,
          row.channel,
          row.revenue,
          row.expenses,
          row.orders,
          row.active_users,
          row.conversion_rate,
          `"${(row.notes || '').replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'dashboard_metrics.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const numEnd = 'text-end';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              {t('manage.title')}
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
              <ShieldCheck className="h-3 w-3" />
              {t('manage.adminOnly')}
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
            {t('manage.subtitle')}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredRows.length === 0}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5" />
            {t('manage.exportCsv')}
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 text-xs font-medium text-white shadow-xs transition-colors hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            {t('manage.newRecord')}
          </button>
        </div>
      </div>

      {/* Status Alerts */}
      {usingFallback && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          {t('manage.fallbackNotice')}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      )}

      {feedback && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="shrink-0 font-medium underline"
          >
            {t('common.dismiss')}
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('manage.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 ps-9 pe-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:bg-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label={t('dashboard.filterCategory')}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="All">{t('manage.allCategories')}</option>
            {METRIC_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {t(`category.${cat}`)}
              </option>
            ))}
          </select>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t('manage.rowCount', {
              shown: filteredRows.length,
              total: rawMetrics.length,
            })}
          </span>
        </div>
      </div>

      {/* CRUD Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                <th className="px-5 py-3">{t('table.month')}</th>
                <th className="px-4 py-3">{t('table.category')}</th>
                <th className="px-4 py-3">{t('table.channel')}</th>
                <th className={`px-4 py-3 ${numEnd}`}>{t('table.revenue')}</th>
                <th className={`px-4 py-3 ${numEnd}`}>{t('table.expenses')}</th>
                <th className={`px-4 py-3 ${numEnd}`}>{t('table.orders')}</th>
                <th className={`px-4 py-3 ${numEnd}`}>
                  {t('table.activeUsers')}
                </th>
                <th className={`px-4 py-3 ${numEnd}`}>{t('table.convRate')}</th>
                <th className="px-4 py-3">{t('table.notes')}</th>
                <th className={`px-5 py-3 ${numEnd}`}>{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-5 py-10 text-center text-sm text-slate-400"
                  >
                    {t('manage.loading')}
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-5 py-10 text-center text-sm text-slate-400"
                  >
                    {t('manage.noRecords')}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-slate-100">
                      {t(`month.${row.month}`)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {t(`category.${row.category}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                      {t(`channel.${row.channel}`)}
                    </td>
                    <td
                      className={`tabular-nums px-4 py-3.5 font-medium text-slate-900 dark:text-slate-100 ${numEnd}`}
                    >
                      {formatCurrency(row.revenue)}
                    </td>
                    <td
                      className={`tabular-nums px-4 py-3.5 text-slate-600 dark:text-slate-400 ${numEnd}`}
                    >
                      {formatCurrency(row.expenses)}
                    </td>
                    <td
                      className={`tabular-nums px-4 py-3.5 text-slate-600 dark:text-slate-400 ${numEnd}`}
                    >
                      {row.orders.toLocaleString()}
                    </td>
                    <td
                      className={`tabular-nums px-4 py-3.5 text-slate-600 dark:text-slate-400 ${numEnd}`}
                    >
                      {row.active_users.toLocaleString()}
                    </td>
                    <td
                      className={`tabular-nums px-4 py-3.5 text-slate-600 dark:text-slate-400 ${numEnd}`}
                    >
                      {row.conversion_rate.toFixed(2)}%
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                      {row.notes || '—'}
                    </td>
                    <td className={`px-5 py-3.5 ${numEnd}`}>
                      <div className={`inline-flex items-center gap-1 ${numEnd}`}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(row)}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
                          title={t('form.editTitle')}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                          title={t('manage.deleteConfirm')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MetricFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingRow}
        saving={saving}
      />
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  SlidersHorizontal,
  DollarSign,
  Pencil,
  Plus,
  RefreshCw,
  ShoppingBag,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import AdminOnly from '../components/auth/AdminOnly';
import CategoryBarChart from '../components/charts/CategoryBarChart';
import DistributionPieChart from '../components/charts/DistributionPieChart';
import RevenueAreaChart from '../components/charts/RevenueAreaChart';
import MetricFormModal from '../components/dashboard/MetricFormModal';
import ChartBuilderModal from '../components/dashboard/ChartBuilderModal';
import ConfigurableChart from '../components/charts/ConfigurableChart';
import { useChartConfigurations } from '../hooks/useChartConfigurations';
import KpiCard from '../components/ui/KpiCard';
import { useLanguage } from '../context/LanguageContext';
import {
  METRIC_CATEGORIES,
  METRIC_CHANNELS,
  MONTHS_ORDER,
  useDashboardData,
} from '../hooks/useDashboardData';

const formatCurrency = (val, maxFractionDigits = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits,
  }).format(val || 0);

export default function Dashboard() {
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');
  const [channelFilter, setChannelFilter] = useState('All');
  const [chartBuilderOpen, setChartBuilderOpen] = useState(false);
  const [editingChart, setEditingChart] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const { t, isRtl } = useLanguage();
  const { charts, loading: chartsLoading, error: chartsError, saving: chartSaving, createChart, updateChart, deleteChart } = useChartConfigurations();

  const {
    metrics,
    kpis,
    totalSoPrice,
    totalSoCount,
    soLoading,
    soError,
    monthlySeries,
    categorySeries,
    channelDistribution,
    loading,
    saving,
    error,
    usingFallback,
    refetch,
    createMetric,
    updateMetric,
    deleteMetric,
  } = useDashboardData({ categoryFilter, monthFilter, channelFilter });

  const handleChartSave = async (values) => editingChart
    ? updateChart(editingChart.id, values)
    : createChart(values);

  const handleChartDelete = async (chart) => {
    if (window.confirm(t('builder.deleteConfirm', { title: chart.title || t('builder.autoTitle') }))) {
      await deleteChart(chart.id);
    }
  };

  const handleOpenCreate = () => {
    setEditingRow(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (row) => {
    setEditingRow(row);
    setModalOpen(true);
  };

  const handleModalSubmit = async (formValues) => {
    if (editingRow) {
      return updateMetric(editingRow.id, formValues);
    }
    return createMetric(formValues);
  };

  const handleDelete = async (row) => {
    const message = t('dashboard.confirmDelete', {
      month: t(`month.${row.month}`),
      category: t(`category.${row.category}`),
    });
    if (!window.confirm(message)) return;
    await deleteMetric(row.id);
  };

  const numEnd = 'text-end';

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {t('dashboard.title')}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{t('dashboard.subtitle')}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                usingFallback
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
              }`}
            >
              {usingFallback ? t('dashboard.sampleData') : t('dashboard.liveData')}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={refetch}
            disabled={loading}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {t('dashboard.refresh')}
          </button>

          <AdminOnly>
            <button
              type="button"
              onClick={() => { setEditingChart(null); setChartBuilderOpen(true); }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300"
            >
              <Plus className="h-3.5 w-3.5" />
              {t('builder.addChart')}
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 text-xs font-medium text-white shadow-xs transition-colors hover:bg-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" />
              {t('dashboard.addEdit')}
            </button>
          </AdminOnly>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      )}
      {soError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          {soError}
        </div>
      )}
      {chartsError && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">{chartsError}</div>}

      <section className="flex flex-wrap items-center gap-3 border-y border-slate-200 py-4 dark:border-slate-800" aria-label={t('builder.mainFilters')}>
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200"><SlidersHorizontal className="h-4 w-4 text-indigo-500" />{t('builder.mainFilters')}</span>
        <label className="sr-only" htmlFor="main-category">{t('dashboard.filterCategory')}</label>
        <select id="main-category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-slate-800 dark:bg-slate-900">
          <option value="All">{t('dashboard.allCategories')}</option>
          {METRIC_CATEGORIES.map((category) => <option key={category} value={category}>{t(`category.${category}`)}</option>)}
        </select>
        <label className="sr-only" htmlFor="main-month">{t('table.month')}</label>
        <select id="main-month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-slate-800 dark:bg-slate-900" >
          <option value="All">{t('builder.allMonths')}</option>
          {MONTHS_ORDER.map((month) => <option key={month} value={month}>{t(`month.${month}`)}</option>)}
        </select>
        <label className="sr-only" htmlFor="main-channel">{t('table.channel')}</label>
        <select id="main-channel" value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-slate-800 dark:bg-slate-900" >
          <option value="All">{t('builder.allChannels')}</option>
          {METRIC_CHANNELS.map((channel) => <option key={channel} value={channel}>{t(`channel.${channel}`)}</option>)}
        </select>
        {(monthFilter !== 'All' || channelFilter !== 'All' || categoryFilter !== 'All') && <button type="button" onClick={() => {setCategoryFilter('All'); setMonthFilter('All'); setChannelFilter('All');}} className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">{t('builder.clearFilters')}</button>}
      </section>

      {/* Top Row: 4 KPI Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title={t('kpi.totalSoPrice')}
          value={formatCurrency(totalSoPrice, 2)}
          change={totalSoCount.toLocaleString()}
          changeLabel={t('kpi.soRecordsLabel')}
          trend="neutral"
          icon={DollarSign}
          loading={soLoading}
        />
        <KpiCard
          title={t('kpi.netProfit')}
          value={formatCurrency(kpis.netProfit)}
          change={`${kpis.profitMargin.toFixed(1)}%`}
          changeLabel={t('kpi.marginLabel')}
          trend={kpis.netProfit >= 0 ? 'up' : 'down'}
          icon={TrendingUp}
          loading={loading}
        />
        <KpiCard
          title={t('kpi.totalOrders')}
          value={kpis.totalOrders.toLocaleString()}
          change="+8.6%"
          trend="up"
          icon={ShoppingBag}
          loading={loading}
        />
        <KpiCard
          title={t('kpi.avgConversion')}
          value={`${kpis.avgConversion.toFixed(2)}%`}
          change={kpis.latestActiveUsers.toLocaleString()}
          changeLabel={t('table.activeUsers')}
          trend="up"
          icon={Activity}
          loading={loading}
        />
      </section>

      {/* Middle / Bottom: Responsive 3-Chart Grid */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-12 xl:col-span-6">
          <RevenueAreaChart data={monthlySeries} loading={loading} />
        </div>
        <div className="lg:col-span-6 xl:col-span-3">
          <CategoryBarChart data={categorySeries} loading={loading} />
        </div>
        <div className="lg:col-span-6 xl:col-span-3">
          <DistributionPieChart data={channelDistribution} loading={loading} />
        </div>
      </section>

      {(chartsLoading || charts.length > 0) && <section className="space-y-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">{t('builder.customCharts')}</h3>
        {chartsLoading ? <p className="text-sm text-slate-500">{t('common.loading')}</p> : <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {charts.map((chart) => <ConfigurableChart key={chart.id} chart={chart} metrics={metrics} onEdit={() => {setEditingChart(chart); setChartBuilderOpen(true);}} onDelete={() => handleChartDelete(chart)} />)}
        </div>}
      </section>}

      {/* Metrics Breakdown Table */}
      <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              {t('dashboard.breakdown')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('dashboard.showing', { count: metrics.length })}
              {categoryFilter !== 'All' &&
                ` ${t('dashboard.inCategory', {
                  category: t(`category.${categoryFilter}`),
                })}`}
            </p>
          </div>

          <AdminOnly>
            <Link
              to="/manage"
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              {t('dashboard.openManager')}
              <span aria-hidden="true">{isRtl ? '←' : '→'}</span>
            </Link>
          </AdminOnly>
        </div>

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
                <th className={`px-4 py-3 ${numEnd}`}>{t('table.convRate')}</th>
                <AdminOnly>
                  <th className={`px-5 py-3 ${numEnd}`}>{t('table.actions')}</th>
                </AdminOnly>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {metrics.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-8 text-center text-sm text-slate-400"
                  >
                    {t('dashboard.noMetrics')}
                  </td>
                </tr>
              ) : (
                metrics.map((row) => (
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
                      {row.conversion_rate.toFixed(2)}%
                    </td>
                    <AdminOnly>
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
                    </AdminOnly>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <MetricFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingRow}
        saving={saving}
      />
      <ChartBuilderModal open={chartBuilderOpen} initialData={editingChart} saving={chartSaving} onClose={() => setChartBuilderOpen(false)} onSubmit={handleChartSave} />
    </div>
  );
}

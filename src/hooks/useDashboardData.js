import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export const METRIC_CATEGORIES = ['SaaS', 'Enterprise', 'Services', 'Add-ons'];
export const METRIC_CHANNELS = ['Direct', 'Organic', 'Partner', 'Outbound'];
export const MONTHS_ORDER = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const FALLBACK_METRICS = [
  {
    id: 'mock-1',
    month: 'Jan',
    period_order: 1,
    category: 'SaaS',
    channel: 'Organic',
    revenue: 42500,
    expenses: 18200,
    orders: 312,
    active_users: 1840,
    conversion_rate: 3.4,
    notes: 'Q1 launch cohort',
  },
  {
    id: 'mock-2',
    month: 'Feb',
    period_order: 2,
    category: 'Enterprise',
    channel: 'Outbound',
    revenue: 48900,
    expenses: 20100,
    orders: 285,
    active_users: 1960,
    conversion_rate: 3.65,
    notes: 'Annual contracts expansion',
  },
  {
    id: 'mock-3',
    month: 'Mar',
    period_order: 3,
    category: 'Services',
    channel: 'Partner',
    revenue: 53200,
    expenses: 21400,
    orders: 340,
    active_users: 2180,
    conversion_rate: 3.9,
    notes: 'Onboarding sprint revenue',
  },
  {
    id: 'mock-4',
    month: 'Apr',
    period_order: 4,
    category: 'SaaS',
    channel: 'Direct',
    revenue: 58400,
    expenses: 22800,
    orders: 392,
    active_users: 2410,
    conversion_rate: 4.15,
    notes: 'Self-serve tier growth',
  },
  {
    id: 'mock-5',
    month: 'May',
    period_order: 5,
    category: 'Enterprise',
    channel: 'Partner',
    revenue: 64100,
    expenses: 24600,
    orders: 418,
    active_users: 2650,
    conversion_rate: 4.3,
    notes: 'Mid-market pipeline close',
  },
  {
    id: 'mock-6',
    month: 'Jun',
    period_order: 6,
    category: 'Add-ons',
    channel: 'Organic',
    revenue: 69800,
    expenses: 25900,
    orders: 465,
    active_users: 2890,
    conversion_rate: 4.55,
    notes: 'API usage add-on adoption',
  },
  {
    id: 'mock-7',
    month: 'Jul',
    period_order: 7,
    category: 'SaaS',
    channel: 'Direct',
    revenue: 73400,
    expenses: 27100,
    orders: 490,
    active_users: 3120,
    conversion_rate: 4.7,
    notes: 'Summer retention peak',
  },
  {
    id: 'mock-8',
    month: 'Aug',
    period_order: 8,
    category: 'Services',
    channel: 'Outbound',
    revenue: 78200,
    expenses: 28400,
    orders: 515,
    active_users: 3340,
    conversion_rate: 4.85,
    notes: 'Dedicated SLA renewals',
  },
];

function normalizeRow(row) {
  return {
    id: row.id,
    month: row.month,
    period_order: Number(row.period_order) || 1,
    category: row.category || 'SaaS',
    channel: row.channel || 'Direct',
    revenue: Number(row.revenue) || 0,
    expenses: Number(row.expenses) || 0,
    orders: Number(row.orders) || 0,
    active_users: Number(row.active_users) || 0,
    conversion_rate: Number(row.conversion_rate) || 0,
    notes: row.notes || '',
    created_at: row.created_at,
  };
}

export function useDashboardData({ categoryFilter = 'All', monthFilter = 'All', channelFilter = 'All' } = {}) {
  const { user, isDemoMode } = useAuth();
  const [rawMetrics, setRawMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [totalSoPrice, setTotalSoPrice] = useState(0);
  const [totalSoCount, setTotalSoCount] = useState(0);
  const [soLoading, setSoLoading] = useState(true);
  const [soError, setSoError] = useState(null);

  const fetchTotalSoPrice = useCallback(async () => {
    setSoLoading(true);
    setSoError(null);

    if (!isSupabaseConfigured || !supabase || isDemoMode) {
      setTotalSoPrice(0);
      setTotalSoCount(0);
      setSoLoading(false);
      return;
    }

    try {
      const PAGE_SIZE = 1000;
      let from = 0;
      let sum = 0;
      let count = 0;

      while (true) {
        const { data, error: queryError } = await supabase
          .from('S O')
          .select('"Total SO Price"')
          .range(from, from + PAGE_SIZE - 1);

        if (queryError) {
          throw queryError;
        }

        const rows = data || [];
        for (const row of rows) {
          const parsed = Number(row?.['Total SO Price']);
          if (Number.isFinite(parsed)) {
            sum += parsed;
          }
        }
        count += rows.length;

        if (rows.length < PAGE_SIZE) {
          break;
        }
        from += PAGE_SIZE;
      }

      setTotalSoPrice(sum);
      setTotalSoCount(count);
    } catch (err) {
      setSoError(err?.message || 'Unable to load Total SO Price from S O.');
      setTotalSoPrice(0);
      setTotalSoCount(0);
    } finally {
      setSoLoading(false);
    }
  }, [isDemoMode]);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Preview / non-configured mode uses clean in-memory sample data
    if (!isSupabaseConfigured || !supabase || isDemoMode) {
      setRawMetrics((prev) => (prev.length > 0 ? prev : FALLBACK_METRICS));
      setUsingFallback(true);
      setLoading(false);
      return;
    }

    try {
      const { data, error: queryError } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .order('period_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (queryError) {
        throw queryError;
      }

      if (!data || data.length === 0) {
        setRawMetrics(FALLBACK_METRICS);
        setUsingFallback(true);
      } else {
        setRawMetrics(data.map(normalizeRow));
        setUsingFallback(false);
      }
    } catch (err) {
      setError(err?.message || 'Unable to load dashboard metrics.');
      setRawMetrics(FALLBACK_METRICS);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    fetchMetrics();
    fetchTotalSoPrice();
  }, [fetchMetrics, fetchTotalSoPrice]);

  const refetchAll = useCallback(async () => {
    await Promise.all([fetchMetrics(), fetchTotalSoPrice()]);
  }, [fetchMetrics, fetchTotalSoPrice]);

  // Filtered dataset for Dashboard views
  const metrics = useMemo(() => {
    return rawMetrics.filter((item) =>
      (categoryFilter === 'All' || item.category === categoryFilter) &&
      (monthFilter === 'All' || item.month === monthFilter) &&
      (channelFilter === 'All' || item.channel === channelFilter)
    );
  }, [rawMetrics, categoryFilter, monthFilter, channelFilter]);

  // Derived KPI metrics
  const kpis = useMemo(() => {
    const totalRevenue = metrics.reduce((sum, m) => sum + m.revenue, 0);
    const totalExpenses = metrics.reduce((sum, m) => sum + m.expenses, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const totalOrders = metrics.reduce((sum, m) => sum + m.orders, 0);
    const avgConversion =
      metrics.length > 0
        ? metrics.reduce((sum, m) => sum + m.conversion_rate, 0) / metrics.length
        : 0;
    const latestActiveUsers =
      metrics.length > 0 ? metrics[metrics.length - 1].active_users : 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      totalOrders,
      avgConversion,
      latestActiveUsers,
    };
  }, [metrics]);

  // Chart 1: Monthly Revenue & Expenses Area Chart
  const monthlySeries = useMemo(() => {
    const grouped = new Map();
    metrics.forEach((item) => {
      const existing = grouped.get(item.month) || {
        month: item.month,
        period_order: item.period_order,
        revenue: 0,
        expenses: 0,
        profit: 0,
      };
      existing.revenue += item.revenue;
      existing.expenses += item.expenses;
      existing.profit = existing.revenue - existing.expenses;
      grouped.set(item.month, existing);
    });

    return Array.from(grouped.values()).sort(
      (a, b) => a.period_order - b.period_order
    );
  }, [metrics]);

  // Chart 2: Category Bar Chart
  const categorySeries = useMemo(() => {
    const grouped = new Map();
    metrics.forEach((item) => {
      const existing = grouped.get(item.category) || {
        category: item.category,
        revenue: 0,
        orders: 0,
      };
      existing.revenue += item.revenue;
      existing.orders += item.orders;
      grouped.set(item.category, existing);
    });

    return Array.from(grouped.values()).sort((a, b) => b.revenue - a.revenue);
  }, [metrics]);

  // Chart 3: Channel Distribution Pie Chart
  const channelDistribution = useMemo(() => {
    const grouped = new Map();
    metrics.forEach((item) => {
      const existing = grouped.get(item.channel) || {
        name: item.channel,
        value: 0,
      };
      existing.value += item.revenue;
      grouped.set(item.channel, existing);
    });

    return Array.from(grouped.values()).sort((a, b) => b.value - a.value);
  }, [metrics]);

  // Admin CRUD: Create
  const createMetric = async (payload) => {
    setSaving(true);
    setError(null);
    const periodOrder =
      Number(payload.period_order) ||
      Math.max(1, MONTHS_ORDER.indexOf(payload.month) + 1);

    const record = {
      month: payload.month,
      period_order: periodOrder,
      category: payload.category,
      channel: payload.channel || 'Direct',
      revenue: Number(payload.revenue) || 0,
      expenses: Number(payload.expenses) || 0,
      orders: parseInt(payload.orders, 10) || 0,
      active_users: parseInt(payload.active_users, 10) || 0,
      conversion_rate: Number(payload.conversion_rate) || 0,
      notes: payload.notes?.trim() || null,
    };

    try {
      if (!isSupabaseConfigured || !supabase || isDemoMode) {
        const localRow = normalizeRow({
          ...record,
          id: `local-${Date.now()}`,
          created_at: new Date().toISOString(),
        });
        setRawMetrics((prev) =>
          [...prev, localRow].sort((a, b) => a.period_order - b.period_order)
        );
        return { data: localRow, error: null };
      }

      const { data, error: insertError } = await supabase
        .from('dashboard_metrics')
        .insert([{ ...record, created_by: user?.id ?? null }])
        .select()
        .single();

      if (insertError) throw insertError;

      const normalized = normalizeRow(data);
      setRawMetrics((prev) => {
        const base = usingFallback ? [] : prev;
        return [...base, normalized].sort(
          (a, b) => a.period_order - b.period_order
        );
      });
      setUsingFallback(false);
      return { data: normalized, error: null };
    } catch (err) {
      const message = err?.message || 'Failed to create metric.';
      setError(message);
      return { data: null, error: { message } };
    } finally {
      setSaving(false);
    }
  };

  // Admin CRUD: Update
  const updateMetric = async (id, payload) => {
    setSaving(true);
    setError(null);
    const periodOrder =
      Number(payload.period_order) ||
      Math.max(1, MONTHS_ORDER.indexOf(payload.month) + 1);

    const updates = {
      month: payload.month,
      period_order: periodOrder,
      category: payload.category,
      channel: payload.channel || 'Direct',
      revenue: Number(payload.revenue) || 0,
      expenses: Number(payload.expenses) || 0,
      orders: parseInt(payload.orders, 10) || 0,
      active_users: parseInt(payload.active_users, 10) || 0,
      conversion_rate: Number(payload.conversion_rate) || 0,
      notes: payload.notes?.trim() || null,
    };

    try {
      // If editing a mock row in Preview Mode, update locally
      if (
        !isSupabaseConfigured ||
        !supabase ||
        isDemoMode ||
        String(id).startsWith('mock-')
      ) {
        const updatedLocal = normalizeRow({ id, ...updates });
        setRawMetrics((prev) =>
          prev
            .map((row) => (row.id === id ? updatedLocal : row))
            .sort((a, b) => a.period_order - b.period_order)
        );
        return { data: updatedLocal, error: null };
      }

      const { data, error: updateError } = await supabase
        .from('dashboard_metrics')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const normalized = normalizeRow(data);
      setRawMetrics((prev) =>
        prev
          .map((row) => (row.id === id ? normalized : row))
          .sort((a, b) => a.period_order - b.period_order)
      );
      return { data: normalized, error: null };
    } catch (err) {
      const message = err?.message || 'Failed to update metric.';
      setError(message);
      return { data: null, error: { message } };
    } finally {
      setSaving(false);
    }
  };

  // Admin CRUD: Delete
  const deleteMetric = async (id) => {
    setSaving(true);
    setError(null);
    try {
      if (
        !isSupabaseConfigured ||
        !supabase ||
        isDemoMode ||
        String(id).startsWith('mock-')
      ) {
        setRawMetrics((prev) => prev.filter((row) => row.id !== id));
        return { error: null };
      }

      const { error: deleteError } = await supabase
        .from('dashboard_metrics')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setRawMetrics((prev) => prev.filter((row) => row.id !== id));
      return { error: null };
    } catch (err) {
      const message = err?.message || 'Failed to delete metric.';
      setError(message);
      return { error: { message } };
    } finally {
      setSaving(false);
    }
  };

  return {
    metrics,
    rawMetrics,
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
    refetch: refetchAll,
    createMetric,
    updateMetric,
    deleteMetric,
  };
}

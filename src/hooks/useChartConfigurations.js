import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export const CHART_FIELDS = {
  month: { kind: 'dimension', label: 'table.month' },
  category: { kind: 'dimension', label: 'table.category' },
  channel: { kind: 'dimension', label: 'table.channel' },
  revenue: { kind: 'measure', label: 'table.revenue' },
  expenses: { kind: 'measure', label: 'table.expenses' },
  orders: { kind: 'measure', label: 'table.orders' },
  active_users: { kind: 'measure', label: 'table.activeUsers' },
  conversion_rate: { kind: 'measure', label: 'table.convRate' },
};

const STORAGE_KEY = 'metricgrid_preview_charts';
const CHART_TYPES = ['bar', 'line', 'area', 'pie'];
const AGGREGATIONS = ['sum', 'avg', 'count'];
const COLORS = ['indigo', 'teal', 'amber', 'rose'];

function readPreview() {
  try {
    const rows = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function writePreview(rows) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)); } catch { /* storage unavailable */ }
}

export function useChartConfigurations() {
  const { user, isAdmin, isDemoMode } = useAuth();
  const preview = !isSupabaseConfigured || isDemoMode;
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!user) { setCharts([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    if (preview) {
      setCharts(readPreview());
      setLoading(false);
      return;
    }
    const { data, error: queryError } = await supabase
      .from('dashboard_charts').select('*').order('created_at', { ascending: true });
    if (queryError) setError(queryError.message);
    else setCharts(data || []);
    setLoading(false);
  }, [user?.id, preview]);

  useEffect(() => { refetch(); }, [refetch]);

  function validate(payload) {
    const x = CHART_FIELDS[payload.x_field];
    const y = CHART_FIELDS[payload.y_field];
    if (!x || x.kind !== 'dimension' || !y || y.kind !== 'measure' ||
      !CHART_TYPES.includes(payload.chart_type) || !AGGREGATIONS.includes(payload.aggregation) ||
      !COLORS.includes(payload.color) || !['half', 'full'].includes(payload.size) ||
      !['All', 'SaaS', 'Enterprise', 'Services', 'Add-ons'].includes(payload.filter_category)) {
      throw new Error('Invalid chart configuration.');
    }
    return {
      title: (payload.title || '').trim().slice(0, 100),
      source_table: 'dashboard_metrics',
      x_field: payload.x_field,
      y_field: payload.y_field,
      aggregation: payload.aggregation,
      chart_type: payload.chart_type,
      color: payload.color,
      size: payload.size,
      filter_category: payload.filter_category,
    };
  }

  async function mutate(action, id, payload) {
    if (!isAdmin) return { error: { message: 'Admin access required.' } };
    setSaving(true);
    setError(null);
    try {
      const record = action === 'delete' ? null : validate(payload);
      if (preview) {
        let next;
        if (action === 'create') next = [...charts, { ...record, id: crypto.randomUUID(), created_at: new Date().toISOString() }];
        else if (action === 'update') next = charts.map((chart) => chart.id === id ? { ...chart, ...record } : chart);
        else next = charts.filter((chart) => chart.id !== id);
        writePreview(next);
        setCharts(next);
        return { error: null };
      }

      let query;
      if (action === 'create') query = supabase.from('dashboard_charts').insert({ ...record, created_by: user.id }).select().single();
      else if (action === 'update') query = supabase.from('dashboard_charts').update(record).eq('id', id).select().single();
      else query = supabase.from('dashboard_charts').delete().eq('id', id).select().single();
      const { data, error: mutationError } = await query;
      if (mutationError) throw mutationError;
      if (action === 'create') setCharts((prev) => [...prev, data]);
      else if (action === 'update') setCharts((prev) => prev.map((chart) => chart.id === id ? data : chart));
      else setCharts((prev) => prev.filter((chart) => chart.id !== id));
      return { error: null };
    } catch (err) {
      const message = err?.message || 'Could not save chart.';
      setError(message);
      return { error: { message } };
    } finally {
      setSaving(false);
    }
  }

  return {
    charts, loading, saving, error, refetch,
    createChart: (payload) => mutate('create', null, payload),
    updateChart: (id, payload) => mutate('update', id, payload),
    deleteChart: (id) => mutate('delete', id),
  };
}
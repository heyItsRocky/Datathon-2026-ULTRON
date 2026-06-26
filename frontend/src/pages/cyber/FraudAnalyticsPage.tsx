import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CircleDollarSign, FileSearch, ShieldCheck, Target } from 'lucide-react';
import { useCyberIncidents } from '@/features/cyber/hooks/useCyberIncidents';
import type { CyberIncidentDTO } from '@/shared/api/dto-adapters/cyber';
import { EmptyState, ErrorState, KpiCard, LoadingSkeleton, PageHeader } from '@/shared/components';
import { Select } from '@/shared/ui-kit';

const FRAUD_TYPES = ['Cyber Fraud', 'Identity Theft', 'Phishing', 'Social Engineering'];
const ACTIVE_STATUSES = ['Open', 'Under Investigation'];
const colors = ['var(--color-cyber-cyan)', 'var(--color-crime-red)', 'var(--color-gold)', 'var(--color-network-purple)', 'var(--color-intel-violet)'];
const tooltipStyle = { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' };

interface TargetRow {
  target: string;
  count: number;
  type: string;
  status: string;
}

function countBy<T extends string>(items: T[]): T {
  const counts = new Map<T, number>();
  items.forEach((item) => counts.set(item, (counts.get(item) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? items[0];
}

function parseImpactUsers(impact: string): number {
  return Number(impact.match(/\d+/)?.[0] ?? 0);
}

function monthKey(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';
  return parsed.toLocaleString('en-IN', { month: 'short' });
}

export function FraudAnalyticsPage() {
  const { data, isLoading, isError, error, refetch } = useCyberIncidents();
  const [fraudType, setFraudType] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  const fraudIncidents = useMemo(() => (data ?? []).filter((incident) => FRAUD_TYPES.includes(incident.type)), [data]);

  const filteredIncidents = useMemo(
    () => fraudIncidents.filter((incident) => (fraudType === 'all' || incident.type === fraudType) && (status === 'all' || incident.status === status)),
    [fraudIncidents, fraudType, status],
  );

  const typeOptions = useMemo(
    () => [{ label: 'All Fraud Types', value: 'all' }, ...FRAUD_TYPES.map((type) => ({ label: type, value: type }))],
    [],
  );

  const statusOptions = useMemo(() => {
    const statuses = [...new Set(fraudIncidents.map((incident) => incident.status))].sort();
    return [{ label: 'All Statuses', value: 'all' }, ...statuses.map((item) => ({ label: item, value: item }))];
  }, [fraudIncidents]);

  const typeDistribution = useMemo(() => {
    const map = new Map<string, number>();
    filteredIncidents.forEach((incident) => map.set(incident.type, (map.get(incident.type) ?? 0) + 1));
    return [...map.entries()].map(([type, count]) => ({ type, count }));
  }, [filteredIncidents]);

  const monthlyTrend = useMemo(() => {
    const map = new Map<string, number>();
    filteredIncidents.forEach((incident) => {
      const month = monthKey(incident.date || incident.detectedAt);
      map.set(month, (map.get(month) ?? 0) + 1);
    });
    return [...map.entries()].map(([month, incidents]) => ({ month, incidents }));
  }, [filteredIncidents]);

  const targetRows = useMemo<TargetRow[]>(() => {
    const map = new Map<string, CyberIncidentDTO[]>();
    filteredIncidents.forEach((incident) => {
      const rows = map.get(incident.target) ?? [];
      rows.push(incident);
      map.set(incident.target, rows);
    });
    return [...map.entries()]
      .map(([target, rows]) => ({
        target,
        count: rows.length,
        type: countBy(rows.map((row) => row.type)),
        status: countBy(rows.map((row) => row.status)),
      }))
      .sort((a, b) => (sortOrder === 'asc' ? a.count - b.count : b.count - a.count));
  }, [filteredIncidents, sortOrder]);

  const totalImpact = useMemo(() => filteredIncidents.reduce((sum, incident) => sum + parseImpactUsers(incident.impact), 0), [filteredIncidents]);
  const activeCount = filteredIncidents.filter((incident) => ACTIVE_STATUSES.includes(incident.status)).length;
  const resolutionRate = filteredIncidents.length ? Math.round((filteredIncidents.filter((incident) => incident.status === 'Resolved').length / filteredIncidents.length) * 100) : 0;

  if (isLoading) {
    return <div className="grid gap-6"><LoadingSkeleton className="h-28" variant="card" /><div className="grid gap-4 md:grid-cols-4">{[0, 1, 2, 3].map((item) => <LoadingSkeleton key={item} variant="card" />)}</div><div className="grid gap-6 xl:grid-cols-2"><LoadingSkeleton className="h-80" variant="chart" /><LoadingSkeleton className="h-80" variant="chart" /></div></div>;
  }

  if (isError) return <ErrorState message={error.message} onRetry={() => void refetch()} />;

  if (!fraudIncidents.length) {
    return <EmptyState title="No fraud analytics data available" description="Cyber incidents may not contain fraud records." />;
  }

  if (!filteredIncidents.length) {
    return <div className="grid gap-6"><PageHeader title="Fraud Analytics" subtitle="Fraud pattern analysis across cyber incidents" /><section className="glass-card grid gap-3 rounded-[var(--radius-2xl)] p-4 lg:grid-cols-[1fr_180px_180px]"><Select value={fraudType} onValueChange={setFraudType} options={typeOptions} /><Select value={status} onValueChange={setStatus} options={statusOptions} /><Select value={sortOrder} onValueChange={setSortOrder} options={[{ label: 'Count: High to Low', value: 'desc' }, { label: 'Count: Low to High', value: 'asc' }]} /></section><EmptyState title="No matching fraud incidents" description="Adjust fraud type or status filters to view analytics." /></div>;
  }

  return (
    <div className="grid gap-6">
      <PageHeader title="Fraud Analytics" subtitle="Fraud pattern analysis across cyber incidents" />

      <section className="glass-card grid gap-3 rounded-[var(--radius-2xl)] p-4 lg:grid-cols-[1fr_180px_180px]">
        <Select value={fraudType} onValueChange={setFraudType} options={typeOptions} />
        <Select value={status} onValueChange={setStatus} options={statusOptions} />
        <Select value={sortOrder} onValueChange={setSortOrder} options={[{ label: 'Count: High to Low', value: 'desc' }, { label: 'Count: Low to High', value: 'asc' }]} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={FileSearch} title="Total Fraud Cases" value={filteredIncidents.length} trend={8} />
        <KpiCard icon={ShieldCheck} title="Active Investigations" value={activeCount} trend={4} />
        <KpiCard icon={CircleDollarSign} title="Impact Users/Systems" value={totalImpact} trend={-3} />
        <KpiCard icon={Target} title="Avg Resolution Rate" value={resolutionRate} trend={resolutionRate - 50} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="glass-card rounded-[var(--radius-2xl)] p-5">
          <h2 className="text-xl font-bold">Fraud Type Distribution</h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeDistribution} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={100} label>
                  {typeDistribution.map((entry, index) => <Cell key={entry.type} fill={colors[index % colors.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-[var(--radius-2xl)] p-5">
          <h2 className="text-xl font-bold">Monthly Fraud Trend</h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <defs><linearGradient id="fraudTrend" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-gold)" stopOpacity={0.35} /><stop offset="95%" stopColor="var(--color-gold)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="rgba(255,255,255,.08)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="incidents" stroke="var(--color-gold)" fill="url(#fraudTrend)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="glass-card rounded-[var(--radius-2xl)] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div><h2 className="text-xl font-bold">Top Targeted Entities</h2><p className="text-sm text-[var(--color-text-secondary)]">Sorted by incident count across filtered fraud cases.</p></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-[var(--color-text-muted)]"><tr><th className="py-3">Target</th><th>Incident Count</th><th>Most Common Fraud Type</th><th>Status</th></tr></thead>
            <tbody>{targetRows.map((row) => <tr key={row.target} className="border-t border-[var(--color-border)]"><td className="py-3 font-mono text-[var(--color-gold)]">{row.target}</td><td className="font-bold">{row.count}</td><td>{row.type}</td><td className="text-[var(--color-text-secondary)]">{row.status}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default FraudAnalyticsPage;

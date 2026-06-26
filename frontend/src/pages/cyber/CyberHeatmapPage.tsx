import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, Crosshair } from 'lucide-react';
import { useCyberIncidents } from '@/features/cyber/hooks/useCyberIncidents';
import { EmptyState, ErrorState, LoadingSkeleton, PageHeader } from '@/shared/components';
import { Select } from '@/shared/ui-kit';

const severityOptions = ['all', 'low', 'medium', 'high', 'extreme'].map((value) => ({ label: value === 'all' ? 'All Severities' : value[0].toUpperCase() + value.slice(1), value }));
const dateOptions = [
  { label: 'All Dates', value: 'all' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
];

function getHeatColor(count: number, max: number): string {
  if (!count || !max) return 'rgba(255, 255, 255, 0.04)';
  const ratio = count / max;
  if (ratio > 0.66) return 'rgba(239, 68, 68, 0.8)';
  if (ratio > 0.33) return 'rgba(245, 158, 11, 0.8)';
  return 'rgba(34, 211, 238, 0.6)';
}

function dateThreshold(dateRange: string, dates: string[]): number {
  if (dateRange === 'all') return Number.NEGATIVE_INFINITY;
  const latest = Math.max(...dates.map((date) => new Date(date).getTime()).filter(Number.isFinite));
  const days = Number(dateRange.replace('d', ''));
  return latest - days * 24 * 60 * 60 * 1000;
}

function topEntry(entries: string[]): string {
  const counts = new Map<string, number>();
  entries.forEach((entry) => counts.set(entry, (counts.get(entry) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Unknown';
}

export function CyberHeatmapPage() {
  const { data, isLoading, isError, error, refetch } = useCyberIncidents();
  const [severity, setSeverity] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const filteredIncidents = useMemo(() => {
    const incidents = data ?? [];
    const threshold = dateThreshold(dateRange, incidents.map((incident) => incident.date || incident.detectedAt));
    return incidents.filter((incident) => {
      const timestamp = new Date(incident.date || incident.detectedAt).getTime();
      const matchesDate = dateRange === 'all' || (Number.isFinite(timestamp) && timestamp >= threshold);
      return (severity === 'all' || incident.severity === severity) && matchesDate;
    });
  }, [data, dateRange, severity]);

  const types = useMemo(() => [...new Set(filteredIncidents.map((incident) => incident.type))].sort(), [filteredIncidents]);
  const districts = useMemo(() => [...new Set(filteredIncidents.map((incident) => incident.district))].sort(), [filteredIncidents]);

  const matrix = useMemo(() => {
    const map = new Map<string, number>();
    filteredIncidents.forEach((incident) => {
      const key = `${incident.type}::${incident.district}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return map;
  }, [filteredIncidents]);

  const maxCount = useMemo(() => Math.max(0, ...matrix.values()), [matrix]);
  const mostActiveDistrict = useMemo(() => topEntry(filteredIncidents.map((incident) => incident.district)), [filteredIncidents]);
  const mostCommonType = useMemo(() => topEntry(filteredIncidents.map((incident) => incident.type)), [filteredIncidents]);

  if (isLoading) {
    return <div className="grid gap-6"><LoadingSkeleton className="h-28" variant="card" /><div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((item) => <LoadingSkeleton key={item} variant="card" />)}</div><LoadingSkeleton className="h-[34rem]" variant="chart" /></div>;
  }

  if (isError) return <ErrorState message={error.message} onRetry={() => void refetch()} />;

  if (!data?.length) return <EmptyState title="No heatmap data available" description="No cyber incident density records are available." />;

  if (!filteredIncidents.length) {
    return <div className="grid gap-6"><PageHeader title="Cyber Heatmap" subtitle="Incident density by type and district" /><section className="glass-card grid gap-3 rounded-[var(--radius-2xl)] p-4 sm:grid-cols-2"><Select value={severity} onValueChange={setSeverity} options={severityOptions} /><Select value={dateRange} onValueChange={setDateRange} options={dateOptions} /></section><EmptyState title="No heatmap data available" description="Adjust severity or date filters to reveal incident density." /></div>;
  }

  return (
    <div className="grid gap-6">
      <PageHeader title="Cyber Heatmap" subtitle="Incident density by type and district" />

      <section className="glass-card grid gap-3 rounded-[var(--radius-2xl)] p-4 sm:grid-cols-2">
        <Select value={severity} onValueChange={setSeverity} options={severityOptions} />
        <Select value={dateRange} onValueChange={setDateRange} options={dateOptions} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="glass-card rounded-[var(--radius-xl)] border-t-2 border-t-[var(--color-gold)] p-5"><div className="mb-4 flex items-center justify-between text-[var(--color-text-secondary)]"><span className="text-sm font-semibold">Total Incidents Mapped</span><Activity className="h-5 w-5 text-[var(--color-gold)]" /></div><b className="text-4xl font-extrabold">{filteredIncidents.length.toLocaleString()}</b><p className="mt-3 text-sm text-[var(--color-text-secondary)]">Filtered cyber reports in the density matrix.</p></div>
        <div className="glass-card rounded-[var(--radius-xl)] border-t-2 border-t-[var(--color-gold)] p-5"><div className="mb-4 flex items-center justify-between text-[var(--color-text-secondary)]"><span className="text-sm font-semibold">Most Active District</span><Crosshair className="h-5 w-5 text-[var(--color-gold)]" /></div><b className="text-2xl font-extrabold">{mostActiveDistrict}</b><p className="mt-3 text-sm text-[var(--color-text-secondary)]">{filteredIncidents.filter((incident) => incident.district === mostActiveDistrict).length} mapped incidents.</p></div>
        <div className="glass-card rounded-[var(--radius-xl)] border-t-2 border-t-[var(--color-gold)] p-5"><div className="mb-4 flex items-center justify-between text-[var(--color-text-secondary)]"><span className="text-sm font-semibold">Most Common Attack Type</span><AlertTriangle className="h-5 w-5 text-[var(--color-gold)]" /></div><b className="text-2xl font-extrabold">{mostCommonType}</b><p className="mt-3 text-sm text-[var(--color-text-secondary)]">{filteredIncidents.filter((incident) => incident.type === mostCommonType).length} matching incidents.</p></div>
      </section>

      <section className="glass-card rounded-[var(--radius-2xl)] p-5">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div><h2 className="text-xl font-bold">Type × District Density</h2><p className="text-sm text-[var(--color-text-secondary)]">Hover cells for exact incident count. Peak district: <span className="text-[var(--color-gold)]">{mostActiveDistrict}</span>; leading type: <span className="text-[var(--color-gold)]">{mostCommonType}</span>.</p></div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-secondary)]">
            <span className="flex items-center gap-2"><span className="h-3 w-8 rounded-full bg-[rgba(34,211,238,0.6)]" />Low</span>
            <span className="flex items-center gap-2"><span className="h-3 w-8 rounded-full bg-[rgba(245,158,11,0.8)]" />Medium</span>
            <span className="flex items-center gap-2"><span className="h-3 w-8 rounded-full bg-[rgba(239,68,68,0.8)]" />High</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[980px]" style={{ display: 'grid', gridTemplateColumns: `180px repeat(${districts.length}, minmax(88px, 1fr))` }}>
            <div className="sticky left-0 z-10 border-b border-[var(--color-border)] bg-[#111827] p-3 text-xs font-semibold uppercase text-[var(--color-text-muted)]">Attack Type</div>
            {districts.map((district) => <div key={district} className="border-b border-[var(--color-border)] p-3 text-center text-xs font-semibold text-[var(--color-text-muted)]">{district}</div>)}
            {types.map((type) => (
              <div key={type} className="contents">
                <div className="sticky left-0 z-10 border-b border-[var(--color-border)] bg-[#111827] p-3 text-sm font-semibold">{type}</div>
                {districts.map((district) => {
                  const count = matrix.get(`${type}::${district}`) ?? 0;
                  return <div key={`${type}-${district}`} title={`${type} in ${district}: ${count} incidents`} className="grid min-h-14 place-items-center border-b border-l border-[var(--color-border)] text-sm font-bold transition hover:scale-105 hover:ring-2 hover:ring-[var(--color-gold)]" style={{ backgroundColor: getHeatColor(count, maxCount), color: count ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>{count}</div>;
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default CyberHeatmapPage;

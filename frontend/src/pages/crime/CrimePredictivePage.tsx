import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BrainCircuit, CalendarClock, Crosshair, ShieldAlert, Target } from 'lucide-react';
import { EmptyState, ErrorState, KpiCard, LoadingSkeleton, PageHeader, SeverityBadge, type SeverityLevel } from '@/shared/components';
import { Button } from '@/shared/ui-kit';
import { apiGet } from '@/shared/api/client';

type RiskFilter = 'all' | 'extreme' | 'high' | 'medium';

interface PredictiveZoneDTO {
  id: string;
  districtId: string;
  district: string;
  confidence: number;
  riskLevel: SeverityLevel;
  date: string;
}

interface RedZoneDTO {
  district: string;
  districtId: string;
  level: SeverityLevel;
  crimeRate: number;
  trend: number;
  population: number;
  policeStations: number;
  priority: number;
}

const tabs: Array<{ label: string; value: RiskFilter }> = [{ label: 'All', value: 'all' }, { label: 'Extreme', value: 'extreme' }, { label: 'High', value: 'high' }, { label: 'Medium', value: 'medium' }];

function fetchPredictiveZones() {
  return apiGet<PredictiveZoneDTO[]>('/maps/predictive-zones');
}

function fetchRedZones() {
  return apiGet<RedZoneDTO[]>('/maps/red-zones');
}

function recommendation(zone: PredictiveZoneDTO, context?: RedZoneDTO) {
  if (zone.riskLevel === 'extreme') return `Deploy rapid response patrols, keep ${context?.policeStations ?? 0} station units on alert, and prioritize visible deterrence before ${zone.date}.`;
  if (zone.riskLevel === 'high') return `Increase night patrol frequency, review repeat-offender watchlists, and pre-position response teams in ${zone.district}.`;
  if (zone.riskLevel === 'medium') return `Schedule beat-level surveillance and monitor crime-type signals against current red-zone trend of ${context?.trend ?? 0}%.`;
  return `Maintain routine monitoring and validate forecast confidence with fresh FIR ingestion.`;
}

function confidenceColor(confidence: number) {
  if (confidence >= 90) return 'var(--color-crime-red)';
  if (confidence >= 75) return 'var(--color-crime-amber)';
  return 'var(--color-gold)';
}

export function CrimePredictivePage() {
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const zonesQuery = useQuery({ queryKey: ['predictive-zones'], queryFn: fetchPredictiveZones });
  const redZonesQuery = useQuery({ queryKey: ['red-zones'], queryFn: fetchRedZones });
  const zones = zonesQuery.data ?? [];
  const redZones = redZonesQuery.data ?? [];

  const redZoneByDistrict = useMemo(() => new Map(redZones.map((zone) => [zone.districtId, zone])), [redZones]);
  const filtered = useMemo(() => zones.filter((zone) => riskFilter === 'all' || zone.riskLevel === riskFilter).sort((a, b) => b.confidence - a.confidence), [riskFilter, zones]);
  const avgConfidence = zones.length > 0 ? Math.round(zones.reduce((sum, zone) => sum + zone.confidence, 0) / zones.length) : 0;
  const extremeCount = zones.filter((zone) => zone.riskLevel === 'extreme').length;
  const highCount = zones.filter((zone) => zone.riskLevel === 'high').length;
  const isLoading = zonesQuery.isLoading || redZonesQuery.isLoading;
  const isError = zonesQuery.isError || redZonesQuery.isError;
  const error = zonesQuery.error ?? redZonesQuery.error;

  if (isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-28" variant="card" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <LoadingSkeleton key={index} variant="card" />)}</div><div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <LoadingSkeleton key={index} className="h-72" variant="card" />)}</div></div>;
  if (isError) return <ErrorState message={error instanceof Error ? error.message : 'Unable to load predictive intelligence'} onRetry={() => { void zonesQuery.refetch(); void redZonesQuery.refetch(); }} />;

  return (
    <div className="grid gap-6">
      <PageHeader title="Predictive Intelligence" subtitle="AI-forecasted high-risk zones" />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><KpiCard icon={Target} title="Zones Predicted" value={zones.length} trend={8} /><KpiCard icon={ShieldAlert} title="Extreme Risk Count" value={extremeCount} trend={extremeCount > 0 ? 14 : 0} /><KpiCard icon={Crosshair} title="High Risk Count" value={highCount} trend={9} /><KpiCard icon={BrainCircuit} title="Avg Confidence" value={avgConfidence} trend={5} /></section>
      <section className="glass-card flex flex-wrap gap-2 rounded-[var(--radius-2xl)] p-3">{tabs.map((tab) => <Button key={tab.value} onClick={() => setRiskFilter(tab.value)} variant={riskFilter === tab.value ? 'primary' : 'ghost'}>{tab.label}</Button>)}</section>
      {filtered.length === 0 ? <EmptyState description="No predictive zones match the selected risk level." title="No predictions available" /> : <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{filtered.map((zone) => {
        const context = redZoneByDistrict.get(zone.districtId);
        return (
          <article key={zone.id} className="glass-card grid gap-5 rounded-[var(--radius-2xl)] p-5">
            <div className="flex items-start justify-between gap-3"><div><p className="font-mono text-xs text-[var(--color-gold)]">{zone.id}</p><h2 className="mt-1 text-xl font-bold">{zone.district}</h2><p className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)]"><CalendarClock className="h-4 w-4" />Predicted for {zone.date}</p></div><SeverityBadge severity={zone.riskLevel} /></div>
            <div><div className="flex items-center justify-between text-sm"><span className="text-[var(--color-text-secondary)]">Forecast Confidence</span><span className="font-bold text-[var(--color-gold)]">{zone.confidence}%</span></div><div className="mt-2 h-3 rounded-full bg-white/10"><div className="h-3 rounded-full" style={{ background: confidenceColor(zone.confidence), width: `${zone.confidence}%` }} /></div></div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/5 p-4"><h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Action Recommendation</h3><p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{recommendation(zone, context)}</p></div>
            {context ? <div className="grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-[var(--radius-lg)] bg-white/5 p-3"><p className="text-[var(--color-text-muted)]">Current Rate</p><p className="mt-1 font-bold text-[var(--color-gold)]">{context.crimeRate}</p></div><div className="rounded-[var(--radius-lg)] bg-white/5 p-3"><p className="text-[var(--color-text-muted)]">Trend</p><p className="mt-1 font-bold text-[var(--color-gold)]">+{context.trend}%</p></div><div className="rounded-[var(--radius-lg)] bg-white/5 p-3"><p className="text-[var(--color-text-muted)]">Priority</p><p className="mt-1 font-bold text-[var(--color-gold)]">#{context.priority}</p></div></div> : null}
            <Link to={`/maps/districts/${zone.districtId}`}><Button className="w-full" variant="secondary">View Details</Button></Link>
          </article>
        );
      })}</section>}
    </div>
  );
}

export default CrimePredictivePage;

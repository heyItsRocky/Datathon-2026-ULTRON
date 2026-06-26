import { Link } from 'react-router-dom';
import { Brain, Radar, Siren, TrendingUp } from 'lucide-react';
import { EmergingTrendsPanel } from '@/features/intelligence/components/EmergingTrendsPanel';
import { IntelBriefCard } from '@/features/intelligence/components/IntelBriefCard';
import { IntelHubHero } from '@/features/intelligence/components/IntelHubHero';
import { PredictiveZonesPanel } from '@/features/intelligence/components/PredictiveZonesPanel';
import { RedZonePanel } from '@/features/intelligence/components/RedZonePanel';
import { SocioEconomicPanel } from '@/features/intelligence/components/SocioEconomicPanel';
import { useEmergingTrends } from '@/features/intelligence/hooks/useEmergingTrends';
import { useIntelBriefs } from '@/features/intelligence/hooks/useIntelBriefs';
import { usePredictiveZones } from '@/features/intelligence/hooks/usePredictiveZones';
import { useRedZones } from '@/features/intelligence/hooks/useRedZones';
import { useSocioEconomicData } from '@/features/intelligence/hooks/useSocioEconomicData';
import { EmergencyFooter, EmptyState, ErrorState, KpiCard, LoadingSkeleton, PageHeader } from '@/shared/components';

export function IntelHubPage() {
  const briefs = useIntelBriefs();
  const trends = useEmergingTrends();
  const redZones = useRedZones();
  const predictive = usePredictiveZones();
  const socio = useSocioEconomicData();
  const loading = briefs.isLoading || trends.isLoading || redZones.isLoading || predictive.isLoading || socio.isLoading;
  const error = briefs.error ?? trends.error ?? redZones.error ?? predictive.error ?? socio.error;
  const hasData = Boolean(briefs.data?.length || trends.data?.length || redZones.data?.length || predictive.data?.length || socio.data?.demographics.length);

  if (loading) return <div className="grid gap-6"><LoadingSkeleton className="h-32" variant="card" /><div className="grid gap-4 md:grid-cols-4">{[0, 1, 2, 3].map((item) => <LoadingSkeleton key={item} variant="card" />)}</div><div className="grid gap-6 xl:grid-cols-2">{[0, 1, 2, 3].map((item) => <LoadingSkeleton key={item} className="h-80" variant="chart" />)}</div></div>;
  if (error && !hasData) return <ErrorState message={error.message} onRetry={() => { void briefs.refetch(); void trends.refetch(); void redZones.refetch(); void predictive.refetch(); void socio.refetch(); }} />;
  if (!hasData) return <EmptyState title="No strategic intelligence" description="Intel mock data is unavailable." />;

  const topBriefDate = briefs.data?.[0]?.date ?? '2026-06-24';
  const highRiskDistricts = redZones.data?.filter((zone) => zone.severity === 'high').length ?? 0;

  return <div className="grid gap-6"><PageHeader title="Strategic Intelligence Hub" subtitle="Executive command center for Karnataka Police senior leadership" />{error ? <ErrorState message={error.message} onRetry={() => { void briefs.refetch(); void trends.refetch(); void redZones.refetch(); void predictive.refetch(); void socio.refetch(); }} /> : null}<IntelHubHero briefsCount={briefs.data?.length ?? 0} redZonesCount={redZones.data?.length ?? 0} trendsCount={trends.data?.length ?? 0} highRiskDistricts={highRiskDistricts} lastUpdated={topBriefDate} /><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><KpiCard icon={Brain} title="AI Briefs" value={briefs.data?.length ?? 0} trend={12} /><KpiCard icon={Siren} title="Red Zones" value={redZones.data?.length ?? 0} trend={highRiskDistricts} /><KpiCard icon={TrendingUp} title="Emerging Trends" value={trends.data?.length ?? 0} trend={8} /><KpiCard icon={Radar} title="Forecast Zones" value={predictive.data?.length ?? 0} trend={15} /></section><section className="grid gap-6 xl:grid-cols-2"><PredictiveZonesPanel zones={predictive.data ?? []} isLoading={predictive.isLoading} isEmpty={!predictive.data?.length} hasError={predictive.isError} /><SocioEconomicPanel data={socio.data} isLoading={socio.isLoading} isEmpty={!socio.data?.demographics.length} hasError={socio.isError} /><EmergingTrendsPanel trends={trends.data ?? []} isLoading={trends.isLoading} isEmpty={!trends.data?.length} hasError={trends.isError} /><RedZonePanel zones={redZones.data ?? []} isLoading={redZones.isLoading} isEmpty={!redZones.data?.length} hasError={redZones.isError} /></section><section className="grid gap-4"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">AI-Generated Briefs</h2><Link className="text-sm text-[var(--color-gold)]" to="/intel/briefings">View all →</Link></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{(briefs.data ?? []).slice(0, 6).map((brief) => <IntelBriefCard key={brief.id} brief={brief} />)}</div></section><EmergencyFooter /></div>;
}

export default IntelHubPage;

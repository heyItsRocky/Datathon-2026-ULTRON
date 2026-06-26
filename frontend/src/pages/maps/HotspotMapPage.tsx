import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import { ArrowDown, ArrowUp, Crosshair, Flame, Gauge } from 'lucide-react';
import { HotspotLayer } from '@/features/maps/components/HotspotLayer';
import { RedZoneLayer } from '@/features/maps/components/RedZoneLayer';
import { useHotspots } from '@/features/maps/hooks/useHotspots';
import { useRedZones } from '@/features/maps/hooks/useRedZones';
import { EmptyState, ErrorState, KpiCard, LoadingSkeleton, PageHeader, SeverityBadge } from '@/shared/components';
import { Button, Select } from '@/shared/ui-kit';

const KARNATAKA_CENTER: [number, number] = [15.3, 75.5];
const riskOptions = ['all', 'high', 'medium', 'low'].map((value) => ({ label: value === 'all' ? 'All Risk Levels' : value[0].toUpperCase() + value.slice(1), value }));

function MapFlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, 12, { duration: 1 }); }, [center, map]);
  return null;
}

export function HotspotMapPage() {
  const hotspots = useHotspots();
  const redZones = useRedZones();
  const [risk, setRisk] = useState('all');
  const [center, setCenter] = useState<[number, number]>(KARNATAKA_CENTER);

  const filtered = useMemo(() => (hotspots.data ?? []).filter((hotspot) => risk === 'all' || hotspot.riskLevel === risk), [hotspots.data, risk]);
  const highRisk = filtered.filter((hotspot) => hotspot.riskLevel === 'high').length;
  const avgDensity = filtered.length ? Math.round(filtered.reduce((sum, hotspot) => sum + hotspot.crimeCount, 0) / filtered.length) : 0;
  const error = hotspots.error ?? redZones.error;

  if (hotspots.isLoading || redZones.isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-24" variant="card" /><LoadingSkeleton className="h-[80vh]" variant="map" /></div>;
  if (error) return <ErrorState message={error.message} onRetry={() => { void hotspots.refetch(); void redZones.refetch(); }} />;
  if (!hotspots.data?.length) return <EmptyState title="No hotspot data" description="No crime hotspot clusters are available for the map." />;

  return (
    <div className="grid gap-6">
      <PageHeader title="Hotspot Map" subtitle={`${filtered.length} active hotspots across Karnataka`} />
      <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
        <div className="glass-card rounded-[var(--radius-2xl)] p-3">
          {filtered.length ? (
            <MapContainer className="h-[80vh] w-full rounded-[var(--radius-2xl)]" center={KARNATAKA_CENTER} zoom={7} zoomControl={false} scrollWheelZoom>
              <TileLayer attribution='© <a href="https://carto.com/">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <ZoomControl position="bottomleft" />
              <MapFlyTo center={center} />
              <RedZoneLayer zones={redZones.data ?? []} />
              <HotspotLayer hotspots={filtered} />
            </MapContainer>
          ) : <EmptyState title="No matching hotspots" description="Adjust the risk filter to display hotspot clusters." />}
        </div>
        <aside className="grid max-h-[84vh] gap-4 overflow-hidden">
          <section className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <KpiCard icon={Flame} title="Total Hotspots" value={filtered.length} trend={6} />
            <KpiCard icon={Crosshair} title="High-Risk Count" value={highRisk} trend={2} />
            <KpiCard icon={Gauge} title="Avg Crime Density" value={avgDensity} trend={-4} />
          </section>
          <section className="glass-card rounded-[var(--radius-2xl)] p-4">
            <Select value={risk} onValueChange={setRisk} options={riskOptions} />
          </section>
          <section className="grid gap-3 overflow-y-auto pr-1">
            {filtered.map((hotspot) => (
              <button key={hotspot.id} onClick={() => setCenter([hotspot.latitude, hotspot.longitude])} className="glass-card rounded-[var(--radius-xl)] p-4 text-left transition hover:border-[var(--color-gold)]/60">
                <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{hotspot.district}</h3><p className="text-sm text-[var(--color-text-secondary)]">{hotspot.topCrimeType} · Peak {hotspot.peakTime}</p></div><SeverityBadge severity={hotspot.riskLevel as 'high' | 'medium' | 'low'} /></div>
                <div className="mt-4 flex items-center justify-between"><span className="text-3xl font-black text-[var(--color-gold)]">{hotspot.crimeCount}</span><span className={hotspot.trend >= 0 ? 'flex items-center gap-1 text-red-300' : 'flex items-center gap-1 text-green-300'}>{hotspot.trend >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}{Math.abs(hotspot.trend)}%</span></div>
                <Button className="mt-4 w-full" size="sm" variant="secondary">View on Map</Button>
              </button>
            ))}
          </section>
        </aside>
      </section>
    </div>
  );
}

export default HotspotMapPage;

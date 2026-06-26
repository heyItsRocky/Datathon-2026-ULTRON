import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Polygon, TileLayer, Tooltip, ZoomControl, useMap } from 'react-leaflet';
import { RadioTower, Route, ShieldCheck, Users } from 'lucide-react';
import { HotspotLayer } from '@/features/maps/components/HotspotLayer';
import { useHotspots } from '@/features/maps/hooks/useHotspots';
import { usePatrolZones, type PatrolZoneDTO } from '@/features/maps/hooks/usePatrolZones';
import { EmptyState, ErrorState, KpiCard, LoadingSkeleton, PageHeader } from '@/shared/components';
import { Badge, Button } from '@/shared/ui-kit';

const CENTER: [number, number] = [15.3, 75.5];
const shifts: Array<'all' | PatrolZoneDTO['shift']> = ['all', 'morning', 'afternoon', 'night'];
const shiftColor: Record<PatrolZoneDTO['shift'], string> = { morning: '#f59e0b', afternoon: '#22d3ee', night: '#8b5cf6' };

function MapFlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, 12, { duration: 1 }); }, [center, map]);
  return null;
}

export function PatrolMapPage() {
  const zones = usePatrolZones();
  const hotspots = useHotspots();
  const [shift, setShift] = useState<'all' | PatrolZoneDTO['shift']>('all');
  const [center, setCenter] = useState<[number, number]>(CENTER);
  const [showHotspots, setShowHotspots] = useState(true);

  const filtered = useMemo(() => (zones.data ?? []).filter((zone) => shift === 'all' || zone.shift === shift), [zones.data, shift]);
  const activePatrols = filtered.filter((zone) => zone.status === 'active' || zone.status === 'patrolling').length;
  const avgCoverage = filtered.length ? Math.round(filtered.reduce((sum, zone) => sum + zone.coverage, 0) / filtered.length) : 0;
  const teams = new Set(filtered.map((zone) => zone.assignedTeam)).size;
  const error = zones.error ?? hotspots.error;

  if (zones.isLoading || hotspots.isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-24" variant="card" /><LoadingSkeleton className="h-[80vh]" variant="map" /></div>;
  if (error) return <ErrorState message={error.message} onRetry={() => { void zones.refetch(); void hotspots.refetch(); }} />;
  if (!zones.data?.length) return <EmptyState title="No patrol zones" description="No patrol beat data is available." />;

  return (
    <div className="grid gap-6">
      <PageHeader title="Patrol Management" subtitle="Live patrol beat map" />
      <section className="grid gap-4 md:grid-cols-4"><KpiCard icon={Route} title="Total Beats" value={filtered.length} trend={4} /><KpiCard icon={ShieldCheck} title="Active Patrols" value={activePatrols} trend={2} /><KpiCard icon={RadioTower} title="Avg Coverage %" value={avgCoverage} trend={5} /><KpiCard icon={Users} title="Teams Deployed" value={teams} trend={1} /></section>
      <section className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-2xl)] p-4">
        <div className="flex flex-wrap gap-2">{shifts.map((item) => <Button key={item} variant={shift === item ? 'primary' : 'ghost'} size="sm" className="capitalize" onClick={() => setShift(item)}>{item}</Button>)}</div>
        <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]"><input type="checkbox" checked={showHotspots} onChange={(event) => setShowHotspots(event.target.checked)} /> Hotspot overlay</label>
      </section>
      <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
        <div className="glass-card rounded-[var(--radius-2xl)] p-3">
          {filtered.length ? <MapContainer className="h-[80vh] w-full rounded-[var(--radius-2xl)]" center={CENTER} zoom={7} zoomControl={false} scrollWheelZoom>
            <TileLayer attribution='© <a href="https://carto.com/">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <ZoomControl position="bottomleft" />
            <MapFlyTo center={center} />
            {showHotspots ? <HotspotLayer hotspots={hotspots.data ?? []} /> : null}
            {filtered.map((zone) => <Polygon key={zone.id} positions={zone.boundaries.map((point) => [point.lat, point.lng])} pathOptions={{ color: shiftColor[zone.shift], fillColor: shiftColor[zone.shift], fillOpacity: 0.14, weight: 2 }}><Tooltip>{zone.zoneName}: {zone.assignedTeam}</Tooltip></Polygon>)}
            {filtered.map((zone) => <CircleMarker key={`${zone.id}-team`} center={[zone.centerLat, zone.centerLng]} radius={7} pathOptions={{ color: shiftColor[zone.shift], fillColor: shiftColor[zone.shift], fillOpacity: 0.9 }}><Tooltip>{zone.assignedTeam} · {zone.teamSize} officers · {zone.coverage}%</Tooltip></CircleMarker>)}
          </MapContainer> : <EmptyState title="No matching patrol zones" description="Adjust shift filters to show patrol beats." />}
        </div>
        <aside className="grid max-h-[80vh] gap-3 overflow-y-auto pr-1">
          {filtered.map((zone) => <article key={zone.id} className="glass-card rounded-[var(--radius-xl)] p-4"><div className="flex justify-between gap-3"><div><h3 className="font-bold">{zone.zoneName}</h3><p className="text-sm text-[var(--color-text-secondary)]">{zone.district} · {zone.assignedTeam}</p></div><Badge variant={zone.status === 'patrolling' ? 'green' : zone.status === 'active' ? 'cyan' : 'muted'}>{zone.status}</Badge></div><div className="mt-3 flex gap-2"><Badge variant={zone.shift === 'morning' ? 'gold' : zone.shift === 'afternoon' ? 'cyan' : 'violet'}>{zone.shift}</Badge><Badge variant="muted">{zone.teamSize} officers</Badge></div><div className="mt-4"><div className="mb-1 flex justify-between text-xs text-[var(--color-text-secondary)]"><span>Coverage</span><span>{zone.coverage}%</span></div><div className="h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-[var(--color-gold)]" style={{ width: `${zone.coverage}%` }} /></div></div><Button className="mt-4 w-full" size="sm" variant="secondary" onClick={() => setCenter([zone.centerLat, zone.centerLng])}>View on Map</Button></article>)}
        </aside>
      </section>
    </div>
  );
}

export default PatrolMapPage;

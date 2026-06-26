import { useEffect, useMemo, useState } from 'react';
import { Circle, MapContainer, Popup, TileLayer, Tooltip, ZoomControl, useMap } from 'react-leaflet';
import { BellRing, LockKeyhole, ShieldAlert, Star } from 'lucide-react';
import { RedZoneLayer } from '@/features/maps/components/RedZoneLayer';
import { useGeofences, type GeoFenceDTO } from '@/features/maps/hooks/useGeofences';
import { useRedZones } from '@/features/maps/hooks/useRedZones';
import { EmptyState, ErrorState, KpiCard, LoadingSkeleton, PageHeader } from '@/shared/components';
import { Badge, Button, Select } from '@/shared/ui-kit';

const CENTER: [number, number] = [15.3, 75.5];
const typeTabs: Array<'all' | GeoFenceDTO['type']> = ['all', 'alert', 'restricted', 'vip', 'monitoring'];
const statusOptions = ['all', 'active', 'triggered', 'inactive'].map((value) => ({ label: value === 'all' ? 'All Statuses' : value[0].toUpperCase() + value.slice(1), value }));
const typeColor: Record<GeoFenceDTO['type'], string> = { alert: '#ef4444', restricted: '#f97316', monitoring: '#22d3ee', vip: '#f59e0b' };

function MapFlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, 12, { duration: 1 }); }, [center, map]);
  return null;
}

function typeVariant(type: GeoFenceDTO['type']) {
  if (type === 'alert') return 'red';
  if (type === 'restricted') return 'amber';
  if (type === 'vip') return 'gold';
  return 'cyan';
}

export function GeoFencePage() {
  const geofences = useGeofences();
  const redZones = useRedZones();
  const [type, setType] = useState<'all' | GeoFenceDTO['type']>('all');
  const [status, setStatus] = useState('all');
  const [center, setCenter] = useState<[number, number]>(CENTER);

  const filtered = useMemo(() => (geofences.data ?? []).filter((fence) => (type === 'all' || fence.type === type) && (status === 'all' || fence.status === status)), [geofences.data, status, type]);
  const activeCount = filtered.filter((fence) => fence.status === 'active').length;
  const triggeredCount = filtered.filter((fence) => fence.status === 'triggered').length;
  const highPriority = filtered.filter((fence) => fence.priority >= 4).length;
  const restricted = filtered.filter((fence) => fence.type === 'restricted').length;
  const error = geofences.error ?? redZones.error;

  if (geofences.isLoading || redZones.isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-24" variant="card" /><LoadingSkeleton className="h-[80vh]" variant="map" /></div>;
  if (error) return <ErrorState message={error.message} onRetry={() => { void geofences.refetch(); void redZones.refetch(); }} />;
  if (!geofences.data?.length) return <EmptyState title="No geo-fences" description="No geo-fence zones are available." />;

  return (
    <div className="grid gap-6">
      <PageHeader title="Geo Fences" subtitle={`Monitoring ${activeCount} active geo-fences`} />
      <section className="grid gap-4 md:grid-cols-4"><KpiCard icon={BellRing} title="Active Fences" value={activeCount} trend={3} /><KpiCard icon={ShieldAlert} title="Triggered Alerts" value={triggeredCount} trend={-2} /><KpiCard icon={Star} title="High Priority" value={highPriority} trend={1} /><KpiCard icon={LockKeyhole} title="Restricted Zones" value={restricted} trend={0} /></section>
      <section className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-2xl)] p-4">
        <div className="flex flex-wrap gap-2">{typeTabs.map((item) => <Button key={item} variant={type === item ? 'primary' : 'ghost'} size="sm" className="capitalize" onClick={() => setType(item)}>{item}</Button>)}</div>
        <Select value={status} onValueChange={setStatus} options={statusOptions} />
      </section>
      <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
        <div className="glass-card rounded-[var(--radius-2xl)] p-3">
          {filtered.length ? <MapContainer className="h-[80vh] w-full rounded-[var(--radius-2xl)]" center={CENTER} zoom={7} zoomControl={false} scrollWheelZoom>
            <TileLayer attribution='© <a href="https://carto.com/">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <ZoomControl position="bottomleft" />
            <MapFlyTo center={center} />
            <RedZoneLayer zones={redZones.data ?? []} />
            {filtered.map((fence) => <Circle key={fence.id} center={[fence.centerLat, fence.centerLng]} radius={fence.radius} pathOptions={{ color: typeColor[fence.type], fillColor: typeColor[fence.type], fillOpacity: 0.12, weight: fence.status === 'triggered' ? 4 : 2, dashArray: fence.status === 'triggered' ? '8 6' : undefined }}><Tooltip>{fence.name} · {fence.status}</Tooltip><Popup><b>{fence.name}</b><br />{fence.district}<br />Status: {fence.status}<br />Last triggered: {fence.lastTriggered ?? 'Never'}</Popup></Circle>)}
          </MapContainer> : <EmptyState title="No matching geo-fences" description="Adjust type or status filters to show fence zones." />}
        </div>
        <aside className="grid max-h-[80vh] gap-3 overflow-y-auto pr-1">
          {filtered.map((fence) => <article key={fence.id} className="glass-card rounded-[var(--radius-xl)] p-4"><div className="flex justify-between gap-3"><div><h3 className="font-bold">{fence.name}</h3><p className="text-sm text-[var(--color-text-secondary)]">{fence.district}</p></div><Badge variant={typeVariant(fence.type)}>{fence.type}</Badge></div><p className="mt-3 text-sm text-[var(--color-text-secondary)]">{fence.description}</p><div className="mt-3 flex flex-wrap gap-2"><Badge variant={fence.status === 'triggered' ? 'red' : fence.status === 'active' ? 'green' : 'muted'}>{fence.status}</Badge><Badge variant="gold">Priority {fence.priority}/5</Badge><Badge variant="cyan">{fence.triggerEvents} triggers</Badge></div><Button className="mt-4 w-full" size="sm" variant="secondary" onClick={() => setCenter([fence.centerLat, fence.centerLng])}>View Details</Button></article>)}
        </aside>
      </section>
    </div>
  );
}

export default GeoFencePage;

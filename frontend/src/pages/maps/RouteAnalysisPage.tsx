import { useEffect, useMemo, useState } from 'react';
import type { LatLngBoundsExpression } from 'leaflet';
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, ZoomControl, useMap } from 'react-leaflet';
import { MapPinned, Route, ShieldAlert, Target } from 'lucide-react';
import { CrimePinLayer } from '@/features/maps/components/CrimePinLayer';
import { useRouteAnalysis, type CrimeRouteDTO } from '@/features/maps/hooks/useRouteAnalysis';
import { useCrimeList } from '@/features/crime/hooks/useCrimeList';
import { EmptyState, ErrorState, KpiCard, LoadingSkeleton, PageHeader, SeverityBadge } from '@/shared/components';
import { Badge, Button, Select } from '@/shared/ui-kit';

const CENTER: [number, number] = [15.3, 75.5];
const typeTabs: Array<'all' | CrimeRouteDTO['type']> = ['all', 'escape', 'suspected', 'patrol', 'pattern'];
const riskOptions = ['all', 'extreme', 'high', 'medium', 'low'].map((value) => ({ label: value === 'all' ? 'All Risk Levels' : value[0].toUpperCase() + value.slice(1), value }));
const routeColor: Record<CrimeRouteDTO['type'], string> = { escape: '#ef4444', suspected: '#f97316', patrol: '#22d3ee', pattern: '#f59e0b' };

function MapFitBounds({ bounds }: { bounds: LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => { if (bounds) map.flyToBounds(bounds, { duration: 1, padding: [40, 40] }); }, [bounds, map]);
  return null;
}

function typeVariant(type: CrimeRouteDTO['type']) {
  if (type === 'escape') return 'red';
  if (type === 'suspected') return 'amber';
  if (type === 'patrol') return 'cyan';
  return 'gold';
}

export function RouteAnalysisPage() {
  const routes = useRouteAnalysis();
  const crimes = useCrimeList();
  const [type, setType] = useState<'all' | CrimeRouteDTO['type']>('all');
  const [risk, setRisk] = useState('all');
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [showCrimePins, setShowCrimePins] = useState(false);

  const filtered = useMemo(() => (routes.data ?? []).filter((route) => (type === 'all' || route.type === type) && (risk === 'all' || route.riskLevel === risk)), [risk, routes.data, type]);
  const selected = filtered.find((route) => route.id === selectedRoute) ?? filtered[0];
  const selectedBounds = selected ? selected.waypoints.map((waypoint) => [waypoint.lat, waypoint.lng] as [number, number]) : null;
  const escapeRoutes = filtered.filter((route) => route.type === 'escape').length;
  const highConfidence = filtered.filter((route) => route.confidence >= 80).length;
  const activeMonitoring = filtered.filter((route) => route.status === 'active').length;
  const error = routes.error ?? crimes.error;

  if (routes.isLoading || crimes.isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-24" variant="card" /><LoadingSkeleton className="h-[80vh]" variant="map" /></div>;
  if (error) return <ErrorState message={error.message} onRetry={() => { void routes.refetch(); void crimes.refetch(); }} />;
  if (!routes.data?.length) return <EmptyState title="No route data" description="No crime route analysis records are available." />;

  return (
    <div className="grid gap-6">
      <PageHeader title="Route Analysis" subtitle={`${filtered.length} routes under analysis`} />
      <section className="grid gap-4 md:grid-cols-4"><KpiCard icon={Route} title="Total Routes" value={filtered.length} trend={4} /><KpiCard icon={ShieldAlert} title="Escape Routes" value={escapeRoutes} trend={2} /><KpiCard icon={Target} title="High Confidence" value={highConfidence} trend={8} /><KpiCard icon={MapPinned} title="Active Monitoring" value={activeMonitoring} trend={1} /></section>
      <section className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-2xl)] p-4">
        <div className="flex flex-wrap gap-2">{typeTabs.map((item) => <Button key={item} variant={type === item ? 'primary' : 'ghost'} size="sm" className="capitalize" onClick={() => setType(item)}>{item}</Button>)}</div>
        <div className="flex flex-wrap items-center gap-3"><Select value={risk} onValueChange={setRisk} options={riskOptions} /><label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]"><input type="checkbox" checked={showCrimePins} onChange={(event) => setShowCrimePins(event.target.checked)} /> Crime pins</label></div>
      </section>
      <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
        <div className="glass-card rounded-[var(--radius-2xl)] p-3">
          {filtered.length ? <MapContainer className="h-[80vh] w-full rounded-[var(--radius-2xl)]" center={CENTER} zoom={7} zoomControl={false} scrollWheelZoom>
            <TileLayer attribution='© <a href="https://carto.com/">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <ZoomControl position="bottomleft" />
            <MapFitBounds bounds={selectedBounds} />
            {showCrimePins ? <CrimePinLayer cases={crimes.data ?? []} /> : null}
            {filtered.map((route) => <Polyline key={route.id} positions={route.waypoints.map((waypoint) => [waypoint.lat, waypoint.lng])} pathOptions={{ color: routeColor[route.type], weight: selectedRoute === route.id ? 5 : 3, dashArray: route.type === 'patrol' ? '4 8' : route.type === 'pattern' ? '10 6' : undefined, opacity: selectedRoute && selectedRoute !== route.id ? 0.45 : 0.95 }}><Tooltip>{route.name} · {route.confidence}% confidence</Tooltip></Polyline>)}
            {filtered.flatMap((route) => route.waypoints.map((waypoint) => <CircleMarker key={`${route.id}-${waypoint.label}`} center={[waypoint.lat, waypoint.lng]} radius={selectedRoute === route.id ? 8 : 6} pathOptions={{ color: routeColor[route.type], fillColor: routeColor[route.type], fillOpacity: 0.85 }}><Tooltip>{route.name}<br />{waypoint.label}</Tooltip></CircleMarker>))}
          </MapContainer> : <EmptyState title="No matching routes" description="Adjust route type or risk filters to show route analysis." />}
        </div>
        <aside className="grid max-h-[80vh] gap-3 overflow-y-auto pr-1">
          {filtered.map((route) => <article key={route.id} className={`glass-card rounded-[var(--radius-xl)] p-4 ${selectedRoute === route.id ? 'border-[var(--color-gold)]/70' : ''}`}><div className="flex justify-between gap-3"><div><h3 className="font-bold">{route.name}</h3><p className="text-sm text-[var(--color-text-secondary)]">{route.distance} km · {route.estimatedTime} min</p></div><Badge variant={typeVariant(route.type)}>{route.type}</Badge></div><div className="mt-3 flex flex-wrap gap-2"><SeverityBadge severity={route.riskLevel} /><Badge variant={route.status === 'active' ? 'green' : route.status === 'monitored' ? 'cyan' : 'muted'}>{route.status}</Badge><Badge variant="muted">{route.incidents} incidents</Badge></div><div className="mt-4"><div className="mb-1 flex justify-between text-xs text-[var(--color-text-secondary)]"><span>Confidence</span><span>{route.confidence}%</span></div><div className="h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-[var(--color-gold)]" style={{ width: `${route.confidence}%` }} /></div></div><Button className="mt-4 w-full" size="sm" variant="secondary" onClick={() => setSelectedRoute(route.id)}>View Route</Button></article>)}
        </aside>
      </section>
    </div>
  );
}

export default RouteAnalysisPage;

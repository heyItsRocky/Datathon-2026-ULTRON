import { Circle, Tooltip } from 'react-leaflet';
import type { HotspotDTO } from '@/shared/api/dto-adapters/maps';
function color(r:string){return r==='high'?'#ef4444':r==='medium'?'#f59e0b':'#22c55e'}
export function HotspotLayer({ hotspots }: { hotspots:HotspotDTO[] }){return <>{hotspots.map(h=><Circle key={h.id} center={[h.latitude,h.longitude]} radius={h.radius} pathOptions={{color:color(h.riskLevel),fillColor:color(h.riskLevel),fillOpacity:.18}}><Tooltip>{h.district}: {h.topCrimeType} · {h.crimeCount} · {h.peakTime}</Tooltip></Circle>)}</>}

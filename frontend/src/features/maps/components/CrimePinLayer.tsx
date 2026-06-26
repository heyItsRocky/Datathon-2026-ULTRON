import { CircleMarker, Popup } from 'react-leaflet';
import type { CrimeCaseDTO } from '@/shared/api/dto-adapters/crime';
function color(t:string){return t==='Murder'?'#dc2626':t==='Robbery'?'#f97316':t==='Theft'?'#eab308':t==='Cyber Crime'?'#06b6d4':'#94a3b8'}
export function CrimePinLayer({ cases }: { cases:CrimeCaseDTO[] }){return <>{cases.slice(0,50).map(c=><CircleMarker key={c.id} center={[c.lat,c.lng]} radius={7} pathOptions={{color:color(c.type),fillColor:color(c.type),fillOpacity:.85}}><Popup><b>{c.type}</b><br/>{c.date}<br/>{c.id}</Popup></CircleMarker>)}</>}

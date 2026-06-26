import { Circle, Tooltip } from 'react-leaflet';
import type { PredictiveZoneDTO } from '../api/mapsApi';
const coords:Record<string,[number,number]>={'bengaluru-urban':[12.9716,77.5946],mysuru:[12.30,76.65],belagavi:[15.85,74.50]};
export function PredictiveRiskLayer({ zones }: { zones:PredictiveZoneDTO[] }){return <>{zones.map(z=><Circle key={z.id} center={coords[z.districtId]??[15.3,75.5]} radius={45000} pathOptions={{color:'#a78bfa',fillColor:'#a78bfa',fillOpacity:.12}}><Tooltip>{z.district}: {z.confidence}% confidence for {z.date}</Tooltip></Circle>)}</>}

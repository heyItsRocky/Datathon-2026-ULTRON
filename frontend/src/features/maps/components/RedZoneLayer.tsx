import { Circle, Tooltip } from 'react-leaflet';
import type { RedZoneDTO } from '@/shared/api/dto-adapters/maps';
const coords:Record<string,[number,number]>={'bengaluru-urban':[12.9716,77.5946],mysuru:[12.30,76.65],belagavi:[15.85,74.50],'hubli-dharwad':[15.36,75.12],kalaburagi:[17.33,76.83]};
export function RedZoneLayer({ zones }: { zones:RedZoneDTO[] }){return <>{zones.map(z=><Circle key={z.districtId} center={coords[z.districtId]??[15.3,75.5]} radius={35000} pathOptions={{color:'#ef4444',fillColor:'#ef4444',fillOpacity:.08+z.priority*.03}}><Tooltip>{z.district}: {z.level} priority {z.priority}</Tooltip></Circle>)}</>}

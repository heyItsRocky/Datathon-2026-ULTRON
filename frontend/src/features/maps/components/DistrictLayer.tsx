import { GeoJSON, Tooltip } from 'react-leaflet';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import type { Layer, PathOptions } from 'leaflet';

export interface DistrictProperties { name:string; id:string; crimeDensity:number; riskLevel:string }
function color(d:number){return d>80?'#dc2626':d>60?'#f97316':d>35?'#eab308':'#22c55e'}
export function DistrictLayer({ data, onDistrictClick, onDistrictHover, onDistrictDoubleClick }: { data:FeatureCollection<Geometry,DistrictProperties>; onDistrictClick?:(id:string)=>void; onDistrictHover?:(id:string)=>void; onDistrictDoubleClick?:(id:string)=>void }){return <GeoJSON key={data.features.length} data={data} style={(f):PathOptions=>({fillColor:color(f?.properties.crimeDensity??0),weight:1,opacity:.8,color:'#fff',fillOpacity:.35})} onEachFeature={(feature:Feature<Geometry,DistrictProperties>,layer:Layer)=>{layer.on({click:()=>onDistrictClick?.(feature.properties.id),dblclick:()=>onDistrictDoubleClick?.(feature.properties.id),mouseover:()=>{onDistrictHover?.(feature.properties.id); const path=layer as Layer & {setStyle?:(s:PathOptions)=>void}; path.setStyle?.({fillOpacity:.7})},mouseout:()=>{const path=layer as Layer & {setStyle?:(s:PathOptions)=>void}; path.setStyle?.({fillOpacity:.35})}}); layer.bindTooltip(`${feature.properties.name}<br/>Density: ${feature.properties.crimeDensity}`);}}><Tooltip/></GeoJSON>}

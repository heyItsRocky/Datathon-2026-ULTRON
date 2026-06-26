import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import type { FeatureCollection, Geometry } from 'geojson';
import type { CrimeCaseDTO } from '@/shared/api/dto-adapters/crime';
import type { HotspotDTO, RedZoneDTO } from '@/shared/api/dto-adapters/maps';
import type { PredictiveZoneDTO } from '../api/mapsApi';
import { CrimePinLayer } from './CrimePinLayer';
import { DistrictLayer, type DistrictProperties } from './DistrictLayer';
import { HotspotLayer } from './HotspotLayer';
import type { MapLayers } from './LayerControl';
import { PredictiveRiskLayer } from './PredictiveRiskLayer';
import { RedZoneLayer } from './RedZoneLayer';
export function KarnatakaMap({ layers, crimes, hotspots, redZones, predictiveZones, onDistrictClick, onDistrictHover, onDistrictDoubleClick }: { layers:MapLayers; crimes:CrimeCaseDTO[]; hotspots:HotspotDTO[]; redZones:RedZoneDTO[]; predictiveZones:PredictiveZoneDTO[]; onDistrictClick?:(id:string)=>void; onDistrictHover?:(id:string)=>void; onDistrictDoubleClick?:(id:string)=>void }){const [geo,setGeo]=useState<FeatureCollection<Geometry,DistrictProperties>|null>(null); useEffect(()=>{fetch('/data/karnataka-districts.geojson').then(r=>r.json()).then((d:FeatureCollection<Geometry,DistrictProperties>)=>setGeo(d)).catch(()=>setGeo(null));},[]); return <MapContainer className="min-h-[70vh] w-full rounded-[var(--radius-2xl)]" center={[15.3,75.5]} zoom={7} zoomControl={false} scrollWheelZoom><TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"/><ZoomControl position="bottomleft"/>{geo?<DistrictLayer data={geo} onDistrictClick={onDistrictClick} onDistrictHover={onDistrictHover} onDistrictDoubleClick={onDistrictDoubleClick}/>:null}{layers.crimePins?<CrimePinLayer cases={crimes}/>:null}{layers.hotspots?<HotspotLayer hotspots={hotspots}/>:null}{layers.redZones?<RedZoneLayer zones={redZones}/>:null}{layers.predictive?<PredictiveRiskLayer zones={predictiveZones}/>:null}</MapContainer>}

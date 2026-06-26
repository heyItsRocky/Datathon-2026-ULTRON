import { useQuery } from '@tanstack/react-query'; import { fetchHotspots } from '../api/mapsApi'; export function useHotspots(){return useQuery({queryKey:['map-hotspots'],queryFn:fetchHotspots})}

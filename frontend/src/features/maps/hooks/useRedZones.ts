import { useQuery } from '@tanstack/react-query'; import { fetchRedZones } from '../api/mapsApi'; export function useRedZones(){return useQuery({queryKey:['map-red-zones'],queryFn:fetchRedZones})}

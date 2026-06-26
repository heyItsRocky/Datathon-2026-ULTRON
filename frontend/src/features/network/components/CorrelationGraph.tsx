import { CrimeNetworkGraph } from './CrimeNetworkGraph';
import type { GraphData } from '@/shared/api/dto-adapters/network';
export function CorrelationGraph(props:{data:GraphData;onNodeClick?:(id:string)=>void;layout?:string}){return <CrimeNetworkGraph {...props}/>}

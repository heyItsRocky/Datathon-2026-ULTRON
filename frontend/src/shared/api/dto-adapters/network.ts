export type GraphPrimitive = string | number | boolean | null | undefined;
export interface GraphElement { data: { id:string; label?:string; type?:string; color?:string; source?:string; target?:string; [key:string]: GraphPrimitive } }
export interface GraphData { elements: { nodes: GraphElement[]; edges: GraphElement[] } }
function rec(v:unknown):Record<string,unknown>{return v&&typeof v==='object'?v as Record<string,unknown>:{};}
function data(v:unknown): GraphElement { const d=rec(rec(v).data); const out: GraphElement['data']={id:String(d.id??'unknown')}; for(const [k,val] of Object.entries(d)){ if(['string','number','boolean','undefined'].includes(typeof val)||val===null) out[k]=val as GraphPrimitive; } return {data:out}; }
export function adaptGraphData(raw: unknown): GraphData { const elements=rec(rec(raw).elements); return {elements:{nodes:Array.isArray(elements.nodes)?elements.nodes.map(data):[],edges:Array.isArray(elements.edges)?elements.edges.map(data):[]}}; }
export function adaptNetworkDto<T>(dto: T): T { return dto; }

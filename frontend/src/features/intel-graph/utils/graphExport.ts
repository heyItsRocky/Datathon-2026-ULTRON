import type { IntelEdge, IntelNode } from '@/stores/graphStore';

interface GraphJSON {
  graphName: string;
  version: '1.0';
  nodes: IntelNode[];
  edges: IntelEdge[];
}

function isGraphJSON(value: unknown): value is GraphJSON {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return record.version === '1.0' && typeof record.graphName === 'string' && Array.isArray(record.nodes) && Array.isArray(record.edges);
}

export function exportGraph(nodes: IntelNode[], edges: IntelEdge[], graphName: string): string {
  return JSON.stringify({ graphName, version: '1.0', nodes, edges } satisfies GraphJSON, null, 2);
}

export function importGraph(json: string): GraphJSON | null {
  try {
    const parsed: unknown = JSON.parse(json);
    return isGraphJSON(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, SearchX } from 'lucide-react';
import { NODE_TYPE_CONFIGS } from '@/features/intel-graph/config/nodeTypes';
import { useGraphStore, type IntelNodeData, type IntelNodeType } from '@/stores/graphStore';
import { EmptyState, ErrorState, LoadingSkeleton, PageHeader } from '@/shared/components';
import { Badge, Button, SearchInput } from '@/shared/ui-kit';

interface SearchEntity extends IntelNodeData {
  id: string;
  type: IntelNodeType;
  district: string;
}

const entities: SearchEntity[] = [
  { id: 's1', type: 'person', label: 'Ravi Kumar', description: 'Repeat offender with phishing links', confidence: 82, source: 'Crime network', riskLevel: 'high', district: 'Bengaluru Urban' },
  { id: 's2', type: 'person', label: 'Ayesha Khan', description: 'Witness and associate in two cases', confidence: 64, source: 'Case file', riskLevel: 'medium', district: 'Mysuru' },
  { id: 's3', type: 'ipAddress', label: '185.44.12.90', description: 'Suspicious relay IP', confidence: 91, source: 'SOC alert', riskLevel: 'extreme', district: 'Unknown' },
  { id: 's4', type: 'ipAddress', label: '103.78.55.21', description: 'DDoS command node', confidence: 78, source: 'Netflow', riskLevel: 'high', district: 'Bengaluru City' },
  { id: 's5', type: 'location', label: 'KR Puram Junction', description: 'Route choke point', confidence: 70, source: 'Patrol map', riskLevel: 'medium', district: 'Bengaluru Urban' },
  { id: 's6', type: 'location', label: 'Vidhana Soudha Corridor', description: 'VIP geo-fence zone', confidence: 86, source: 'Geo fence', riskLevel: 'high', district: 'Bengaluru City' },
  { id: 's7', type: 'evidence', label: 'Email Header Log', description: 'Header dump with DKIM mismatch', confidence: 88, source: 'Digital evidence', riskLevel: 'high', district: 'Cyber Cell' },
  { id: 's8', type: 'evidence', label: 'Latent Fingerprint', description: 'Recovered from entry point', confidence: 74, source: 'Forensics', riskLevel: 'medium', district: 'Mysuru' },
  { id: 's9', type: 'method', label: 'Credential Phishing', description: 'Fake login capture method', confidence: 93, source: 'Threat intel', riskLevel: 'extreme', district: 'Cyber Cell' },
  { id: 's10', type: 'method', label: 'Forced Entry', description: 'Window pry pattern', confidence: 67, source: 'Crime pattern', riskLevel: 'medium', district: 'Belagavi' },
  { id: 's11', type: 'motive', label: 'Financial Extortion', description: 'Payment demand after attack', confidence: 79, source: 'Briefing', riskLevel: 'high', district: 'Hubli-Dharwad' },
  { id: 's12', type: 'motive', label: 'Retaliation', description: 'Prior dispute context', confidence: 55, source: 'Interview', riskLevel: 'low', district: 'Tumakuru' },
  { id: 's13', type: 'crimeType', label: 'Burglary', description: 'Residential burglary classification', confidence: 81, source: 'FIR', riskLevel: 'medium', district: 'Mysuru' },
  { id: 's14', type: 'crimeType', label: 'Identity Theft', description: 'Account takeover cluster', confidence: 89, source: 'Cyber incidents', riskLevel: 'high', district: 'Bengaluru City' },
  { id: 's15', type: 'crimeType', label: 'Chain Snatching', description: 'Street crime pattern', confidence: 61, source: 'Crime cases', riskLevel: 'medium', district: 'Mangaluru' },
];

const typeTabs: Array<'all' | IntelNodeType> = ['all', 'person', 'ipAddress', 'location', 'evidence', 'method', 'motive', 'crimeType'];

export function GraphSearchPage() {
  const navigate = useNavigate();
  const { addNode, pushHistory } = useGraphStore();
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<'all' | IntelNodeType>('all');
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => entities.filter((entity) => {
    const haystack = `${entity.label} ${entity.description} ${entity.type} ${entity.district}`.toLowerCase();
    return (activeType === 'all' || entity.type === activeType) && (!search || haystack.includes(search.toLowerCase()));
  }), [activeType, search]);

  const handleAdd = (entity: SearchEntity, index: number) => {
    try {
      pushHistory(`Added ${entity.label} from search`);
      addNode(entity.type, { x: 160 + (index % 4) * 210, y: 120 + Math.floor(index / 4) * 140 }, entity);
      navigate('/intel-graph');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to add entity');
    }
  };

  if (isLoading) return <LoadingSkeleton className="h-96" variant="chart" />;
  if (error) return <ErrorState message={error} onRetry={() => setError(null)} />;

  return (
    <div className="grid gap-6">
      <PageHeader title="Graph Search" subtitle="Find platform entities and add them to the intel graph" />
      <section className="glass-card grid gap-3 rounded-[var(--radius-2xl)] p-4 lg:grid-cols-[1fr_auto]"><SearchInput value={search} onChange={(event) => setSearch(event.target.value)} onClear={() => setSearch('')} placeholder="Search people, IPs, places, evidence, methods..." /><div className="flex flex-wrap gap-2">{typeTabs.map((type) => <Button key={type} size="sm" variant={activeType === type ? 'primary' : 'secondary'} onClick={() => setActiveType(type)}>{type === 'all' ? 'All' : NODE_TYPE_CONFIGS[type].label}</Button>)}</div></section>
      {!filtered.length ? <EmptyState icon={SearchX} title="No results" description="No entities match your search and filters." /> : <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((entity, index) => { const config = NODE_TYPE_CONFIGS[entity.type]; const Icon = config.icon; return <article key={entity.id} className="glass-card flex flex-col gap-3 rounded-[var(--radius-2xl)] p-5"><div className="flex items-start justify-between"><Icon className="h-6 w-6" style={{ color: config.color }} /><Badge variant="cyan">{config.label}</Badge></div><h3 className="text-lg font-bold">{entity.label}</h3><p className="text-sm text-[var(--color-text-secondary)]">{entity.description}</p><div className="grid grid-cols-2 gap-2 text-xs text-[var(--color-text-muted)]"><span>Confidence: {entity.confidence}%</span><span>District: {entity.district}</span><span>Risk: {entity.riskLevel}</span><span>Source: {entity.source}</span></div><Button className="mt-auto" onClick={() => handleAdd(entity, index)}><Plus className="h-4 w-4" />Add to Graph</Button></article>; })}</section>}
    </div>
  );
}

export default GraphSearchPage;

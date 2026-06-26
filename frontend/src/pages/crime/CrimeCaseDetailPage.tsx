import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Map, Network } from 'lucide-react';
import { useCrimeDetail } from '@/features/crime/hooks/useCrimeDetail';
import { EmptyState, ErrorState, LoadingSkeleton, SeverityBadge } from '@/shared/components';
import { Badge, Button } from '@/shared/ui-kit';

export default function CrimeCaseDetailPage() {
  const { caseId = '' } = useParams();
  const decodedId = decodeURIComponent(caseId);
  const { data, isLoading, isError, error, refetch } = useCrimeDetail(decodedId);

  if (isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-24" variant="card" /><div className="grid gap-6 xl:grid-cols-[2fr_1fr]"><LoadingSkeleton className="h-96" variant="chart" /><LoadingSkeleton className="h-96" variant="card" /></div></div>;
  if (isError) return <ErrorState message={error.message} onRetry={() => void refetch()} />;
  if (!data || data.id === 'UNKNOWN-CASE') return <EmptyState actionLabel="Back to list" description="Case not found in mock crime intelligence records." onAction={() => history.back()} title="Case not found" />;

  const severity = data.riskLevel === 'HIGH' ? 'high' : data.riskLevel === 'MEDIUM' ? 'medium' : 'low';

  return (
    <div className="grid gap-6">
      <section className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-2xl)] p-5">
        <div><Link className="mb-3 inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)]" to="/crime/cases"><ArrowLeft className="h-4 w-4" /> Crime Cases</Link><h1 className="text-2xl font-black">{data.id}</h1><p className="text-[var(--color-text-secondary)]">{data.type} · {data.district}</p></div>
        <div className="flex flex-wrap items-center gap-2"><Badge variant={data.status === 'Resolved' ? 'green' : data.status === 'Open' ? 'red' : 'amber'}>{data.status}</Badge><Button variant="secondary"><Network className="h-4 w-4" /> Link to Network</Button><Button variant="secondary"><Map className="h-4 w-4" /> Link to Map</Button></div>
      </section>
      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="grid gap-6">
          <article className="glass-card rounded-[var(--radius-2xl)] p-5"><h2 className="text-xl font-bold">Case Information</h2><dl className="mt-4 grid gap-4 md:grid-cols-2"><div><dt className="text-xs uppercase text-[var(--color-text-muted)]">Type</dt><dd className="font-semibold">{data.type}</dd></div><div><dt className="text-xs uppercase text-[var(--color-text-muted)]">Date / Time</dt><dd>{data.date} · {data.time}</dd></div><div><dt className="text-xs uppercase text-[var(--color-text-muted)]">District</dt><dd>{data.district}</dd></div><div><dt className="text-xs uppercase text-[var(--color-text-muted)]">Location</dt><dd>{data.location}</dd></div></dl><p className="mt-4 text-[var(--color-text-secondary)]">{data.description}</p></article>
          <article className="glass-card rounded-[var(--radius-2xl)] p-5"><h2 className="text-xl font-bold">Timeline</h2><ol className="mt-4 space-y-3">{data.timeline.map((item, index) => <li key={`${item.date}-${item.event}`} className="flex gap-3"><span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-gold)]/15 text-xs font-bold text-[var(--color-gold)]">{index + 1}</span><div><p className="font-semibold">{item.event}</p><p className="text-sm text-[var(--color-text-muted)]">{item.date}</p></div></li>)}</ol></article>
          <article className="glass-card rounded-[var(--radius-2xl)] p-5"><h2 className="text-xl font-bold">Evidence</h2><div className="mt-4 grid gap-3 md:grid-cols-3">{data.evidence.map((item) => <div key={item} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/5 p-3 font-mono text-sm text-[var(--color-gold)]">{item}</div>)}</div></article>
        </div>
        <aside className="glass-card h-fit rounded-[var(--radius-2xl)] p-5"><h2 className="text-xl font-bold">Quick Info</h2><div className="mt-4 grid gap-4"><div><p className="text-xs uppercase text-[var(--color-text-muted)]">Risk Level</p><SeverityBadge severity={severity} /></div><div><p className="text-xs uppercase text-[var(--color-text-muted)]">MO Description</p><p className="mt-1 text-sm text-[var(--color-text-secondary)]">{data.moDescription}</p></div><div><p className="text-xs uppercase text-[var(--color-text-muted)]">Linked Criminals</p><p className="text-2xl font-black text-[var(--color-gold)]">{data.criminals.length}</p></div><div><p className="text-xs uppercase text-[var(--color-text-muted)]">Victim</p><p>{data.victim}</p></div><Button variant="secondary"><Network className="h-4 w-4" /> Link to Network</Button><Button variant="secondary"><Map className="h-4 w-4" /> Link to Map</Button></div></aside>
      </section>
    </div>
  );
}

import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Network } from 'lucide-react';
import { useCrimeList } from '@/features/crime/hooks/useCrimeList';
import { useCriminalDetail } from '@/features/crime/hooks/useCriminalDetail';
import { useCriminalList } from '@/features/crime/hooks/useCriminalList';
import { EmptyState, ErrorState, LoadingSkeleton, RiskBadge } from '@/shared/components';
import { Badge } from '@/shared/ui-kit';

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

export default function CriminalDetailPage() {
  const { criminalId = '' } = useParams();
  const detail = useCriminalDetail(criminalId);
  const crimes = useCrimeList();
  const criminals = useCriminalList();

  if (detail.isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-36" variant="card" /><div className="grid gap-6 xl:grid-cols-[2fr_1fr]"><LoadingSkeleton className="h-96" variant="chart" /><LoadingSkeleton className="h-96" variant="card" /></div></div>;
  if (detail.isError) return <ErrorState message={detail.error.message} onRetry={() => void detail.refetch()} />;
  if (!detail.data || detail.data.id === 'UNKNOWN-CRIMINAL') return <EmptyState description="Criminal not found in directory." title="Criminal not found" />;

  const criminal = detail.data;
  const linkedCrimes = (crimes.data ?? []).filter((crime) => criminal.associatedCrimes.includes(crime.id));
  const associateProfiles = (criminals.data ?? []).filter((item) => criminal.associates.includes(item.id));

  return (
    <div className="grid gap-6">
      <Link className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)]" to="/crime/criminals"><ArrowLeft className="h-4 w-4" /> Criminal Directory</Link>
      <section className="glass-card flex flex-wrap items-center gap-5 rounded-[var(--radius-2xl)] p-5">
        <div className="grid h-24 w-24 place-items-center rounded-full border border-[var(--color-border)] bg-white/10 text-3xl font-black text-[var(--color-gold)]">{initials(criminal.name)}</div>
        <div className="min-w-0 flex-1"><h1 className="text-3xl font-black">{criminal.name}</h1><p className="text-[var(--color-text-secondary)]">Alias: {criminal.alias} · DOB: {criminal.dob} · {criminal.district}</p><div className="mt-3 flex flex-wrap gap-2"><RiskBadge score={criminal.riskScore} /><Badge variant={criminal.status === 'Active' ? 'red' : criminal.status === 'Parole' ? 'amber' : 'green'}>{criminal.status}</Badge><Badge variant="muted">{criminal.priors} priors</Badge></div></div>
      </section>
      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="grid gap-6">
          <article className="glass-card rounded-[var(--radius-2xl)] p-5"><h2 className="text-xl font-bold">Associated Crimes</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="text-xs uppercase text-[var(--color-text-muted)]"><tr><th className="px-3 py-2">FIR</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Date</th><th className="px-3 py-2">Status</th></tr></thead><tbody>{linkedCrimes.map((crime) => <tr key={crime.id} className="border-t border-[var(--color-border)]"><td className="px-3 py-2 font-mono text-[var(--color-gold)]"><Link to={`/crime/cases/${encodeURIComponent(crime.id)}`}>{crime.id}</Link></td><td className="px-3 py-2">{crime.type}</td><td className="px-3 py-2">{crime.date}</td><td className="px-3 py-2"><Badge variant={crime.status === 'Resolved' ? 'green' : crime.status === 'Open' ? 'red' : 'amber'}>{crime.status}</Badge></td></tr>)}</tbody></table></div></article>
          <article className="glass-card grid min-h-60 place-items-center rounded-[var(--radius-2xl)] p-5 text-center"><Network className="mb-3 h-12 w-12 text-[var(--color-network-purple)]" /><h2 className="text-xl font-bold">Network visualization coming in Phase 5</h2><p className="mt-2 text-[var(--color-text-secondary)]">Associates, co-offenders, and FIR links will render as an interactive graph.</p></article>
        </div>
        <aside className="grid gap-6"><article className="glass-card rounded-[var(--radius-2xl)] p-5"><h2 className="text-xl font-bold">MO Profile</h2><p className="mt-3 text-sm text-[var(--color-text-secondary)]">{criminal.moSignature}</p><p className="mt-4 text-sm"><span className="text-[var(--color-text-muted)]">Matched cases:</span> <span className="font-bold text-[var(--color-gold)]">{criminal.associatedCrimes.length}</span></p></article><article className="glass-card rounded-[var(--radius-2xl)] p-5"><h2 className="text-xl font-bold">Risk Factors</h2><div className="mt-4 grid gap-2">{Object.entries(criminal.riskFactors).map(([factor, value]) => <div key={factor} className="flex items-center justify-between rounded-[var(--radius-md)] bg-white/5 p-2"><span className="capitalize text-[var(--color-text-secondary)]">{factor}</span><Badge variant={value === 'HIGH' ? 'red' : value === 'MEDIUM' ? 'amber' : 'green'}>{value}</Badge></div>)}</div></article><article className="glass-card rounded-[var(--radius-2xl)] p-5"><h2 className="text-xl font-bold">Associates</h2><div className="mt-4 flex flex-wrap gap-2">{associateProfiles.map((associate) => <Link key={associate.id} to={`/crime/criminals/${associate.id}`}><Badge variant="violet">{associate.name}</Badge></Link>)}</div></article></aside>
      </section>
    </div>
  );
}

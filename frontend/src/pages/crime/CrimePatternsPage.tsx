import { useState } from 'react';
import { Search } from 'lucide-react';
import { useMOAnalysis } from '@/features/crime/hooks/useMOAnalysis';
import { EmptyState, ErrorState, LoadingSkeleton, PageHeader } from '@/shared/components';
import { Button, Select } from '@/shared/ui-kit';

const typeOptions = ['Any Type', 'Murder', 'Theft', 'Assault', 'Burglary', 'Robbery', 'Cyber Crime', 'Chain Snatching', 'Domestic Violence'].map((value) => ({ label: value, value }));
const districtOptions = ['Any District', 'Bengaluru City', 'Bengaluru Urban', 'Mysuru', 'Belagavi', 'Hubli-Dharwad', 'Kalaburagi', 'Mangaluru', 'Tumakuru', 'Shivamogga', 'Davanagere'].map((value) => ({ label: value, value }));

export default function CrimePatternsPage() {
  const [description, setDescription] = useState('');
  const [crimeType, setCrimeType] = useState('Any Type');
  const [district, setDistrict] = useState('Any District');
  const [searched, setSearched] = useState(false);
  const query = useMOAnalysis(description, crimeType, district, searched);

  const runSearch = () => setSearched(true);

  return (
    <div className="grid gap-6">
      <PageHeader title="MO Pattern Matcher" subtitle="Paste FIR or modus operandi text to discover likely criminal pattern matches." />
      <section className="glass-card grid gap-4 rounded-[var(--radius-2xl)] p-5">
        <label className="grid gap-2 text-sm text-[var(--color-text-secondary)]"><span>Crime / MO Description</span><textarea className="min-h-40 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-gold)]" onChange={(event) => { setSearched(false); setDescription(event.target.value); }} placeholder="Example: Helmeted riders targeted a senior citizen during evening walk and escaped on a covered-number scooter..." value={description} /></label>
        <div className="flex flex-wrap items-center gap-3"><Select onValueChange={setCrimeType} options={typeOptions} value={crimeType} /><Select onValueChange={setDistrict} options={districtOptions} value={district} /><Button disabled={!description.trim()} onClick={runSearch}><Search className="h-4 w-4" /> Find Matches</Button></div>
      </section>
      {!searched ? <EmptyState description="Paste a crime description to find matching MO patterns." title="Paste a crime description to begin" /> : null}
      {searched && query.isLoading ? <LoadingSkeleton className="h-72" variant="chart" /> : null}
      {searched && query.isError ? <ErrorState message={query.error.message} onRetry={() => void query.refetch()} /> : null}
      {searched && query.isSuccess && query.data.length === 0 ? <EmptyState description="No matching MO patterns found. Try adjusting filters." title="No matching MO patterns found" /> : null}
      {searched && query.isSuccess && query.data.length > 0 ? (
        <section className="glass-card overflow-hidden rounded-[var(--radius-2xl)]">
          <table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-white/5 text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]"><tr><th className="px-4 py-3">Criminal</th><th className="px-4 py-3">Match</th><th className="px-4 py-3">Priors</th><th className="px-4 py-3">Similar Cases</th><th className="px-4 py-3">District</th></tr></thead><tbody>{query.data.map((match) => <tr key={match.criminalId} className="border-t border-[var(--color-border)]"><td className="px-4 py-3 font-semibold">{match.criminalName}</td><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-2 w-32 rounded-full bg-white/10"><div className="h-2 rounded-full bg-[var(--color-gold)]" style={{ width: `${match.matchPercentage}%` }} /></div><span className="font-bold text-[var(--color-gold)]">{match.matchPercentage}%</span></div></td><td className="px-4 py-3">{match.priors}</td><td className="px-4 py-3">{match.similarCases}</td><td className="px-4 py-3 text-[var(--color-text-secondary)]">{match.district}</td></tr>)}</tbody></table>
        </section>
      ) : null}
    </div>
  );
}

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CriminalDTO } from '@/shared/api/dto-adapters/crime';
import { EmptyState, ErrorState, LoadingSkeleton, RiskBadge } from '@/shared/components';
import { Badge, Button } from '@/shared/ui-kit';

interface CriminalTableProps {
  criminals: CriminalDTO[];
  search: string;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

function statusVariant(status: string): 'red' | 'amber' | 'green' | 'muted' {
  if (status === 'Active') return 'red';
  if (status === 'Parole') return 'amber';
  if (status === 'Incarcerated') return 'green';
  return 'muted';
}

export function CriminalTable({ criminals, search, loading = false, error, onRetry }: CriminalTableProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return criminals;
    return criminals.filter((criminal) => criminal.name.toLowerCase().includes(query) || criminal.alias.toLowerCase().includes(query));
  }, [criminals, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <div className="grid gap-2">{Array.from({ length: 10 }).map((_, index) => <LoadingSkeleton key={index} variant="table-row" />)}</div>;
  if (error) return <ErrorState message={error.message} onRetry={onRetry} />;
  if (filtered.length === 0) return <EmptyState description="No criminals found for the current search or filters." title="No criminals found" />;

  return (
    <div className="glass-card overflow-hidden rounded-[var(--radius-2xl)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Alias</th><th className="px-4 py-3">District</th><th className="px-4 py-3">Risk Score</th><th className="px-4 py-3">Priors</th><th className="px-4 py-3">Status</th></tr>
          </thead>
          <tbody>
            {visible.map((criminal) => (
              <tr key={criminal.id} className="cursor-pointer border-t border-[var(--color-border)] transition-[var(--transition-fast)] hover:bg-white/5" onClick={() => navigate(`/crime/criminals/${criminal.id}`)}>
                <td className="px-4 py-3 font-semibold">{criminal.name}</td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{criminal.alias}</td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{criminal.district}</td>
                <td className="px-4 py-3"><RiskBadge score={criminal.riskScore} /></td>
                <td className="px-4 py-3 font-mono text-[var(--color-gold)]">{criminal.priors}</td>
                <td className="px-4 py-3"><Badge variant={statusVariant(criminal.status)}>{criminal.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
        <span>Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span>
        <div className="flex items-center gap-2"><Button disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} size="sm" variant="secondary">Prev</Button><span>Page {page} / {totalPages}</span><Button disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} size="sm" variant="secondary">Next</Button></div>
      </div>
    </div>
  );
}

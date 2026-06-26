import { useMemo, useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CrimeCaseDTO } from '@/shared/api/dto-adapters/crime';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/shared/components';
import { Badge, Button } from '@/shared/ui-kit';

type SortKey = 'id' | 'type' | 'district' | 'date' | 'status';
type SortDirection = 'asc' | 'desc';

interface CrimeTableProps {
  cases: CrimeCaseDTO[];
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  emptyAction?: () => void;
}

function statusVariant(status: string): 'red' | 'amber' | 'green' | 'muted' {
  if (status === 'Resolved') return 'green';
  if (status === 'Under Investigation') return 'amber';
  if (status === 'Open') return 'red';
  return 'muted';
}

export function CrimeTable({ cases, loading = false, error, onRetry, emptyAction }: CrimeTableProps) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const sortedCases = useMemo(() => {
    return [...cases].sort((a, b) => {
      const left = String(a[sortKey]);
      const right = String(b[sortKey]);
      const result = left.localeCompare(right);
      return sortDirection === 'asc' ? result : -result;
    });
  }, [cases, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedCases.length / pageSize));
  const visibleCases = sortedCases.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return <div className="grid gap-2">{Array.from({ length: 10 }).map((_, index) => <LoadingSkeleton key={index} variant="table-row" />)}</div>;
  }

  if (error) return <ErrorState message={error.message} onRetry={onRetry} />;

  if (cases.length === 0) {
    return <EmptyState actionLabel="Clear filters" description="No crime records match your filters." onAction={emptyAction} title="No crime records match your filters" />;
  }

  const headers: Array<{ key: SortKey; label: string }> = [
    { key: 'id', label: 'FIR No.' },
    { key: 'type', label: 'Type' },
    { key: 'district', label: 'District' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="glass-card overflow-hidden rounded-[var(--radius-2xl)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
            <tr>
              {headers.map((header) => (
                <th key={header.key} className="px-4 py-3">
                  <button className="font-bold hover:text-[var(--color-gold)]" onClick={() => toggleSort(header.key)} type="button">
                    {header.label} {sortKey === header.key ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                  </button>
                </th>
              ))}
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleCases.map((crimeCase) => (
              <tr key={crimeCase.id} className="cursor-pointer border-t border-[var(--color-border)] transition-[var(--transition-fast)] hover:bg-white/5" onClick={() => navigate(`/crime/cases/${encodeURIComponent(crimeCase.id)}`)}>
                <td className="px-4 py-3 font-mono text-xs text-[var(--color-gold)]">{crimeCase.id}</td>
                <td className="px-4 py-3 font-semibold">{crimeCase.type}</td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{crimeCase.district}</td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">{crimeCase.date}</td>
                <td className="px-4 py-3"><Badge variant={statusVariant(crimeCase.status)}>{crimeCase.status}</Badge></td>
                <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/crime/cases/${encodeURIComponent(crimeCase.id)}`)}>View</Button>
                    <Button aria-label="More actions" size="sm" variant="ghost"><MoreVertical className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
        <span>Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sortedCases.length)} of {sortedCases.length}</span>
        <div className="flex items-center gap-2">
          <Button disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} size="sm" variant="secondary">Prev</Button>
          <span>Page {page} / {totalPages}</span>
          <Button disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} size="sm" variant="secondary">Next</Button>
        </div>
      </div>
    </div>
  );
}

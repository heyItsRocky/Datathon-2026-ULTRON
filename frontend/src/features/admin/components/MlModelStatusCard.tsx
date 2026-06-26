import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Brain } from 'lucide-react';
import type { MlModelDTO } from '@/shared/api/dto-adapters/admin-adapters';
import { Badge, Button } from '@/shared/ui-kit';
import { formatDate, statusVariant } from './helpers';

export function MlModelStatusCard({ model, onRetrain, loading = false }: { model: MlModelDTO; onRetrain?: (modelId: string) => void; loading?: boolean }) {
  return <article className="glass-card rounded-[var(--radius-xl)] p-4"><div className="flex items-start justify-between"><div className="flex items-center gap-2"><Brain className="h-5 w-5 text-[var(--color-intel-violet)]" /><div><h3 className="font-bold">{model.name}</h3><p className="text-xs text-[var(--color-text-muted)]">{model.algorithm} · v{model.version}</p></div></div><Badge variant={statusVariant(model.status)}>{model.status}</Badge></div><div className="mt-4"><div className="mb-1 flex justify-between text-xs text-[var(--color-text-secondary)]"><span>Accuracy</span><b>{model.accuracy}%</b></div><div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-[var(--color-gold)]" style={{ width: `${model.accuracy}%` }} /></div></div><div className="mt-3 h-16"><ResponsiveContainer width="100%" height="100%"><AreaChart data={model.trainHistory}><Tooltip /><Area type="monotone" dataKey="accuracy" stroke="var(--color-gold)" fill="var(--color-gold)" fillOpacity={0.18} /></AreaChart></ResponsiveContainer></div><div className="mt-3 flex items-center justify-between gap-3"><p className="text-xs text-[var(--color-text-muted)]">Trained {formatDate(model.lastTrained)}</p><Button size="sm" variant="secondary" loading={loading} onClick={() => onRetrain?.(model.id)}>Retrain</Button></div></article>;
}

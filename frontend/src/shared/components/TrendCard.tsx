import { Area, AreaChart, ResponsiveContainer } from 'recharts';

export interface TrendPoint { name: string; value: number }

interface TrendCardProps {
  title: string;
  data: TrendPoint[];
}

export function TrendCard({ title, data }: TrendCardProps) {
  return (
    <div className="glass-card rounded-[var(--radius-xl)] p-5">
      <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-secondary)]">{title}</h3>
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}><Area type="monotone" dataKey="value" stroke="var(--color-gold)" fill="var(--color-gold-soft)" /></AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

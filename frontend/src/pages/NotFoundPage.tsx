import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui-kit';

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--color-background)] p-6 text-center">
      <section className="glass-card max-w-lg rounded-[var(--radius-2xl)] p-8">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-gold)]">404</p>
        <h1 className="mt-3 text-4xl font-black">Signal not found</h1>
        <p className="mt-3 text-[var(--color-text-secondary)]">The requested ULTRON route is not available.</p>
        <Link to="/"><Button className="mt-6">Return to Command Center</Button></Link>
      </section>
    </main>
  );
}

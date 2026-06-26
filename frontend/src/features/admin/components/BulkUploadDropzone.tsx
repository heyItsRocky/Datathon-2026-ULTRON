import { UploadCloud } from 'lucide-react';

export function BulkUploadDropzone({ onFileDrop, accept = '.csv,.json', maxSize = 5_000_000 }: { onFileDrop: (file: File) => void; accept?: string; maxSize?: number }) {
  return <label className="glass-card grid cursor-pointer place-items-center rounded-[var(--radius-2xl)] border border-dashed border-[var(--color-border)] p-10 text-center hover:border-[var(--color-gold)]"><UploadCloud className="mb-3 h-10 w-10 text-[var(--color-gold)]" /><b>Drop bulk data here or browse</b><p className="mt-2 text-sm text-[var(--color-text-secondary)]">Accepts {accept}; max {(maxSize / 1_000_000).toFixed(0)} MB</p><input className="hidden" type="file" accept={accept} onChange={(event) => { const file = event.target.files?.[0]; if (file) onFileDrop(file); }} /></label>;
}

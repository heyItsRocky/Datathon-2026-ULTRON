import { Drawer } from '@/shared/ui-kit';
import { useUiStore } from '@/stores/uiStore';

export function RightContextPanel() {
  const panel = useUiStore((state) => state.rightPanel);
  const close = useUiStore((state) => state.closeRightPanel);
  return <Drawer open={panel.open} onOpenChange={(open) => { if (!open) close(); }} title={panel.title ?? 'Context'}><p className="text-sm text-[var(--color-text-secondary)]">{panel.content ?? 'Contextual intelligence will appear here.'}</p></Drawer>;
}

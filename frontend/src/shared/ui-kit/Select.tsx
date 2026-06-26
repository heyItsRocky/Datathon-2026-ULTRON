import * as RadixSelect from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({ value, onValueChange, options, placeholder = 'Select' }: SelectProps) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange}>
      <RadixSelect.Trigger className="glass-card inline-flex h-10 min-w-36 items-center justify-between gap-3 rounded-[var(--radius-md)] px-3 text-sm text-[var(--color-text-secondary)]">
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon><ChevronDown className="h-4 w-4" /></RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className="glass-card z-50 overflow-hidden rounded-[var(--radius-md)]">
          <RadixSelect.Viewport className="p-1">
            {options.map((option) => (
              <RadixSelect.Item key={option.value} value={option.value} className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm outline-none data-[highlighted]:bg-white/10">
                <RadixSelect.ItemIndicator><Check className="h-4 w-4 text-[var(--color-gold)]" /></RadixSelect.ItemIndicator>
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

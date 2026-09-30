import React from 'react';
import { cn } from '../../lib/utils';

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center font-mono text-[11px] font-medium tracking-tight text-text-muted bg-surface-subtle border border-border px-1.5 py-0.5 rounded shadow-[0_1px_0_rgba(0,0,0,0.08)] select-none',
        className
      )}
    >
      {children}
    </kbd>
  );
}

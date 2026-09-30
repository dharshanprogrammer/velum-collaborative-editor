import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'outline';
  className?: string;
}) {
  const variants = {
    default: 'bg-surface-subtle text-text-muted border border-border',
    accent: 'bg-accent/10 text-accent border border-accent/20',
    success: 'bg-semantic-success-bg text-semantic-success border border-semantic-success/20',
    warning: 'bg-semantic-warning-bg text-semantic-warning border border-semantic-warning/20',
    danger: 'bg-semantic-danger-bg text-semantic-danger border border-semantic-danger/20',
    outline: 'border border-border text-text-muted',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium tracking-tight select-none',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

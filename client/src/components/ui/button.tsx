import React from 'react';
import { cn } from '../../lib/utils';
import { Spinner } from './spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-md select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

    const variants = {
      primary:
        'bg-gradient-to-r from-accent to-accent-secondary text-white shadow-lg shadow-accent/15 hover:shadow-accent/25 hover:brightness-110 active:brightness-95',
      secondary:
        'bg-surface-subtle text-text-primary hover:bg-surface-elevated active:bg-border/40 border border-border/50',
      outline:
        'bg-transparent border border-border/50 text-text-primary hover:bg-surface-subtle/50 hover:border-accent/20 active:bg-surface-subtle',
      ghost:
        'bg-transparent text-text-muted hover:text-accent hover:bg-accent/[0.06] active:bg-accent/[0.1]',
      danger:
        'bg-semantic-danger text-white shadow-lg shadow-red-500/15 hover:bg-semantic-danger/90 active:bg-semantic-danger/95',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-9 px-4 text-sm gap-2',
      lg: 'h-11 px-6 text-base gap-2.5 rounded-lg',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && <Spinner size="sm" className="mr-1.5" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

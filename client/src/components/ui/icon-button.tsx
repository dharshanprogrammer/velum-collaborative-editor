import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../../lib/utils';
import { Kbd } from './kbd';

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <TooltipPrimitive.Provider delayDuration={250}>{children}</TooltipPrimitive.Provider>;
}

export function Tooltip({
  children,
  content,
  shortcut,
  side = 'top',
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  shortcut?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className={cn(
            'z-50 overflow-hidden rounded-md bg-text-primary px-2.5 py-1.5 text-xs text-background shadow-floating animate-in fade-in-0 zoom-in-95 flex items-center gap-1.5'
          )}
        >
          <span>{content}</span>
          {shortcut && <Kbd className="bg-background/20 border-white/20 text-background">{shortcut}</Kbd>}
          <TooltipPrimitive.Arrow className="fill-text-primary" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  variant?: 'ghost' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, shortcut, variant = 'ghost', size = 'md', active = false, className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-7 h-7 text-xs',
      md: 'w-8 h-8 text-sm',
      lg: 'w-10 h-10 text-base',
    };

    const variantClasses = {
      ghost: active
        ? 'bg-accent/15 text-accent font-semibold'
        : 'text-text-muted hover:text-text-primary hover:bg-surface-subtle',
      secondary: active
        ? 'bg-accent/15 text-accent border border-accent/30'
        : 'bg-surface-subtle text-text-primary hover:bg-border/60 border border-border/70',
      outline: active
        ? 'border-accent bg-accent/10 text-accent'
        : 'border border-border text-text-muted hover:text-text-primary hover:bg-surface-subtle',
      danger: 'text-semantic-danger hover:bg-semantic-danger-bg',
    };

    const button = (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={cn(
          'inline-flex items-center justify-center rounded-md transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40 disabled:pointer-events-none',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {icon}
      </button>
    );

    return (
      <Tooltip content={label} shortcut={shortcut}>
        {button}
      </Tooltip>
    );
  }
);
IconButton.displayName = 'IconButton';

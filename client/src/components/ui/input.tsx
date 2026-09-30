import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, icon, ...props }, ref) => {
    return (
      <div className="w-full relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 transition-all duration-150',
            'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            icon && 'pl-9',
            error && 'border-semantic-danger focus:border-semantic-danger focus:ring-semantic-danger/20',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-semantic-danger font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 transition-all duration-150',
            'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20',
            'disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]',
            error && 'border-semantic-danger focus:border-semantic-danger focus:ring-semantic-danger/20',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-semantic-danger font-medium">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

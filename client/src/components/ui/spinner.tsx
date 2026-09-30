import React from 'react';
import { cn } from '../../lib/utils';

export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = {
    sm: 'w-3.5 h-3.5 border-[1.5px]',
    md: 'w-5 h-5 border-2',
    lg: 'w-7 h-7 border-[2.5px]',
  };

  return (
    <div
      className={cn(
        'inline-block animate-spin rounded-full border-current border-t-transparent text-current',
        sizes[size],
        className
      )}
      role="status"
      aria-label="loading"
    />
  );
}

import React from 'react';
import { Lock, Eye } from 'lucide-react';

export function PermissionBanner({ role }: { role: string }) {
  if (role !== 'viewer') return null;

  return (
    <div className="bg-surface-subtle border-b border-border px-4 py-2 flex items-center justify-between text-xs text-text-muted select-none">
      <div className="flex items-center gap-2">
        <Eye className="w-3.5 h-3.5 text-accent" />
        <span>
          <strong>Viewing mode.</strong> You have read-only access to this document. Contact the owner to request edit permissions.
        </span>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-wider bg-border/60 px-1.5 py-0.5 rounded">
        Read-Only
      </span>
    </div>
  );
}

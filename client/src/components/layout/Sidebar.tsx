import React from 'react';
import {
  FileText,
  Users,
  Star,
  Trash2,
  Plus,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function Sidebar({
  activeFilter,
  onSelectFilter,
  onOpenNewDoc,
}: {
  activeFilter: string;
  onSelectFilter: (filter: 'all' | 'shared' | 'starred' | 'trash') => void;
  onOpenNewDoc: () => void;
}) {
  const NAV_ITEMS = [
    { id: 'all', label: 'All Documents', icon: FileText },
    { id: 'shared', label: 'Shared with me', icon: Users },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ] as const;

  return (
    <aside className="w-60 border-r border-border/40 bg-surface/30 backdrop-blur-xl flex flex-col h-[calc(100vh-56px)] p-4 select-none shrink-0 transition-colors">
      {/* Workspace Switcher */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-subtle/30 border border-border/40 mb-4 cursor-pointer hover:border-accent/20 hover:bg-accent/[0.04] transition-all duration-200 group">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center font-bold text-[10px] text-white shadow-sm shadow-accent/15">
            V
          </div>
          <div className="flex flex-col text-left">
            <span className="font-medium text-xs text-text-primary group-hover:text-text-primary transition-colors tracking-tight">
              Workspace
            </span>
            <span className="text-[10px] text-text-muted font-medium">Personal</span>
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors" />
      </div>

      {/* New Document */}
      <button
        onClick={onOpenNewDoc}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-accent to-accent-secondary text-white hover:shadow-lg hover:shadow-accent/20 font-semibold text-xs tracking-tight active:scale-[0.98] transition-all duration-150 mb-5 group btn-glow"
      >
        <Plus className="w-4 h-4 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
        <span>New Document</span>
      </button>

      {/* Nav Items */}
      <div className="space-y-0.5">
        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider px-2 py-1.5 block">
          Library
        </span>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeFilter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectFilter(item.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left duration-150 relative',
                isActive
                  ? 'bg-accent/[0.08] text-accent font-semibold'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-subtle/50'
              )}
            >
              {isActive && (
                <div className="absolute left-0 inset-y-1.5 w-[3px] bg-accent rounded-full" />
              )}
              <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-accent' : 'text-text-muted')} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-border/30 flex flex-col gap-2">
        <div className="p-3 rounded-lg bg-accent/[0.04] border border-accent/10 text-[11px] text-text-muted space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-accent">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Velum v1.0</span>
          </div>
          <p className="text-[10px] leading-relaxed">
            Local-first CRDTs. All changes persist instantly.
          </p>
        </div>
      </div>
    </aside>
  );
}

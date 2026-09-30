import React from 'react';
import { Info, Clock, Type, FileText, User } from 'lucide-react';
import { getDocumentStats, formatRelativeTime } from '../../../lib/utils';
import { DocumentItem } from '../../../types';

export function DocInfoPanel({
  doc,
  content,
}: {
  doc: DocumentItem | null;
  content: string;
}) {
  const stats = getDocumentStats(content);

  return (
    <div className="flex flex-col h-full bg-surface p-4 space-y-6 text-xs select-none">
      <div className="flex items-center gap-1.5 font-semibold text-text-primary border-b border-border pb-3">
        <Info className="w-4 h-4 text-accent" />
        <span>Document Statistics</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-surface-subtle border border-border flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-text-muted">
            <Type className="w-3.5 h-3.5" />
            <span>Words</span>
          </div>
          <span className="text-xl font-bold text-text-primary tracking-tight">{stats.words}</span>
        </div>

        <div className="p-3 rounded-xl bg-surface-subtle border border-border flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-text-muted">
            <FileText className="w-3.5 h-3.5" />
            <span>Characters</span>
          </div>
          <span className="text-xl font-bold text-text-primary tracking-tight">{stats.characters}</span>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-surface-subtle border border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-text-muted">
          <Clock className="w-4 h-4 text-accent" />
          <span>Estimated reading time</span>
        </div>
        <span className="font-semibold text-text-primary">{stats.readingTimeMinutes} min</span>
      </div>

      {doc && (
        <div className="space-y-3 pt-2 border-t border-border">
          <h4 className="font-semibold text-text-muted uppercase tracking-wider text-[10px]">
            Metadata
          </h4>

          <div className="flex items-center justify-between text-text-muted">
            <span>Author</span>
            <span className="font-medium text-text-primary">{doc.ownerId?.name || 'You'}</span>
          </div>

          <div className="flex items-center justify-between text-text-muted">
            <span>Created</span>
            <span className="font-medium text-text-primary">{formatRelativeTime(doc.createdAt)}</span>
          </div>

          <div className="flex items-center justify-between text-text-muted">
            <span>Last Modified</span>
            <span className="font-medium text-text-primary">{formatRelativeTime(doc.updatedAt)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

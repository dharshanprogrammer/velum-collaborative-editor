import React, { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import { ListTree, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface HeadingItem {
  id: string;
  level: number;
  text: string;
  pos: number;
}

export function OutlineSidebar({
  editor,
  isOpen,
  onClose,
}: {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!editor) return;

    const extractHeadings = () => {
      const items: HeadingItem[] = [];
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          const text = node.textContent;
          const level = node.attrs.level;
          if (text.trim()) {
            items.push({
              id: `heading-${pos}`,
              level,
              text,
              pos,
            });
          }
        }
      });
      setHeadings(items);
    };

    extractHeadings();
    editor.on('update', extractHeadings);

    return () => {
      editor.off('update', extractHeadings);
    };
  }, [editor]);

  const scrollToHeading = (pos: number) => {
    if (!editor) return;
    editor.chain().focus().setTextSelection(pos).scrollIntoView().run();
  };

  if (!isOpen) return null;

  return (
    <aside className="w-64 border-r border-border bg-surface/60 backdrop-blur-md flex flex-col h-[calc(100vh-56px)] select-none shrink-0 transition-all">
      <div className="flex items-center justify-between p-3 border-b border-border/70">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
          <ListTree className="w-4 h-4 text-accent" />
          <span>Table of Contents</span>
        </div>
        <span className="text-[11px] text-text-muted">{headings.length} sections</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {headings.map((h) => {
          const indent = {
            1: 'pl-1 font-semibold text-text-primary',
            2: 'pl-4 font-medium text-text-muted',
            3: 'pl-7 text-xs text-text-muted/80',
          }[h.level] || 'pl-1';

          return (
            <button
              key={h.id}
              onClick={() => scrollToHeading(h.pos)}
              className={cn(
                'w-full text-left py-1.5 px-2 rounded-md text-xs transition-colors hover:bg-surface-subtle hover:text-text-primary flex items-center justify-between group truncate',
                indent
              )}
            >
              <span className="truncate">{h.text}</span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1 text-accent" />
            </button>
          );
        })}

        {headings.length === 0 && (
          <div className="py-8 text-center text-xs text-text-muted">
            <p>No headings yet.</p>
            <p className="text-[11px] text-text-muted/70 mt-1">Use H1, H2, or H3 to generate an outline automatically.</p>
          </div>
        )}
      </div>
    </aside>
  );
}

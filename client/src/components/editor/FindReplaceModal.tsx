import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { Search, ChevronDown, ChevronUp, X, CaseSensitive, Replace } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export function FindReplaceModal({
  editor,
  open,
  onClose,
}: {
  editor: Editor | null;
  open: boolean;
  onClose: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [matches, setMatches] = useState<number[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  useEffect(() => {
    if (!editor || !open || !searchTerm) {
      setMatches([]);
      setCurrentMatchIndex(0);
      return;
    }

    const text = editor.getText();
    const flags = caseSensitive ? 'g' : 'gi';
    try {
      const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const found: number[] = [];
      let match;
      while ((match = regex.exec(text)) !== null) {
        found.push(match.index);
      }
      setMatches(found);
      setCurrentMatchIndex(found.length > 0 ? 0 : -1);
    } catch {
      setMatches([]);
    }
  }, [searchTerm, caseSensitive, editor, open]);

  const handleNext = () => {
    if (matches.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(nextIdx);
    jumpToMatch(matches[nextIdx]);
  };

  const handlePrev = () => {
    if (matches.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + matches.length) % matches.length;
    setCurrentMatchIndex(prevIdx);
    jumpToMatch(matches[prevIdx]);
  };

  const jumpToMatch = (pos: number) => {
    if (!editor) return;
    editor.chain().focus().setTextSelection({ from: pos + 1, to: pos + 1 + searchTerm.length }).scrollIntoView().run();
  };

  const handleReplace = () => {
    if (!editor || matches.length === 0 || currentMatchIndex === -1) return;
    const pos = matches[currentMatchIndex];
    editor
      .chain()
      .focus()
      .insertContentAt({ from: pos + 1, to: pos + 1 + searchTerm.length }, replaceTerm)
      .run();
  };

  const handleReplaceAll = () => {
    if (!editor || !searchTerm) return;
    const content = editor.getHTML();
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    const updated = content.replace(regex, replaceTerm);
    editor.commands.setContent(updated);
  };

  if (!open) return null;

  return (
    <div className="absolute top-16 right-6 z-50 p-3 rounded-xl border border-border bg-surface/95 backdrop-blur-xl shadow-floating w-80 space-y-2 select-none animate-in fade-in-0 zoom-in-95">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-accent" />
          Find and Replace
        </span>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary p-0.5 rounded">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Find input */}
      <div className="flex items-center gap-1 bg-surface-subtle px-2 py-1 rounded-md border border-border">
        <input
          type="text"
          placeholder="Find..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent text-xs text-text-primary outline-none"
          autoFocus
        />
        <span className="text-[10px] text-text-muted px-1">
          {matches.length > 0 ? `${currentMatchIndex + 1}/${matches.length}` : '0 results'}
        </span>
        <button
          onClick={() => setCaseSensitive(!caseSensitive)}
          title="Match Case"
          className={cn(
            'p-1 rounded text-xs transition-colors',
            caseSensitive ? 'bg-accent/20 text-accent font-bold' : 'text-text-muted hover:text-text-primary'
          )}
        >
          <CaseSensitive className="w-3.5 h-3.5" />
        </button>
        <button onClick={handlePrev} disabled={matches.length === 0} className="p-0.5 text-text-muted hover:text-text-primary disabled:opacity-40">
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button onClick={handleNext} disabled={matches.length === 0} className="p-0.5 text-text-muted hover:text-text-primary disabled:opacity-40">
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Replace input */}
      <div className="flex items-center gap-1 bg-surface-subtle px-2 py-1 rounded-md border border-border">
        <input
          type="text"
          placeholder="Replace with..."
          value={replaceTerm}
          onChange={(e) => setReplaceTerm(e.target.value)}
          className="flex-1 bg-transparent text-xs text-text-primary outline-none"
        />
      </div>

      <div className="flex items-center justify-end gap-1.5 pt-1">
        <Button size="sm" variant="ghost" onClick={handleReplace} disabled={matches.length === 0}>
          Replace
        </Button>
        <Button size="sm" onClick={handleReplaceAll} disabled={matches.length === 0}>
          Replace All
        </Button>
      </div>
    </div>
  );
}

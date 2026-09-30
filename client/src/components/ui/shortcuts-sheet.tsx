import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Input } from './input';
import { Kbd } from './kbd';
import { Search } from 'lucide-react';

interface ShortcutGroup {
  category: string;
  items: { description: string; shortcut: string }[];
}

const SHORTCUTS: ShortcutGroup[] = [
  {
    category: 'Essential & Navigation',
    items: [
      { description: 'Open command palette', shortcut: '⌘ K' },
      { description: 'Open keyboard shortcuts', shortcut: '⌘ /' },
      { description: 'Find and replace', shortcut: '⌘ F' },
      { description: 'Toggle focus mode', shortcut: '⌘ ⇧ F' },
      { description: 'Toggle dark / light mode', shortcut: '⌘ ⇧ D' },
    ],
  },
  {
    category: 'Text Formatting',
    items: [
      { description: 'Bold', shortcut: '⌘ B' },
      { description: 'Italic', shortcut: '⌘ I' },
      { description: 'Underline', shortcut: '⌘ U' },
      { description: 'Strikethrough', shortcut: '⌘ ⇧ X' },
      { description: 'Inline code', shortcut: '⌘ E' },
      { description: 'Highlight text', shortcut: '⌘ ⇧ H' },
    ],
  },
  {
    category: 'Blocks & Structure',
    items: [
      { description: 'Heading 1', shortcut: '⌘ ⌥ 1' },
      { description: 'Heading 2', shortcut: '⌘ ⌥ 2' },
      { description: 'Heading 3', shortcut: '⌘ ⌥ 3' },
      { description: 'Bullet list', shortcut: '⌘ ⇧ 8' },
      { description: 'Numbered list', shortcut: '⌘ ⇧ 7' },
      { description: 'Task / Todo list', shortcut: '⌘ ⇧ 9' },
      { description: 'Quote block', shortcut: '⌘ ⇧ B' },
      { description: 'Code block', shortcut: '⌘ ⌥ C' },
    ],
  },
  {
    category: 'Collaboration',
    items: [
      { description: 'Add comment to selection', shortcut: '⌘ ⌥ M' },
      { description: 'Open share dialog', shortcut: '⌘ ⌥ S' },
      { description: 'Undo (local-first CRDT)', shortcut: '⌘ Z' },
      { description: 'Redo', shortcut: '⌘ ⇧ Z' },
    ],
  },
];

export function ShortcutsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [filter, setFilter] = useState('');

  const filteredGroups = SHORTCUTS.map((g) => ({
    ...g,
    items: g.items.filter(
      (item) =>
        item.description.toLowerCase().includes(filter.toLowerCase()) ||
        item.shortcut.toLowerCase().includes(filter.toLowerCase())
    ),
  })).filter((g) => g.items.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl">Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Speed up your workflow with native keyboard-first navigation and editing.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder="Search shortcuts..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="overflow-y-auto pr-1 space-y-6">
          {filteredGroups.map((group) => (
            <div key={group.category}>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2.5">
                {group.category}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {group.items.map((item) => (
                  <div
                    key={item.description}
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-subtle/60 border border-border/50 text-xs"
                  >
                    <span className="text-text-primary font-medium">{item.description}</span>
                    <Kbd>{item.shortcut}</Kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredGroups.length === 0 && (
            <p className="text-center text-xs text-text-muted py-6">No matching shortcuts found</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

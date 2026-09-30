import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code2,
  Table,
  AlertCircle,
  Minus,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Kbd } from '../ui/kbd';

interface SlashItem {
  id: string;
  title: string;
  description: string;
  group: 'Basic' | 'Lists' | 'Advanced';
  shortcut?: string;
  icon: React.ReactNode;
  action: (editor: Editor) => void;
}

const SLASH_COMMANDS: SlashItem[] = [
  {
    id: 'h1',
    title: 'Heading 1',
    description: 'Large top-level section header',
    group: 'Basic',
    shortcut: '#',
    icon: <Heading1 className="w-4 h-4 text-accent" />,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: 'h2',
    title: 'Heading 2',
    description: 'Medium sub-section header',
    group: 'Basic',
    shortcut: '##',
    icon: <Heading2 className="w-4 h-4 text-accent" />,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: 'h3',
    title: 'Heading 3',
    description: 'Small subsection header',
    group: 'Basic',
    shortcut: '###',
    icon: <Heading3 className="w-4 h-4 text-accent" />,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    id: 'bullet-list',
    title: 'Bullet List',
    description: 'Simple bulleted list',
    group: 'Lists',
    shortcut: '-',
    icon: <List className="w-4 h-4" />,
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: 'numbered-list',
    title: 'Numbered List',
    description: 'Sequential ordered list',
    group: 'Lists',
    shortcut: '1.',
    icon: <ListOrdered className="w-4 h-4" />,
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: 'task-list',
    title: 'To-do List',
    description: 'Interactive checklist with task states',
    group: 'Lists',
    shortcut: '[]',
    icon: <CheckSquare className="w-4 h-4" />,
    action: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    id: 'quote',
    title: 'Quote',
    description: 'Capture a notable quote or citation',
    group: 'Advanced',
    shortcut: '>',
    icon: <Quote className="w-4 h-4" />,
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    id: 'callout',
    title: 'Callout',
    description: 'Highlight key information in a stylized box',
    group: 'Advanced',
    icon: <AlertCircle className="w-4 h-4 text-semantic-info" />,
    action: (editor) => (editor.commands as any).toggleCallout({ type: 'info' }),
  },
  {
    id: 'code-block',
    title: 'Code Block',
    description: 'Syntax-highlighted code container',
    group: 'Advanced',
    shortcut: '```',
    icon: <Code2 className="w-4 h-4" />,
    action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: 'table',
    title: 'Table',
    description: 'Grid layout with customizable rows & columns',
    group: 'Advanced',
    icon: <Table className="w-4 h-4" />,
    action: (editor) =>
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    id: 'divider',
    title: 'Divider',
    description: 'Horizontal thematic break rule',
    group: 'Advanced',
    shortcut: '---',
    icon: <Minus className="w-4 h-4" />,
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
];

export function SlashMenu({
  editor,
  isOpen,
  onClose,
  position,
}: {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex] && editor) {
          executeCommand(filtered[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filtered, editor]);

  const executeCommand = (cmd: SlashItem) => {
    if (!editor) return;
    // Remove the slash typed before executing
    const { from } = editor.state.selection;
    editor.commands.deleteRange({ from: Math.max(0, from - 1), to: from });
    cmd.action(editor);
    onClose();
  };

  if (!isOpen || !editor) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.95, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        style={{
          position: 'absolute',
          top: `${position.top + 28}px`,
          left: `${position.left}px`,
          zIndex: 70,
        }}
        className="w-72 rounded-xl border border-border bg-surface/95 backdrop-blur-xl shadow-floating p-1.5 overflow-hidden select-none"
      >
        <div className="px-2 py-1 mb-1 border-b border-border/50">
          <input
            type="text"
            placeholder="Type command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-text-primary placeholder:text-text-muted/60 outline-none"
            autoFocus
          />
        </div>

        <div className="max-h-64 overflow-y-auto space-y-0.5">
          {filtered.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <div
                key={item.id}
                onClick={() => executeCommand(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={cn(
                  'flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition-colors',
                  isSelected ? 'bg-surface-subtle text-text-primary' : 'text-text-muted hover:text-text-primary'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-md bg-surface border border-border/60">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{item.title}</p>
                    <p className="text-[11px] text-text-muted line-clamp-1">{item.description}</p>
                  </div>
                </div>
                {item.shortcut && <Kbd>{item.shortcut}</Kbd>}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <p className="p-3 text-center text-xs text-text-muted">No commands match "{query}"</p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

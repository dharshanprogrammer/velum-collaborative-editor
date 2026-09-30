import React, { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Code,
  MessageSquarePlus,
  Link as LinkIcon,
} from 'lucide-react';
import { IconButton } from '../ui/icon-button';

export function BubbleToolbar({
  editor,
  onAddComment,
}: {
  editor: Editor | null;
  onAddComment?: () => void;
}) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!editor) return;

    const updatePosition = () => {
      const { from, to, empty } = editor.state.selection;
      if (empty || from === to) {
        setVisible(false);
        return;
      }

      // Check if window selection exists
      const domSelection = window.getSelection();
      if (!domSelection || domSelection.rangeCount === 0) {
        setVisible(false);
        return;
      }

      const range = domSelection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) {
        setVisible(false);
        return;
      }

      // Position bubble centered above selection
      setCoords({
        top: rect.top - 48 + window.scrollY,
        left: rect.left + rect.width / 2,
      });
      setVisible(true);
    };

    editor.on('selectionUpdate', updatePosition);
    editor.on('blur', () => {
      // Small timeout to allow button clicks inside bubble toolbar
      setTimeout(() => {
        if (!document.activeElement?.closest('#bubble-toolbar')) {
          setVisible(false);
        }
      }, 150);
    });

    return () => {
      editor.off('selectionUpdate', updatePosition);
    };
  }, [editor]);

  if (!editor || !coords) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="bubble-toolbar"
          initial={{ opacity: 0, scale: 0.9, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 6 }}
          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
          style={{
            position: 'absolute',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            transform: 'translateX(-50%)',
            zIndex: 60,
          }}
          className="flex items-center gap-0.5 p-1 rounded-lg border border-border bg-surface/90 backdrop-blur-xl shadow-floating select-none"
        >
          <IconButton
            icon={<Bold className="w-3.5 h-3.5" />}
            label="Bold"
            shortcut="⌘B"
            size="sm"
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <IconButton
            icon={<Italic className="w-3.5 h-3.5" />}
            label="Italic"
            shortcut="⌘I"
            size="sm"
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <IconButton
            icon={<Underline className="w-3.5 h-3.5" />}
            label="Underline"
            shortcut="⌘U"
            size="sm"
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          />
          <IconButton
            icon={<Strikethrough className="w-3.5 h-3.5" />}
            label="Strikethrough"
            shortcut="⌘⇧X"
            size="sm"
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
          <IconButton
            icon={<Highlighter className="w-3.5 h-3.5" />}
            label="Highlight"
            shortcut="⌘⇧H"
            size="sm"
            active={editor.isActive('highlight')}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          />
          <IconButton
            icon={<Code className="w-3.5 h-3.5" />}
            label="Inline code"
            shortcut="⌘E"
            size="sm"
            active={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()}
          />

          <div className="w-px h-4 bg-border mx-0.5" />

          {/* Comment Action */}
          <IconButton
            icon={<MessageSquarePlus className="w-3.5 h-3.5 text-accent" />}
            label="Comment"
            shortcut="⌘⌥M"
            size="sm"
            onClick={() => {
              setVisible(false);
              onAddComment?.();
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

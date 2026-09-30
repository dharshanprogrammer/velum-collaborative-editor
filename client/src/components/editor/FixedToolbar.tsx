import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Highlighter,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Table as TableIcon,
  Link as LinkIcon,
  Undo2,
  Redo2,
  AlertCircle,
  Code2,
  ChevronDown,
  Type,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';
import { IconButton } from '../ui/icon-button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export function FixedToolbar({
  editor,
  fontFamily,
  onFontFamilyChange,
}: {
  editor: Editor | null;
  fontFamily: 'sans' | 'serif' | 'mono';
  onFontFamilyChange: (font: 'sans' | 'serif' | 'mono') => void;
}) {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkOpen, setLinkOpen] = useState(false);

  if (!editor) return null;

  const setLink = () => {
    if (!linkUrl) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}` })
        .run();
    }
    setLinkOpen(false);
    setLinkUrl('');
  };

  const getHeadingLabel = () => {
    if (editor.isActive('heading', { level: 1 })) return 'H1';
    if (editor.isActive('heading', { level: 2 })) return 'H2';
    if (editor.isActive('heading', { level: 3 })) return 'H3';
    return 'Text';
  };

  return (
    <div className="w-full flex justify-center py-2.5 px-4 sticky top-0 z-30 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-1 px-3 py-1.5 rounded-full border border-border/70 bg-surface/85 backdrop-blur-2xl shadow-floating select-none transition-all duration-200">
        {/* Undo / Redo */}
        <div className="flex items-center">
          <IconButton
            icon={<Undo2 className="w-3.5 h-3.5" />}
            label="Undo"
            shortcut="⌘Z"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          />
          <IconButton
            icon={<Redo2 className="w-3.5 h-3.5" />}
            label="Redo"
            shortcut="⌘⇧Z"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          />
        </div>

        <div className="w-px h-3.5 bg-border/70 mx-1" />

        {/* Font Family Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors">
              <Type className="w-3.5 h-3.5 text-accent" />
              <span className="capitalize">{fontFamily}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40 glass-dock">
            <DropdownMenuItem onClick={() => onFontFamilyChange('sans')}>
              <span className="font-sans font-medium">Plus Jakarta (Modern)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFontFamilyChange('serif')}>
              <span className="font-serif font-medium">Instrument (Editorial)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFontFamilyChange('mono')}>
              <span className="font-mono font-medium">JetBrains Mono</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Heading Style Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors">
              <span>{getHeadingLabel()}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-36 glass-dock">
            <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
              Regular Text
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
              <span className="font-bold text-sm">Heading 1</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <span className="font-semibold text-xs">Heading 2</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
              <span className="font-medium text-xs">Heading 3</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-3.5 bg-border/70 mx-1" />

        {/* Inline Marks */}
        <div className="flex items-center gap-0.5">
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
            label="Inline Code"
            shortcut="⌘E"
            size="sm"
            active={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()}
          />

          {/* Link Popover */}
          <Popover open={linkOpen} onOpenChange={setLinkOpen}>
            <PopoverTrigger asChild>
              <div>
                <IconButton
                  icon={<LinkIcon className="w-3.5 h-3.5" />}
                  label="Insert Link"
                  shortcut="⌘K"
                  size="sm"
                  active={editor.isActive('link')}
                  onClick={() => {
                    setLinkUrl(editor.getAttributes('link').href || '');
                    setLinkOpen(true);
                  }}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3 space-y-2 glass-dock" align="start">
              <p className="text-xs font-semibold text-text-primary">Insert Link</p>
              <Input
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setLink()}
                autoFocus
              />
              <div className="flex justify-end gap-2 pt-1">
                <Button size="sm" variant="ghost" onClick={() => setLinkOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={setLink}>
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="w-px h-3.5 bg-border/70 mx-1" />

        {/* Blocks & Lists */}
        <div className="flex items-center gap-0.5">
          <IconButton
            icon={<List className="w-3.5 h-3.5" />}
            label="Bullet List"
            shortcut="⌘⇧8"
            size="sm"
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <IconButton
            icon={<ListOrdered className="w-3.5 h-3.5" />}
            label="Numbered List"
            shortcut="⌘⇧7"
            size="sm"
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <IconButton
            icon={<CheckSquare className="w-3.5 h-3.5" />}
            label="Task List"
            shortcut="⌘⇧9"
            size="sm"
            active={editor.isActive('taskList')}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
          />
          <IconButton
            icon={<Quote className="w-3.5 h-3.5" />}
            label="Quote"
            shortcut="⌘⇧B"
            size="sm"
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          />
          <IconButton
            icon={<AlertCircle className="w-3.5 h-3.5" />}
            label="Callout Box"
            size="sm"
            active={editor.isActive('callout')}
            onClick={() => (editor.commands as any).toggleCallout({ type: 'info' })}
          />
          <IconButton
            icon={<Code2 className="w-3.5 h-3.5" />}
            label="Code Block"
            shortcut="⌘⌥C"
            size="sm"
            active={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          />
          <IconButton
            icon={<TableIcon className="w-3.5 h-3.5" />}
            label="Insert Table"
            size="sm"
            onClick={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
          />
        </div>
      </div>
    </div>
  );
}

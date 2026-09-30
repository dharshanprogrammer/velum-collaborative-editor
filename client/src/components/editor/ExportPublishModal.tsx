import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  FileText,
  Code,
  Download,
  Copy,
  Check,
  Printer,
  Sparkles,
  Share2,
  FileCode,
  Layers,
} from 'lucide-react';
import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export function ExportPublishModal({
  editor,
  title,
  open,
  onClose,
}: {
  editor: Editor | null;
  title: string;
  open: boolean;
  onClose: () => void;
}) {
  const [activeFormat, setActiveFormat] = useState<'markdown' | 'html' | 'text' | 'json'>('markdown');
  const [copied, setCopied] = useState(false);

  if (!editor) return null;

  const docTitle = title || 'untitled_document';
  const cleanFilename = docTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

  const getMarkdown = () => {
    // Basic clean markdown conversion from TipTap HTML / text
    const text = editor.getText();
    return `# ${title}\n\n${text}`;
  };

  const getHtml = () => {
    const content = editor.getHTML();
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Velum Studio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      color-scheme: light dark;
      --bg: #090B10;
      --text: #F1F4FA;
      --accent: #6366F1;
      --border: rgba(255,255,255,0.1);
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #FAFAFC;
        --text: #18191E;
        --accent: #4F46E5;
        --border: rgba(0,0,0,0.08);
      }
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      line-height: 1.75;
      padding: 3rem 1.5rem;
      margin: 0;
      display: flex;
      justify-content: center;
    }
    article {
      max-width: 760px;
      width: 100%;
    }
    h1, h2, h3 { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; font-weight: 700; }
    h1 { font-size: 2.25rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
    h2 { font-size: 1.5rem; margin-top: 2rem; }
    h3 { font-size: 1.2rem; margin-top: 1.5rem; }
    blockquote { border-left: 3px solid var(--accent); padding-left: 1rem; margin: 1.5rem 0; font-style: italic; opacity: 0.85; }
    pre { background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; overflow-x: auto; font-family: monospace; }
  </style>
</head>
<body>
  <article>
    <h1>${title}</h1>
    ${content}
  </article>
</body>
</html>`;
  };

  const getText = () => {
    return `${title}\n\n${editor.getText()}`;
  };

  const getJson = () => {
    return JSON.stringify(editor.getJSON(), null, 2);
  };

  const getCurrentContent = () => {
    switch (activeFormat) {
      case 'markdown': return getMarkdown();
      case 'html': return getHtml();
      case 'text': return getText();
      case 'json': return getJson();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(`Copied ${activeFormat.toUpperCase()} to clipboard`);
  };

  const handleDownload = () => {
    const content = getCurrentContent();
    const mimeTypes = {
      markdown: 'text/markdown;charset=utf-8',
      html: 'text/html;charset=utf-8',
      text: 'text/plain;charset=utf-8',
      json: 'application/json;charset=utf-8',
    };
    const extensions = {
      markdown: 'md',
      html: 'html',
      text: 'txt',
      json: 'json',
    };

    const blob = new Blob([content], { type: mimeTypes[activeFormat] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cleanFilename}.${extensions[activeFormat]}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${cleanFilename}.${extensions[activeFormat]}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden glass-dock border-border/80 shadow-floating">
        {/* Header */}
        <div className="p-5 border-b border-border/70 flex items-center justify-between bg-surface/50">
          <div>
            <h2 className="text-base font-bold text-text-primary font-display flex items-center gap-2">
              <Download className="w-4 h-4 text-accent" />
              <span>Publish & Export Studio</span>
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Export high-fidelity documents in standard formats or publish standalone HTML.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onClose();
              window.print();
            }}
            className="gap-1.5 rounded-full"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </Button>
        </div>

        {/* Format Selector Pills */}
        <div className="px-5 pt-4 flex items-center gap-2">
          <button
            onClick={() => setActiveFormat('markdown')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFormat === 'markdown'
                ? 'bg-accent text-white shadow-subtle'
                : 'bg-surface-subtle text-text-muted hover:text-text-primary border border-border/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Markdown (.md)</span>
          </button>

          <button
            onClick={() => setActiveFormat('html')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFormat === 'html'
                ? 'bg-accent text-white shadow-subtle'
                : 'bg-surface-subtle text-text-muted hover:text-text-primary border border-border/60'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Standalone HTML</span>
          </button>

          <button
            onClick={() => setActiveFormat('text')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFormat === 'text'
                ? 'bg-accent text-white shadow-subtle'
                : 'bg-surface-subtle text-text-muted hover:text-text-primary border border-border/60'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Plain Text (.txt)</span>
          </button>

          <button
            onClick={() => setActiveFormat('json')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFormat === 'json'
                ? 'bg-accent text-white shadow-subtle'
                : 'bg-surface-subtle text-text-muted hover:text-text-primary border border-border/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ProseMirror JSON</span>
          </button>
        </div>

        {/* Code / Content Preview */}
        <div className="p-5">
          <div className="relative rounded-2xl bg-surface-subtle/80 border border-border/80 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-surface/60 border-b border-border/60 text-[11px] text-text-muted">
              <span>Preview: {cleanFilename}.{activeFormat === 'markdown' ? 'md' : activeFormat}</span>
              <span className="font-mono text-[10px]">
                {getCurrentContent().length.toLocaleString()} characters
              </span>
            </div>

            <pre className="p-4 text-xs font-mono text-text-primary overflow-x-auto max-h-64 whitespace-pre-wrap leading-relaxed select-text">
              {getCurrentContent().slice(0, 1500)}
              {getCurrentContent().length > 1500 ? '\n\n... (truncated preview)' : ''}
            </pre>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-text-muted">
              Ready for GitHub, Obsidian, Notion, or personal blog publishing.
            </span>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="gap-1.5 rounded-full"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-semantic-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Content'}</span>
              </Button>

              <Button
                size="sm"
                onClick={handleDownload}
                className="gap-1.5 rounded-full shadow-floating"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

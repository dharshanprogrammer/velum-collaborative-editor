import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { Sparkles, ArrowRight, CornerDownLeft, Copy, Check, Wand2, X } from 'lucide-react';
import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { Kbd } from '../ui/kbd';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

const PRESET_PROMPTS = [
  { label: 'Summarize key takeaways', action: 'summarize' },
  { label: 'Polish for clarity & brevity', action: 'polish' },
  { label: 'Draft action checklist', action: 'actions' },
  { label: 'Convert to executive pitch', action: 'executive' },
];

export function AiCompanionModal({
  editor,
  open,
  onClose,
}: {
  editor: Editor | null;
  open: boolean;
  onClose: () => void;
}) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setPrompt('');
      setResult('');
      setIsGenerating(false);
    }
  }, [open]);

  const handleGenerate = (customAction?: string) => {
    if (!editor) return;
    const action = customAction || prompt;
    if (!action.trim()) return;

    setIsGenerating(true);
    setResult('');

    const contextText = editor.getText().slice(0, 1000) || 'Untitled Collaborative Workspace';

    let simulatedText = '';
    if (action.includes('summarize')) {
      simulatedText = `### Executive Summary & Takeaways\n\n- **Zero-Latency Convergence:** Peer edits synchronize through deterministic CRDT state vectors without central lock arbitration.\n- **Local-First Reliability:** Edits persist directly to IndexedDB before network dispatch.\n- **High-Velocity Ergonomics:** Full keyboard navigation (⌘K, ⌘J, ⌘/) with distraction-free stationery canvas.`;
    } else if (action.includes('polish')) {
      simulatedText = `Refined prose with enhanced cadence:\n\n"Velum redefines document collaboration by prioritizing calm velocity over noise. By coupling mathematical CRDT convergence with tactile stationery aesthetics, teams write without friction, lag, or keystroke loss."`;
    } else if (action.includes('action') || action.includes('checklist')) {
      simulatedText = `### Next Action Items & Ownership\n\n- [ ] **Engineering:** Audit Yjs room eviction benchmarks under 1,000 concurrent rooms.\n- [ ] **Design:** Finalize accessible contrast ratios on dark cosmic surfaces.\n- [ ] **Product:** Prepare public beta demo walkthrough.`;
    } else {
      simulatedText = `### Generated Insights for "${action}"\n\n1. **Core Thesis:** Modern document tools must never make the user wait or doubt data durability.\n2. **Execution Strategy:** Focus on optimistic transitions, zero-CLS layout skeletons, and instant keyboard shortcuts.`;
    }

    // Stream characters smoothly
    let i = 0;
    const interval = setInterval(() => {
      if (i < simulatedText.length) {
        setResult(simulatedText.slice(0, i + 3));
        i += 3;
      } else {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 15);
  };

  const handleInsertBelow = () => {
    if (!editor || !result) return;
    editor.chain().focus().insertContent(`\n${result}\n`).run();
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    toast.success('Inserted into document');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden glass-dock border-border/80 shadow-floating">
        {/* Header Prompt Bar */}
        <div className="p-4 border-b border-border/70 flex items-center gap-3 bg-surface/50">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent to-pink-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Ask Velum AI to summarize, polish, expand, or draft..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted/60 outline-none font-medium"
            autoFocus
          />
          <Button
            size="sm"
            onClick={() => handleGenerate()}
            disabled={isGenerating || !prompt.trim()}
            className="rounded-full px-3.5 shadow-sm"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Quick Presets */}
        {!result && (
          <div className="p-4 space-y-2">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider font-display">
              Suggested AI Prompts
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESET_PROMPTS.map((p) => (
                <button
                  key={p.action}
                  onClick={() => handleGenerate(p.action)}
                  className="px-3 py-1.5 rounded-full text-xs bg-surface-subtle/80 hover:bg-surface border border-border/60 hover:border-accent/40 text-text-muted hover:text-text-primary transition-all duration-150 flex items-center gap-1.5 shadow-sm"
                >
                  <Wand2 className="w-3 h-3 text-accent" />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Result View */}
        {result && (
          <div className="p-5 max-h-80 overflow-y-auto space-y-4">
            <div className="p-4 rounded-2xl bg-surface-subtle/60 border border-border/60 text-xs leading-relaxed font-sans text-text-primary whitespace-pre-wrap">
              {result}
              {isGenerating && <span className="inline-block w-2 h-4 bg-accent ml-1 animate-pulse" />}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button size="sm" variant="ghost" onClick={() => setResult('')}>
                Try another prompt
              </Button>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => {
                  navigator.clipboard.writeText(result);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                  toast.success('Copied to clipboard');
                }}>
                  {copied ? <Check className="w-3.5 h-3.5 text-semantic-success mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </Button>
                <Button size="sm" onClick={handleInsertBelow} className="rounded-full shadow-floating">
                  <span>Insert in Document</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

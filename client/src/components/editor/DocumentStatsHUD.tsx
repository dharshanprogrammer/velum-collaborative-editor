import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { BookOpen, Clock, Volume2, Sparkles, Hash, AlignLeft, Eye } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { studioSound, SoundProfile } from '../../lib/sound';
import { cn } from '../../lib/utils';

export function DocumentStatsHUD({
  editor,
  scrollContainerRef,
  soundTheme,
}: {
  editor: Editor | null;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  soundTheme?: SoundProfile;
}) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [stats, setStats] = useState({
    words: 0,
    characters: 0,
    readingTimeMinutes: 1,
    paragraphs: 0,
  });

  // Calculate live statistics
  useEffect(() => {
    if (!editor) return;

    const updateStats = () => {
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const characters = text.length;
      const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

      let paragraphs = 0;
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'paragraph' && node.textContent.trim()) {
          paragraphs++;
        }
      });

      setStats({
        words,
        characters,
        readingTimeMinutes,
        paragraphs,
      });
    };

    updateStats();
    editor.on('update', updateStats);
    return () => {
      editor.off('update', updateStats);
    };
  }, [editor]);

  // Track scroll position
  useEffect(() => {
    const target = scrollContainerRef?.current || window;

    const handleScroll = () => {
      let scrollTop = 0;
      let scrollHeight = 0;
      let clientHeight = 0;

      if (scrollContainerRef?.current) {
        scrollTop = scrollContainerRef.current.scrollTop;
        scrollHeight = scrollContainerRef.current.scrollHeight;
        clientHeight = scrollContainerRef.current.clientHeight;
      } else {
        scrollTop = window.scrollY;
        scrollHeight = document.documentElement.scrollHeight;
        clientHeight = window.innerHeight;
      }

      const totalScrollable = scrollHeight - clientHeight;
      if (totalScrollable > 0) {
        const progress = Math.min(100, Math.max(0, Math.round((scrollTop / totalScrollable) * 100)));
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }
    };

    target.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => target.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef]);

  return (
    <>
      {/* Top Hairline Reading Progress Bar */}
      <div className="fixed top-14 left-0 right-0 h-[2px] z-50 pointer-events-none bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-accent via-purple-500 to-pink-500 transition-all duration-150 ease-out shadow-[0_0_8px_rgba(99,102,241,0.6)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Bottom-Right Document HUD Pill */}
      <div className="fixed bottom-5 right-6 z-30 select-none">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-surface/85 backdrop-blur-xl border border-border/80 shadow-floating text-text-muted hover:text-text-primary text-[11px] font-medium transition-all hover:scale-105 group">
              <span className="flex items-center gap-1.5 font-display font-semibold text-text-primary">
                <AlignLeft className="w-3.5 h-3.5 text-accent" />
                <span>{stats.words.toLocaleString()} words</span>
              </span>

              <span className="w-1 h-1 rounded-full bg-border" />

              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-text-muted group-hover:text-accent transition-colors" />
                <span>{stats.readingTimeMinutes}m read</span>
              </span>

              {scrollProgress > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="text-accent font-semibold">{scrollProgress}%</span>
                </>
              )}
            </button>
          </PopoverTrigger>

          <PopoverContent
            side="top"
            align="end"
            className="w-64 p-4 glass-dock border-border/80 shadow-floating space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="text-xs font-bold text-text-primary font-display flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-accent" />
                Document Telemetry
              </span>
              <span className="text-[10px] text-text-muted font-mono">{scrollProgress}% scrolled</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-surface-subtle/80 border border-border/60">
                <div className="text-[10px] text-text-muted uppercase font-semibold">Words</div>
                <div className="text-base font-bold text-text-primary mt-0.5 font-display">
                  {stats.words.toLocaleString()}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-subtle/80 border border-border/60">
                <div className="text-[10px] text-text-muted uppercase font-semibold">Characters</div>
                <div className="text-base font-bold text-text-primary mt-0.5 font-display">
                  {stats.characters.toLocaleString()}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-subtle/80 border border-border/60">
                <div className="text-[10px] text-text-muted uppercase font-semibold">Paragraphs</div>
                <div className="text-base font-bold text-text-primary mt-0.5 font-display">
                  {stats.paragraphs}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-subtle/80 border border-border/60">
                <div className="text-[10px] text-text-muted uppercase font-semibold">Est. Read Time</div>
                <div className="text-base font-bold text-text-primary mt-0.5 font-display">
                  {stats.readingTimeMinutes} min
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 text-[11px] text-text-muted flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-accent" />
                Acoustics: <span className="capitalize text-text-primary font-medium">{soundTheme || 'Silent'}</span>
              </span>
              <span className="text-[10px] font-mono text-accent">0ms CRDT</span>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}

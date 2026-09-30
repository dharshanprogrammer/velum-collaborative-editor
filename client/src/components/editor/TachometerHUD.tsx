import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { Zap, Activity, Gauge, Flame } from 'lucide-react';
import { cn } from '../../lib/utils';

export function TachometerHUD({ editor }: { editor: Editor | null }) {
  const [wpm, setWpm] = useState(0);
  const [gear, setGear] = useState('N');
  const [isRedline, setIsRedline] = useState(false);
  const keystrokeTimestamps = useRef<number[]>([]);
  const decayTimer = useRef<any>(null);

  useEffect(() => {
    if (!editor) return;

    const handleKey = () => {
      const now = performance.now();
      keystrokeTimestamps.current.push(now);

      // Keep only keystrokes within the last 5 seconds
      const windowStart = now - 5000;
      keystrokeTimestamps.current = keystrokeTimestamps.current.filter((t) => t >= windowStart);

      // 5 keystrokes ~ 1 word
      const count = keystrokeTimestamps.current.length;
      const durationMin = Math.max(0.5, (now - (keystrokeTimestamps.current[0] || now)) / 60000);
      const calculatedWpm = Math.min(180, Math.round(count / 5 / durationMin));

      setWpm(calculatedWpm);

      // Determine Gear based on WPM
      if (calculatedWpm === 0) setGear('N');
      else if (calculatedWpm < 25) setGear('1');
      else if (calculatedWpm < 45) setGear('2');
      else if (calculatedWpm < 65) setGear('3');
      else if (calculatedWpm < 85) setGear('4');
      else if (calculatedWpm < 105) setGear('5');
      else if (calculatedWpm < 125) setGear('6');
      else setGear('7');

      setIsRedline(calculatedWpm >= 85);

      // Decay timer if typing pauses
      if (decayTimer.current) clearTimeout(decayTimer.current);
      decayTimer.current = setTimeout(() => {
        setWpm(0);
        setGear('N');
        setIsRedline(false);
        keystrokeTimestamps.current = [];
      }, 2500);
    };

    const dom = editor.view.dom;
    dom.addEventListener('keydown', handleKey);
    return () => {
      dom.removeEventListener('keydown', handleKey);
      if (decayTimer.current) clearTimeout(decayTimer.current);
    };
  }, [editor]);

  // Compute active LEDs (15 LEDs total: 5 Green, 5 Volt Yellow, 5 Purple)
  const maxWpm = 110;
  const activeCount = Math.min(15, Math.round((wpm / maxWpm) * 15));

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 select-none pointer-events-auto">
      <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#07090E]/90 backdrop-blur-2xl border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.8)] card-aurora hover:border-[#DFFF00]/50 transition-all">
        {/* LN // 04 Emblem */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#DFFF00] text-black font-extrabold text-[11px] font-mono tracking-tighter skew-racing">
          <span className="unskew-racing">LN // 04</span>
        </div>

        {/* F1 Shift Light Bar (15 LEDs) */}
        <div className="flex items-center gap-1 px-2">
          {Array.from({ length: 15 }).map((_, idx) => {
            const isActive = idx < activeCount;
            let activeColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]';
            if (idx >= 5 && idx < 10) {
              activeColor = 'bg-[#DFFF00] shadow-[0_0_10px_rgba(223,255,0,0.9)]';
            } else if (idx >= 10) {
              activeColor = 'bg-fuchsia-500 shadow-[0_0_12px_rgba(217,70,239,1)]';
            }

            return (
              <div
                key={idx}
                className={cn(
                  'w-1.5 h-3.5 rounded-sm transition-all duration-75',
                  isActive
                    ? activeColor
                    : 'bg-white/10'
                )}
              />
            );
          })}
        </div>

        {/* Gear Indicator */}
        <div className="flex items-baseline gap-1 font-mono">
          <span className="text-[10px] text-white/50 font-bold uppercase">GEAR</span>
          <span
            className={cn(
              'text-sm font-black transition-colors',
              gear === 'N' ? 'text-white/60' : 'text-[#DFFF00]'
            )}
          >
            {gear}
          </span>
        </div>

        <div className="w-px h-4 bg-white/10" />

        {/* Speed / WPM */}
        <div className="flex items-baseline gap-1 font-mono">
          <span
            className={cn(
              'text-sm font-extrabold tracking-tight transition-colors',
              isRedline ? 'text-fuchsia-400 animate-pulse' : wpm > 40 ? 'text-[#DFFF00]' : 'text-white'
            )}
          >
            {wpm}
          </span>
          <span className="text-[10px] text-white/50 font-bold">WPM</span>
        </div>

        {isRedline && (
          <div className="flex items-center gap-1 text-[10px] font-mono font-black text-[#DFFF00] uppercase tracking-wider bg-[#DFFF00]/15 px-2 py-0.5 rounded border border-[#DFFF00]/30 animate-pulse">
            <Flame className="w-3 h-3 text-[#DFFF00]" />
            <span>PURPLE SECTOR</span>
          </div>
        )}
      </div>
    </div>
  );
}

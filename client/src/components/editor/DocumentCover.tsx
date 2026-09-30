import React, { useState } from 'react';
import { Image, Smile, Trash2, Sparkles } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '../../lib/utils';

export const COVER_GRADIENTS = [
  { id: 'noir', name: 'Noir', css: 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900' },
  { id: 'silver', name: 'Silver Mist', css: 'bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300' },
  { id: 'charcoal', name: 'Charcoal', css: 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900' },
  { id: 'marble', name: 'White Marble', css: 'bg-gradient-to-br from-white via-gray-100 to-gray-200' },
  { id: 'ink', name: 'Ink Wash', css: 'bg-gradient-to-r from-gray-950 via-gray-800 to-gray-950' },
  { id: 'fog', name: 'Morning Fog', css: 'bg-gradient-to-br from-gray-200 via-gray-50 to-gray-300' },
  { id: 'obsidian', name: 'Obsidian', css: 'bg-gradient-to-br from-black via-gray-900 to-gray-800' },
];

export const EMOJI_OPTIONS = ['📄', '✍️', '📝', '💡', '🎯', '📚', '🗂️', '⚡', '🔬', '🎨', '✨', '🧠'];

export function DocumentCover({
  coverId,
  icon,
  onCoverChange,
  onIconChange,
}: {
  coverId?: string | null;
  icon?: string;
  onCoverChange: (coverId: string | null) => void;
  onIconChange: (icon: string) => void;
}) {
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const activeGradient = COVER_GRADIENTS.find((g) => g.id === coverId)?.css;

  return (
    <div className="relative group w-full mb-6 select-none">
      {/* Cover Banner */}
      {coverId ? (
        <div className={cn('w-full h-44 rounded-xl relative overflow-hidden shadow-subtle', activeGradient)}>
          {/* Noise overlay on cover */}
          <div className="absolute inset-0 opacity-[0.08]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
          }} />

          {/* Cover Controls */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-xs text-white">
            <Popover open={coverPickerOpen} onOpenChange={setCoverPickerOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/20 transition-colors">
                  <Image className="w-3.5 h-3.5" />
                  <span>Change</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 glass-dock" align="end">
                <p className="text-xs font-semibold text-text-primary mb-2">Select Cover</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {COVER_GRADIENTS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        onCoverChange(g.id);
                        setCoverPickerOpen(false);
                      }}
                      className={cn(
                        'w-full h-8 rounded-lg text-xs font-medium flex items-center px-3 shadow-sm transition-transform hover:scale-[1.02]',
                        g.css,
                        g.id === 'marble' || g.id === 'silver' || g.id === 'fog' ? 'text-gray-800' : 'text-white'
                      )}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <button
              onClick={() => onCoverChange(null)}
              className="p-1 rounded hover:bg-white/20 transition-colors text-white/80 hover:text-white"
              title="Remove cover"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 mb-2">
          <button
            onClick={() => onCoverChange('noir')}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary px-2.5 py-1 rounded-lg bg-surface-subtle hover:bg-surface border border-border/50 transition-colors"
          >
            <Image className="w-3.5 h-3.5" />
            <span>Add Cover</span>
          </button>
        </div>
      )}

      {/* Document Icon */}
      <div className={cn('flex items-center gap-3', coverId ? '-mt-7 ml-6 relative z-10' : 'mb-2')}>
        <Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
          <PopoverTrigger asChild>
            <button
              className="w-12 h-12 rounded-xl bg-surface border-2 border-background shadow-card flex items-center justify-center text-2xl hover:scale-105 transition-transform"
              title="Change icon"
            >
              <span>{icon || '📄'}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-3 glass-dock" align="start">
            <p className="text-xs font-semibold text-text-primary mb-2 font-display">Pick an Icon</p>
            <div className="grid grid-cols-6 gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    onIconChange(e);
                    setIconPickerOpen(false);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-surface-subtle transition-colors"
                >
                  {e}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

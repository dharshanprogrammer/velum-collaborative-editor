import React from 'react';
import { COLLAB_COLORS, cn } from '../../lib/utils';
import { Check } from 'lucide-react';

export function ColorSwatchPicker({
  selectedIndex,
  onSelectIndex,
}: {
  selectedIndex: number;
  onSelectIndex: (idx: number) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {COLLAB_COLORS.map((hex, idx) => {
        const isSelected = selectedIndex === idx;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectIndex(idx)}
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ring-offset-background',
              isSelected && 'ring-2 ring-accent ring-offset-2'
            )}
            style={{ backgroundColor: hex }}
            aria-label={`Color option ${idx + 1}`}
          >
            {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
          </button>
        );
      })}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CloudOff, RefreshCw, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Tooltip } from '../ui/icon-button';

export type SyncStatus = 'saved' | 'saving' | 'offline' | 'reconnecting' | 'readonly';

export function StatusPill({
  status,
  reconnectCountdown = 5,
}: {
  status: SyncStatus;
  reconnectCountdown?: number;
}) {
  const [debouncedStatus, setDebouncedStatus] = useState<SyncStatus>(status);

  useEffect(() => {
    // 400ms debounce to prevent flicker on rapid keystrokes
    const timer = setTimeout(() => {
      setDebouncedStatus(status);
    }, 350);

    return () => clearTimeout(timer);
  }, [status]);

  const configs = {
    saved: {
      icon: <Check className="w-3.5 h-3.5 text-text-muted" />,
      text: 'Saved',
      color: 'text-text-muted hover:text-text-primary bg-surface-subtle/70 border-border/60',
      tooltip: 'All changes saved locally to IndexedDB & synced to cloud',
    },
    saving: {
      icon: <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />,
      text: 'Saving...',
      color: 'text-accent bg-accent/10 border-accent/20',
      tooltip: 'Syncing changes with collaborators',
    },
    offline: {
      icon: <CloudOff className="w-3.5 h-3.5 text-semantic-warning" />,
      text: 'Offline, saved locally',
      color: 'text-semantic-warning bg-semantic-warning-bg border-semantic-warning/30',
      tooltip: 'No internet connection. Edits persist locally in IndexedDB and sync when online.',
    },
    reconnecting: {
      icon: <RefreshCw className="w-3.5 h-3.5 text-semantic-warning animate-spin" />,
      text: `Reconnecting in ${reconnectCountdown}s...`,
      color: 'text-semantic-warning bg-semantic-warning-bg border-semantic-warning/30',
      tooltip: 'Attempting to reconnect with exponential backoff and jitter',
    },
    readonly: {
      icon: <Lock className="w-3.5 h-3.5 text-text-muted" />,
      text: 'Read-only',
      color: 'text-text-muted bg-surface-subtle border-border',
      tooltip: 'You have viewer permissions on this document',
    },
  };

  const current = configs[debouncedStatus] || configs.saved;

  return (
    <Tooltip content={current.tooltip}>
      <motion.div
        layout
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border select-none transition-colors duration-200 cursor-default',
          current.color
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={debouncedStatus}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5"
          >
            {current.icon}
            <span className="tracking-tight">{current.text}</span>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </Tooltip>
  );
}

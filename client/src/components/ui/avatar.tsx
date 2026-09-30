import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCollabColor, cn } from '../../lib/utils';
import { Tooltip } from './icon-button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export interface AvatarProps {
  name: string;
  colorIndex?: number;
  size?: 'sm' | 'md' | 'lg';
  isOnline?: boolean;
  isIdle?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Avatar({
  name,
  colorIndex = 0,
  size = 'md',
  isOnline = false,
  isIdle = false,
  className,
  onClick,
}: AvatarProps) {
  const color = getCollabColor(colorIndex);
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5 bottom-0 right-0',
    md: 'w-2 h-2 bottom-0 right-0',
    lg: 'w-2.5 h-2.5 bottom-0.5 right-0.5',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full font-semibold text-white select-none ring-2 ring-background transition-transform duration-150',
        onClick && 'cursor-pointer hover:scale-105 active:scale-95',
        isIdle && 'opacity-60 saturate-50',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: color }}
    >
      <span>{initials || '?'}</span>
      {isOnline && (
        <span
          className={cn(
            'absolute rounded-full ring-1.5 ring-background',
            isIdle ? 'bg-semantic-warning' : 'bg-semantic-success',
            dotSizes[size]
          )}
        />
      )}
    </div>
  );
}

export interface AvatarStackProps {
  users: Array<{
    id: string;
    name: string;
    email?: string;
    colorIndex: number;
    isIdle?: boolean;
    isTyping?: boolean;
  }>;
  maxVisible?: number;
  followingUserId?: string | null;
  onSelectUser?: (userId: string) => void;
  size?: 'sm' | 'md';
}

export function AvatarStack({
  users,
  maxVisible = 4,
  followingUserId,
  onSelectUser,
  size = 'md',
}: AvatarStackProps) {
  const visible = users.slice(0, maxVisible);
  const overflow = users.slice(maxVisible);

  return (
    <div className="flex items-center -space-x-2">
      <AnimatePresence>
        {visible.map((u) => {
          const isFollowing = followingUserId === u.id;
          return (
            <motion.div
              key={u.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              <Tooltip
                content={
                  <div className="text-center">
                    <p className="font-semibold">{u.name}</p>
                    {u.isTyping && <p className="text-[10px] text-accent">Typing...</p>}
                    {isFollowing && <p className="text-[10px] text-accent">Following viewport</p>}
                  </div>
                }
              >
                <div className={cn('relative', isFollowing && 'ring-2 ring-accent rounded-full p-0.5')}>
                  <Avatar
                    name={u.name}
                    colorIndex={u.colorIndex}
                    size={size}
                    isOnline
                    isIdle={u.isIdle}
                    onClick={() => onSelectUser?.(u.id)}
                  />
                </div>
              </Tooltip>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {overflow.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-subtle border border-border text-xs font-semibold text-text-muted hover:text-text-primary ring-2 ring-background transition-transform hover:scale-105"
            >
              +{overflow.length}
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" className="w-52 p-2">
            <p className="text-xs font-semibold text-text-muted mb-2 px-1">Other collaborators</p>
            <div className="space-y-1">
              {overflow.map((o) => (
                <div
                  key={o.id}
                  onClick={() => onSelectUser?.(o.id)}
                  className="flex items-center gap-2 p-1.5 rounded-md hover:bg-surface-subtle cursor-pointer text-xs"
                >
                  <Avatar name={o.name} colorIndex={o.colorIndex} size="sm" isOnline />
                  <span className="truncate font-medium">{o.name}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

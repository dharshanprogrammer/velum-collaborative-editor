import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Columns,
  Maximize2,
  Minimize2,
  MessageSquare,
  History,
  Info,
  MoreVertical,
  Download,
  Printer,
  Sparkles,
  Volume2,
  VolumeX,
  FileDown,
} from 'lucide-react';
import { StatusPill, SyncStatus } from './StatusPill';
import { AvatarStack } from '../ui/avatar';
import { Button } from '../ui/button';
import { IconButton } from '../ui/icon-button';
import { CollaboratorPeer, DocumentItem } from '../../types';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../ui/dropdown-menu';
import { SoundProfile } from '../../lib/sound';
import { Kbd } from '../ui/kbd';

export function EditorHeader({
  doc,
  title,
  onTitleChange,
  status,
  peers,
  followingUserId,
  onSelectPeer,
  activeRightTab,
  onToggleRightTab,
  focusMode,
  onToggleFocusMode,
  wideMode,
  onToggleWideMode,
  onOpenShare,
  onOpenExport,
  onOpenAi,
  soundTheme = 'silent',
  onSoundThemeChange,
}: {
  doc: DocumentItem | null;
  title: string;
  onTitleChange: (newTitle: string) => void;
  status: SyncStatus;
  peers: CollaboratorPeer[];
  followingUserId: string | null;
  onSelectPeer: (peerId: string) => void;
  activeRightTab: 'comments' | 'history' | 'info' | null;
  onToggleRightTab: (tab: 'comments' | 'history' | 'info') => void;
  focusMode: boolean;
  onToggleFocusMode: () => void;
  wideMode: boolean;
  onToggleWideMode: () => void;
  onOpenShare: () => void;
  onOpenExport: () => void;
  onOpenAi?: () => void;
  soundTheme?: SoundProfile;
  onSoundThemeChange?: (theme: SoundProfile) => void;
}) {
  const navigate = useNavigate();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);

  const handleBlurTitle = () => {
    setIsEditingTitle(false);
    if (localTitle.trim() && localTitle !== title) {
      onTitleChange(localTitle.trim());
    } else {
      setLocalTitle(title);
    }
  };

  const soundLabels: Record<SoundProfile, { label: string; icon: string }> = {
    silent: { label: 'Silent', icon: '🔇' },
    mechanical: { label: 'Mechanical', icon: '⌨️' },
    felt: { label: 'Felt Thud', icon: '☁️' },
    typewriter: { label: 'Typewriter', icon: '📜' },
  };

  return (
    <header className="h-13 border-b border-border/50 bg-surface/80 backdrop-blur-2xl px-4 flex items-center justify-between sticky top-0 z-40 select-none transition-colors">
      {/* Left: Back & Title */}
      <div className="flex items-center gap-3 max-w-md">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-all"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleBlurTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleBlurTitle();
                if (e.key === 'Escape') {
                  setLocalTitle(title);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              className="text-sm font-semibold text-text-primary bg-surface-subtle px-2 py-0.5 rounded-md border border-text-primary/20 outline-none font-display tracking-tight"
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="text-sm font-semibold text-text-primary hover:bg-surface-subtle px-2 py-1 rounded-md cursor-pointer truncate max-w-[180px] sm:max-w-xs transition-colors font-display tracking-tight"
              title="Click to rename"
            >
              {title || 'Untitled'}
            </h1>
          )}
        </div>

        <StatusPill status={status} />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* AI Assistant */}
        {onOpenAi && (
          <button
            onClick={onOpenAi}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-text-primary/[0.05] hover:bg-text-primary/[0.10] border border-border/50 hover:border-text-primary/20 text-text-primary text-xs font-medium transition-all group"
            title="Open AI Assistant (⌘J)"
          >
            <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            <span className="tracking-tight">AI Assist</span>
            <Kbd className="text-[10px] py-0 px-1 ml-0.5">⌘J</Kbd>
          </button>
        )}

        {/* Sound Switcher */}
        {onSoundThemeChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`p-1.5 rounded-lg transition-all text-xs flex items-center gap-1 px-2.5 ${
                  soundTheme !== 'silent'
                    ? 'bg-text-primary/[0.06] border border-text-primary/15 text-text-primary font-medium shadow-sm'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-subtle'
                }`}
                title="Keystroke Sounds"
              >
                {soundTheme !== 'silent' ? (
                  <Volume2 className="w-3.5 h-3.5" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5" />
                )}
                <span className="hidden lg:inline text-[11px] font-display">
                  {soundLabels[soundTheme].label}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 glass-dock">
              <DropdownMenuLabel className="text-[11px] text-text-muted font-display uppercase tracking-wider">
                Keystroke Sounds
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onSoundThemeChange('silent')}>
                <span className="mr-2">🔇</span>
                <span>Silent (Default)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSoundThemeChange('mechanical')}>
                <span className="mr-2">⌨️</span>
                <span>Mechanical</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSoundThemeChange('felt')}>
                <span className="mr-2">☁️</span>
                <span>Felt Thud</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSoundThemeChange('typewriter')}>
                <span className="mr-2">📜</span>
                <span>Typewriter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <AvatarStack
          users={peers}
          followingUserId={followingUserId}
          onSelectUser={onSelectPeer}
          size="sm"
        />

        <div className="w-px h-4 bg-border/50 mx-1 hidden sm:block" />

        {/* View Toggles */}
        <div className="hidden sm:flex items-center gap-1">
          <IconButton
            icon={<Columns className="w-3.5 h-3.5" />}
            label={wideMode ? 'Standard width' : 'Wide canvas'}
            size="sm"
            active={wideMode}
            onClick={onToggleWideMode}
          />
          <IconButton
            icon={focusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            label={focusMode ? 'Exit focus' : 'Focus mode'}
            shortcut="⌘⇧F"
            size="sm"
            active={focusMode}
            onClick={onToggleFocusMode}
          />
        </div>

        <div className="w-px h-4 bg-border/50 mx-1 hidden sm:block" />

        {/* Right Panel Toggles */}
        <div className="flex items-center gap-1">
          <IconButton
            icon={<MessageSquare className="w-3.5 h-3.5" />}
            label="Comments"
            size="sm"
            active={activeRightTab === 'comments'}
            onClick={() => onToggleRightTab('comments')}
          />
          <IconButton
            icon={<History className="w-3.5 h-3.5" />}
            label="History"
            size="sm"
            active={activeRightTab === 'history'}
            onClick={() => onToggleRightTab('history')}
          />
          <IconButton
            icon={<Info className="w-3.5 h-3.5" />}
            label="Details"
            size="sm"
            active={activeRightTab === 'info'}
            onClick={() => onToggleRightTab('info')}
          />
        </div>

        {/* Share */}
        <Button
          size="sm"
          onClick={onOpenShare}
          className="ml-1 gap-1.5 rounded-lg shadow-subtle px-3.5"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-semibold">Share</span>
        </Button>

        {/* More */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 glass-dock">
            <DropdownMenuItem onClick={onOpenExport}>
              <Download className="w-3.5 h-3.5 mr-2" />
              <span>Export & Publish</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.print()}>
              <Printer className="w-3.5 h-3.5 mr-2" />
              <span>Print / Save PDF</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

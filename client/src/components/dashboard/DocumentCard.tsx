import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MoreVertical, Trash2, Edit3, Share2, ExternalLink, FileText, Globe, Lock, Users } from 'lucide-react';
import { DocumentItem } from '../../types';
import { formatRelativeTime, cn } from '../../lib/utils';
import { AvatarStack } from '../ui/avatar';
import { COVER_GRADIENTS } from '../editor/DocumentCover';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '../ui/context-menu';

export function DocumentCard({
  doc,
  onToggleStar,
  onDelete,
  onRename,
  onShare,
}: {
  doc: DocumentItem;
  onToggleStar: (id: string, starred: boolean) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onShare: (doc: DocumentItem) => void;
}) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(doc.title);

  const handleOpen = () => {
    navigate(`/doc/${doc._id}`);
  };

  const handleSaveTitle = () => {
    setIsEditing(false);
    if (editTitle.trim() && editTitle !== doc.title) {
      onRename(doc._id, editTitle.trim());
    } else {
      setEditTitle(doc.title);
    }
  };

  const previewSnippet = doc.contentPreview || 'Clean stationery page with zero keystroke lag.';
  const membersForStack = (doc.members || []).map((m) => ({
    id: m.user?.id || '',
    name: m.user?.name || 'Collaborator',
    email: m.user?.email,
    colorIndex: m.user?.colorIndex ?? 0,
  }));

  // Resolve cover artwork gradient
  const coverGradient = COVER_GRADIENTS.find((g) => g.id === doc.coverId)?.css || 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900';

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          onClick={handleOpen}
          className="group relative flex flex-col justify-between rounded-xl border border-border/60 bg-surface/80 hover:bg-surface card-aurora cursor-pointer transition-all duration-200 select-none overflow-hidden h-64 shadow-subtle hover:shadow-card hover:border-text-primary/20"
        >
          {/* Top Artwork Strip */}
          <div className={cn('h-14 w-full relative overflow-hidden shrink-0 transition-opacity', coverGradient)}>
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

            {/* Quick Star & Context Actions on Hover */}
            <div
              className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-full text-white/90"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => onToggleStar(doc._id, !doc.isStarred)}
                className="p-1 rounded-full hover:text-amber-300 transition-colors"
                title={doc.isStarred ? 'Unstar' : 'Star'}
              >
                <Star
                  className={cn(
                    'w-3.5 h-3.5 transition-transform hover:scale-110',
                    doc.isStarred ? 'fill-white text-white opacity-100' : ''
                  )}
                />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded-full hover:text-white transition-colors">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 glass-dock">
                  <DropdownMenuItem onClick={handleOpen}>
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                    Open Workspace
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit3 className="w-3.5 h-3.5 mr-2" />
                    Rename (F2)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onShare(doc)}>
                    <Share2 className="w-3.5 h-3.5 mr-2" />
                    Share Access
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem danger onClick={() => onDelete(doc._id)}>
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Move to Trash
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Floating Emblem Badge & Title Header */}
          <div className="px-5 pt-0 -mt-5 relative z-10 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface border-2 border-background shadow-floating flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
              <span>{doc.icon || '📄'}</span>
            </div>

            <div className="min-w-0 flex-1 pt-5">
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') {
                      setEditTitle(doc.title);
                      setIsEditing(false);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  className="font-bold text-sm text-text-primary bg-surface-subtle px-2 py-0.5 rounded-lg border border-text-primary/20 outline-none w-full font-display"
                />
              ) : (
                <h3
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="font-bold text-sm text-text-primary line-clamp-1 group-hover:text-accent transition-colors font-display tracking-tight"
                  title={doc.title}
                >
                  {doc.title}
                </h3>
              )}
              <span className="text-[10px] text-text-muted font-mono block mt-0.5">
                {formatRelativeTime(doc.updatedAt)}
              </span>
            </div>
          </div>

          {/* Content Preview Snippet */}
          <div className="px-5 py-2 flex-1 flex flex-col justify-center">
            <div className="p-2.5 rounded-xl bg-surface-subtle/50 border border-border/40 text-xs text-text-muted leading-relaxed select-none group-hover:bg-surface-subtle/70 transition-colors">
              <p className="line-clamp-2 text-[11px]">{previewSnippet}</p>
            </div>
          </div>

          {/* Card Footer: Access Policy & Collaborator Avatar Stack */}
          <div className="px-5 py-3 border-t border-border/50 flex items-center justify-between text-[11px] text-text-muted bg-surface/30">
            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-text-muted bg-surface-subtle px-2 py-0.5 rounded-full border border-border/60">
              {doc.accessPolicy === 'restricted' ? (
                <>
                  <Lock className="w-2.5 h-2.5 text-text-muted" />
                  <span>Private</span>
                </>
              ) : doc.accessPolicy === 'public_edit' ? (
                <>
                  <Globe className="w-2.5 h-2.5 text-semantic-success" />
                  <span>Public Edit</span>
                </>
              ) : (
                <>
                  <Users className="w-2.5 h-2.5 text-accent" />
                  <span>Team View</span>
                </>
              )}
            </span>

            <div onClick={(e) => e.stopPropagation()}>
              <AvatarStack users={membersForStack} maxVisible={3} size="sm" />
            </div>
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-44 glass-dock">
        <ContextMenuItem onClick={handleOpen}>Open Document</ContextMenuItem>
        <ContextMenuItem onClick={() => setIsEditing(true)}>Rename (F2)</ContextMenuItem>
        <ContextMenuItem onClick={() => onShare(doc)}>Share Access</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem danger onClick={() => onDelete(doc._id)}>
          Move to Trash
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

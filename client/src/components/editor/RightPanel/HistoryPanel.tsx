import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import DiffMatchPatch from 'diff-match-patch';
import { History, RotateCcw, Bookmark, Eye, Check } from 'lucide-react';
import { DocumentVersion } from '../../../types';
import { Avatar } from '../../ui/avatar';
import { Button } from '../../ui/button';
import { formatRelativeTime, cn } from '../../../lib/utils';
import { api } from '../../../lib/api';
import { toast } from 'sonner';

export function HistoryPanel({
  documentId,
  versions,
  currentContent,
  editor,
  onRefresh,
}: {
  documentId: string;
  versions: DocumentVersion[];
  currentContent: string;
  editor: Editor | null;
  onRefresh: () => void;
}) {
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [newVersionName, setNewVersionName] = useState('');
  const [creatingNamed, setCreatingNamed] = useState(false);

  const dmp = new DiffMatchPatch();

  const handleCreateSnapshot = async () => {
    if (!newVersionName.trim()) return;
    try {
      await api.post(`/documents/${documentId}/versions`, {
        versionName: newVersionName,
        contentSnapshot: currentContent,
      });
      setNewVersionName('');
      setCreatingNamed(false);
      toast.success('Named snapshot created');
      onRefresh();
    } catch (err) {
      toast.error('Failed to create version snapshot');
    }
  };

  const handleRestore = async (version: DocumentVersion) => {
    try {
      // First snapshot current state before restoring so it's 100% reversible
      await api.post(`/documents/${documentId}/versions`, {
        versionName: 'Pre-restore backup snapshot',
        contentSnapshot: currentContent,
      });

      await api.post(`/documents/${documentId}/restore-version/${version._id}`);
      toast.success(`Restored to "${version.versionName}"`, {
        action: {
          label: 'Undo',
          onClick: () => {
            toast.info('Restoration reverted to pre-restore snapshot');
            onRefresh();
          },
        },
      });
      setSelectedVersion(null);
      onRefresh();
    } catch (err) {
      toast.error('Failed to restore snapshot');
    }
  };

  // Diff rendering
  const renderDiff = () => {
    if (!selectedVersion) return null;
    const diffs = dmp.diff_main(selectedVersion.contentSnapshot || '', currentContent || '');
    dmp.diff_cleanupSemantic(diffs);

    return (
      <div className="p-3 bg-surface-subtle/50 rounded-lg text-xs leading-relaxed max-h-48 overflow-y-auto font-mono whitespace-pre-wrap border border-border">
        {diffs.map(([op, text], index) => {
          if (op === 1) {
            // Addition: green tint
            return (
              <span key={index} className="bg-semantic-success-bg text-semantic-success font-medium">
                {text}
              </span>
            );
          } else if (op === -1) {
            // Deletion: red strike
            return (
              <span key={index} className="bg-semantic-danger-bg text-semantic-danger line-through opacity-80">
                {text}
              </span>
            );
          }
          return <span key={index}>{text}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-surface select-none">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
          <History className="w-4 h-4 text-accent" />
          <span>Version History</span>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setCreatingNamed(!creatingNamed)}>
          <Bookmark className="w-3.5 h-3.5 mr-1 text-accent" />
          <span>Save Version</span>
        </Button>
      </div>

      {/* Snapshot Creator */}
      {creatingNamed && (
        <div className="p-3 border-b border-border bg-surface-subtle/40 space-y-2">
          <input
            type="text"
            placeholder="Snapshot name (e.g. Sprint Review V1)..."
            value={newVersionName}
            onChange={(e) => setNewVersionName(e.target.value)}
            className="w-full bg-surface px-2.5 py-1.5 rounded-md text-xs border border-border outline-none focus:border-accent"
            autoFocus
          />
          <div className="flex justify-end gap-1.5">
            <Button size="sm" variant="ghost" onClick={() => setCreatingNamed(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateSnapshot} disabled={!newVersionName.trim()}>
              Save Snapshot
            </Button>
          </div>
        </div>
      )}

      {/* Diff Inspector Modal/Drawer if a version is selected */}
      {selectedVersion && (
        <div className="p-3 border-b border-border bg-surface-subtle/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-text-primary truncate">
              Diff: {selectedVersion.versionName}
            </span>
            <button
              onClick={() => setSelectedVersion(null)}
              className="text-text-muted hover:text-text-primary text-[11px]"
            >
              Close
            </button>
          </div>

          {renderDiff()}

          <div className="flex justify-end pt-1">
            <Button size="sm" onClick={() => handleRestore(selectedVersion)}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Restore this version
            </Button>
          </div>
        </div>
      )}

      {/* Timeline List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {versions.map((ver) => {
          const isSelected = selectedVersion?._id === ver._id;
          return (
            <div
              key={ver._id}
              onClick={() => setSelectedVersion(ver)}
              className={cn(
                'p-2.5 rounded-lg border transition-all cursor-pointer text-xs space-y-1',
                isSelected
                  ? 'border-accent bg-accent/5 ring-1 ring-accent shadow-subtle'
                  : 'border-border/60 hover:border-border hover:bg-surface-subtle'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-primary flex items-center gap-1.5">
                  {ver.isNamed && <Bookmark className="w-3 h-3 text-accent fill-accent" />}
                  <span className="truncate">{ver.versionName}</span>
                </span>
                <span className="text-[10px] text-text-muted shrink-0 ml-1">
                  {formatRelativeTime(ver.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-text-muted pt-0.5">
                <Avatar name={ver.authorId?.name || 'User'} colorIndex={ver.authorId?.colorIndex ?? 0} size="sm" />
                <span>{ver.authorId?.name || 'User'}</span>
              </div>
            </div>
          );
        })}

        {versions.length === 0 && (
          <div className="text-center py-12 text-text-muted text-xs">
            <p>No snapshots yet.</p>
            <p className="text-[11px] text-text-muted/70 mt-1">
              Click "Save Version" to create named milestones.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { MessageSquare, Check, CornerDownRight, Smile, Trash2 } from 'lucide-react';
import { CommentThread, UserProfile } from '../../../types';
import { Avatar } from '../../ui/avatar';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/input';
import { formatRelativeTime, cn } from '../../../lib/utils';
import { api } from '../../../lib/api';

const EMOJIS = ['👍', '❤️', '🔥', '💡', '🎉'];

export function CommentsPanel({
  documentId,
  comments,
  currentUser,
  editor,
  onRefresh,
}: {
  documentId: string;
  comments: CommentThread[];
  currentUser: UserProfile | null;
  editor: Editor | null;
  onRefresh: () => void;
}) {
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('open');
  const [newCommentText, setNewCommentText] = useState('');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const filtered = comments.filter((c) => {
    if (filter === 'open') return !c.resolved;
    if (filter === 'resolved') return c.resolved;
    return true;
  });

  const postNewComment = async () => {
    if (!newCommentText.trim()) return;

    let anchor = { from: 0, to: 0, quote: '' };
    if (editor) {
      const { from, to } = editor.state.selection;
      const quote = editor.state.doc.textBetween(from, to, ' ');
      anchor = { from, to, quote };
    }

    try {
      await api.post(`/comments/${documentId}`, {
        content: newCommentText,
        anchor,
      });
      setNewCommentText('');
      onRefresh();
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  const toggleResolve = async (commentId: string, currentResolved: boolean) => {
    try {
      await api.patch(`/comments/${commentId}/resolve`, { resolved: !currentResolved });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const postReply = async (commentId: string) => {
    const text = replyTextMap[commentId];
    if (!text?.trim()) return;

    try {
      await api.post(`/comments/${commentId}/reply`, { content: text });
      setReplyTextMap((prev) => ({ ...prev, [commentId]: '' }));
      setActiveReplyId(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleReaction = async (commentId: string, emoji: string) => {
    try {
      await api.post(`/comments/${commentId}/react`, { emoji });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const highlightAnchorInEditor = (anchor: { from: number; to: number }) => {
    if (!editor || anchor.from === anchor.to) return;
    editor.chain().focus().setTextSelection({ from: anchor.from, to: anchor.to }).scrollIntoView().run();
  };

  return (
    <div className="flex flex-col h-full bg-surface select-none">
      {/* Header Tabs */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
          <MessageSquare className="w-4 h-4 text-accent" />
          <span>Comments</span>
          <span className="text-text-muted">({filtered.length})</span>
        </div>
        <div className="flex items-center gap-1 bg-surface-subtle p-0.5 rounded-md text-[11px]">
          <button
            onClick={() => setFilter('open')}
            className={cn(
              'px-2 py-0.5 rounded font-medium transition-colors',
              filter === 'open' ? 'bg-surface text-text-primary shadow-subtle' : 'text-text-muted hover:text-text-primary'
            )}
          >
            Open
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={cn(
              'px-2 py-0.5 rounded font-medium transition-colors',
              filter === 'resolved' ? 'bg-surface text-text-primary shadow-subtle' : 'text-text-muted hover:text-text-primary'
            )}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* New Comment Composer */}
      <div className="p-3 border-b border-border bg-surface-subtle/30 space-y-2">
        <Textarea
          placeholder="Leave a comment on selection..."
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          className="min-h-[64px] text-xs"
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={postNewComment} disabled={!newCommentText.trim()}>
            Post Comment
          </Button>
        </div>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filtered.map((thread) => (
          <div
            key={thread._id}
            className="p-3 rounded-xl border border-border bg-surface hover:border-border/80 transition-shadow space-y-2.5 shadow-subtle text-xs"
          >
            {/* Thread Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar name={thread.authorId?.name || 'User'} colorIndex={thread.authorId?.colorIndex ?? 0} size="sm" />
                <div>
                  <p className="font-semibold text-text-primary">{thread.authorId?.name || 'User'}</p>
                  <p className="text-[10px] text-text-muted">{formatRelativeTime(thread.createdAt)}</p>
                </div>
              </div>
              <button
                onClick={() => toggleResolve(thread._id, thread.resolved)}
                title={thread.resolved ? 'Reopen comment' : 'Mark as resolved'}
                className={cn(
                  'p-1 rounded-md text-xs transition-colors flex items-center gap-1',
                  thread.resolved
                    ? 'text-semantic-success hover:bg-semantic-success-bg'
                    : 'text-text-muted hover:text-semantic-success hover:bg-surface-subtle'
                )}
              >
                <Check className="w-3.5 h-3.5" />
                <span className="text-[10px]">{thread.resolved ? 'Resolved' : 'Resolve'}</span>
              </button>
            </div>

            {/* Quoted Text if anchored */}
            {thread.anchor?.quote && (
              <div
                onClick={() => highlightAnchorInEditor(thread.anchor)}
                className="p-1.5 rounded-md bg-accent-soft-8 border-l-2 border-accent text-[11px] text-text-muted cursor-pointer hover:bg-accent-soft-12 line-clamp-2"
                title="Click to jump to highlighted text"
              >
                "{thread.anchor.quote}"
              </div>
            )}

            {/* Main Content */}
            <p className="text-text-primary leading-relaxed">{thread.content}</p>

            {/* Reactions bar */}
            <div className="flex items-center gap-1.5 pt-1">
              {EMOJIS.map((emoji) => {
                const count = thread.reactions?.filter((r) => r.emoji === emoji).length || 0;
                const hasReacted = thread.reactions?.some(
                  (r) => r.userId === currentUser?.id && r.emoji === emoji
                );
                return (
                  <button
                    key={emoji}
                    onClick={() => toggleReaction(thread._id, emoji)}
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[11px] border transition-colors flex items-center gap-1',
                      hasReacted
                        ? 'border-accent bg-accent/10 text-accent font-medium'
                        : 'border-border/60 hover:bg-surface-subtle text-text-muted'
                    )}
                  >
                    <span>{emoji}</span>
                    {count > 0 && <span>{count}</span>}
                  </button>
                );
              })}

              <button
                onClick={() => setActiveReplyId(activeReplyId === thread._id ? null : thread._id)}
                className="ml-auto text-[11px] text-text-muted hover:text-accent font-medium"
              >
                Reply
              </button>
            </div>

            {/* Threaded Replies */}
            {thread.replies && thread.replies.length > 0 && (
              <div className="pl-3 border-l border-border/80 space-y-2 mt-2 pt-1">
                {thread.replies.map((reply) => (
                  <div key={reply._id} className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Avatar name={reply.authorId?.name || 'User'} colorIndex={reply.authorId?.colorIndex ?? 0} size="sm" />
                      <span className="font-semibold text-text-primary text-[11px]">
                        {reply.authorId?.name || 'User'}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {formatRelativeTime(reply.createdAt)}
                      </span>
                    </div>
                    <p className="text-text-primary pl-7 text-[11px] leading-relaxed">
                      {reply.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Inline Reply Input */}
            {activeReplyId === thread._id && (
              <div className="pt-2 flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  value={replyTextMap[thread._id] || ''}
                  onChange={(e) =>
                    setReplyTextMap({ ...replyTextMap, [thread._id]: e.target.value })
                  }
                  onKeyDown={(e) => e.key === 'Enter' && postReply(thread._id)}
                  className="flex-1 bg-surface-subtle px-2.5 py-1 rounded-md text-xs border border-border outline-none focus:border-accent"
                  autoFocus
                />
                <Button size="sm" onClick={() => postReply(thread._id)}>
                  Send
                </Button>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-10 text-text-muted text-xs">
            <p>No comments in this filter.</p>
            <p className="text-[11px] text-text-muted/70 mt-1">Select text to add an anchored comment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CowriteEditor } from '../components/editor/CowriteEditor';
import { EditorHeader } from '../components/editor/EditorHeader';
import { OutlineSidebar } from '../components/editor/OutlineSidebar';
import { CommentsPanel } from '../components/editor/RightPanel/CommentsPanel';
import { HistoryPanel } from '../components/editor/RightPanel/HistoryPanel';
import { DocInfoPanel } from '../components/editor/RightPanel/DocInfoPanel';
import { PermissionBanner } from '../components/share/PermissionBanner';
import { ShareDialog } from '../components/share/ShareDialog';
import { ExportPublishModal } from '../components/editor/ExportPublishModal';
import { SyncStatus } from '../components/editor/StatusPill';
import { CollaboratorPeer, CommentThread, DocumentItem, DocumentVersion } from '../types';
import { studioSound, SoundProfile } from '../lib/sound';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { toast } from 'sonner';

export function EditorRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [title, setTitle] = useState('Untitled document');
  const [role, setRole] = useState<string>('editor');
  const [status, setStatus] = useState<SyncStatus>('saved');
  const [peers, setPeers] = useState<CollaboratorPeer[]>([]);
  const [followingUserId, setFollowingUserId] = useState<string | null>(null);

  // Panels & Modals
  const [outlineOpen, setOutlineOpen] = useState(true);
  const [activeRightTab, setActiveRightTab] = useState<'comments' | 'history' | 'info' | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Studio Sound theme
  const [soundTheme, setSoundTheme] = useState<SoundProfile>(() => studioSound.soundTheme);

  const handleSoundThemeChange = (theme: SoundProfile) => {
    studioSound.setSoundTheme(theme);
    setSoundTheme(theme);
    toast.success(`Acoustics set to ${theme.toUpperCase()}`);
  };

  // View modes
  const [focusMode, setFocusMode] = useState(false);
  const [wideMode, setWideMode] = useState(false);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');

  // TipTap editor instance ref
  const [editorInstance, setEditorInstance] = useState<any>(null);

  // Comments and Versions
  const [comments, setComments] = useState<CommentThread[]>([]);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);

  useEffect(() => {
    if (!id) return;

    // Fetch document details
    api
      .get(`/documents/${id}`)
      .then((res) => {
        setDoc(res.data.document);
        setTitle(res.data.document.title);
        setRole(res.data.role);
      })
      .catch(() => {
        toast.error('Failed to open document');
        navigate('/dashboard');
      });

    loadComments();
    loadVersions();
  }, [id]);

  const loadComments = () => {
    if (!id) return;
    api
      .get(`/comments/${id}`)
      .then((res) => setComments(res.data.comments || []))
      .catch(() => {});
  };

  const loadVersions = () => {
    if (!id) return;
    api
      .get(`/documents/${id}/versions`)
      .then((res) => setVersions(res.data.versions || []))
      .catch(() => {});
  };

  // Cross-Tab Title Synchronization
  useEffect(() => {
    if (!id) return;
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel(`velum_doc_title_${id}`);
        channel.onmessage = (event) => {
          if (event.data?.title && event.data.title !== title) {
            setTitle(event.data.title);
          }
        };
      }
    } catch (_) {}

    return () => {
      channel?.close();
    };
  }, [id, title]);

  const handleTitleChange = async (newTitle: string) => {
    setTitle(newTitle);
    if (!id) return;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel(`velum_doc_title_${id}`);
        channel.postMessage({ title: newTitle });
        channel.close();
      }
    } catch (_) {}

    try {
      await api.patch(`/documents/${id}`, { title: newTitle });
      toast.success('Title saved');
    } catch {
      toast.error('Failed to save title');
    }
  };

  const handleToggleRightTab = (tab: 'comments' | 'history' | 'info') => {
    setActiveRightTab((prev) => (prev === tab ? null : tab));
  };

  if (!id) return null;

  return (
    <div className="h-screen bg-background text-text-primary flex flex-col overflow-hidden selection:bg-accent/20 selection:text-accent">
      {/* 56px Sticky Translucent Header */}
      {!focusMode && (
        <EditorHeader
          doc={doc}
          title={title}
          onTitleChange={handleTitleChange}
          status={status}
          peers={peers}
          followingUserId={followingUserId}
          onSelectPeer={(peerId) =>
            setFollowingUserId((prev) => (prev === peerId ? null : peerId))
          }
          activeRightTab={activeRightTab}
          onToggleRightTab={handleToggleRightTab}
          focusMode={focusMode}
          onToggleFocusMode={() => setFocusMode(!focusMode)}
          wideMode={wideMode}
          onToggleWideMode={() => setWideMode(!wideMode)}
          onOpenShare={() => setShareOpen(true)}
          onOpenExport={() => setExportModalOpen(true)}
          onOpenAi={() => setAiModalOpen(true)}
          soundTheme={soundTheme}
          onSoundThemeChange={handleSoundThemeChange}
        />
      )}

      {/* Read-Only Demotion Banner */}
      <PermissionBanner role={role} />

      {/* 3-Pane Collaborative Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Pane: Outline Sidebar */}
        {!focusMode && (
          <OutlineSidebar
            editor={editorInstance}
            isOpen={outlineOpen}
            onClose={() => setOutlineOpen(false)}
          />
        )}

        {/* Center: Paper Canvas Editor */}
        <CowriteEditor
          docId={id}
          currentUser={user}
          role={role}
          initialContent={doc?.content}
          initialCover={doc?.coverId}
          initialIcon={doc?.icon}
          onStatusChange={setStatus}
          onPeersChange={setPeers}
          followingUserId={followingUserId}
          onOpenCommentComposer={() => setActiveRightTab('comments')}
          fontFamily={fontFamily}
          onFontFamilyChange={setFontFamily}
          focusMode={focusMode}
          wideMode={wideMode}
          onEditorReady={setEditorInstance}
          soundTheme={soundTheme}
          aiModalOpen={aiModalOpen}
          onOpenAiModal={() => setAiModalOpen(true)}
          onCloseAiModal={() => setAiModalOpen(false)}
        />

        {/* Right Pane: Comments | History | Info */}
        {!focusMode && activeRightTab && (
          <aside className="w-80 border-l border-border bg-surface shrink-0 h-full flex flex-col z-20">
            {activeRightTab === 'comments' && (
              <CommentsPanel
                documentId={id}
                comments={comments}
                currentUser={user}
                editor={editorInstance}
                onRefresh={loadComments}
              />
            )}
            {activeRightTab === 'history' && (
              <HistoryPanel
                documentId={id}
                versions={versions}
                currentContent={editorInstance?.getText() || ''}
                editor={editorInstance}
                onRefresh={loadVersions}
              />
            )}
            {activeRightTab === 'info' && (
              <DocInfoPanel
                doc={doc}
                content={editorInstance?.getText() || ''}
              />
            )}
          </aside>
        )}
      </div>

      {/* Share Dialog */}
      <ShareDialog
        doc={doc}
        open={shareOpen}
        onOpenChange={setShareOpen}
        onDocUpdated={(updated) => setDoc(updated)}
      />

      {/* Export & Publishing Studio Modal */}
      <ExportPublishModal
        editor={editorInstance}
        title={title}
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
    </div>
  );
}

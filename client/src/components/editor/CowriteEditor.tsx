import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import * as syncProtocol from 'y-protocols/sync';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';

import { Callout } from './extensions/Callout';
import { FixedToolbar } from './FixedToolbar';
import { BubbleToolbar } from './BubbleToolbar';
import { SlashMenu } from './SlashMenu';
import { FindReplaceModal } from './FindReplaceModal';
import { DocumentCover } from './DocumentCover';
import { AiCompanionModal } from './AiCompanionModal';
import { DocumentStatsHUD } from './DocumentStatsHUD';
import { SyncStatus } from './StatusPill';
import { CollaboratorPeer, UserProfile } from '../../types';
import { studioSound, SoundProfile } from '../../lib/sound';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';



export function CowriteEditor({
  docId,
  currentUser,
  role,
  initialContent,
  initialCover,
  initialIcon,
  onStatusChange,
  onPeersChange,
  followingUserId,
  onOpenCommentComposer,
  fontFamily = 'sans',
  onFontFamilyChange,
  focusMode = false,
  wideMode = false,
  typewriterScroll = false,
  onEditorReady,
  soundTheme = 'silent',
  aiModalOpen = false,
  onOpenAiModal,
  onCloseAiModal,
}: {
  docId: string;
  currentUser: UserProfile | null;
  role: string;
  initialContent?: string;
  initialCover?: string | null;
  initialIcon?: string;
  onStatusChange: (status: SyncStatus) => void;
  onPeersChange: (peers: CollaboratorPeer[]) => void;
  followingUserId: string | null;
  onOpenCommentComposer?: () => void;
  fontFamily?: 'sans' | 'serif' | 'mono';
  onFontFamilyChange: (font: 'sans' | 'serif' | 'mono') => void;
  focusMode?: boolean;
  wideMode?: boolean;
  typewriterScroll?: boolean;
  onEditorReady?: (editor: any) => void;
  soundTheme?: SoundProfile;
  aiModalOpen?: boolean;
  onOpenAiModal?: () => void;
  onCloseAiModal?: () => void;
}) {
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashMenuPos, setSlashMenuPos] = useState({ top: 0, left: 0 });
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [peers, setPeers] = useState<Map<string, CollaboratorPeer>>(new Map());
  const [localAiOpen, setLocalAiOpen] = useState(false);
  const hasLoadedInitialContent = useRef(false);
  const autoSaveTimerRef = useRef<any>(null);

  // Cover Artwork and Emoji Badge
  const [coverId, setCoverId] = useState<string | null>(() => {
    return initialCover || localStorage.getItem(`velum_cover_${docId}`) || null;
  });
  const [docIcon, setDocIcon] = useState<string>(() => {
    return initialIcon || localStorage.getItem(`velum_icon_${docId}`) || '📄';
  });

  // Sync initial cover/icon if passed from parent doc fetch
  useEffect(() => {
    if (initialCover !== undefined) setCoverId(initialCover);
  }, [initialCover]);

  useEffect(() => {
    if (initialIcon !== undefined) setDocIcon(initialIcon);
  }, [initialIcon]);

  const tabIdRef = useRef(`tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  const applyRemoteContentRef = useRef<(content: string) => void>(() => {});

  const handleCoverChange = async (newCover: string | null) => {
    setCoverId(newCover);
    if (newCover) {
      localStorage.setItem(`velum_cover_${docId}`, newCover);
    } else {
      localStorage.removeItem(`velum_cover_${docId}`);
    }

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel(`velum_doc_channel_${docId}`);
        channel.postMessage({ type: 'DOC_COVER_UPDATE', coverId: newCover, tabId: tabIdRef.current });
        channel.close();
      }
    } catch (_) {}

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: 'DOC_META_UPDATE', coverId: newCover, tabId: tabIdRef.current })
      );
    }

    try {
      await api.patch(`/documents/${docId}`, { coverId: newCover });
    } catch (_) {}
  };

  const handleIconChange = async (newIcon: string) => {
    setDocIcon(newIcon);
    localStorage.setItem(`velum_icon_${docId}`, newIcon);

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel(`velum_doc_channel_${docId}`);
        channel.postMessage({ type: 'DOC_ICON_UPDATE', icon: newIcon, tabId: tabIdRef.current });
        channel.close();
      }
    } catch (_) {}

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: 'DOC_META_UPDATE', icon: newIcon, tabId: tabIdRef.current })
      );
    }

    try {
      await api.patch(`/documents/${docId}`, { icon: newIcon });
    } catch (_) {}
  };

  const ydocRef = useRef<Y.Doc>(new Y.Doc());
  const wsRef = useRef<WebSocket | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Auto-Save function: saves to local-storage instantly & debounces REST patch
  const persistContent = (htmlContent: string, plainText: string) => {
    if (role === 'viewer') return;

    // 1. Immediately persist locally (0ms durability)
    localStorage.setItem(`velum_content_${docId}`, htmlContent);

    // 2. Broadcast immediately to other tabs in the same browser (0ms intra-browser)
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel(`velum_doc_channel_${docId}`);
        channel.postMessage({
          type: 'DOC_CONTENT_UPDATE',
          content: htmlContent,
          tabId: tabIdRef.current,
        });
        channel.close();
      }
    } catch (_) {}

    // 3. Broadcast to real-time peers over WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'DOC_CONTENT_UPDATE',
          content: htmlContent,
          senderId: currentUser?.id,
          tabId: tabIdRef.current,
        })
      );
    }

    // 4. Debounced cloud persist to MongoDB
    onStatusChange('saving');
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await api.patch(`/documents/${docId}`, {
          content: htmlContent,
          contentPreview: plainText.slice(0, 160),
        });
        onStatusChange('saved');
      } catch (err) {
        console.error('[Cloud Save Error]:', err);
        onStatusChange('offline');
      }
    }, 600);
  };

  // Initialize TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: {},
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Callout,
      CharacterCount,
      Placeholder.configure({
        placeholder: "Press '/' for commands, ⌘J for AI, or start typing thoughts...",
      }),
    ],
    content: initialContent || localStorage.getItem(`velum_content_${docId}`) || '',
    editable: role !== 'viewer',
    editorProps: {
      handleKeyDown: (_, event) => {
        studioSound.playKeystroke(event.key);
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      persistContent(ed.getHTML(), ed.getText());

      if (typewriterScroll) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const rect = selection.getRangeAt(0).getBoundingClientRect();
          const targetY = window.innerHeight / 2;
          const diff = rect.top - targetY;
          if (Math.abs(diff) > 40) {
            scrollContainerRef.current?.scrollBy({ top: diff, behavior: 'smooth' });
          }
        }
      }
    },
  });

  const applyRemoteContent = (newContent: string) => {
    if (!editor || newContent === undefined || newContent === null) return;
    const currentHtml = editor.getHTML();
    if (currentHtml === newContent) return;

    const { from, to } = editor.state.selection;
    editor.commands.setContent(newContent, false);
    try {
      const docSize = editor.state.doc.content.size;
      if (from <= docSize && to <= docSize) {
        editor.commands.setTextSelection({ from, to });
      }
    } catch (_) {}

    localStorage.setItem(`velum_content_${docId}`, newContent);
    onStatusChange('saved');
  };

  useEffect(() => {
    applyRemoteContentRef.current = applyRemoteContent;
  });

  // Cross-Tab Instant Synchronization (0ms intra-browser via BroadcastChannel)
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel(`velum_doc_channel_${docId}`);
        channel.onmessage = (event) => {
          const data = event.data;
          if (!data || data.tabId === tabIdRef.current) return;

          if (data.type === 'DOC_CONTENT_UPDATE' && data.content !== undefined) {
            applyRemoteContentRef.current(data.content);
          } else if (data.type === 'DOC_COVER_UPDATE') {
            setCoverId(data.coverId);
          } else if (data.type === 'DOC_ICON_UPDATE') {
            setDocIcon(data.icon);
          }
        };
      }
    } catch (err) {
      console.warn('[BroadcastChannel Warning]:', err);
    }

    return () => {
      channel?.close();
    };
  }, [docId, editor]);

  // When initialContent arrives asynchronously, populate if editor is clean
  useEffect(() => {
    if (editor && initialContent !== undefined && !hasLoadedInitialContent.current) {
      const currentText = editor.getText().trim();
      const localCached = localStorage.getItem(`velum_content_${docId}`);
      
      // If we have content from server and editor is empty or pristine
      if (initialContent && (!currentText || !localCached)) {
        editor.commands.setContent(initialContent);
      }
      hasLoadedInitialContent.current = true;
    }
  }, [editor, initialContent, docId]);

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor]);

  // Connect local-first persistence via y-indexeddb
  useEffect(() => {
    const ydoc = ydocRef.current;
    const dbProvider = new IndexeddbPersistence(`cowrite_doc_${docId}`, ydoc);

    dbProvider.on('synced', () => {
      onStatusChange('saved');
    });

    return () => {
      dbProvider.destroy();
    };
  }, [docId]);

  // Connect real-time WebSocket CRDT sync
  useEffect(() => {
    const token = localStorage.getItem('cowrite_token');
    if (!token || !docId) return;

    let reconnectAttempts = 0;
    let reconnectTimeout: any = null;
    let isUnmounted = false;

    const connectWS = () => {
      let wsBase = import.meta.env.VITE_WS_URL;
      if (!wsBase && import.meta.env.VITE_API_URL) {
        wsBase = import.meta.env.VITE_API_URL
          .replace(/\/api\/?$/, '')
          .replace(/\/+$/, '')
          .replace(/^http:/, 'ws:')
          .replace(/^https:/, 'wss:');
      }
      if (!wsBase) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'localhost:5000' : window.location.host;
        wsBase = `${protocol}//${wsHost}`;
      }
      const wsUrl = `${wsBase.replace(/\/+$/, '').replace(/\/ws$/, '')}/ws?token=${token}&docId=${docId}`;

      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttempts = 0;
        onStatusChange('saved');

        // Send Sync Step 1
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, 0); // messageSync = 0
        syncProtocol.writeSyncStep1(encoder, ydocRef.current);
        ws.send(encoding.toUint8Array(encoder));
      };

      ws.onmessage = (event) => {
        try {
          let json: any = null;
          if (typeof event.data === 'string') {
            try {
              json = JSON.parse(event.data);
            } catch (_) {}
          } else if (event.data instanceof ArrayBuffer) {
            try {
              const text = new TextDecoder().decode(event.data);
              const trimmed = text.trim();
              if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                json = JSON.parse(trimmed);
              }
            } catch (_) {}
          }

          if (json) {
            if (json.type === 'PEER_JOINED' && json.user) {
              studioSound.playJoinChime();
              setPeers((prev) => {
                const updated = new Map(prev);
                updated.set(json.user.id, {
                  ...json.user,
                  lastActive: Date.now(),
                });
                onPeersChange(Array.from(updated.values()));
                return updated;
              });
            } else if (json.type === 'PEER_LEFT' && json.userId) {
              setPeers((prev) => {
                const updated = new Map(prev);
                updated.delete(json.userId);
                onPeersChange(Array.from(updated.values()));
                return updated;
              });
            } else if (json.type === 'DOC_CONTENT_UPDATE') {
              if (json.tabId !== tabIdRef.current && json.content !== undefined) {
                applyRemoteContentRef.current(json.content);
              }
            } else if (json.type === 'DOC_META_UPDATE') {
              if (json.tabId !== tabIdRef.current) {
                if (json.coverId !== undefined) setCoverId(json.coverId);
                if (json.icon !== undefined) setDocIcon(json.icon);
              }
            } else if (json.type === 'ROLE_CHANGED' && json.newRole) {
              if (editor) {
                editor.setEditable(json.newRole !== 'viewer');
              }
            }
            return;
          }

          // Handle Binary CRDT Yjs Protocol Packets
          const data = new Uint8Array(event.data);
          const decoder = decoding.createDecoder(data);
          const messageType = decoding.readVarUint(decoder);

          if (messageType === 0) {
            const syncMessageType = decoding.readVarUint(decoder);
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, 0);

            if (syncMessageType === 0) {
              syncProtocol.writeSyncStep2(encoder, ydocRef.current, decoding.readVarUint8Array(decoder));
              ws.send(encoding.toUint8Array(encoder));
            } else if (syncMessageType === 1 || syncMessageType === 2) {
              const update = decoding.readVarUint8Array(decoder);
              Y.applyUpdate(ydocRef.current, update, 'server');
            }
          }
        } catch (err) {
          console.error('[WS Sync] error handling message:', err);
        }
      };

      ws.onerror = () => {
        onStatusChange('reconnecting');
      };

      ws.onclose = () => {
        if (isUnmounted) return;
        onStatusChange('reconnecting');
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
        reconnectAttempts++;
        reconnectTimeout = setTimeout(connectWS, delay);
      };
    };

    connectWS();

    return () => {
      isUnmounted = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [docId]);

  // Keyboard shortcut listener for Cmd+S (Save), Cmd+F (Find), Cmd+J (AI), Slash Menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (editor) {
          const html = editor.getHTML();
          localStorage.setItem(`velum_content_${docId}`, html);
          onStatusChange('saving');
          api
            .patch(`/documents/${docId}`, {
              content: html,
              contentPreview: editor.getText().slice(0, 160),
            })
            .then(() => {
              onStatusChange('saved');
              toast.success('Document saved to cloud');
            })
            .catch(() => {
              toast.error('Failed to sync to cloud');
            });
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setFindReplaceOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        if (onOpenAiModal) {
          onOpenAiModal();
        } else {
          setLocalAiOpen(true);
        }
      } else if (e.key === '/') {
        setTimeout(() => {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const rect = selection.getRangeAt(0).getBoundingClientRect();
            setSlashMenuPos({ top: rect.top + window.scrollY, left: rect.left });
            setSlashMenuOpen(true);
          }
        }, 10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor, docId, onOpenAiModal]);

  const fontClasses = {
    sans: 'font-sans',
    serif: 'font-serif text-[19px] leading-[1.85]',
    mono: 'font-mono text-[15px]',
  }[fontFamily];

  const isAiActive = aiModalOpen || localAiOpen;
  const handleCloseAi = () => {
    setLocalAiOpen(false);
    if (onCloseAiModal) onCloseAiModal();
  };

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 flex flex-col h-full bg-background relative overflow-y-auto bg-mesh-glow scroll-smooth"
    >
      {/* Top Floating Island Toolbar */}
      {!focusMode && (
        <FixedToolbar
          editor={editor}
          fontFamily={fontFamily}
          onFontFamilyChange={onFontFamilyChange}
        />
      )}

      {/* Floating Bubble Toolbar */}
      <BubbleToolbar editor={editor} onAddComment={onOpenCommentComposer} />

      {/* Slash Menu */}
      <SlashMenu
        editor={editor}
        isOpen={slashMenuOpen}
        onClose={() => setSlashMenuOpen(false)}
        position={slashMenuPos}
      />

      {/* Find and Replace Modal */}
      <FindReplaceModal
        editor={editor}
        open={findReplaceOpen}
        onClose={() => setFindReplaceOpen(false)}
      />

      {/* Spotlight AI Companion Modal (⌘J) */}
      <AiCompanionModal
        editor={editor}
        open={isAiActive}
        onClose={handleCloseAi}
      />

      {/* Live Reading Progress & Telemetry HUD */}
      <DocumentStatsHUD
        editor={editor}
        scrollContainerRef={scrollContainerRef}
        soundTheme={soundTheme}
      />



      {/* Centered Stationery Canvas */}
      <main
        className={cn(
          'flex-1 flex justify-center py-8 px-4 sm:px-8 transition-all duration-300',
          focusMode && 'py-16'
        )}
      >
        <div
          ref={editorContainerRef}
          className={cn(
            'w-full bg-surface/90 backdrop-blur-md rounded-3xl p-8 sm:p-14 shadow-floating border border-border/80 transition-all duration-300 relative min-h-[750px]',
            wideMode ? 'max-w-5xl' : 'max-w-[830px]',
            focusMode && 'zen-focus-mode',
            fontClasses
          )}
        >
          {/* Subtle decorative editorial accent */}
          <div className="absolute top-0 inset-x-12 h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent rounded-full" />

          {/* Artistic Document Cover Artwork & Emoji Badge */}
          <DocumentCover
            coverId={coverId}
            icon={docIcon}
            onCoverChange={handleCoverChange}
            onIconChange={handleIconChange}
          />

          {/* ProseMirror Content Area */}
          <EditorContent editor={editor} />
        </div>
      </main>
    </div>
  );
}

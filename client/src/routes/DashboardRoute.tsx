import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  List as ListIcon,
  Plus,
  Search,
  FileText,
  Trash2,
  Users,
  Target,
  Calendar,
  Activity,
  Star,
  MoreVertical,
  ExternalLink,
  Share2,
  ArrowUpRight,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { DocumentCard } from '../components/dashboard/DocumentCard';
import { TemplatePickerModal } from '../components/dashboard/TemplatePickerModal';
import { ShareDialog } from '../components/share/ShareDialog';
import { DocumentGridSkeleton } from '../components/ui/skeleton';
import { EmptyState } from '../components/ui/empty-state';
import { Button } from '../components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { DocumentItem } from '../types';
import { formatRelativeTime } from '../lib/utils';
import { api } from '../lib/api';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';

const QUICK_STARTERS = [
  {
    id: 'blank',
    title: 'Blank Canvas',
    desc: 'Start with a clean slate',
    icon: FileText,
    accent: 'bg-gradient-to-br from-accent to-accent-secondary text-white',
  },
  {
    id: 'meeting-notes',
    title: 'Meeting Notes',
    desc: 'Agendas, decisions & action items',
    icon: Users,
    accent: 'bg-surface-subtle/60 text-text-primary border border-border/40',
  },
  {
    id: 'project-brief',
    title: 'Project Brief',
    desc: 'Goals, milestones & deliverables',
    icon: Target,
    accent: 'bg-surface-subtle/60 text-text-primary border border-border/40',
  },
  {
    id: 'weekly-report',
    title: 'Weekly Report',
    desc: 'Progress, blockers & next steps',
    icon: Calendar,
    accent: 'bg-surface-subtle/60 text-text-primary border border-border/40',
  },
];

export function DashboardRoute({ onOpenCommandPalette }: { onOpenCommandPalette: () => void }) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'shared' | 'starred' | 'trash'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [shareDoc, setShareDoc] = useState<DocumentItem | null>(null);

  const { user, createGuestSession } = useAuth();
  const navigate = useNavigate();

  const fetchDocs = async () => {
    try {
      const token = localStorage.getItem('cowrite_token');
      if (!token) {
        await createGuestSession();
      }
      const res = await api.get('/documents', {
        params: {
          filter: activeFilter,
          search: searchQuery,
        },
      });
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [activeFilter, searchQuery]);

  const handleCreateDocument = async (templateId: string = 'blank') => {
    try {
      let token = localStorage.getItem('cowrite_token');
      if (!token) {
        await createGuestSession();
      }
      const res = await api.post('/documents', { template: templateId });
      const created = res.data.document;
      toast.success('Document created');
      navigate(`/doc/${created._id}`);
    } catch (err) {
      console.error('Create doc error:', err);
      toast.error('Failed to create document. Please try again.');
    }
  };

  const handleToggleStar = async (docId: string, starred: boolean) => {
    setDocuments((prev) =>
      prev.map((d) => (d._id === docId ? { ...d, isStarred: starred } : d))
    );
    try {
      await api.patch(`/documents/${docId}`, { isStarred: starred });
    } catch {
      toast.error('Failed to update favorite status');
      fetchDocs();
    }
  };

  const handleMoveToTrash = async (docId: string) => {
    const docToTrash = documents.find((d) => d._id === docId);
    if (!docToTrash) return;

    setDocuments((prev) => prev.filter((d) => d._id !== docId));

    try {
      await api.patch(`/documents/${docId}`, { isTrash: true });
      toast.success(`"${docToTrash.title}" moved to Trash`, {
        action: {
          label: 'Undo',
          onClick: async () => {
            await api.patch(`/documents/${docId}`, { isTrash: false });
            fetchDocs();
            toast.info('Document restored');
          },
        },
      });
    } catch {
      toast.error('Failed to trash document');
      fetchDocs();
    }
  };

  const handleRename = async (docId: string, newTitle: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d._id === docId ? { ...d, title: newTitle } : d))
    );
    try {
      await api.patch(`/documents/${docId}`, { title: newTitle });
    } catch {
      toast.error('Failed to rename document');
      fetchDocs();
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col selection:bg-accent/20 bg-noise">
      <Navbar onOpenCommandPalette={onOpenCommandPalette} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          onOpenNewDoc={() => setTemplateModalOpen(true)}
        />

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8">
          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-surface/40 backdrop-blur-sm border border-border/30 shadow-subtle">
            <div className="flex items-center gap-3">
              <div className="relative w-2.5 h-2.5 rounded-full bg-semantic-success status-pulse" />
              <span className="text-xs font-medium text-text-muted">
                CRDT engine synced — {documents.length} {documents.length === 1 ? 'document' : 'documents'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-accent" />
                <span className="text-accent">Real-time</span>
              </div>
            </div>
          </div>

          {/* Quick Starters */}
          {activeFilter === 'all' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Quick Start
                </span>
                <button
                  onClick={() => setTemplateModalOpen(true)}
                  className="text-xs font-medium text-text-muted hover:text-text-primary transition-colors link-underline"
                >
                  All Templates
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {QUICK_STARTERS.map((tmpl) => {
                  const Icon = tmpl.icon;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => handleCreateDocument(tmpl.id)}
                      className="p-4 rounded-xl border border-border/30 bg-surface/30 hover:bg-surface/60 hover:border-accent/20 card-aurora cursor-pointer select-none group transition-all duration-200 flex flex-col justify-between h-28"
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-8 h-8 rounded-lg ${tmpl.accent} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-text-primary group-hover:text-text-primary transition-colors">
                          {tmpl.title}
                        </h4>
                        <p className="text-[11px] text-text-muted truncate mt-0.5">{tmpl.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Documents Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
            <div>
              <h1 className="text-2xl font-light tracking-tight text-text-primary capitalize">
                {activeFilter === 'all'
                  ? 'All Documents'
                  : activeFilter === 'shared'
                  ? 'Shared with me'
                  : activeFilter === 'starred'
                  ? 'Starred'
                  : 'Trash'}
              </h1>
              <p className="text-xs text-text-muted mt-0.5">
                {documents.length} {documents.length === 1 ? 'document' : 'documents'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative w-52 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Filter documents…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-subtle/30 pl-8 pr-3 py-1.5 rounded-lg text-xs border border-border/40 outline-none focus:border-accent/30 text-text-primary transition-all font-medium"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center p-0.5 rounded-lg bg-surface-subtle border border-border/60">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-surface text-text-primary shadow-subtle'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    viewMode === 'list'
                      ? 'bg-surface text-text-primary shadow-subtle'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                  aria-label="List view"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              <Button
                size="sm"
                onClick={() => setTemplateModalOpen(true)}
                className="rounded-lg px-4 bg-gradient-to-r from-accent to-accent-secondary text-white border-0 shadow-lg shadow-accent/15 btn-glow"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>New Doc</span>
              </Button>
            </div>
          </div>

          {/* Document Content */}
          {loading ? (
            <DocumentGridSkeleton />
          ) : documents.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc._id}
                    doc={doc}
                    onToggleStar={handleToggleStar}
                    onDelete={handleMoveToTrash}
                    onRename={handleRename}
                    onShare={(d) => setShareDoc(d)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border/60 bg-surface/80 backdrop-blur-sm overflow-hidden shadow-subtle">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/30 bg-surface-subtle/20 text-text-muted uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4 font-semibold">Title</th>
                      <th className="py-3 px-4 font-semibold hidden md:table-cell">Access</th>
                      <th className="py-3 px-4 font-semibold hidden sm:table-cell">Modified</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {documents.map((doc) => (
                      <tr
                        key={doc._id}
                        onClick={() => navigate(`/doc/${doc._id}`)}
                        className="hover:bg-surface-subtle/60 cursor-pointer transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <span className="text-lg shrink-0">{doc.icon || '📄'}</span>
                            <div className="min-w-0">
                              <span className="font-semibold text-text-primary group-hover:underline transition-colors block truncate max-w-xs sm:max-w-md">
                                {doc.title}
                              </span>
                              <span className="text-[11px] text-text-muted truncate block max-w-sm">
                                {doc.contentPreview || 'No content preview'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <span className="font-mono text-[10px] bg-surface-subtle px-2 py-0.5 rounded-md border border-border/50">
                            {doc.accessPolicy === 'restricted' ? 'Private' : 'Shared'}
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell text-text-muted font-mono text-[11px]">
                          {formatRelativeTime(doc.updatedAt)}
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleToggleStar(doc._id, !doc.isStarred)}
                              className="p-1 rounded text-text-muted hover:text-text-primary transition-colors"
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  doc.isStarred ? 'fill-text-primary text-text-primary' : ''
                                }`}
                              />
                            </button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-subtle">
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 glass-dock">
                                <DropdownMenuItem onClick={() => navigate(`/doc/${doc._id}`)}>
                                  <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                  Open
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setShareDoc(doc)}>
                                  <Share2 className="w-3.5 h-3.5 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem danger onClick={() => handleMoveToTrash(doc._id)}>
                                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                                  Move to Trash
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <EmptyState
              icon={activeFilter === 'trash' ? Trash2 : FileText}
              title={
                activeFilter === 'trash'
                  ? 'Trash is empty'
                  : activeFilter === 'starred'
                  ? 'No starred documents'
                  : 'No documents yet'
              }
              description={
                activeFilter === 'trash'
                  ? 'Items moved to trash will appear here.'
                  : 'Create your first document to get started.'
              }
              actionLabel={activeFilter !== 'trash' ? 'Create New Document' : undefined}
              onAction={activeFilter !== 'trash' ? () => setTemplateModalOpen(true) : undefined}
            />
          )}
        </main>
      </div>

      <TemplatePickerModal
        open={templateModalOpen}
        onOpenChange={setTemplateModalOpen}
        onSelectTemplate={handleCreateDocument}
      />

      <ShareDialog
        doc={shareDoc}
        open={!!shareDoc}
        onOpenChange={(open) => !open && setShareDoc(null)}
        onDocUpdated={(updated) => {
          setDocuments((prev) => prev.map((d) => (d._id === updated._id ? updated : d)));
          setShareDoc(updated);
        }}
      />
    </div>
  );
}

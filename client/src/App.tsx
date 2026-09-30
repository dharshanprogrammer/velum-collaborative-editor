import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { TooltipProvider } from './components/ui/icon-button';
import { useTheme } from './hooks/useTheme';

import { LandingRoute } from './routes/LandingRoute';
import { AuthRoute } from './routes/AuthRoute';
import { DashboardRoute } from './routes/DashboardRoute';
import { EditorRoute } from './routes/EditorRoute';
import { DesignSystemRoute } from './routes/DesignSystemRoute';

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from './components/ui/command';
import { ShortcutsSheet } from './components/ui/shortcuts-sheet';
import { FileText, Plus, Moon, Sun, HelpCircle, Palette, Home, Sparkles } from 'lucide-react';
import { api } from './lib/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min cache
      refetchOnWindowFocus: false,
    },
  },
});

function AppShell() {
  const [commandOpen, setCommandOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const { toggleTheme, isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Global hotkeys: Cmd+K and Cmd+/
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Pre-load recent docs for command palette
  useEffect(() => {
    if (commandOpen && user) {
      api
        .get('/documents')
        .then((res) => setRecentDocs(res.data.documents?.slice(0, 5) || []))
        .catch(() => {});
    }
  }, [commandOpen, user]);

  const handleCreateNewDoc = async () => {
    setCommandOpen(false);
    try {
      const res = await api.post('/documents', { template: 'blank' });
      navigate(`/doc/${res.data.document._id}`);
      toast.success('New document created');
    } catch {
      toast.error('Please sign in to create documents');
      navigate('/auth');
    }
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path="/auth" element={<AuthRoute />} />
        <Route
          path="/dashboard"
          element={<DashboardRoute onOpenCommandPalette={() => setCommandOpen(true)} />}
        />
        <Route path="/doc/:id" element={<EditorRoute />} />
        <Route path="/design" element={<DesignSystemRoute />} />
        <Route
          path="*"
          element={<DashboardRoute onOpenCommandPalette={() => setCommandOpen(true)} />}
        />
      </Routes>

      {/* Global Command Palette (Cmd/Ctrl + K) */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command, search documents, or toggle actions..." />
        <CommandList>
          <CommandEmpty>No matching actions found.</CommandEmpty>

          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                setCommandOpen(false);
                handleCreateNewDoc();
              }}
            >
              <Plus className="w-4 h-4 mr-2 text-accent" />
              <span>Create New Document</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setCommandOpen(false);
                toggleTheme();
              }}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 mr-2 text-semantic-warning" />
              ) : (
                <Moon className="w-4 h-4 mr-2" />
              )}
              <span>Toggle Dark / Light Theme</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setCommandOpen(false);
                setShortcutsOpen(true);
              }}
            >
              <HelpCircle className="w-4 h-4 mr-2 text-text-muted" />
              <span>Keyboard Shortcuts Reference (⌘/)</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setCommandOpen(false);
                navigate('/design');
              }}
            >
              <Palette className="w-4 h-4 mr-2 text-accent" />
              <span>Design Tokens Showcase (/design)</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setCommandOpen(false);
                navigate('/dashboard');
              }}
            >
              <Home className="w-4 h-4 mr-2 text-text-muted" />
              <span>Go to Dashboard</span>
            </CommandItem>
          </CommandGroup>

          {recentDocs.length > 0 && (
            <CommandGroup heading="Recent Documents">
              {recentDocs.map((doc) => (
                <CommandItem
                  key={doc._id}
                  onSelect={() => {
                    setCommandOpen(false);
                    navigate(`/doc/${doc._id}`);
                  }}
                >
                  <FileText className="w-4 h-4 mr-2 text-text-muted" />
                  <span className="truncate">{doc.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>

      {/* Global Shortcuts Reference Sheet (Cmd/Ctrl + /) */}
      <ShortcutsSheet open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      {/* Modern Sonner Toaster */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          className:
            '!bg-surface !border !border-border/40 !text-text-primary !shadow-floating !rounded-xl !text-xs !py-3',
        }}
      />
    </>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
export default App;

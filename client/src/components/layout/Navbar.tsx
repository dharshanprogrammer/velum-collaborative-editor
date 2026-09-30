import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Moon, Sun, Palette, LogOut, Command } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Avatar } from '../ui/avatar';
import { Kbd } from '../ui/kbd';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';

export function Navbar({ onOpenCommandPalette }: { onOpenCommandPalette: () => void }) {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <header className="h-14 border-b border-border/40 bg-background/70 backdrop-blur-2xl px-5 sm:px-8 flex items-center justify-between sticky top-0 z-40 select-none transition-colors">
      {/* Brand: Cerebrium-style logo + wordmark */}
      <div className="flex items-center gap-5">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center font-bold text-[11px] text-white shadow-lg shadow-accent/15 group-hover:scale-105 transition-transform duration-200">
            V
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[14px] tracking-tight text-text-primary">
              Velum
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-accent/[0.08] text-accent font-semibold border border-accent/15 uppercase tracking-widest hidden sm:inline-block">
              Studio
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md mx-6 hidden sm:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full h-9 px-3.5 rounded-lg bg-surface-subtle/40 hover:bg-surface-subtle/60 border border-border/50 hover:border-accent/20 flex items-center justify-between text-xs text-text-muted transition-all duration-200 group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors" />
            <span className="font-medium">Search documents, actions…</span>
          </div>
          <div className="flex items-center gap-1">
            <Kbd className="bg-surface/60 border-border/60 text-[10px] px-1.5">⌘ K</Kbd>
          </div>
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCommandPalette}
          className="sm:hidden p-2 rounded-lg text-text-muted hover:text-accent hover:bg-accent/[0.06] transition-colors"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Design System button */}
        <Link
          to="/design"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-accent hover:bg-accent/[0.06] border border-transparent hover:border-accent/15 transition-all"
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Tokens</span>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-accent bg-surface-subtle/30 hover:bg-accent/[0.06] border border-border/40 hover:border-accent/20 transition-all hover:scale-105 active:scale-95"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Menu */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-0.5 rounded-full ring-2 ring-border/40 hover:ring-accent/40 transition-all duration-200 ml-1">
                <Avatar name={user.name} colorIndex={user.colorIndex} size="sm" isOnline />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 p-1.5 glass-dock">
              <DropdownMenuLabel>
                <p className="font-medium text-text-primary text-xs">{user.name}</p>
                <p className="text-[11px] text-text-muted truncate font-mono">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/design')}>
                <Palette className="w-3.5 h-3.5 mr-2" />
                Design System
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleTheme}>
                {isDarkMode ? <Sun className="w-3.5 h-3.5 mr-2" /> : <Moon className="w-3.5 h-3.5 mr-2" />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem danger onClick={handleLogout}>
                <LogOut className="w-3.5 h-3.5 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            to="/auth"
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-accent-secondary text-white hover:shadow-lg hover:shadow-accent/20 transition-all btn-glow"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const COLLAB_COLORS = [
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Rose
  '#F97316', // Coral
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#A855F7', // Purple
  '#D946EF', // Fuchsia
  '#84CC16', // Lime
];

export function getCollabColor(index: number = 0): string {
  const safeIdx = Math.abs(index) % COLLAB_COLORS.length;
  return COLLAB_COLORS[safeIdx];
}

export function formatRelativeTime(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 30) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getDocumentStats(content: string) {
  const clean = content.replace(/<[^>]*>?/gm, ' ').trim();
  const words = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
  const characters = clean.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return { words, characters, readingTimeMinutes };
}

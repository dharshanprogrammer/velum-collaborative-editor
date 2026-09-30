import { useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('cowrite_theme') as ThemeMode) || 'dark';
  });

  const applyTheme = (mode: ThemeMode) => {
    const isLight =
      mode === 'light' ||
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches);

    if (isLight) {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('cowrite_theme', mode);
    applyTheme(mode);
  };

  const toggleTheme = () => {
    const isLight = document.documentElement.classList.contains('light');
    setTheme(isLight ? 'dark' : 'light');
  };

  useEffect(() => {
    applyTheme(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const isDarkMode =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return { theme, setTheme, toggleTheme, isDarkMode };
}

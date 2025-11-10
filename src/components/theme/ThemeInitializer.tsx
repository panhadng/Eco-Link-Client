'use client';

import { useEffect } from 'react';

const STORAGE_KEY = 'eco-link-theme';

const applyTheme = (theme: 'light' | 'dark') => {
  if (typeof document === 'undefined') return;
  document.body.classList.toggle('dark', theme === 'dark');
};

export function ThemeInitializer() {
  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY) as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme ?? (prefersDark ? 'dark' : 'light');

    applyTheme(initialTheme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (event: MediaQueryListEvent) => {
      const currentStoredTheme = window.localStorage.getItem(STORAGE_KEY);
      if (currentStoredTheme) return;
      applyTheme(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && (event.newValue === 'light' || event.newValue === 'dark')) {
        applyTheme(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return null;
}


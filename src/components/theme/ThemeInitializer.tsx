'use client';

import { useEffect } from 'react';

export function ThemeInitializer() {
  useEffect(() => {
    // Always use light mode - remove any dark class that might be present
    if (typeof document !== 'undefined') {
      document.body.classList.remove('dark');
    }
  }, []);

  return null;
}


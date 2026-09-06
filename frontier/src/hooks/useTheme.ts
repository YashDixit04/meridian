import { useState, useEffect } from 'react';

/**
 * Manages dark-mode state and syncs it to document.documentElement's class list.
 * Extracted from App.tsx.
 */
export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    // Temporarily suppress CSS transitions so the theme swap feels instant.
    root.classList.add('no-transitions');
    setIsDarkMode((prev) => !prev);
    setTimeout(() => {
      root.classList.remove('no-transitions');
    }, 0);
  };

  return { isDarkMode, toggleTheme };
}

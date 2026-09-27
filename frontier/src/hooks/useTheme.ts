import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { applyThemeToDocument } from '@/theme/applyTheme';
import {
  loadThemeSettings,
  persistThemeSettings,
  resolveColorScheme,
  type ColorScheme,
  type ThemePresetId,
  type ThemeSettings,
} from '@/theme/presets';

export interface ThemeContextValue {
  isDarkMode: boolean;
  colorScheme: ColorScheme;
  preset: ThemePresetId;
  primarySwatch: string | null;
  setColorScheme: (scheme: ColorScheme) => void;
  setPreset: (preset: ThemePresetId) => void;
  setPrimarySwatch: (swatch: string | null) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function useThemeState(): ThemeContextValue {
  const [settings, setSettings] = useState<ThemeSettings>(() => loadThemeSettings());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => resolveColorScheme(settings.colorScheme) === 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('no-transitions');
    const resolved = applyThemeToDocument(settings);
    setIsDarkMode(resolved === 'dark');
    persistThemeSettings(settings);
    const timer = window.setTimeout(() => {
      root.classList.remove('no-transitions');
    }, 0);
    return () => window.clearTimeout(timer);
  }, [settings]);

  useEffect(() => {
    if (settings.colorScheme !== 'system') {
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const resolved = applyThemeToDocument(settings);
      setIsDarkMode(resolved === 'dark');
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [settings]);

  const setColorScheme = (colorScheme: ColorScheme) => {
    setSettings((prev) => ({
      ...prev,
      colorScheme,
      preset: 'default',
    }));
  };

  const setPreset = (preset: ThemePresetId) => {
    setSettings((prev) => ({ ...prev, preset, primarySwatch: null, secondarySwatch: null }));
  };

  const setPrimarySwatch = (swatch: string | null) => {
    setSettings((prev) => ({
      ...prev,
      primarySwatch: prev.primarySwatch === swatch ? null : swatch,
      secondarySwatch: null,
    }));
  };

  const toggleTheme = () => {
    setSettings((prev) => {
      const resolved = resolveColorScheme(prev.colorScheme);
      return { ...prev, colorScheme: resolved === 'dark' ? 'light' : 'dark' };
    });
  };

  return useMemo(
    () => ({
      isDarkMode,
      colorScheme: settings.colorScheme,
      preset: settings.preset,
      primarySwatch: settings.primarySwatch,
      setColorScheme,
      setPreset,
      setPrimarySwatch,
      toggleTheme,
    }),
    [isDarkMode, settings],
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useThemeState();
  return createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

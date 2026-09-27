import React, { useEffect, useRef, useState } from 'react';
import { Monitor, Palette } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import {
  PRIMARY_SWATCHES,
  SCHEME_OPTIONS,
  THEME_PRESETS,
  type ColorScheme,
  type ThemePresetId,
} from './presets';

const ThemeToggler: React.FC = () => {
  const { colorScheme, preset, primarySwatch, setColorScheme, setPreset, setPrimarySwatch } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const schemePreview = (id: ColorScheme) => {
    if (id === 'light') {
      return (
        <span className="ml-auto flex items-center -space-x-1">
          <span className="h-3.5 w-3.5 rounded-full bg-primary ring-2 ring-white dark:ring-grey-50" />
          <span className="h-3.5 w-3.5 rounded-full bg-white ring-2 ring-grey-200" />
        </span>
      );
    }
    if (id === 'dark') {
      return (
        <span className="ml-auto flex items-center -space-x-1">
          <span className="h-3.5 w-3.5 rounded-full bg-primary ring-2 ring-white dark:ring-grey-50" />
          <span className="h-3.5 w-3.5 rounded-full bg-grey-950 ring-2 ring-grey-200" />
        </span>
      );
    }
    return <Monitor size={14} className="ml-auto text-grey-500" />;
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        data-testid="theme-toggler-trigger"
        aria-label="Change theme colors"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`h-10 w-10 rounded-full inline-flex items-center justify-center border border-grey-200 dark:border-grey-300 bg-white dark:bg-grey-100 shadow-[0_0_0_3px_rgba(var(--primary-channel,19_121_240)/0.18)] transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-primary ${
          isOpen ? 'ring-2 ring-primary' : ''
        }`}
      >
        <Palette size={16} className="text-primary" />
      </button>

      {isOpen && (
        <div
          data-testid="theme-toggler-panel"
          className="absolute top-full right-0 mt-3 w-72 rounded-2xl border border-grey-200 dark:border-grey-300 bg-white dark:bg-grey-50 shadow-xl shadow-grey-200/50 dark:shadow-black/40 p-3 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200"
        >
          <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-grey-500">Default</p>
          <div className="flex flex-col">
            {SCHEME_OPTIONS.map((option) => {
              const selected = preset === 'default' && colorScheme === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  data-testid={option.testId}
                  data-checked={selected ? 'true' : 'false'}
                  onClick={() => setColorScheme(option.id)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-grey-900 dark:text-white hover:bg-grey-50 dark:hover:bg-grey-200 transition-colors duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                >
                  <span
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      selected ? 'border-primary' : 'border-grey-400'
                    }`}
                  >
                    {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </span>
                  <span>{option.label}</span>
                  {schemePreview(option.id)}
                </button>
              );
            })}
          </div>

          <div className="my-2 h-px bg-grey-200 dark:bg-grey-300" />

          <div className="flex flex-col">
            {THEME_PRESETS.filter((item) => item.id !== 'default').map((item) => {
              const selected = preset === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-testid={`theme-preset-${item.id}`}
                  data-checked={selected ? 'true' : 'false'}
                  onClick={() => setPreset(item.id as ThemePresetId)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-grey-900 dark:text-white hover:bg-grey-50 dark:hover:bg-grey-200 transition-colors duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                >
                  <span
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      selected ? 'border-primary' : 'border-grey-400'
                    }`}
                  >
                    {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </span>
                  <span>{item.label}</span>
                  <span className="ml-auto flex items-center -space-x-1">
                    <span
                      className="h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-grey-50"
                      style={{ backgroundColor: item.colors.primary }}
                    />
                    <span
                      className="h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-grey-50"
                      style={{ backgroundColor: item.colors.secondary }}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="my-2 h-px bg-grey-200 dark:bg-grey-300" />

          <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-grey-500">
            Primary Color
          </p>
          <div className="grid grid-cols-8 gap-1.5 px-1 pb-1">
            {PRIMARY_SWATCHES.map((swatch) => {
              const selected = primarySwatch === swatch;
              return (
                <button
                  key={swatch}
                  type="button"
                  data-testid={`theme-swatch-${swatch.replace('#', '')}`}
                  data-selected={selected ? 'true' : 'false'}
                  aria-label={`Primary color ${swatch}`}
                  aria-pressed={selected}
                  onClick={() => setPrimarySwatch(swatch)}
                  className={`h-7 w-7 rounded-full flex items-center justify-center transition-transform duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    selected ? 'ring-2 ring-offset-2 ring-primary dark:ring-offset-grey-50 scale-105' : ''
                  }`}
                  style={{ backgroundColor: swatch }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggler;

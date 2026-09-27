import {
  getPreset,
  resolveColorScheme,
  type ThemeSettings,
} from './presets';
import { cssVarRgba, darkenHex, hexToRgbChannel, lightenHex } from './utils';

const THEME_VARS = [
  '--primary',
  '--primary-active',
  '--primary-accent',
  '--primary-transparent',
  '--primary-soft',
  '--primary-channel',
  '--secondary',
  '--secondary-active',
  '--secondary-accent',
  '--secondary-transparent',
  '--secondary-soft',
  '--secondary-channel',
] as const;

const applyColorFamily = (
  root: HTMLElement,
  prefix: 'primary' | 'secondary',
  hex: string,
  resolved: 'light' | 'dark',
) => {
  const channel = hexToRgbChannel(hex);
  root.style.setProperty(`--${prefix}`, hex);
  root.style.setProperty(
    `--${prefix}-active`,
    resolved === 'dark' ? lightenHex(hex, 0.18) : darkenHex(hex, 0.1),
  );
  root.style.setProperty(`--${prefix}-accent`, darkenHex(hex, 0.28));
  root.style.setProperty(`--${prefix}-transparent`, hex);
  root.style.setProperty(
    `--${prefix}-soft`,
    resolved === 'dark' ? cssVarRgba(channel, 0.16) : lightenHex(hex, 0.88),
  );
  root.style.setProperty(`--${prefix}-channel`, channel);
};

export function applyThemeToDocument(settings: ThemeSettings): 'light' | 'dark' {
  const root = document.documentElement;
  const resolved = resolveColorScheme(settings.colorScheme);
  const preset = getPreset(settings.preset);
  const primary = settings.primarySwatch || preset.colors.primary;
  const secondary = settings.secondarySwatch || preset.colors.secondary;

  root.classList.toggle('dark', resolved === 'dark');
  root.setAttribute('data-aurora-color-scheme', resolved);
  root.setAttribute('data-theme-preset', settings.preset);
  root.setAttribute('data-theme-transition', 'slow');
  root.setAttribute('data-theme-primary', primary);
  root.setAttribute('data-theme-secondary', secondary);

  const isDefaultBrand =
    settings.preset === 'default' && !settings.primarySwatch && !settings.secondarySwatch;
  if (isDefaultBrand) {
    THEME_VARS.forEach((name) => root.style.removeProperty(name));
    return resolved;
  }

  applyColorFamily(root, 'primary', primary, resolved);
  applyColorFamily(root, 'secondary', secondary, resolved);

  return resolved;
}

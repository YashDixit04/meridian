export type ColorScheme = 'light' | 'dark' | 'system';
export type ThemePresetId =
  | 'default'
  | 'luxury'
  | 'retro'
  | 'arctic'
  | 'nature'
  | 'ember'
  | 'dracula'
  | 'midnight';

export interface PresetColors {
  primary: string;
  secondary: string;
  error: string;
  warning: string;
  success: string;
  neutral: string;
}

export interface ThemePreset {
  id: ThemePresetId;
  label: string;
  colors: PresetColors;
}

export interface ThemeSettings {
  colorScheme: ColorScheme;
  preset: ThemePresetId;
  primarySwatch: string | null;
  secondarySwatch: string | null;
}

export const THEME_STORAGE_KEY = 'aurora-theme-settings';

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  colorScheme: 'light',
  preset: 'default',
  primarySwatch: null,
  secondarySwatch: null,
};

export const SCHEME_OPTIONS: Array<{
  id: ColorScheme;
  label: string;
  testId: string;
}> = [
  { id: 'light', label: 'Lightest', testId: 'theme-scheme-lightest' },
  { id: 'dark', label: 'Darkest', testId: 'theme-scheme-darkest' },
  { id: 'system', label: 'Systemist', testId: 'theme-scheme-systemist' },
];

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'default',
    label: 'Default',
    colors: {
      primary: '#3385F0',
      secondary: '#7C3AED',
      error: '#ED143B',
      warning: '#FEC524',
      success: '#0BC33F',
      neutral: '#27314B',
    },
  },
  {
    id: 'luxury',
    label: 'Luxury',
    colors: {
      primary: '#9E3B3B',
      secondary: '#C9A227',
      error: '#C44747',
      warning: '#E0B04E',
      success: '#3D7A5A',
      neutral: '#2F2F2F',
    },
  },
  {
    id: 'retro',
    label: 'Retro',
    colors: {
      primary: '#4D6A8C',
      secondary: '#C4A574',
      error: '#B85C38',
      warning: '#D4A017',
      success: '#5C7A4A',
      neutral: '#3E4A56',
    },
  },
  {
    id: 'arctic',
    label: 'Arctic',
    colors: {
      primary: '#017B8B',
      secondary: '#4C8D99',
      error: '#C44747',
      warning: '#D4A017',
      success: '#2A9D8F',
      neutral: '#1F3A40',
    },
  },
  {
    id: 'nature',
    label: 'Nature',
    colors: {
      primary: '#308236',
      secondary: '#8F6B2B',
      error: '#B85C38',
      warning: '#C9A227',
      success: '#2F7D4A',
      neutral: '#2C3A2E',
    },
  },
  {
    id: 'ember',
    label: 'Ember',
    colors: {
      primary: '#E07A5F',
      secondary: '#3D405B',
      error: '#C44747',
      warning: '#F2CC8F',
      success: '#81B29A',
      neutral: '#2F2F2F',
    },
  },
  {
    id: 'dracula',
    label: 'Dracula',
    colors: {
      primary: '#BD93F9',
      secondary: '#FF79C6',
      error: '#FF5555',
      warning: '#F1FA8C',
      success: '#50FA7B',
      neutral: '#44475A',
    },
  },
  {
    id: 'midnight',
    label: 'Midnight',
    colors: {
      primary: '#5B8DEF',
      secondary: '#7C8CF8',
      error: '#F07178',
      warning: '#FFCB6B',
      success: '#62D196',
      neutral: '#1B2430',
    },
  },
];

/** Primary-only swatches from the Aurora ThemeToggler “Primary Colorful” row. */
export const PRIMARY_SWATCHES = [
  '#3385F0',
  '#1E3A5F',
  '#64748B',
  '#94A3B8',
  '#1F2937',
  '#0D9488',
  '#9E3B3B',
  '#E07A5F',
];

export function getPreset(id: ThemePresetId): ThemePreset {
  return THEME_PRESETS.find((preset) => preset.id === id) ?? THEME_PRESETS[0];
}

export function loadThemeSettings(): ThemeSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_THEME_SETTINGS;
    }

    const parsed = JSON.parse(raw) as Partial<ThemeSettings>;
    const colorScheme = SCHEME_OPTIONS.some((option) => option.id === parsed.colorScheme)
      ? (parsed.colorScheme as ColorScheme)
      : DEFAULT_THEME_SETTINGS.colorScheme;
    const preset = THEME_PRESETS.some((item) => item.id === parsed.preset)
      ? (parsed.preset as ThemePresetId)
      : DEFAULT_THEME_SETTINGS.preset;
    const primarySwatch =
      typeof parsed.primarySwatch === 'string' && PRIMARY_SWATCHES.includes(parsed.primarySwatch)
        ? parsed.primarySwatch
        : null;
    const secondarySwatch =
      typeof parsed.secondarySwatch === 'string' &&
      PRIMARY_SWATCHES.includes(parsed.secondarySwatch) &&
      parsed.secondarySwatch !== primarySwatch
        ? parsed.secondarySwatch
        : null;

    return { colorScheme, preset, primarySwatch, secondarySwatch };
  } catch {
    return DEFAULT_THEME_SETTINGS;
  }
}

export function persistThemeSettings(settings: ThemeSettings): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(settings));
}

export function resolveColorScheme(colorScheme: ColorScheme): 'light' | 'dark' {
  if (colorScheme !== 'system') {
    return colorScheme;
  }

  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

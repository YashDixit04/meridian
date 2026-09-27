# Aurora Theme System — Architecture Reference

> **Purpose:** A standalone, portability-focused reference for Aurora Free 1.0.0’s theme architecture (`AURORA/aurora-free-1.0.0/src/theme` and related providers). After reading this document, a developer should be able to recreate the same design-system pattern in another project without opening Aurora’s source again.

**Stack context:** Material UI (MUI) v6+ with **CSS variables / color schemes** (`createTheme` + `cssVariables`), React context for user settings, and TypeScript module augmentation for custom variants/props.

---

## Table of contents

1. [Theme architecture overview](#1-theme-architecture-overview)
2. [Core theme logic](#2-core-theme-logic)
3. [Component integration](#3-component-integration)
4. [Design details and patterns](#4-design-details-and-patterns)
5. [How it all works together](#5-how-it-all-works-together)
6. [Code examples](#6-code-examples)
7. [Porting checklist](#7-porting-checklist)
8. [Glossary](#8-glossary)

---

## 1. Theme architecture overview

### 1.1 What “theme” means in Aurora

Aurora does **not** use a single CSS file of design tokens. Instead it builds an MUI `Theme` object at runtime and injects it via `ThemeProvider`. That theme contains:

| Layer | Responsibility |
|-------|----------------|
| **Raw color scales** | Hex ramps (50–950) for blue, grey, red, etc. |
| **Semantic palette** | Maps scales → roles (`primary.main`, `text.secondary`, `background.elevation2`) |
| **Channels + CSS vars** | RGB channel siblings so alpha blend works with CSS variables |
| **Typography** | Font family + type scale (h1–overline) |
| **Shadows** | Custom elevation stack (replaces MUI’s default 25 shadows) |
| **Component overrides** | Per-MUI-component `styleOverrides`, `variants`, `defaultProps` |
| **Global chrome** | CssBaseline injects scrollbars, SimpleBar, keyframes, Popper arrows |
| **App settings** | Font family (and layout flags) from `SettingsProvider` |

Color **presets** (Light / Dark / Luxury / Arctic / …) live outside `src/theme` as data + UI. In the free build, switching most presets is gated (shows a Pro snackbar); the architecture still documents how presets are meant to drive palette mains.

### 1.2 Folder structure

```
src/
├── config.ts                          # Font families, drawer widths, assetsDir
├── data/
│   └── color-presets.ts               # Theme preset definitions (hex main colors)
├── providers/
│   ├── SettingsProvider.tsx           # User config (fontFamily, sidenav, …)
│   └── ThemeProvider.tsx              # createTheme + MuiThemeProvider
├── lib/
│   └── utils.ts                       # generatePaletteChannel, cssVarRgba
├── layouts/.../ThemeToggler.tsx       # Palette menu UI (preset picker)
└── theme/
    ├── theme.ts                       # Aggregates overrides → themeOverrides
    ├── typography.ts                  # createTypography(fontFamily)
    ├── shadows.ts                     # Custom box-shadow array
    ├── sxConfig.ts                    # Extra sx prop: lineClamp
    ├── palette/
    │   ├── colors.ts                  # Raw hex scales
    │   └── index.ts                   # Semantic palette + TS augmentations
    ├── styles/
    │   ├── keyFrames.ts               # Global @keyframes
    │   ├── popper.ts                  # Popper arrow geometry
    │   └── simplebar.ts               # SimpleBar scrollbar colors
    └── components/                    # One file per MUI component family
        ├── Button.tsx, Chip.tsx, …
        └── text-fields/               # Input / TextField / Label / …
```

### 1.3 Hierarchy and data flow

```
┌─────────────────────────────────────────────────────────────┐
│  main.tsx                                                   │
│    SettingsProvider  →  ThemeProvider  →  app tree          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  ThemeProvider                                              │
│    reads config.fontFamily                                  │
│    createTypography(fontFamily)                             │
│    createTheme({ typography, ...themeOverrides })           │
│    MuiThemeProvider + CssBaseline                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  themeOverrides (theme/theme.ts)                            │
│    cssVariables  →  --aurora-* CSS vars on DOM              │
│    colorSchemes.light.palette  ← paletteOptions             │
│    shadows                                                  │
│    unstable_sxConfig                                        │
│    components: { MuiButton: …, MuiChip: … }                 │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
   palette/colors.ts    typography.ts      components/*.tsx
   palette/index.ts     shadows.ts         styles/* (via CssBaseline)
```

**Runtime cascade when a token changes:**

1. Change a hex in `palette/colors.ts` (or remap in `palette/index.ts`).
2. `generatePaletteChannel` adds `*Channel` RGB triples.
3. `createTheme` emits CSS variables (`--aurora-palette-primary-main`, etc.).
4. Component overrides that reference `theme.vars.palette…` update automatically.
5. App JSX using `sx={{ color: 'primary.main' }}` or `<Button color="primary">` also updates.

### 1.4 Provider wrap order (important)

```tsx
<SettingsProvider>      {/* fontFamily, layout config */}
  <ThemeProvider>       {/* must sit under Settings — needs fontFamily */}
    <BreakpointsProvider>
      <SettingsPanelProvider>
        <RouterProvider />
      </SettingsPanelProvider>
    </BreakpointsProvider>
  </ThemeProvider>
</SettingsProvider>
```

`ThemeProvider` depends on `useSettingsContext()`, so settings must wrap theme—not the reverse.

---

## 2. Core theme logic

### 2.1 Entry aggregator: `theme/theme.ts`

`themeOverrides` is the single object merged into `createTheme`. Key configuration:

| Key | Value / meaning |
|-----|-----------------|
| `cssVariables.colorSchemeSelector` | `'data-aurora-color-scheme'` — scheme toggled via this attribute |
| `cssVariables.cssVarPrefix` | `'aurora'` — vars look like `--aurora-palette-…` |
| `colorSchemes.light.palette` | Full semantic palette (`paletteOptions`) |
| `colorSchemes.dark` | `false` in free build — dark scheme not shipped |
| `shadows` | `['none', ...customShadows]` (MUI expects index 0 = none) |
| `unstable_sxConfig` | Adds `sx={{ lineClamp: n }}` support |
| `components` | Map of `MuiX` → override object |

Type-only imports (`themeAugmentation`, `themeCssVarsAugmentation`, Data Grid / Lab) extend TypeScript so custom keys type-check.

### 2.2 Raw colors: `palette/colors.ts`

Each hue is an **11-step scale** keyed `50` … `950` (plus `basic.white` / `basic.black`).

| Export | Role in semantic palette |
|--------|---------------------------|
| `grey` | Neutrals, text, elevations, action states |
| `blue` | Primary |
| `purple` | Secondary |
| `red` | Error |
| `orange` | Warning |
| `green` | Success |
| `lightBlue` | Info |
| `basic` | Pure white/black |

**Design rule:** Never hard-code these hex values in components. Map them once into semantic roles, then consume roles (`primary.main`, `background.elevation2`).

### 2.3 Semantic palette: `palette/index.ts`

Builds MUI `PaletteOptions` by picking stops from scales:

| Semantic token | Typical mapping (light) |
|----------------|-------------------------|
| `primary` | blue 50/400/500/600/900 → lighter/light/main/dark/darker |
| `secondary` | purple equivalent |
| `error` / `warning` / `success` / `info` | red / orange / green / lightBlue |
| `neutral` | grey 100/600/800/900/950 — “non-brand” chrome color |
| `action` | hover/selected/disabled/focus from grey |
| `text` | primary=grey800, secondary=grey600, disabled=grey400 |
| `background.elevation1–4` | grey50 → grey300 surface ladder |
| `background.menu` / `menuElevation*` | White + grey for menus/popovers |
| `divider` / `dividerLight` / `menuDivider` | Borders; light uses alpha via `cssVarRgba` |
| `chGrey`, `chBlue`, … | Full chromatic scales exposed for charts / one-offs |

**TypeScript augmentations** extend MUI’s `Palette`, `PaletteColor` (`lighter` / `darker`), `Color` (`950` + `*Channel`), and `TypeBackground` (elevation keys). Without these declarations, `theme.vars.palette.background.elevation2` would not type-check.

### 2.4 Channel generation and alpha: `lib/utils.ts`

MUI CSS-variable themes store colors as CSS vars. You cannot do `rgba(var(--x), 0.15)` with hex vars; you need a separate **channel** string `"51 133 240"` and the modern syntax `rgba(51 133 240 / 0.15)`.

```ts
// hex → "R G B"
hexToRgbChannel('#3385F0') // "51 133 240"

generatePaletteChannel({ main: '#3385F0' })
// → { main: '#3385F0', mainChannel: '51 133 240' }

cssVarRgba(theme.vars.palette.primary.mainChannel, 0.15)
// → "rgba(var(--aurora-palette-primary-mainChannel) / 0.15)" conceptually
//    (MUI substitutes the channel var; helper returns `rgba(${color} / ${alpha})`)
```

**Rule of thumb:** Solid fills → `theme.vars.palette.primary.main`. Tint overlays → `cssVarRgba(….mainChannel, alpha)`.

### 2.5 Typography: `theme/typography.ts`

`createTypography(fontFamily)` returns MUI `TypographyVariantsOptions`:

- Stack: `[chosenFont, 'sans-serif', 'Spline Sans Mono', 'monospace']`
- Headings h1–h6: weight **700**, sizes 48→21px, line-height ~1.4–1.5
- Body: 16 / 14px, line-height 1.6
- Button: 14px, weight 700, `textTransform: 'capitalize'` at type level (Button override later forces `none`)
- Caption / overline: 12px

Font choices come from `config.ts`: `['Plus Jakarta Sans', 'Roboto', 'Inter', 'Poppins']`. Changing font in Settings recreates the theme via `useMemo`.

### 2.6 Shadows: `theme/shadows.ts`

Seven soft multi-layer shadows (indices 1–7 after prepending `'none'`). Components prefer **elevation tokens via Paper** rather than inventing new shadows. DataGrid / Dialog / Drawer / Popover commonly use `elevation: 6` which maps into this stack.

### 2.7 SX config: `sxConfig.ts`

Registers a custom `sx` key `lineClamp` that emits `-webkit-line-clamp` styles. Usage:

```tsx
<Typography sx={{ lineClamp: 2 }}>Long text…</Typography>
```

### 2.8 ThemeProvider runtime

```tsx
const { config: { fontFamily } } = useSettingsContext();
const typography = useMemo(() => createTypography(fontFamily), [fontFamily]);
const theme = createTheme({ typography, ...themeOverrides });

return (
  <MuiThemeProvider disableTransitionOnChange theme={theme} modeStorageKey="aurora-mode">
    <CssBaseline enableColorScheme />
    {children}
  </MuiThemeProvider>
);
```

- `disableTransitionOnChange` — avoids flashy color transitions when scheme/font updates.
- `modeStorageKey="aurora-mode"` — where MUI persists color mode (free build still light-only).
- `CssBaseline enableColorScheme` — syncs native form controls with scheme.

### 2.9 Color presets (adjacent system)

`data/color-presets.ts` defines presets as **main-color bags**, not full themes:

```ts
interface PresetOption {
  value: string;          // e.g. 'arctic', 'default-light'
  label: string;          // UI label
  preset: 'default' | 'luxury' | 'retro' | 'arctic' | 'nature';
  mode?: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    error: string;
    warning: string;
    success: string;
    neutral: string;
  };
}
```

| Preset | Primary (approx) | Notes |
|--------|------------------|-------|
| Light (`default-light`) | `#3385F0` | Matches `blue[500]` — active free default |
| Dark (`default-dark`) | `#589BF3` | Lighter primary for dark UIs |
| Luxury | `#9E3B3B` | Maroon brand |
| Retro | `#4D6A8C` | Slate |
| Arctic | `#017B8B` | Teal |
| Nature | `#308236` | Forest green |

**Free vs Pro:** `ThemeToggler` only treats `default-light` as active; other clicks open a Pro upsell snackbar. A full implementation would regenerate palette scales (or swap `primary.main` family) from `option.colors` and call `setColorScheme` / rebuild theme.

### 2.10 Resolving CSS vars for non-React APIs

Charts (ECharts) often need concrete hex. `SettingsProvider.getThemeColor` → `getColor()` reads computed CSS from `document.documentElement` when given a `var(--…)` string.

---

## 3. Component integration

Every file under `theme/components/` exports an MUI **component theme object** (`styleOverrides` / `variants` / `defaultProps`) registered in `theme.ts` as `MuiButton`, `MuiChip`, etc.

These are **not** React components you import into pages. They customize the library components you already use (`import Button from '@mui/material/Button'`).

### 3.1 How a component override receives theme values

```ts
styleOverrides: {
  root: ({ theme }) => ({
    color: theme.vars.palette.text.primary,
    padding: theme.spacing(1, 2),
    ...theme.applyStyles('dark', { /* dark-only */ }),
  }),
}
```

- Prefer **`theme.vars.palette`** (CSS-var aware) over `theme.palette` for colors that should track schemes.
- Exception: Snackbar uses solid `theme.palette.grey[950]` for always-dark toast chrome.

### 3.2 Catalog by file

#### Surfaces & shell

| File | MUI target | Why it exists | Theme usage | Design decisions |
|------|------------|---------------|-------------|------------------|
| `AppBar.tsx` | `MuiAppBar` | Flat header | `color: 'inherit'`, no shadow | App bar blends into page; elevation via content not chrome |
| `Toolbar.tsx` | `MuiToolbar` | App bar height | Variant `appbar`: 64px / 82px≥md | Matches CssBaseline `scrollMarginTop: 82` |
| `Paper.tsx` | `MuiPaper` | Surface language | `background` 1–5, variant `default`, elevation→menu tokens | Dual system: outlined “cards” vs elevated menus |
| `Drawer.tsx` | `MuiDrawer` | Nav panels | Paper elevation 6; docked = no shadow | Permanent sidenav stays flat |
| `Dialog.tsx` | `MuiDialog` | Modals | Paper elevation 6 | Consistent floating panel depth |
| `Backdrop.tsx` | `MuiBackdrop` | Dimmer | `cssVarRgba(grey.950Channel, 0.3/0.5)` | Grey-950 channel, not pure black |
| `CssBaseline.tsx` | `MuiCssBaseline` | Global CSS | Scrollbars, SimpleBar, keyframes, Popper arrows | Single injection point for third-party/global styles |

#### Actions & selection

| File | MUI target | Key extensions | Notes |
|------|------------|----------------|-------|
| `Button.tsx` | `MuiButton` (+ `ButtonBase`) | Variants `soft`/`dashed`*; color `neutral`; prop `shape` | Soft tint; circle/square icon buttons 30/36/42; `disableElevation`; LinkBehavior on ButtonBase |
| `Chip.tsx` | `MuiChip` | `soft`; `neutral`; sizes `large`/`xsmall` | Soft + light border; Iconify delete icon |
| `ToggleButton.tsx` | Toggle + Group | Soft selected fills | Group looks like elevation tray / segmented control |
| `Checkbox.tsx` / `Radio.tsx` | Checkbox / Radio | Custom icons; Radio `large` | Hover uses channel alpha 0.12 |
| `Switch.tsx` | `MuiSwitch` | Compact track | Thumb/track use elevation1/4 |
| `Pagination.tsx` | Pagination + Item | Variant `solid`; extra colors | Soft selected by default; Iconify arrows |

\* `dashed` is declared in Button module augmentation but **not implemented** in variants.

#### Navigation & lists

| File | Role |
|------|------|
| `List.tsx` | ListItemButton: radius 8, selected = `primary.lighter`, focus ring primary |
| `Menu.tsx` | MenuItem only; dense; hover `menuElevation1` |
| `Tab.tsx` | Compact tabs (min 36px) with gap |
| `Breadcrumbs.tsx` | body2 + primary links |
| `Link.tsx` | React Router `LinkBehavior`; animated underline on hover |
| `Toolbar` / `AppBar` | See shell table |

#### Feedback

| File | Role |
|------|------|
| `Tooltip.tsx` | grey[800] tip + caption; complex arrow clip-paths / RTL |
| `Snackbar.tsx` | SnackbarContent: near-black bg, light text |
| `Progress.tsx` | Rounded linear bar; round circular stroke |
| `Backdrop` | See shell |

#### Data display

| File | Role |
|------|------|
| `Avatar.tsx` | elevation4 bg; default tint primary; custom fallback image; AvatarGroup z-index stack |
| `Typography.tsx` | Maps `subtitle2` → `<p>` |
| `DataGrid.tsx` | Product table chrome: elevation1 header/footer radius 16, soft selection, Iconify sort, custom pagination |
| `TablePagination.tsx` | Paired with DataGrid footer; hides unused slots |

#### Overlays

| File | Role |
|------|------|
| `Popover.tsx` | Paper elevation 6 |
| `Popper.tsx` | `zIndex: tooltip` |
| `Autocomplete.tsx` | Elevation paper; size `large`; Iconify popup icon; padding coordinates with inputs |

#### Layout helpers

| File | Role |
|------|------|
| `Stack.tsx` | `useFlexGap: true`, default `direction: 'row'` |

#### Text fields (`components/text-fields/`)

| File | Role |
|------|------|
| `TextField.tsx` | Default **filled**; size `large` augmentation; hide WebKit autofill buttons |
| `FormControl.tsx` | Default filled; size `large` |
| `FilledInput.tsx` | Core field look: elevation2 surface, hover elevation3, focus ring + lighter fill, per-color focus variants |
| `OutlinedInput.tsx` | Radius 8/4; soft hover border (`action.disabled`) |
| `Input.tsx` | Standard underline polish; size large padding |
| `InputLabel.tsx` | Floating label transform matrix for sm/md/lg × variants × adornments |
| `InputAdornment.tsx` | Neutralize filled vertical offset; icon size scales |
| `FormHelperText.tsx` | Error uses `error.light` |
| `FormControlLabel.tsx` | Align multi-line labels with controls |

### 3.3 Style helpers under `theme/styles/`

| Module | Injected via CssBaseline | Purpose |
|--------|--------------------------|---------|
| `simplebar.ts` | Yes | Scrollbar thumb = `background.elevation4` |
| `keyFrames.ts` | Yes | `linearLeftToRight`, `spin` |
| `popper.ts` | Yes | `.base-Popper-root .arrow` placement triangles using `background.paper` |

### 3.4 Connection graph (simplified)

```
colors.ts ──► palette/index.ts ──► theme.ts ──► ThemeProvider
                     │                              │
                     │                              ▼
              generatePaletteChannel          MUI components
                     │                     (Button, Chip, …)
                     ▼
              cssVarRgba in overrides ◄── theme.vars.palette.*Channel

typography.ts ◄── Settings.fontFamily ──► ThemeProvider recreate

Paper elevation tokens ◄── Dialog / Drawer / Popover / Autocomplete / DataGrid

LinkBehavior ◄── ButtonBase + Link
```

---

## 4. Design details and patterns

### 4.1 Color roles (how to think about them)

| Need | Use |
|------|-----|
| Brand action | `primary.main` / `.dark` / `.lighter` |
| Supporting accent | `secondary.*` |
| Status | `success` / `warning` / `error` / `info` |
| Non-brand UI chrome | `neutral.*` or `background.elevation*` |
| Body copy | `text.primary` / `text.secondary` |
| Hairlines | `divider` / `dividerLight` / `menuDivider` |
| Charts / illustrations | `chBlue[500]`, `chGrey[200]`, … |
| Soft tint of brand | `cssVarRgba(primary.mainChannel, 0.15)` |

### 4.2 Elevation ladder (spacing of surfaces)

Aurora invents a **background elevation** system instead of relying only on box-shadow:

| Token | Light source | Typical use |
|-------|--------------|-------------|
| `elevation1` | grey[50] | Table header/footer, subtle panels |
| `elevation2` | grey[100] | Filled inputs, soft neutral buttons, list hovers |
| `elevation3` | grey[200] | Input hover, stronger soft hover |
| `elevation4` | grey[300] | Switch track, scrollbar, avatar fallback, borders |
| `menu` | white | Elevated paper / menus |
| `menuElevation1/2` | grey 50/100 | Menu item hover tiers |

**Paper `background={1|2|3|4|5}`** is a parallel API using raw `grey`/`blue` hex with `applyStyles('light'|'dark')` — useful when you want numbered surface steps without CSS-var indirection.

### 4.3 Soft variant pattern (shared)

Used by **Button** and **Chip**:

1. Background = brand `mainChannel` @ ~15% alpha  
2. Text = brand `.dark`  
3. Hover = bump alpha (~20–36%)  
4. Neutral soft = elevation surfaces, not chroma  

This gives “pastel / tonal” actions without a separate pastel palette.

### 4.4 Neutral color pattern

`neutral` is a first-class palette color (augmented). Buttons/chips/pagination use it for chrome that should **not** scream brand blue—icon toolbars, tags, secondary filters.

### 4.5 Shape and size systems

| System | Values |
|--------|--------|
| Default control radius | **8px** (buttons, filled inputs, list items) |
| Dense / small radius | **4px** (small outlined/filled) |
| Large chrome radius | **16px** (DataGrid header/footer) |
| Circle buttons | `borderRadius: '50%'` + fixed square hit area |
| Button shape sizes | sm 30 / md 36 / lg 42 |
| Chip heights | large 32 / medium 24 / small 20 / xsmall 16 |
| Toolbar appbar | 64 → 82 (≥md) |

### 4.6 Typography in components

- Global scale in `typography.ts`.
- Local overrides: Button forces 14px/600/`textTransform: none`; Chip labels use `subtitle2` + weight 600; ListItemText primary uses `subtitle1`.
- Settings panel can swap font family; theme rebuilds; ECharts consumers read `typography.fontFamily` from context/theme.

### 4.7 Interaction states

| State | Common treatment |
|-------|------------------|
| Hover (soft) | Increase fill alpha or step elevation+1 |
| Hover (outlined button) | `cssVarRgba(mainChannel, 0.12)` + softer border |
| Focus (filled input) | Lighter fill + `boxShadow: 0 0 0 1px primary.main` |
| Focus (list) | Outline with primary |
| Selected (list) | `primary.lighter` bg + primary text |
| Selected (pagination) | Soft channel fill @ 0.36 |
| Disabled | `action.disabled*` / elevation disabled backgrounds |
| Error (input) | `error.lighter` fill + error ring |

### 4.8 Dark mode hooks (even when dark scheme is off)

Many overrides already call `theme.applyStyles('dark', { … })` (Paper backgrounds, Backdrop opacity, soft-neutral Button). When enabling dark:

1. Set `colorSchemes.dark: { palette: darkPaletteOptions }` instead of `false`.
2. Provide inverted greys / elevations.
3. Existing `applyStyles('dark')` branches activate automatically.
4. Toggle via MUI color scheme API + `data-aurora-color-scheme`.

### 4.9 Responsive behavior

- Toolbar / TablePagination / Tooltip use `theme.breakpoints`.
- Most component tokens are **not** viewport-scaled; layout components handle responsiveness.
- CssBaseline `scrollMarginTop: 82` assumes desktop app-bar height for in-page anchors.

### 4.10 Iconography convention

Overrides frequently slot **Iconify** icons (Select caret, Chip delete, Pagination arrows, DataGrid sort, Autocomplete popup). Porting projects should either keep Iconify or replace those `defaultProps.icon` slots.

### 4.11 Router integration

`LinkBehavior` maps MUI `href` → React Router `to`. `ButtonBase` and `Link` default to it so `<Button href="/path">` client-navigates.

---

## 5. How it all works together

### 5.1 Modify a theme value (e.g. change brand blue)

**Goal:** Primary blue should be teal-leaning.

1. Edit `palette/colors.ts` → `blue` scale (or only adjust stops used by primary).
2. Or remap in `palette/index.ts`:

```ts
const primary = generatePaletteChannel({
  lighter: blue[50],
  light: blue[400],
  main: blue[500],   // change this stop or swap scale
  dark: blue[600],
  darker: blue[900],
});
```

3. Restart/refresh — CSS vars update.
4. Every `color="primary"` Button, soft Chip, focus ring, list selection, etc. follows automatically.

No component file edits required if they already use semantic tokens.

### 5.2 Cascade through components

Example: soft primary Button background is `cssVarRgba(primary.mainChannel, 0.15)`. Changing `primary.main` changes both the solid hex **and** its channel sibling (via `generatePaletteChannel`), so soft fills stay in sync.

### 5.3 Add a new component that respects the theme

**Prefer consuming tokens in the component’s `sx` / styled API:**

```tsx
import { Box } from '@mui/material';
import { cssVarRgba } from 'lib/utils';

export function MetricPill({ label }: { label: string }) {
  return (
    <Box
      sx={(theme) => ({
        px: 1.5,
        py: 0.5,
        borderRadius: 2, // 8px if shape.borderRadius defaults to 4; or use 1 → 8px in Aurora patterns
        bgcolor: cssVarRgba(theme.vars.palette.primary.mainChannel, 0.15),
        color: 'primary.dark',
        typography: 'subtitle2',
        fontWeight: 600,
      })}
    >
      {label}
    </Box>
  );
}
```

**If wrapping/customizing an MUI primitive globally**, add `theme/components/MyThing.tsx` and register it in `theme.ts`:

```ts
components: {
  // …
  MuiAlert: Alert, // your override object
}
```

Use module augmentation when adding variants (`soft`) or colors (`neutral`).

### 5.4 Extend for a new design variant (preset)

**Data:**

```ts
// color-presets.ts
{
  value: 'ember',
  label: 'Ember',
  preset: 'ember',
  colors: {
    primary: '#E07A5F',
    secondary: '#3D405B',
    error: '#C44747',
    warning: '#F2CC8F',
    success: '#81B29A',
    neutral: '#2F2F2F',
  },
}
```

**Runtime (pattern to implement — not fully wired in free ThemeToggler):**

1. On preset select, derive or swap palette mains (minimum: regenerate `primary`/`secondary`/… via `generatePaletteChannel` from expanded scales, or tint utilities).
2. Merge into `createTheme({ …themeOverrides, colorSchemes: { light: { palette: newPalette } } })`.
3. Persist preset id in `SettingsProvider` + localStorage (same pattern as `fontFamily`).
4. Optionally set `mode: 'dark'` and enable `colorSchemes.dark`.

**Primary-only override** (matches the “Primary Color” swatches idea): keep preset structure but let user override `config.primaryMain` and rebuild only the `primary` palette object.

### 5.5 Change typography globally

```ts
// config / Settings
setConfig({ fontFamily: 'Poppins' });
// → SettingsReducer persists → ThemeProvider useMemo → createTypography → createTheme
```

### 5.6 Add a soft variant to a new MUI component

Follow Chip/Button:

1. `declare module '@mui/material/X' { interface XPropsVariantOverrides { soft: true } }`
2. Map over `PaletteColorKey[]` to push `variants` entries.
3. Use `cssVarRgba(theme.vars.palette[color].mainChannel, 0.15)`.
4. Register in `theme.ts`.

---

## 6. Code examples

### 6.1 Theme aggregation

```ts
// theme/theme.ts (annotated)
export const themeOverrides = {
  // Emit CSS variables; scheme attribute + --aurora-* prefix
  cssVariables: {
    colorSchemeSelector: 'data-aurora-color-scheme',
    cssVarPrefix: 'aurora',
  },

  // Index 0 must be 'none' for MUI elevation API
  shadows: ['none', ...shadows],

  colorSchemes: {
    light: {
      palette: paletteOptions, // from palette/index.ts
      shadows: ['none', ...shadows],
    },
    dark: false, // enable later with a full dark palette
  },

  unstable_sxConfig: sxConfig, // lineClamp helper

  components: {
    MuiButton: Button,
    MuiPaper: Paper,
    MuiFilledInput: FilledInput,
    MuiCssBaseline: CssBaseline,
    // …every override file registered here
  },
};
```

### 6.2 Building semantic primary from a scale

```ts
// palette/index.ts
const primary = generatePaletteChannel({
  lighter: blue[50],  // tinted backgrounds, selected rows
  light: blue[400],
  main: blue[500],    // default brand
  dark: blue[600],    // soft-variant text, emphasis
  darker: blue[900],  // strongest emphasis
});
```

### 6.3 Soft Button variants generator

```ts
const btnColors: PaletteColorKey[] = [
  'primary', 'secondary', 'info', 'success', 'warning', 'error',
];

const btnCustomVariants = btnColors.map((color) => ({
  props: { variant: 'soft', color },
  style: ({ theme }) => ({
    background: cssVarRgba(theme.vars.palette[color].mainChannel, 0.15),
    color: theme.vars.palette[color].dark,
    '&:hover': {
      background: cssVarRgba(theme.vars.palette[color].mainChannel, 0.2),
    },
  }),
}));
```

**Why:** One loop keeps six colors consistent; channel alpha survives CSS-variable theming.

### 6.4 Shape × size Button matrix

```ts
const sizes = { small: 30, medium: 36, large: 42 };

shapes.forEach((shape) => {
  Object.keys(sizes).forEach((size) => {
    btnShapeVariants.push({
      props: { shape, size },
      style: {
        height: sizes[size],
        minWidth: sizes[size],
        padding: 0,
        borderRadius: shape === 'circle' ? '50%' : undefined,
      },
    });
  });
});
```

**Usage:** `<Button shape="circle" color="neutral" variant="soft"><Icon /></Button>`

### 6.5 Filled input — default product field

```ts
styleOverrides: {
  root: ({ theme }) => ({
    borderRadius: 8,
    backgroundColor: theme.vars.palette.background.elevation2,
    '&:hover': {
      backgroundColor: theme.vars.palette.background.elevation3,
    },
    '&:before, &:after': { display: 'none' }, // kill MUI underline
    [`&.${filledInputClasses.focused}`]: {
      backgroundColor: theme.vars.palette.secondary.lighter,
      boxShadow: `0 0 0 1px ${theme.vars.palette.primary.main}`,
    },
    [`&.${filledInputClasses.error}`]: {
      backgroundColor: theme.vars.palette.error.lighter,
      boxShadow: `0 0 0 1px ${theme.vars.palette.error.main}`,
    },
  }),
}
```

**Why:** Filled-first forms feel “soft surface + focus ring” rather than outlined boxes.

### 6.6 Paper dual surface system

```ts
// variant default → flat outlined panel
{ props: { variant: 'default' }, style: ({ theme }) => ({
  border: 'none',
  outline: `1px solid ${theme.vars.palette.divider}`,
  borderRadius: 0,
})}

// elevation → floating menu surface
elevation: ({ theme }) => ({
  backgroundColor: theme.vars.palette.background.menu,
  backgroundImage: 'none', // disable MUI dark overlay gradient
  borderColor: theme.vars.palette.menuDivider,
})
```

### 6.7 CssBaseline as global style hub

```ts
styleOverrides: (theme) => ({
  '*': { scrollbarWidth: 'thin' },
  body: {
    scrollbarColor: `${theme.vars.palette.background.elevation4} transparent`,
    [`h1, h2, h3, h4, h5, h6, p`]: { margin: 0 },
    [`[id]`]: { scrollMarginTop: 82 },
  },
  ...simplebar(theme),
  ...keyFrames(),
  ...popper(theme),
}),
```

### 6.8 Provider composition

```tsx
// providers/ThemeProvider.tsx
const ThemeProvider = ({ children }) => {
  const { config: { fontFamily } } = useSettingsContext();
  const typography = useMemo(() => createTypography(fontFamily), [fontFamily]);
  const theme = createTheme({ typography, ...themeOverrides });

  return (
    <MuiThemeProvider disableTransitionOnChange theme={theme} modeStorageKey="aurora-mode">
      <CssBaseline enableColorScheme />
      {children}
    </MuiThemeProvider>
  );
};
```

### 6.9 Module augmentation pattern

```ts
declare module '@mui/material/Chip' {
  interface ChipPropsVariantOverrides {
    soft: true;
  }
  interface ChipPropsColorOverrides {
    neutral: true;
  }
  interface ChipPropsSizeOverrides {
    large: true;
    xsmall: true;
  }
}
```

Without this, TypeScript rejects `<Chip variant="soft" color="neutral" size="xsmall" />`.

### 6.10 Preset data shape

```ts
const arcticPaletteMainColors = {
  primary: '#017B8B',
  secondary: '#5E53B3',
  error: '#C44747',
  warning: '#95691E',
  success: '#2DA262',
  neutral: '#2F3534',
} as const;
```

Wire these into palette generation when implementing live preset switching.

---

## 7. Porting checklist

Use this when implementing Aurora’s pattern in FocusStream (or any app):

1. **Install MUI** with CssVars / color scheme support matching Aurora’s approach.
2. **Copy/adapt** `colors.ts` scales → `generatePaletteChannel` → semantic `paletteOptions`.
3. **Add** `cssVarRgba` + channel helper.
4. **Define** typography factory driven by settings.
5. **Replace** default shadows with a short custom stack.
6. **Create** `themeOverrides` aggregator + `ThemeProvider` under `SettingsProvider`.
7. **Port component overrides** starting with: CssBaseline, Paper, Button, Chip, FilledInput/TextField, List/MenuItem, Tooltip.
8. **Augment** modules for `soft`, `neutral`, `shape`, extra sizes.
9. **Decide** dark mode: either ship `colorSchemes.dark` or keep light-only.
10. **Optional:** preset menu from `color-presets.ts` + persist selection.
11. **Consume** only semantic tokens in app code (`sx` / `color` props)—never raw hex from `colors.ts`.
12. **Verify** soft fills still work under CSS variables (channel + `cssVarRgba`).

---

## 8. Glossary

| Term | Meaning |
|------|---------|
| **Design token** | Named value (e.g. `primary.main`) instead of a raw hex in UI code |
| **Semantic palette** | Tokens named by *role* (primary, error) not by hue |
| **CSS variables theme** | MUI mode where palette values become `--aurora-*` CSS custom properties |
| **Channel** | Space-separated RGB triple enabling `rgba(R G B / alpha)` with CSS vars |
| **Component override** | Theme object customizing all instances of an MUI component |
| **Variant** | Named visual style (`contained`, `soft`, `outlined`) selected via prop |
| **Module augmentation** | TypeScript `declare module` to teach MUI about custom props |
| **Elevation (Aurora)** | Background grey steps (`elevation1–4`) for surface hierarchy |
| **Soft variant** | Translucent brand-tinted fill using channel alpha |
| **Preset** | Named bag of main colors (Arctic, Luxury, …) for rebranding the palette |
| **CssBaseline** | MUI component that injects global base styles once |

---

## Appendix A — File inventory (`src/theme`)

```
theme.ts
typography.ts
shadows.ts
sxConfig.ts
palette/colors.ts
palette/index.ts
styles/keyFrames.ts
styles/popper.ts
styles/simplebar.ts
components/AppBar.tsx
components/Autocomplete.tsx
components/Avatar.tsx
components/Backdrop.tsx
components/Breadcrumbs.tsx
components/Button.tsx
components/Checkbox.tsx
components/Chip.tsx
components/CssBaseline.tsx
components/DataGrid.tsx
components/Dialog.tsx
components/Drawer.tsx
components/Link.tsx
components/List.tsx
components/Menu.tsx
components/Pagination.tsx
components/Paper.tsx
components/Popover.tsx
components/Popper.tsx
components/Progress.tsx
components/Radio.tsx
components/Select.tsx
components/Snackbar.tsx
components/Stack.tsx
components/Switch.tsx
components/Tab.tsx
components/TablePagination.tsx
components/ToggleButton.tsx
components/Toolbar.tsx
components/Tooltip.tsx
components/Typography.tsx
components/text-fields/FilledInput.tsx
components/text-fields/FormControl.tsx
components/text-fields/FormControlLabel.tsx
components/text-fields/FormHelperText.tsx
components/text-fields/Input.tsx
components/text-fields/InputAdornment.tsx
components/text-fields/InputLabel.tsx
components/text-fields/OutlinedInput.tsx
components/text-fields/TextField.tsx
```

**Related outside `theme/`:** `providers/ThemeProvider.tsx`, `providers/SettingsProvider.tsx`, `config.ts`, `data/color-presets.ts`, `lib/utils.ts` (`generatePaletteChannel`, `cssVarRgba`), `layouts/.../ThemeToggler.tsx`.

---

## Appendix B — Free-build limitations (know when porting)

| Feature | Free Aurora behavior |
|---------|----------------------|
| Dark `colorSchemes` | Disabled (`dark: false`) |
| Live preset switching | UI present; non-default presets open Pro snackbar |
| Extra presets (Ember, Dracula, Midnight, System) | Not in free `color-presets.ts` — extend using the same `PresetOption` shape |
| Button `dashed` variant | Typed but not styled |

These are product packaging limits, not architectural gaps—the patterns above still apply when you flesh them out.

---

## 9. FocusStream port (Tailwind / CSS variables)

Aurora is MUI-centric. FocusStream ports the **same architecture** onto Tailwind + CSS custom properties (no MUI `createTheme`). This section is the FocusStream-specific gap analysis and target layout.

### 9.1 Mapping Aurora → FocusStream

| Aurora | FocusStream equivalent | Notes |
|--------|------------------------|-------|
| `theme/theme.ts` | `theme/theme.ts` | Aggregates tokens + baseline styles |
| `palette/colors.ts` | `theme/palette/colors.ts` | Raw scales + light/dark brand bags |
| `palette/index.ts` | `theme/palette/index.ts` | Semantic resolve → CSS vars |
| `typography.ts` | `theme/typography.ts` | Type scale + font stacks (Aurora + Syne) |
| `shadows.ts` | `theme/shadows.ts` | Elevation stack as `--shadow-*` |
| `sxConfig.ts` | `theme/sxConfig.ts` | `lineClamp` utility class helper |
| `styles/keyFrames.ts` | `theme/styles/keyFrames.ts` + CSS | `linearLeftToRight`, `spin`, theme fade |
| `styles/popper.ts` | `theme/styles/popper.ts` + CSS | Popper arrow geometry via CSS vars |
| `styles/simplebar.ts` | `theme/styles/simplebar.ts` + CSS | Themed scrollbar / SimpleBar thumbs |
| `components/Button` soft/shape | `theme/components/button.ts` + `ui/button` | Soft / neutral / dashed / circle |
| `components/Typography` | `components/ui/Typography` + theme tokens | Variants consume CSS type tokens |
| `CssBaseline` | `theme/styles/baseline.css` | Global scroll, transitions, chrome |
| `ThemeProvider` | `context/ThemeContext` | Preset + mode + primary + slow transition |
| `ThemeToggler` | `theme/ThemeToggler.tsx` | Default group + named presets + swatches |
| Color presets | `theme/presets.ts` | Light/Dark/System + Luxury…Midnight |
| Jelly / blob | `theme/jelly.ts` | Blob paints from active primary |

### 9.2 Required FocusStream `theme/` tree

```
client/src/theme/
├── theme.ts                 # Aggregator (tokens + baseline hooks)
├── typography.ts            # Type scale + fontFamily options
├── shadows.ts               # Elevation shadows 1–7
├── sxConfig.ts              # lineClamp helper
├── presets.ts               # Preset definitions + picker options
├── jelly.ts                 # Jelly blob palette from primary
├── utils.ts                 # channel, lighten/darken, cssVarRgba
├── ThemeToggler.tsx         # Palette menu UI
├── index.ts                 # Public exports
├── palette/
│   ├── colors.ts            # lightPalette / darkPalette / greys / swatches
│   └── index.ts             # resolveThemeTokens + applyThemeToDocument
├── styles/
│   ├── keyFrames.ts         # Keyframe name constants
│   ├── popper.ts            # Popper class hooks
│   ├── simplebar.ts         # Scrollbar token hooks
│   └── baseline.css         # Keyframes + popper + simplebar + slow theme
└── components/
    └── button.ts            # Soft / neutral / shape style recipes
```

### 9.3 Gap checklist (doc vs implement)

| Piece | In theme.md (Aurora) | FocusStream status after port |
|-------|----------------------|-------------------------------|
| Palette folder | Yes | Required |
| Typography scale | Yes | Required (Aurora sizes + future-work Syne + FocusFlow display) |
| Shadows | Yes | Required |
| Keyframes | Yes | Required |
| Popper arrows | Yes | Required |
| SimpleBar / scroll | Yes | Required |
| Soft button | Yes | Required |
| Slow theme transition | Implied via CssBaseline / disableTransitionOnChange | Required: **enable** slow color transitions (~400ms) |
| sx / lineClamp | Yes | Required |
| Full MUI component overrides (DataGrid, etc.) | Yes | **Out of scope** for Tailwind app — port patterns as needed |
| Preset picker + primary swatches | Partial in free Aurora | Implemented |

### 9.4 Typography tokens (FocusStream)

Combine Aurora’s scale with FocusFlow product fonts:

| Token | Size | Weight | Role |
|-------|------|--------|------|
| `--type-h1` | 3rem (48px) | 700 | Page landmark |
| `--type-h2` | 2.625rem | 700 | Section |
| `--type-h3` | 2rem | 700 | Sub-section |
| `--type-h4` | 1.75rem | 700 | Card title |
| `--type-h5` | 1.5rem | 700 | Panel title |
| `--type-h6` | 1.3125rem | 700 | Dense heading |
| `--type-subtitle1` | 1rem | 400 | Subtitle |
| `--type-subtitle2` | 0.875rem | 500 | Dense subtitle |
| `--type-body1` | 1rem | 400 | Body |
| `--type-body2` | 0.875rem | 400 | Compact body |
| `--type-button` | 0.875rem | 700 | Buttons |
| `--type-caption` | 0.75rem | 400 | Caption |
| `--type-overline` | 0.75rem | 400 | Uppercase labels |
| Font heading/body | Syne (product) with Plus Jakarta / system fallbacks | | |

Modular type scale from product notes: `sm 0.75` → `5xl 4.21` rem.

### 9.5 Soft button recipe (port)

Same Aurora logic, Tailwind-friendly:

- Soft: `bg` = primary channel @ 0.15, text = primary/darker, hover alpha 0.2
- Neutral soft: surface-subtle bg, text-primary
- Circle/square: fixed hit targets 30 / 36 / 42
- Dashed: 1px dashed border-strong

### 9.6 Slow theme transitions

On `:root` / `body` / themed surfaces:

```css
transition:
  background-color 400ms cubic-bezier(0.4, 0, 0.2, 1),
  color 400ms cubic-bezier(0.4, 0, 0.2, 1),
  border-color 400ms cubic-bezier(0.4, 0, 0.2, 1),
  box-shadow 400ms cubic-bezier(0.4, 0, 0.2, 1);
```

Optional `data-theme-transition="slow"` on `<html>` (default on).

---

## 10. Consolidated FocusStream UI library

After the 2026-09-21 audit against [Aurora ecommerce](https://aurora.themewagon.com/dashboard/ecommerce), React primitives live in **one** tree:

```
client/src/components/ui/
├── index.ts
├── Button/  Typography/  Modal/  ModalToolbar/
├── Stack/   Surface/     Card/   Container/
├── Input/   Greeting/
└── *.tsx shims (legacy paths)
```

**Token recipes** (not React) stay in `theme/components/{button,surface}.ts` — same split as Aurora (`theme/components` = styling system, app `components` = composition).

### Usage

```tsx
import { Button, Typography, Card, Greeting, Input, Stack } from '@/components/ui';

<Greeting name="Captain" dateLabel="Monday, Sep 21, 2026" subtitle="Updates from yesterday." />
<Card><Typography variant="h6">Monthly Earnings</Typography></Card>
<Button variant="soft" softColor="primary">Action</Button>
<Input placeholder="Search" />
```

### Animation tokens (from live Aurora)

| Token | Value |
|-------|-------|
| Interactive color | `250ms cubic-bezier(0.4, 0, 0.2, 1)` |
| Paper / card shadow | `300ms cubic-bezier(0.4, 0, 0.2, 1)` |
| Theme color scheme | `400ms` slow transition on `:root` |

### Greeting pattern

Aurora: **“Good morning, Captain!”** — Typography h6 (21px / 700).  
FocusStream: `<Greeting name={firstName} />` on Lobby (authenticated).

Full audit: `business-logic.md/UI_CONSOLIDATION_AUDIT.md`  
Visual diff: `business-logic.md/AURORA_VISUAL_COMPARISON.md`

---

*Document generated from Aurora Free 1.0.0 source analysis. Section 9–10 document the FocusStream Tailwind port and UI consolidation.*

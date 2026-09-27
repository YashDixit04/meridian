# UI Consolidation Audit Report

**Date:** 2026-09-21  
**Reference:** [Aurora Ecommerce Dashboard](https://aurora.themewagon.com/dashboard/ecommerce)  
**Codebases:** Aurora Free `src/theme` (reference) + FocusStream `client/src` (product)

---

## 1. Executive summary

| Finding | Decision |
|---------|----------|
| Aurora `theme/components/*` are **MUI theme overrides**, not React UI | **Keep** under `theme/` — do not move into `components/ui` |
| FocusStream had flat `components/ui/*` + recipes in `theme/components/button|surface` | **Consolidate** React UI under `client/src/components/ui/{Name}/` |
| Live Aurora greeting is **“Good morning, Captain!”** (h6 / 21px / 700) | Ported as `<Greeting />`; Lobby updated |
| Soft button transitions use **0.25s cubic-bezier(0.4, 0, 0.2, 1)** | Applied to Button / Surface / Modal |
| Paper panels use **40px padding**, elevation2 filled inputs, soft-neutral icon buttons | Card + Input + soft Button recipes |

---

## 2. Aurora theme audit (Phase 1)

### 2.1 Architecture

- `theme.ts` aggregates CSS-var palette, shadows, component overrides.
- `palette/colors.ts` + `palette/index.ts` — semantic roles + `*Channel` for alpha.
- `typography.ts` — Plus Jakarta Sans scale (h1–overline).
- `shadows.ts` — 7 soft layered elevations.
- `styles/` — keyframes, popper arrows, SimpleBar.
- `sxConfig.ts` — `lineClamp`.

### 2.2 Override inventory (high level)

40 override modules covering Button (soft/shape/neutral), Chip, Paper, filled TextField, List, DataGrid, Tooltip, etc.  
**Inconsistencies:** unused `dashed` Button variant; Snackbar uses `theme.palette` not `theme.vars`; Paper `background` 1–5 uses raw hex; free build `dark: false`.

### 2.3 Live dashboard measurements (Playwright / CDP)

| Element | Measured |
|---------|----------|
| Font | `"Plus Jakarta Sans", sans-serif, "Spline Sans Mono", monospace` |
| Body | 16px / 400 / lh 25.6px / color `#1B2124` |
| Greeting | **21px / 700 / lh 29.4px** — “Good morning, Captain!” |
| Date line | 16px / 500 / `#4D595E` |
| KPI h4 | 28px / 700 / lh 42px |
| Soft neutral button | bg `#EBF2F5`, radius 50% (icon), transition **0.25s** cubic-bezier(0.4,0,0.2,1) |
| Paper panel | bg `#F7FAFC`, padding **40px**, box-shadow transition **0.3s** |
| Filled search | bg `#EBF2F5`, radius ~20px (pill search) |
| Primary token | `--aurora-palette-primary-main: #3385F0` |
| Scheme | `data-aurora-color-scheme="light"` |

Screenshot + a11y tree captured from `/dashboard/ecommerce` (sidebar, KPI row, Monthly Earnings cards, Top products table).

---

## 3. FocusStream UI audit (Phase 2)

| Location | Role | Styling |
|----------|------|---------|
| `components/ui/*` | React primitives | Tailwind + CVA + CSS vars |
| `theme/components/button.ts` | Soft/shape **recipes** | Class strings for Button |
| `theme/components/surface.ts` | Paper **recipes** | Class strings for Surface |

**Winner for product UI:** `components/ui` (React).  
**Winner for tokens/recipes:** `theme/*` (mirrors Aurora theme tree).  
Do **not** merge MUI overrides into React folders.

---

## 4. Consolidation (Phase 4) — done in FocusStream

```
client/src/components/ui/
├── index.ts                 # barrel
├── Button/                  # soft / shape / flow / follow …
├── Typography/              # + h5/h6/subtitle* (Aurora scale)
├── Modal/ + ModalToolbar/
├── Stack/                   # Aurora row + gap default
├── Surface/                 # Paper port
├── Card/                    # Surface + 24/40 panel pad
├── Container/               # max-w-7xl gutters
├── Input/                   # filled-first
├── Greeting/                # Good morning, {name}!
└── *.tsx shims              # legacy import paths
```

Legacy imports (`../ui/button`) still resolve via shims.

---

## 5. Codebase updates (Phase 6)

- Lobby greeting → `<Greeting name={displayName} />` (Aurora pattern).
- Button / Surface / Modal transitions → Aurora 250–300ms easing.
- Barrel export `import { … } from '@/components/ui'`.

---

## 6. Playwright verification

| Test | Result |
|------|--------|
| Live Aurora ecommerce CDP style audit | Captured (this report §2.3) |
| `tests/e2e/theme.spec.ts` | Previously passing (light/dark/preset/swatch) |
| Visual comparison notes | See `business-logic.md/AURORA_VISUAL_COMPARISON.md` |

---

## 7. Out of scope / intentional differences

- FocusStream keeps product fonts (Syne + Jakarta) and jelly blob mascot beside greeting.
- Full MUI DataGrid / ecommerce widgets not ported — only design tokens + shared UI primitives.
- Aurora Pro ecommerce source is not in the free package; live site was the source of truth for greeting/layout.

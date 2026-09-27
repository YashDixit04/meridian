# Aurora vs FocusStream — Visual Comparison

**Reference URL:** https://aurora.themewagon.com/dashboard/ecommerce  
**Captured:** 2026-09-21 via Cursor browser + CDP `Runtime.evaluate`

---

## Greeting

| Aspect | Aurora (live) | FocusStream (after port) |
|--------|---------------|--------------------------|
| Copy | `Good morning, Captain!` (time-based) | `<Greeting />` → `Good morning, {firstName}!` |
| Size / weight | 21px / 700 (h6) | Typography `variant="h6"` → `--type-h6-size` 1.3125rem |
| Date line | `Monday, Sep 21, 2026` · 16px / 500 · secondary | Optional `dateLabel` via subtitle2 |
| Subtitle | `Updates from yesterday.` | Goal progress / “Ready when you are.” |
| Extra | — | Jelly blob mascot (product) |

## Motion

| Aspect | Aurora | FocusStream |
|--------|--------|-------------|
| Soft button | `background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1)` | Button base transition 250ms same easing |
| Paper shadow | `box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)` | Card `duration-[300ms]` same easing |
| Theme switch | CSS-var driven | `data-theme-transition="slow"` 400ms colors |

## Surfaces & spacing

| Aspect | Aurora | FocusStream |
|--------|--------|-------------|
| Panel pad | 40px | `Surface panel` / `Card` → `p-6 md:p-10` (24/40) |
| Soft fill | grey[100] `#EBF2F5` | `bg-surface-subtle` / elevation tokens |
| Soft icon btn | circle, no elevation | `variant="soft"` + `shape="circle"` |
| Primary | `#3385F0` (default light) | Theme presets / FocusFlow accent tokens |

## Layout chrome

| Aspect | Aurora | FocusStream |
|--------|--------|-------------|
| Shell | 300px sidenav + top app bar | Sticky Navbar + lobby grid |
| Search | Filled pill ~38px | `Input` filled + `SearchInputGroup` |
| Cards | White / grey[50] modules | `Card` / `Surface` |

## Verification commands

```bash
# Theme system
npx playwright test tests/e2e/theme.spec.ts

# Live reference (manual / agent CDP)
# open https://aurora.themewagon.com/dashboard/ecommerce
# assert greeting heading “Good morning,” + username
```

## Gaps remaining (non-blocking)

1. Aurora KPI sparkline cards / DataGrid not productized in FocusStream.
2. Sidebar IA differs (Focus Rooms vs E-commerce nav).
3. Caveat “Hello .” display font removed from authenticated greeting in favor of Aurora h6; Caveat still available via `.greeting-display-font` if needed for marketing surfaces.

# Client `src` Component UI Audit

> **Migration status (2026-09-20):** Phases 1–5 from this audit have been executed. See [`UI_MIGRATION_STATUS.md`](./UI_MIGRATION_STATUS.md). Remaining intentional exceptions: brand hex in `constants/platforms.ts`, local `@dicebear` package in ProfilePictureModal (not CDN), RoomPage mobile drawer scrim.

Audit of every `.tsx` under `client/src/components` and `pages`, plus shared UI primitives.  
Goal: find **duplication**, **slow/wasteful fallbacks**, **bypassed shared UI**, **inline/hex colors** instead of `index.css` tokens, and other **hardcoded** values.

Design tokens (use these): `--color-bg`, `--color-surface`, `--color-surface-subtle`, `--color-border`, `--color-border-strong`, `--color-text-primary`, `--color-text-secondary`, `--color-primary`, `--color-accent-cyan`, `--color-accent-mint`, `--color-accent-warm` → Tailwind aliases like `bg-surface`, `text-text-primary`, `border-border`, `bg-primary` / `cobalt`, `cyan`.

Shared UI that should be preferred: `ui/Modal`, `ui/button` (`Button` / `ShinyButton` / `CircleButton`), `ui/Typography`, `UserAvatar`.

---

## Executive summary

| Category | Worst offenders |
|----------|-----------------|
| Hardcoded hex / arbitrary colors | `StudyFeedTimeline`, `TimelinePostItem`, `CommentItem`, `DirectMessageModal`, `PostComposer`, `notification-panel` |
| Bypass `Modal` | `DirectMessageModal`, `LikesModal`, `LobbyPage` footer, `StudyHoursChart` TZ, `App` login/ban, `RoomPage` ban |
| Bypass `UserAvatar` (dicebear copy-paste) | Feed, DM, Navbar, ProfileHeader, UserSearch, CommunityFeed, PostTimeline |
| Wasteful API fallbacks | `CommunityFeed`, `PostTimeline`, `CommunityFeedCompact`, `DiscoverPeersWidget` |
| Dead / duplicate UI | `ui/notification-panel.tsx` (unused; duplicated by `NotificationDropdown`) |
| Hardcoded data arrays | `EditProfileModal` `COUNTRIES`, `DiscoverPeersWidget` `DEFAULT_PEERS`, `StudyHoursChart` timezones |

---

## Top cross-cutting duplicates

1. **Dicebear avatar URL** — `https://api.dicebear.com/7.x/avataaars/svg?seed=…` pasted across ~15 files instead of `UserAvatar` / `normalizeAvatarUrl`.
2. **Custom modal shells** — `fixed inset-0 … bg-black/75|80 backdrop-blur` + manual ESC, despite `Modal.tsx`.
3. **Pink avatar circle** — `bg-[#f47285]` / `bg-[#f46877]` in PostCard, CommentItem, PostComposer, PostTimeline, TimelinePostItem, StudyFeedTimeline.
4. **Like / follow fetch** — near-identical POST blocks; **two follow URLs** (`/api/users/:id/follow` vs `/api/profile/:id/follow`).
5. **Post author mapping** — `authorName \|\| 'Scholar'`, likes parsing, `avatarBg` repeated in PostTimeline, CommunityFeedCompact, PostComposer.
6. **Ban overlay** — duplicated between `App.tsx` and `RoomPage.tsx`.

---

## Per-file findings

### Shared UI primitives

#### `components/ui/Modal.tsx` — low
- Backdrop `bg-blue-950/40`; header `border-white/10` (dark-biased).
- **Fix:** Tokenize overlay (`bg-overlay`) and borders.

#### `components/ui/button.tsx` — medium
- Shiny variants use emerald/indigo/rose + `shadow-[0_0_15px_rgba(…)]` outside design tokens (L60–64).
- **Fix:** Drive glow/tint from primary / semantic CSS vars.

#### `components/ui/Typography.tsx` — high
- Variants hardcode dark sanctuary colors (`text-white`, `text-slate-*`) — fights light-theme tokens; call sites constantly override with `text-text-primary`.
- **Fix:** Base variants on `text-text-primary` / `text-text-secondary`.

#### `components/ui/notification-panel.tsx` — high
- **Never imported.** Parallel to `NotificationDropdown`. Heavy `neutral-*`, `bg-white`, arbitrary shadows.
- **Fix:** Delete or merge into one panel; restyle with tokens.

#### `components/UserAvatar.tsx` — low (good API, underused)
- Almost no feed/DM consumers use it.
- **Fix:** Single avatar path; remove dicebear strings at call sites.

---

### Modals

#### `modals/AccountSettingsModal.tsx` — low / mostly clean
- Uses Modal + Button + Typography.
- Hardcoded delete `reasons` array (acceptable product copy).

#### `modals/ConfirmDeleteModal.tsx` — clean
- Correct shared UI usage.

#### `modals/ModerationWarningModal.tsx` — clean
- Shared Modal stack; decorative rose pulse OK.

#### `DirectMessageModal.tsx` — high
- Custom shell (`fixed inset-0 … bg-black/75`) — no `Modal`.
- Little/no Button/Typography/UserAvatar; dicebear `<img>` ~8×.
- Hardcoded: `bg-[#2563eb]`, `bg-[#f1f5f9]`, `dark:bg-[#1e293b]`, composer `bg-[#f8fafc]` / `dark:bg-[#0f172a]`.
- **Fix:** `Modal` + `UserAvatar` + tokens (`bg-primary`, `bg-surface-subtle`).

#### `profile/EditProfileModal.tsx` — medium
- Uses Modal/Button/Typography (good).
- **Hardcoded `COUNTRIES`** (partial list) and `PLATFORMS`.
- Defensive US-default country logic adds complexity.
- **Fix:** Centralize countries (see `constants/countries.ts`); extract platforms.

#### `profile/ProfilePictureModal.tsx` — low / mostly clean
- Uses Modal/Button/Typography.

#### `feed/LikesModal.tsx` — high
- Full custom dialog; no Modal/Button/Typography/UserAvatar.
- Entire `slate-*` / emerald palette; dicebear fallback; duplicated ESC + follow logic.
- **Fix:** Rewrite on `Modal` + shared UI + tokens.

---

### Feed

#### `feed/PostCard.tsx` — high
- Avatar `bg-[#f46877]` + dicebear instead of `UserAvatar`.
- Links `text-[#3b82f6]`.
- **Fix:** `UserAvatar`; `text-primary` / `text-cobalt`.

#### `feed/CommentItem.tsx` — high
- Avatars: `bg-[#00b4d8]`, `bg-[#f46877]`, dynamic `style={{ backgroundColor }}`.
- Dicebear ×3; `text-[#3b82f6]` for links/spinner; raw action buttons.
- **Fix:** `UserAvatar` + shared reply composer; token blues.

#### `feed/CommentTree.tsx` — high
- Submit `bg-[#3b82f6]`; toggle/loader `#3b82f6`; slate reply box duplicates CommentItem.
- **Fix:** Shared reply UI; `Button` primary variant.

#### `feed/PostComposer.tsx` — high
- Optimistic `avatarBg: 'bg-[#f47285]'` + dicebear.
- Well: `bg-[#f0f4f9]` / `dark:bg-[#0E1736]` / `border-[#1D2D63]` (hardcodes CSS-var hexes).
- Post button `bg-[#dbeafe] text-[#1e40af]`; inline avatar not `UserAvatar`.
- **Fix:** `bg-surface-subtle`, `border-border`; `UserAvatar`; shared post mapper.

#### `feed/TimelinePostItem.tsx` — high
- Duplicate like fetch; optimistic `avatarBg: 'bg-[#f47285]'`.
- Headings `text-[#1e3a8a] dark:text-[#60a5fa]`; links `text-[#1e60e6]`.
- **Fix:** Shared PostItem + UserAvatar + token navy/cyan.

#### `feed/StudyFeedTimeline.tsx` — high
- Mock-only data with many `bg-[#…]` and dicebear seeds.
- **Fix:** Remove from prod path or move to fixtures with token classes.

#### `feed/VirtualizedFeed.tsx` — clean
- `style={{…}}` only for virtualizer positioning (appropriate).

#### `feed/GatedFeedCurtain.tsx` — medium
- Mask `style` OK; raw `<h3>`/`<p>`/`<button>` instead of Typography/Button.
- **Fix:** Use shared UI.

#### `feed/threadTreeUtils.ts` — low
- Default stroke `'#cfd5e391'` magic color.
- **Fix:** CSS var / token for thread lines.

---

### Profile

#### `profile/PostTimeline.tsx` — high
- Endpoint fallback: `/api/posts/user/:id` then `/api/posts?userId=` — extra latency.
- Debug: `window.__fetchStarted`, `__postTimelineDebug`, `__fetchError`.
- Maps posts with `avatarBg: 'bg-[#f47285]'` + dicebear; duplicated like handler.
- **Fix:** One posts API; remove window debug; shared mapper + UserAvatar.

#### `profile/ProfileHeader.tsx` — medium
- Custom avatar + dicebear (not UserAvatar); follow chip `bg-[#e0edff] text-[#2563eb]`.
- Decorative dicebear seeds (Okkotsu/Nanami).
- **Fix:** `UserAvatar`; token follow chip; real peer data or remove fakes.

#### `profile/UserConnectionsList.tsx` — medium
- Custom avatar markup; `localStorage.getItem('focusflow_jwt')` duplicated; `window.__userConnectionsListRendered` debug.
- **Fix:** Shared auth helper + UserAvatar + Button; delete debug.

#### `profile/SocialConnectors.tsx` — medium
- Brand hex hovers (`#24292e`, `#0077b5`, `#1da1f2`, `#5865f2`, `#ff0000`) — somewhat justified.
- **Fix:** Keep brand map in constants; base chrome on tokens.

#### `profile/TrophyCase.tsx` — medium
- Mock milestones; tier `shadow-[…rgba…]` + zinc/amber; no Typography.
- **Fix:** Tokenize tiers; empty defaults without fake progress.

#### `profile/StreakCards.tsx` — low–medium
- Fake default stats mask missing data.
- **Fix:** Empty/loading state instead of hardcoded streak numbers.

#### `profile/StudyHoursChart.tsx` — medium
- Custom TZ modal (bypasses Modal); hardcoded timezone `<option>` list.
- SVG stops hardcode `#1E60E6` / `#3BD5D3` (same as tokens but not referenced).
- **Fix:** `Modal` + shared TIMEZONES; CSS vars for chart colors.

---

### Lobby / room / chrome

#### `lobby/DiscoverPeersWidget.tsx` — high
- `DEFAULT_PEERS` mock users on API failure — silent fake social graph.
- Local `getInitials` duplicates UserAvatar; follow URL differs from feed.
- **Fix:** Empty state on failure; `UserAvatar`; unify follow endpoint.

#### `lobby/CommunityFeedCompact.tsx` — medium–high
- Parallel feed fetch with following → `/api/posts` fallback; dicebear in normalizer; like POST duplicated.
- **Fix:** Shared `useFeed` / post mapper.

#### `lobby/ActiveRoomsWidget.tsx` — low / mostly clean
- Uses UserAvatar, Button, Typography — good reference.

#### `lobby/TodayTasksWidget.tsx` — low
- Typography used; raw icon buttons OK for dense widget.

#### `lobby/PomodoroWidget.tsx` — low / clean
- Typography + sensible `PRESETS`.

#### `Navbar.tsx` — medium
- Profile `<img>` + dicebear instead of UserAvatar.
- **Fix:** `UserAvatar` for profile chip.

#### `NotificationDropdown.tsx` — medium–high
- Reimplements unused `notification-panel`; mix of tokens + `dark:shadow-[…rgba…]`.
- **Fix:** One notification module; token shadows.

#### `ChatPanel.tsx` — low–medium
- Uses UserAvatar; raw tabs/send (no Button/Typography).

#### `VideoTile.tsx` — medium
- Uses UserAvatar; rest is zinc/amber + rgba glow shadows (off tokens).
- **Fix:** Map to surface/border tokens or document as video-only palette.

#### `VideoGrid.tsx` — medium
- Layout `style` OK; control bar raw `<button>`s instead of Button icon variants.

#### `room/PinnedUserToast.tsx` — low–medium
- Amber/slate + glow shadow; Typography used.

#### `ads/AdPlaceholder.tsx` — medium
- Standardizes ad surfaces as dashed-border placeholders without hardcoded promotional creatives.
- **Fix:** Use the shared placeholder for new ad placements.

#### `search/UserSearch.tsx` — medium
- CircleButton + Typography; results use dicebear `<img>` not UserAvatar.

---

### Pages

#### `pages/FeedPage.tsx` — clean
- Thin wrapper; uses `bg-bg text-text-primary`.

#### `pages/CommunityFeed.tsx` — high
- Heavy fallback ladder (suggested peers ×2, discover → `/api/posts`) — extra latency.
- Duplicated follow/like; dicebear in UI.
- **Fix:** Single feed service + clear empty states; UserAvatar.

#### `pages/LobbyPage.tsx` — medium
- Footer modals custom shell (no Modal); hardcoded soundscape labels.
- **Fix:** `Modal` + Button for footer dialogs.

#### `pages/ProfilePage.tsx` — medium
- Long id fallback chains; default TZ `'America/New_York'`.
- **Fix:** Resolve `profileId` once; share TZ constant with StudyHoursChart.

#### `pages/RoomPage.tsx` — medium
- Ban overlay custom shell + `bg-zinc-950` duplicates App ban UI; raw Exit button.
- **Fix:** Shared `BanOverlay` on Modal + Button.

#### `App.tsx` — high
- Login modal + ban overlay custom shells — no Modal/Button/Typography; ban UX duplicates RoomPage.
- **Fix:** Shared AuthModal + BanModal using `Modal`.

---

### Context (UI-adjacent)

#### `context/AuthContext.tsx` — medium
- Dicebear avatar assignment on login.
- **Fix:** Prefer empty avatar handled by `UserAvatar`; avoid persisting dicebear URLs unless API requires it.

---

## Hardcoded values checklist

| Location | What |
|----------|------|
| `EditProfileModal.tsx` | ~~Partial `COUNTRIES` array~~ → moved to `constants/countries.ts` (full ISO list) |
| `EditProfileModal.tsx` | `PLATFORMS` array |
| `DiscoverPeersWidget.tsx` | `DEFAULT_PEERS`, `COLOR_PALETTES` |
| `StudyHoursChart.tsx` | Timezone options; SVG `#1E60E6` / `#3BD5D3` |
| `TrophyCase.tsx` / `StreakCards.tsx` | Mock milestones / streak defaults |
| `LobbyPage.tsx` | Soundscape names |
| `AccountSettingsModal.tsx` | Delete reasons (OK as copy) |
| `StudyFeedTimeline.tsx` | Full mock feed + hex avatarBgs |
| `ads/AdPlaceholder.tsx` | Shared ad placeholder styling |
| `ProfilePage.tsx` | Default `'America/New_York'` |
| `SocialConnectors.tsx` | Brand brand-color hex map |
| `threadTreeUtils.ts` | Stroke `#cfd5e391` |
| Feed/DM/profile many files | Dicebear base URL + pink `#f47285` / blue `#3b82f6` / navy `#1e3a8a` |
| `index.css` scrollbar hover | Hardcoded `#3BD5D3` (could use `var(--color-accent-cyan)`) |

---

## Suggested priority order

1. Kill or merge `notification-panel.tsx`; adopt `Modal` for all custom overlays.
2. Adopt `UserAvatar` everywhere; kill dicebear / hex `avatarBg` duplication.
3. Retokenize `Typography` defaults to light/dark CSS vars.
4. Extract shared `likePost` / `toggleFollow` (one API path) + post normalizer.
5. Remove mock production fallbacks (`DEFAULT_PEERS`, fake streak/trophy, StudyFeedTimeline mocks).
6. Move `COUNTRIES` / timezones / platforms to shared constants (countries done via `constants/countries.ts`).

---

*Generated from a full pass over `client/src` components and pages. Re-run after major UI refactors.*
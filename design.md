# HabitFlow — Design System

**Version:** 3.1 (Phase 3 — Premium Light Redesign + final branding/CTA polish)
**Status:** Reflects the visual identity as implemented in source after the Phase 3 Premium Light transformation.

> **Premium Light is the only supported theme. There is no Dark Mode.**
> There is no theme switcher, no `dark:` variants, and no automatic system-theme
> switching anywhere in the UI. The former "dark navy + emerald" identity from
> v2.0 has been fully retired. Every color, radius, shadow, font and motion value
> is declared as a semantic custom property in `src/index.css` `@theme` (Tailwind
> CSS v4, CSS-first — there is no `tailwind.config.js`), so components consume
> tokens like `bg-bg`, `text-ink`, `bg-accent`, `border-border` and never
> hard-code raw HEX or palette utilities (`slate-*`, `emerald-*`, etc.).
>
> **One inert exception:** the persisted `UserProfile.theme` schema field
> (`'dark' | 'light' | 'system'`, default `'dark'`) is intentionally left
> untouched to honor the "do not change localStorage keys or data schemas"
> constraint. Nothing reads it for styling — the app always renders Premium
> Light regardless of its value.

---

## 1. Color System

The identity is a **warm paper-light canvas with a signature lime accent and a
deep forest-green ink**, supported by accessible semantic state families and a
pastel category palette harmonized to the lime.

### 1.1 Backgrounds & Surfaces

| Role | Token / Class | Hex | Usage (verified in source) |
|---|---|---|---|
| Page background | `--color-bg` / `bg-bg` | `#F8F9F5` | `html`, `body`, app shell, skeleton, onboarding wrapper |
| Secondary background | `--color-bg-secondary` / `bg-bg-secondary` | `#F1F3ED` | Section bands, inset tracks, segmented-control tracks, carousel wrapper, disabled fills |
| Surface | `--color-surface` / `bg-surface` | `#FFFFFF` | Cards, panels, modals, inputs, library tiles, dropdowns |
| Elevated surface | `--color-surface-elevated` | `#FFFFFF` | Raised cards/dropdowns (differentiated by shadow, not color) |
| Sticky header | `bg-bg/85` + `backdrop-blur-md` | — | Top navigation bar |
| Mobile bottom nav | `bg-surface/95` + `backdrop-blur-lg` | — | Fixed bottom tab bar |
| Modal overlay | `bg-ink/40` + `backdrop-blur-sm` | — | All modal dialogs |

### 1.2 Ink (text) ramp

| Role | Token / Class | Hex | Contrast on white |
|---|---|---|---|
| Primary ink | `--color-ink` / `text-ink` | `#20251F` | AAA (≈15:1) |
| Secondary ink | `--color-ink-secondary` / `text-ink-secondary` | `#5F655C` | AA |
| Muted ink | `--color-ink-muted` / `text-ink-muted` | `#777E75` | AA-large / decorative only |
| Ink on accent | `--color-ink-on-accent` / `text-ink-on-accent` | `#20251F` | 9.71:1 on lime (AAA) |
| Accessible green text | `--color-accent-text` / `text-accent-text` | `#3F6B12` | 5.35:1 on white (AA) |

### 1.3 Accent (lime) & brand

| Role | Token / Class | Hex | Usage |
|---|---|---|---|
| Primary accent | `--color-accent` / `bg-accent` | `#B8E65A` | Primary action **fill**, selection, achievement, checked checkbox, active segment |
| Accent hover | `--color-accent-hover` / `bg-accent-hover` | `#A5D644` | Hover on accent fills |
| Accent soft | `--color-accent-soft` / `bg-accent-soft` | `#F1F8E5` | Soft highlight bg, success tint, active nav tint, icon chips |
| Accent border | `--color-accent-border` / `border-accent-border` | `#CDE8A0` | Borders on accent-soft surfaces |
| Forest | `--color-forest` / `bg-forest` | `#263629` | Deep brand green: focus rings, dark icon chips, secondary toggle fills |
| CTA fill | `--color-cta` / `cta-primary` | `#171A16` | Rich-black fill for the **Add Habit** CTA only |
| CTA hover | `--color-cta-hover` | `#262B24` | Hover on the CTA fill (slightly lighter black) |
| CTA active | `--color-cta-active` | `#0F110E` | Pressed state on the CTA fill |
| CTA ink | `--color-cta-ink` | `#FFFFFF` | Label + plus icon on the CTA fill |

> **Accessibility rule (non-negotiable):** the lime `#B8E65A` is a **fill only —
> never text on white** (as text it is 1.34:1 and fails). Text/icons placed on a
> lime fill always use `ink` (`#20251F`, 9.71:1). Any green *text* on a light
> surface uses `accent-text` (`#3F6B12`, 5.35:1) or the semantic `success` ink.

> **Brand mark:** the official HabitFlow logo — a lime circle with a bold black
> checkmark — is the only brand identifier. Source artwork lives at
> `design-assets/HabitFlow-logo-source.png`; generated variants in `public/`
> (`favicon.png` 48, `logo.png` 256 for in-app use, `apple-touch-icon.png` 180,
> `pwa-192x192.png`, `pwa-512x512.png`, `pwa-maskable-512x512.png`). In-app
> variants are transparent PNGs rendered with `object-contain`; home-screen /
> maskable variants are composited on paper `#F8F9F5`. It is never stretched,
> cropped or recolored, and it never replaces functional checkmarks or habit
> completion indicators (those stay `lucide-react`).

### 1.4 Borders, focus & selection

| Role | Token / Class | Hex |
|---|---|---|
| Default border / divider | `--color-border` / `border-border` | `#E8EBE3` |
| Strong border | `--color-border-strong` / `border-border-strong` | `#D8DDD0` |
| Focus ring | `--color-focus` | `#263629` (2px solid, `outline-offset: 2px`) |
| Selection background | `--color-selection-bg` | `#E4F5C4` |
| Selection foreground | `--color-selection-ink` | `#20251F` |

### 1.5 Semantic state families

Each family exposes four coordinated tokens: base **ink**, soft **bg**,
**border**, and a saturated **fill** (for dots, bars, non-text indicators).

| State | ink | bg | border | fill | Canonical treatment |
|---|---|---|---|---|---|
| Success | `success` `#3F6B12` | `success-bg` `#F1F8E5` | `success-border` `#CDE8A0` | `success-fill` `#8CC63F` | Positive deltas, valid backup, progress ring arc |
| Warning | `warning` `#8A5A00` | `warning-bg` `#FBF1DE` | `warning-border` `#F0DCB8` | `warning-fill` `#E0A43C` | Streak flame, **missed** habit state, archived, offline toast, partial day |
| Error | `error` `#B42318` | `error-bg` `#FDECEA` | `error-border` `#F5C6C0` | `error-fill` `#E0655C` | Destructive actions, negative deltas, "Full Replace" import, validation errors |
| Info | `info` `#175E88` | `info-bg` `#E7F2F9` | `info-border` `#BBDCEE` | `info-fill` `#4E9BC8` | Streak-freeze / Holiday Mode, frozen heatmap cells, local-only notices, restore section |
| Neutral | `neutral` `#5F655C` | `neutral-bg` `#F1F3ED` | `neutral-border` `#E8EBE3` | `neutral-fill` `#A8AEA4` | Rest day, flat/no-data deltas |
| Disabled | `disabled` `#A8AEA4` | `disabled-bg` `#F1F3ED` | `disabled-border` `#E8EBE3` | — | Exhausted freeze allowance, inert controls |

> **"Missed" reconciliation (enforced).** The v1 foundation doc was internally
> inconsistent about the missed-day color (warning in one section, error in
> another). This implementation standardizes on **warning** for habit cards and
> status badges (a missed day is a recoverable, non-destructive state, visually
> paired with the streak flame). The error tint appears **only** as a dense
> heatmap accent where a stronger signal is warranted. Never wire "missed" to the
> destructive `error` family on cards.

### 1.6 Category palette (`--color-cat-*` in `src/index.css`)

Each category provides `-bg`, `-ink`, `-icon`, `-border`, `-progress` tokens —
pastel, harmonized to the lime so no category competes with the accent.

| Category | Name | ink (text) | icon | progress bar | Icon (lucide) |
|---|---|---|---|---|---|
| `fitness` | Fitness / Body | `#8A5A00` | `#C77E14` | `#E0A43C` | `Dumbbell` |
| `mind` | Mind & Focus | `#175E88` | `#2E7FB0` | `#4E9BC8` | `Brain` |
| `productivity` | Productivity | `#3F6B12` | `#6FA32B` | `#8CC63F` | `Zap` |
| `learning` | Learning | `#4A3F9F` | `#6A5FD0` | `#7A6FE0` | `BookOpen` |
| `health` | Health & Routine | `#B42318` | `#D2554C` | `#E0655C` | `HeartPulse` |

Consumed via local maps, not the legacy `CATEGORIES[].color` string:
`HabitCard.tsx` (`CAT_CHIP` / `CAT_ICON`), `HabitForm.tsx` (`CAT_SELECTED`),
`HeatmapAnalytics.tsx` (`CAT_DOT` → `text-cat-*-icon`), `HabitsPage.tsx`
(`CAT_TEXT` → `text-cat-*-ink`). The `color` field on `CATEGORIES` remains in
the type but is no longer used for rendering.

### 1.7 Heatmap intensity ramp (`--color-heat-*`)

A 5-step lime ramp from empty to fully complete, plus distinct frozen treatment.

| Intensity | Meaning | Token / Class | Hex |
|---|---|---|---|
| 0 | 0% | `bg-heat-0` (+ `border-border`) | `#F1F3ED` |
| 1 | 1–39% | `bg-heat-1` | `#E9F5D3` |
| 2 | 40–74% | `bg-heat-2` | `#CDE8A0` |
| 3 | 75–99% | `bg-heat-3` | `#A9D95C` |
| 4 | 100% | `bg-heat-4` | `#7CB92E` |
| Frozen | any (Holiday Mode) | `bg-heat-frozen` + `border-heat-frozen-border` | `#CFE3F2` / `#9CC6E0` |

Reserved-but-unused tokens `--color-heat-rest` (`#E8EBE3`) and
`--color-heat-missed` (`#F6D5D2`) exist for future dense-grid states; the
current heatmap branches only on `isFrozen` + `intensity` (preserving the
existing analytics logic).

### 1.8 Category progress bar colors (`HeatmapAnalytics.tsx`)

Threshold-driven, semantic (not per-category): `≥80%` → `bg-success-fill` ·
`≥50%` → `bg-success` · `≥20%` → `bg-warning-fill` · `<20%` → `bg-neutral-fill`.
Track: `bg-bg-secondary`, `h-2`, `rounded-full`, minimum visible width 3% when
data exists.

### 1.9 Confetti palette (`src/utils/confetti.ts`)

Aligned to the brand ramp (decorative; reduced-motion guarded):

- Streak / onboarding celebration: `#B8E65A, #8CC63F, #263629, #E0A43C, #4E9BC8`
- All-complete celebration: `#B8E65A, #A5D644, #8CC63F, #7CB92E`

---

## 2. Typography

### 2.1 Font families (`src/index.css` `@theme` + `src/main.tsx`)

| Token | Stack | Loaded from |
|---|---|---|
| `--font-sans` | `'Manrope Variable', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif` | **Self-hosted** via `@fontsource-variable/manrope` (`wght.css`, WOFF2 bundled same-origin, `font-display: swap`) |
| `--font-mono` | `'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace` | **Self-hosted** via `@fontsource-variable/jetbrains-mono` (WOFF2, same-origin) |

Manrope replaced the former Geist variable font. Both are imported in
`src/main.tsx` and bundled by Vite into `dist/assets/*.woff2`, so they are served
same-origin and cached by the service worker — **no remote request, no offline
gap, no layout shift** (PWA/offline-safe). Sans is the default for all UI text.

> **Mono is reserved for genuinely technical / export contexts only** — the
> backup validation summary grid (`BackupModal.tsx`) and the timezone identifier
> (`AnalyticsPage.tsx`). **Consumer statistics no longer use mono**: stat values,
> streak counts, percentages, comparison deltas, day numbers, times and target
> units use the sans face with `tabular-nums` for alignment.

### 2.2 Weight scale

| Weight | Class | Usage |
|---|---|---|
| 800 | `font-extrabold` | Wordmark "HabitFlow", hero H1 greeting, big stat values |
| 700 | `font-bold` | Card/section headings, stat numbers, primary buttons, habit titles |
| 600 | `font-semibold` | Nav links, form labels, badges, secondary buttons, category names |
| 500 | `font-medium` | Body labels, mobile tab labels, dropdown items |
| 400 | (default) | Body copy, muted text |

### 2.3 Heading hierarchy

| Level | Classes | Where |
|---|---|---|
| H1 (hero) | `text-[28px] leading-9 sm:text-[32px] sm:leading-10 font-extrabold tracking-[-0.02em] text-ink` | Hero greeting — **plain ink, no gradient** |
| H1 (page) | `text-xl font-bold text-ink tracking-tight` / `text-2xl font-bold text-ink` | Library, Settings, Analytics headers |
| H2 (modal title) | `text-lg/xl font-bold text-ink tracking-tight` | Backup, Settings, Onboarding modals |
| H2 (section) | `text-base font-bold text-ink tracking-tight` | Analytics card headers |
| Eyebrow / kicker | `text-xs font-semibold uppercase tracking-[0.08em]/tracking-wider text-accent-text` | Section eyebrows, "Welcome to HabitFlow", "Live Today" |

### 2.4 Body, labels & captions

| Role | Classes |
|---|---|
| Body (modal copy) | `text-xs sm:text-sm text-ink-secondary leading-relaxed` |
| Form label | `text-xs font-medium/semibold text-ink-secondary` |
| Optional marker | `text-ink-muted text-[11px] font-normal` "(optional)" |
| Required marker | `text-error` "*" |
| Micro label / badge | `text-[11px]`, `uppercase` for day letters, `font-semibold` for badges |
| Helper / caption | `text-[11px] text-ink-secondary` (muted only for large/decorative) |

> **11px floor (enforced):** the smallest type anywhere is `text-[11px]`, used
> sparingly for metadata and never for primary content. Small meaningful labels
> prefer `ink-secondary` (AA) over `ink-muted` (AA-large only).

### 2.5 Numeric statistics

- Big stat values: `text-xl sm:text-[28px] font-extrabold text-ink tabular-nums` (**no mono**).
- Streak pill: `text-xs font-semibold tabular-nums text-warning` on `bg-warning-bg border-warning-border`.
- Comparison percentages: `text-sm font-bold text-ink tabular-nums` current, `text-[11px] text-ink-muted tabular-nums` previous; delta pill `text-xs font-bold tabular-nums` (no mono).
- Character counter (journal): `text-xs text-ink-muted tabular-nums`.
- Category / overall rates: `font-bold text-ink tabular-nums` (overall in `text-accent-text`).

---

## 3. Spacing & Layout

### 3.1 Spacing scale (Tailwind default, 4px base)

Common steps: `0.5`–`8`. Vertical rhythm: `space-y-1.5` (labels/inputs),
`space-y-3`–`space-y-4` (blocks), `space-y-5`–`space-y-6` (modal sections).

### 3.2 Container & layout widths

| Element | Value |
|---|---|
| `<main>` (AppShell) | `flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12` — full-bleed; each page owns its max-width |
| Today dashboard | `mx-auto w-full max-w-[720px] space-y-6` |
| Analytics | `mx-auto w-full max-w-7xl space-y-6` |
| Habits library | `mx-auto w-full max-w-5xl space-y-4` |
| Settings | `mx-auto w-full max-w-2xl space-y-5` |
| Habit form page | `mx-auto w-full max-w-lg space-y-4` |
| Modal width (large) | `max-w-lg` (Backup, Settings, Onboarding `max-w-md`) |
| Modal max height | `max-h-[90vh] overflow-y-auto` |
| Library grid | `grid-cols-1 md:grid-cols-2 gap-4` |
| Mobile bottom clearance | `pb-24 md:pb-12` on `<main>` |

### 3.3 Border-radius scale

| Token | Value | Tailwind | Usage |
|---|---|---|---|
| `--radius-chip` | 8px | `rounded-lg` | Chips, badges, segmented inner buttons |
| `--radius-checkbox` | 10px | `rounded-[10px]` | Habit checkbox (7×7 box) |
| `--radius-control` | 12px | `rounded-xl` | Buttons, inputs, icon chips, dropdowns |
| `--radius-card` | 16px | `rounded-2xl` | Cards, stat tiles, date chips, banners |
| `--radius-panel` | 20px | `rounded-[20px]` | First-run panel, large insets |
| `--radius-modal` | 24px | `rounded-3xl` | Modals, large analytics panels |
| — | — | `rounded-full` | Pills, progress bars, status dots, day toggles |

Heatmap cells `rounded-[4px]`, legend swatches `rounded-[3px]`.

### 3.4 Shadows (`--shadow-*`, warm-tinted — never black glows)

| Token / Class | Definition | Usage |
|---|---|---|
| `shadow-card` | `0 1px 2px rgba(32,37,31,.04), 0 1px 3px rgba(32,37,31,.06)` | Cards, primary buttons, stat tiles, selected chips |
| `shadow-elevated` | `0 2px 6px …06, 0 4px 12px …06` | Hovered cards |
| `shadow-dropdown` | `0 4px 8px …08, 0 12px 24px …10` | Menus, toasts, tooltip |
| `shadow-modal` | `0 8px 16px …10, 0 24px 48px …14` | Modal panels |

All shadow colors derive from ink `rgba(32,37,31,…)`, keeping them warm rather
than the retired cool slate glaze.

### 3.5 Component dimensions

| Component | Value |
|---|---|
| Header "Add Habit" | `h-11 rounded-xl cta-primary` (rich black, white label/icon) |
| Settings icon link | `w-11 h-11 bg-surface border-border` |
| Icon-only buttons | `w-8 h-8`/`w-10 h-10 rounded-xl bg-surface/bg-bg-secondary` |
| Checkbox touch target | ≥44px wrapper around a `w-7 h-7 rounded-[10px] border-2` box |
| Text input | `px-3.5/4 py-2/2.5 rounded-xl bg-surface border-border-strong text-ink placeholder-ink-muted focus:border-forest focus:ring-2 focus:ring-forest/15` |
| Primary CTA (modal) | `min-h-[44px]`/`h-12 rounded-xl bg-accent hover:bg-accent-hover text-ink-on-accent` |
| Date carousel chip | `min-w-[48px] rounded-2xl border` |
| Heatmap cell | `w-3.5 h-3.5 sm:w-4 sm:h-4` |
| Bottom nav | `h-16`, `grid-cols-4`, icons `w-5 h-5`, labels `text-xs` |
| Progress ring SVG | `w-8 h-8 sm:w-12 sm:h-12`, `viewBox 0 0 60 60`, `r=24`, `strokeWidth=4.5`, `-rotate-90`; track `stroke-bg-secondary`, arc `stroke-success-fill` |

### 3.6 Responsive breakpoints (Tailwind defaults)

| Prefix | Min-width | Key adaptations |
|---|---|---|
| (base) | — | Mobile: single column, bottom tab nav, icon-only install button (`hidden sm:inline` label), condensed stat text |
| `sm:` | 640px | Stat subtext visible, two-column form grids, larger paddings, hero scales to 32px |
| `md:` | 768px | Desktop top nav shown (`hidden md:flex`), bottom nav hidden (`md:hidden`), library 2-col grid |
| `lg:` | 1024px | `lg:px-8` page padding, wide analytics |

Target range: iPhone SE (375px) → large desktop monitors. Verified targets
`max-w-[720px]` (Today), `max-w-5xl` (Library), `max-w-7xl` (Analytics).

### 3.7 Z-index layers

`z-30` dropdown menu · `z-40` sticky header & bottom nav · `z-50` modals,
tooltips · `z-[60]` toast stack · offline indicator.

---

## 4. Component Standards

### 4.1 Top navigation bar (`AppShell.tsx` header)
Sticky, `bg-bg/85 backdrop-blur-md border-b border-border`. Three-zone contract:
**(1)** brand mark (`w-9 h-9 object-contain` render of `/logo.png`) + wordmark
(`text-ink tracking-tight`); **(2)** pill nav links —
active `bg-accent-soft text-ink`, inactive `text-ink-secondary hover:text-ink
hover:bg-bg-secondary` (`rounded-full`); **(3)** PWA install button + rich-black
"Add Habit" CTA (`cta-primary`) + settings icon link. Nav hidden `< md`. The
header "Add Habit" is the single persistent primary create action — icon-only
below `sm`. **No sidebar.**

### 4.2 Bottom mobile navigation (`AppShell.tsx`)
Fixed, `md:hidden`, `bg-surface/95 backdrop-blur-lg border-t border-border`, 4
equal columns (Today / Analytics / Habits / Settings), icon over `text-xs` label.
Active: `text-ink font-semibold` + `shadow-[inset_0_2px_0_0_var(--color-accent)]`
(lime top bar); inactive `text-ink-secondary`.

### 4.3 Hero header + stat cards (`HeroHeader.tsx`)
Eyebrow (`text-ink-muted` + `accent-text` "Live Today"/"Historical Log"), H1
greeting in **plain ink** (no gradient), time-based subtext; a single Streak
Freeze button (`bg-info-bg border-info-border text-info` when Holiday Mode is
active, else `bg-surface border-border text-ink-secondary`, `min-h-[44px]`).
Three stat cards: `bg-surface border-border shadow-card rounded-2xl`, values
`text-xl sm:text-[28px] font-extrabold text-ink tabular-nums`. Completion card
includes the SVG progress ring (track `stroke-bg-secondary`, arc
`stroke-success-fill`) in a `flex items-center justify-between gap-2 sm:gap-3`
row; its ring box is `w-8 h-8 sm:w-12 sm:h-12` so the value and the ring keep a
visible gap inside the narrow 3-column mobile grid (the other two cards' icon
chips are `w-8 h-8 sm:w-10 sm:h-10`). Streak chip = warning family; habits chip
= accent-soft.

### 4.4 Date carousel (`DateCarousel.tsx`)
Prev/next `w-10 h-10 bg-surface border-border text-ink-secondary`. Chips carry
`aria-current="date"` when selected. **Selected** = `bg-accent border-accent
text-ink-on-accent shadow-card scale-105`; **today** = `bg-surface border-accent
text-ink`; **default** = `bg-surface border-border text-ink-secondary`. Day number
`text-sm font-bold tabular-nums` (no mono). 1.5px status dot: frozen =
`bg-info-fill`, all-done = `bg-success-fill`, partial = `bg-warning-fill`
(selected chip → `bg-ink-on-accent`). "Today" pill = `text-accent-text
bg-accent-soft border-accent-border hover:bg-accent hover:text-ink-on-accent`.

### 4.5 Habit card (`HabitCard.tsx`)
`rounded-2xl border shadow-card hover:shadow-elevated` (archived → `opacity-60`)
with a state-driven skin:
- Pending: `bg-surface border-border hover:border-border-strong`
- Completed: `bg-accent-soft border-accent-border`
- Frozen: `bg-info-bg border-info-border`
- Rest day: `bg-neutral-bg border-border`
- Missed: `bg-warning-bg border-warning-border`

Anatomy: checkbox (`w-7 h-7 rounded-[10px] border-2`; checked = `bg-accent
border-accent text-ink-on-accent animate-pop`, carries `aria-pressed`) → title
(completed: `text-ink-secondary line-through decoration-border-strong`, else
`text-ink`) + category pastel pill (`CAT_CHIP`/`CAT_ICON`) + streak pill
(warning family, `tabular-nums`) + `MoreVertical` menu → status badges
(frozen=info, rest=neutral, missed=warning) → journal footer above
`border-border`.

### 4.6 Dropdown menu (habit ⋮)
`bg-surface border-border shadow-dropdown rounded-xl`, with `role="menu"` /
`role="menuitem"` / `aria-expanded` / `aria-haspopup`. Destructive delete uses
`text-error hover:bg-error-bg` and routes through the accessible `ConfirmDialog`.

### 4.7 Modals & dialogs
Shell: `fixed inset-0 z-50 … bg-ink/40 backdrop-blur-sm` overlay → panel
`bg-surface border-border rounded-3xl shadow-modal` + `animate-in fade-in
zoom-in-95`. Header: title block (optionally an `bg-accent-soft border-accent-border
text-accent-text` icon chip) + `bg-bg-secondary text-ink-muted` close button,
separated by `pb-3 border-b border-border`. Footer: Cancel
(`bg-bg-secondary text-ink-secondary`) / Primary (`bg-accent text-ink-on-accent`,
`min-h-[44px]`). **Onboarding no longer uses ambient blur glows** — the modal is
a clean surface panel.

Every panel carries `role="dialog"` + `aria-modal="true"` + `aria-labelledby` and
is wired through the shared `useModalA11y` hook (initial focus, Tab trap, focus
restoration, Escape / backdrop dismiss). The onboarding gate traps focus but is
not dismissible.

### 4.8 Buttons

| Variant | Classes |
|---|---|
| Primary CTA (Add Habit only) | `cta-primary rounded-xl font-semibold/bold` — rich black `#171A16`, white label + plus icon, no border, `shadow-card`, hover `#262B24` + `shadow-elevated`, active `#0F110E` + `scale-[0.98]`, `focus-visible` 2px lime `--color-accent` ring (offset 2px), disabled `disabled-bg`/`disabled` ink with no shadow |
| Primary | `bg-accent hover:bg-accent-hover text-ink-on-accent font-bold/semibold rounded-xl shadow-card` |
| Secondary | `bg-surface hover:bg-bg-secondary text-ink border border-border-strong rounded-xl font-semibold` |
| Ghost | `bg-bg-secondary hover:bg-border text-ink-secondary rounded-xl` |
| Soft accent | `bg-accent-soft border-accent-border text-accent-text` |
| Danger solid | `bg-error hover:brightness-110 text-white` |
| Danger outline | `border-error-border text-error hover:bg-error-bg` |
| Info solid | `bg-info hover:brightness-110 text-white` (activate freeze) |
| Segmented control | Track `bg-bg-secondary p-1 border-border`; active `bg-accent text-ink-on-accent shadow-card` (forest variant `bg-forest text-white` in the category-breakdown toggle) |
| Filter chip | Active `bg-accent text-ink-on-accent shadow-card`; inactive `bg-surface text-ink-secondary border-border hover:border-border-strong` |

All interactive elements carry `cursor-pointer` and `transition`. The
`cta-primary` utility (defined in `src/index.css`) is reserved for the five
habit-creation entry points — header "Add Habit", Habits "New Habit", library
empty-state "Create Habit", Today empty-schedule "Add a New Habit", first-run
"Create Your First Habit" — plus the onboarding "Get Started" submit
(`OnboardingModal.tsx`, `h-12 rounded-xl` with a white `ArrowRight`). No other
button is rendered rich black.

### 4.9 Form controls (`HabitForm.tsx`, `SettingsModal.tsx`, `OnboardingModal.tsx`)
Inputs: `bg-surface border-border-strong text-ink placeholder-ink-muted
focus:border-forest focus:ring-2 focus:ring-forest/15`. Range slider:
`accent-success-fill`; its value readout `text-accent-text tabular-nums` (no
mono). Day-of-week toggles `rounded-full`; checked = `bg-accent border-accent
text-ink-on-accent`. Category chips use the pastel `CAT_SELECTED` map +
`shadow-card` when active. Inline validation: error banner in the error family
above fields; clears on next input change.

### 4.10 Heatmap (`HeatmapAnalytics.tsx`)
Weeks as vertical columns of 7 button cells (`flex gap-1.5`), horizontal scroll.
Cell color from the `--color-heat-*` ramp (§1.7); hover `scale-125` +
fixed-position tooltip (`bg-surface border-border-strong shadow-dropdown
text-ink`). Legend: frozen swatch left, 0%→100% lime ramp right. Range selector:
3 Months (84d) / 6 Months (168d) / Full Year (364d), active = lime.

### 4.11 Progress bars
Track `bg-bg-secondary h-2 rounded-full overflow-hidden`; fill threshold-coded
(§1.8), `transition-all duration-700 ease-out`; 3% minimum visible width.

### 4.12 Comparison cards (Week/Month-over-Month)
`bg-bg-secondary border-border rounded-2xl`; left: label, `tabular-nums` current
%, muted previous %, "x of y scheduled check-ins"; right: delta pill — up
`bg-success-bg text-success border-success-border` + `TrendingUp`, down
`bg-error-bg text-error border-error-border` + `TrendingDown`, flat / no-data
`bg-neutral-bg text-ink-secondary/ink-muted` + `Minus`.

> **Percentage-point correctness (enforced):** the delta between two rates is
> rendered as `+N pp` / `−N pp` (percentage points), never a relative percent.
> Each pill carries a `title` and `aria-label` explaining this.

### 4.13 Toasts & indicators
- **Toast system** (`Toast.tsx`): `bg-surface border border-border border-l-4
  ${bar} shadow-dropdown rounded-xl text-ink`, where `bar` is a semantic
  left-accent (success / error / info) from `TOAST_STYLE`. Up to 3 transient
  toasts, auto-dismiss ~4s.
- **Offline indicator** (`OfflineIndicator.tsx`): `bg-warning-fill text-ink
  border-warning-border shadow-dropdown`, `bottom-20 md:bottom-6 left-4 right-4
  sm:right-auto`, `animate-in slide-in-from-bottom-2`, driven by
  `navigator.onLine`.
- **Settings save feedback**: button label swaps to "Saved" + `Check` for 2s.
- **Backup import feedback**: inline banner, success / error families.

### 4.14 Empty states
Panel `bg-surface border-border shadow-card rounded-3xl/rounded-[20px]`:
centered `bg-bg-secondary text-ink-muted` icon tile, `text-ink` title,
`text-ink-secondary` explanation, lime CTA. Implemented: first-run dashboard
(`FirstRunEmptyState.tsx` — **no blur glows**), "No habits scheduled for this
date", empty library, empty analytics, and `NotFoundPage` (404 in `text-ink/10`).

### 4.15 Skeleton / loading state (`App.tsx`)
Full-screen `bg-bg text-ink` centered pulsing brand mark (`w-12 h-12` render of
`/logo.png`) + wordmark + `text-ink-muted` "Loading your routine…",
shown until localStorage hydration completes.

### 4.16 Iconography
`lucide-react` exclusively for functional/UI icons. Sizes `w-3`–`w-6`. Emphasis
via `stroke-[2.5]` / `stroke-[3]`. Category icons per §1.6. The HabitFlow brand
mark is the only non-lucide image (see §1.3 "Brand mark"); decorative `Sparkles`
accents in empty states and the micro-journal are not brand marks and remain.

### 4.17 Scrollbars
Global webkit scrollbar 8px, transparent track, thumb `rgba(32,37,31,0.16)` →
hover `0.28`, pill radius. Carousel/filter rows use the `no-scrollbar` utility.

---

## 5. Motion & Interaction

### 5.1 Motion tokens (`--animate-*` in `src/index.css`)

| Token / Class | Definition | Usage |
|---|---|---|
| `animate-in` | `hf-enter 0.2s cubic-bezier(0.16,1,0.3,1) both` | Modal / toast entrance, composed with `fade-in`, `zoom-in-95`, `slide-in-from-bottom-2` `@utility` state setters |
| `animate-rise` | `hf-rise 0.24s …` | Rising content reveals |
| `animate-pop` | `hf-pop 0.3s …` (scale 1 → 1.12 → 1) | Habit checkbox completion "pop" |

Keyframes `hf-enter`, `hf-rise`, `hf-pop` are defined in `src/index.css`. No
external `tailwindcss-animate` plugin.

### 5.2 Implemented micro-interactions

| Interaction | Specification |
|---|---|
| Checkbox check | `animate-pop`; checked fill = lime + ink check |
| Completion feedback | Web Audio chime (C5→E5→G5) when `soundEnabled`; title strike-through; card → accent-soft |
| All-done celebration | Two-sided confetti (brand ramp) 1.2s + rising chime |
| Onboarding complete | 80-particle confetti burst (brand ramp) |
| Freeze applied | Descending chime (A4→F4) |
| Progress ring | `transition-all duration-500 ease-out` on `stroke-dashoffset` |
| Category bars | `transition-all duration-700 ease-out` width |
| Hover/active | Buttons `hover:bg-*` + `active:scale-95`/`[0.98]`; cards border-darkening + `shadow-elevated`; heatmap `hover:scale-125`; generic `transition` |
| Date chip | `scale-105` on selected + smooth `scrollIntoView` centering |
| Toast | `animate-in slide-in-from-bottom-2` |
| Skeleton | `animate-pulse` |

All motion is **subtle** and short (≤300ms), consistent with the calm Premium
Light character.

### 5.3 Reduced-motion support
- Confetti triggers check `matchMedia('(prefers-reduced-motion: reduce)')` and
  skip entirely.
- A global CSS block collapses animation/transition durations to `0.001ms` and
  sets `scroll-behavior: auto` under the media query.
- Audio chimes remain governed by the independent `soundEnabled` setting.

### 5.4 Interaction & accessibility rules (WCAG 2.2 AA)
- Touch targets ≥44×44px for primary controls (`min-h-[44px]` CTAs, checkbox
  wrapper, `h-16` bottom nav). Dense data-viz controls are smaller by necessity
  but carry full `aria-label`s.
- Global `:focus-visible` outline: `2px solid var(--color-focus)`,
  `outline-offset: 2px` (WCAG 2.4.11).
- Toggle/selection buttons expose state via `aria-pressed` (sound, freeze
  reasons, import mode, archive); date chips via `aria-current="date"`; menus via
  `role="menu"`/`menuitem` + `aria-expanded`/`aria-haspopup`.
- Contrast: all body text uses `ink`/`ink-secondary` (AA+); `ink-muted` is
  large/decorative only; lime is fill-only with ink text (§1.3); the progress arc
  uses `success-fill` for non-text contrast.
- `-webkit-tap-highlight-color: transparent` globally; mobile date strip
  `select-none`; every clickable element sets `cursor-pointer`.
- Destructive actions route through an accessible `ConfirmDialog`
  (`role="alertdialog"`) explaining the cascade — no `window.confirm`.

---

## 6. Design Principles (guardrails for future work)

1. **Premium Light only.** No dark mode, no theme switcher, no `dark:` variants,
   no system-theme switching. Build with semantic tokens (`bg-bg`, `text-ink`,
   `bg-accent`, `border-border`, semantic families) — never raw HEX or palette
   utilities.
2. **Lime is a fill, never text on white.** Ink (`#20251F`) on lime; green text
   uses `accent-text` (`#3F6B12`) or `success`.
3. **Semantics are fixed.** accent/success = action & achievement; info =
   freeze/protection/notice; warning = streaks, missed, archived, offline;
   error = destructive & negative deltas; neutral = rest/flat. Never cross-wire.
4. **Numbers are sans + `tabular-nums`.** Mono is reserved for the backup grid
   and timezone only.
5. **Soft, warm, shadow-differentiated.** Surfaces are white/paper; elevation
   comes from `--shadow-*` (ink-tinted), not borders-with-alpha or dark glows. No
   glassmorphism beyond the header/overlay `backdrop-blur`; no decorative
   gradients or blur glows.
6. **Consistent shell.** Every modal follows §4.7; every card uses
   `rounded-2xl`/`rounded-3xl` + `border-border` + `shadow-card`.
7. **Preserve the product.** HabitFlow branding, desktop top-nav + mobile
   bottom-tab nav (no sidebar), all functionality, user data, and localStorage
   keys/schemas are untouched by visual work.
8. **Mobile thumb zone.** Navigation and the offline indicator respect the bottom
   nav area (`bottom-20`, `pb-24`).

# HabitFlow — Design System

**Version:** 2.0 (Phase 2 — Production Hardening & Premium UI/UX)
**Status:** Reflects the visual identity as implemented in source after the Phase 2 transformation. Former audit inconsistencies (⚠️) — invalid `slate-750`/`slate-850` classes, remote Google Fonts, no-op `animate-in`/`no-scrollbar` utilities, missing reduced-motion support, sub-11px type, duplicate add buttons, and unconfirmed destructive actions — are now resolved and documented inline (see `AUDIT.md`).

HabitFlow uses a **dark navy + emerald** identity built on the Tailwind CSS `slate` and `emerald` palettes, with cyan/sky as the secondary accent. Styling is utility-first Tailwind CSS v4 (configured via `@theme` in `src/index.css` — there is no `tailwind.config.js`). There is intentionally **no glassmorphism-heavy style, no light theme, and no decorative gradients** beyond the two brand gradients listed below.

---

## 1. Color System

### 1.1 Backgrounds & Surfaces

| Role | Token / Class | Hex | Usage (verified in source) |
|---|---|---|---|
| Primary background | `bg-slate-950` (`--color-surface-base`) | `#020617` | `body`, app shell (`App.tsx`), skeleton screen |
| PWA chrome | manifest `background_color` / `theme_color` | `#020617` | `manifest.json`, `index.html` meta — now matches `slate-950` exactly |
| Secondary background / card surface | `bg-slate-900` (`--color-surface`, + `/90`, `/80`, `/60`, `/40` alpha variants) | `#0f172a` | Cards, modals, library tiles, habit cards |
| Elevated surface | `--color-surface-elevated` / `bg-slate-850` | `#172033` | Heatmap empty cells, raised insets |
| Elevated inset surface | `bg-slate-800` (`--color-surface-interactive`, + `/80`, `/60`, `/50`, `/40`) | `#1e293b` | Inputs, buttons, dropdown menus, stat insets, segmented control tracks |
| Custom hover surface | `hover:bg-slate-750` (`--color-slate-750`) | `#293548` | Secondary-button hover. **`slate-750` and `slate-850` are now first-class tokens defined in `src/index.css` `@theme`** (previously no-op classes — see AUDIT.md, resolved) |
| Sticky header | `bg-slate-950/85` + `backdrop-blur-md` | — | Top navigation bar |
| Mobile bottom nav | `bg-slate-950/95` + `backdrop-blur-lg` | — | Fixed bottom tab bar |
| Modal overlay | `bg-slate-950/85` + `backdrop-blur-md` (Freeze modal: `/80`) | — | All modal dialogs |

### 1.2 Accent Colors

| Role | Token | Hex | Usage |
|---|---|---|---|
| Primary accent | `emerald-500` | `#10b981` | Primary buttons, active tabs, selected states, checkbox checked fill, progress rings |
| Primary accent hover | `emerald-400` | `#34d399` | Button hover, heatmap intensity 4, active nav text |
| Primary accent text | `text-emerald-400` / `text-emerald-300` | `#34d399` / `#6ee7b7` | Active nav links, section eyebrow labels, links |
| Primary accent tint | `bg-emerald-500/10`, `/15`, `/20` + `border-emerald-500/20`–`/40` | — | Icon chips, badges, soft-selected states |
| Secondary accent | `sky-500` / `sky-400` | `#0ea5e9` / `#38bdf8` | Streak-freeze / Holiday Mode identity, heatmap frozen cells, info banners |
| Tertiary brand | `cyan-500` / `cyan-400` | `#06b6d4` / `#22d3ee` | Logo tile gradient endpoint, greeting name gradient |

### 1.3 Brand Gradients (only two; do not add more)

1. **Logo tile:** `bg-gradient-to-tr from-emerald-500 to-cyan-500` with `text-slate-950` icon and `shadow-emerald-500/20` glow.
2. **Greeting name:** `text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400` (hero H1 user name only).

### 1.4 Text

| Role | Class | Hex |
|---|---|---|
| Text primary | `text-white` | `#ffffff` |
| Text body | `text-slate-100` / `text-slate-200` | `#f1f5f9` / `#e2e8f0` |
| Text secondary | `text-slate-300` / `text-slate-400` | `#cbd5e1` / `#94a3b8` |
| Text muted / placeholder | `text-slate-500` | `#64748b` |
| Text on accent (primary buttons) | `text-slate-950` | `#020617` |
| Text disabled | `text-slate-500`–`slate-600` | — |
| Selection | `selection:bg-emerald-500/20 selection:text-emerald-300` | — |

### 1.5 Borders & Dividers

| Role | Class |
|---|---|
| Default card/modal border | `border-slate-800` (often `/80`, `/60` alpha) |
| Input border | `border-slate-700` (`/80`, `/60` variants) |
| Hover border | `hover:border-slate-700` (cards), `hover:border-slate-500` (checkbox) |
| Internal divider | `border-slate-800/60`, `border-t border-slate-800` |
| Accent borders | `border-emerald-500/20`–`/40` (success/selected), `border-sky-500/20`–`/40` (freeze), `border-amber-500/20`–`/30` (warning), `border-rose-500/20`–`/30` (danger) |

### 1.6 Semantic / State Colors

| State | Color family | Canonical treatment |
|---|---|---|
| Success / Completed | `emerald` | Solid `bg-emerald-500` fill + `text-slate-950` (checkbox, buttons); tinted `bg-emerald-500/10 border-emerald-500/20 text-emerald-300` (banners) |
| Informational / Frozen | `sky` | `bg-sky-500/10 border-sky-500/20 text-sky-300` banners; `bg-sky-500/50 border-sky-400/40` heatmap frozen cell; solid `bg-sky-500 text-slate-950` for "Activate Freeze" button |
| Warning / Missed / Streak flame | `amber` | `bg-amber-500/10 border-amber-500/20 text-amber-300` badges; streak pill uses `text-amber-300` + `Flame` icon `text-amber-400 fill-amber-400/20`; offline toast is solid `bg-amber-500/90 text-slate-950` |
| Error / Danger / Destructive | `rose` | `bg-rose-500/10 border-rose-500/20 text-rose-300` error banners; `text-rose-400 hover:bg-rose-500/10` destructive menu items; solid `bg-rose-500 hover:bg-rose-400 text-white` for "Full Replace" import |
| Neutral / Rest day | `slate` | `bg-slate-800 text-slate-400/500`, `Moon` icon |

### 1.7 Category Colors (from `CATEGORIES` in `src/types/index.ts` + `HabitCard.tsx`)

| Category | Name | Text color | Icon (lucide) |
|---|---|---|---|
| `fitness` | Fitness / Body | `text-amber-400` | `Dumbbell` |
| `mind` | Mind & Focus | `text-sky-400` | `Brain` |
| `productivity` | Productivity | `text-emerald-400` | `Zap` |
| `learning` | Learning | `text-indigo-400` | `BookOpen` |
| `health` | Health & Routine | `text-rose-400` | `HeartPulse` |

### 1.8 Heatmap Intensity Scale (emerald ramp)

| Intensity | Meaning | Class |
|---|---|---|
| 0 | 0% | `bg-slate-850 border-slate-800/60` (`#172033`, defined token) |
| 1 | 1–39% | `bg-emerald-950/80 border-emerald-800/40` |
| 2 | 40–74% | `bg-emerald-800` |
| 3 | 75–99% | `bg-emerald-600` |
| 4 | 100% | `bg-emerald-400` + `shadow-emerald-400/20` |
| Frozen | any | `bg-sky-500/50 border-sky-400/40` |

### 1.9 Category Progress Bar Colors (`HeatmapAnalytics.tsx`)

`≥80%` → `bg-emerald-400` · `≥50%` → `bg-emerald-500` · `≥20%` → `bg-amber-400` · `<20%` → `bg-slate-600`. Track: `bg-slate-800`, height `h-2`, `rounded-full`.

### 1.10 Confetti Palette (`src/utils/confetti.ts`)

- Streak celebration: `#10b981, #06b6d4, #3b82f6, #f59e0b, #ec4899`
- All-complete celebration: `#10b981, #34d399, #6ee7b7, #06b6d4`

---

## 2. Typography

### 2.1 Font Families (`src/index.css` `@theme` + `src/main.tsx`)

| Token | Stack | Loaded from |
|---|---|---|
| `--font-sans` | `'Geist Variable', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif` | **Self-hosted** via `@fontsource-variable/geist` (WOFF2, bundled same-origin, `font-display: swap`) |
| `--font-mono` | `'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace` | **Self-hosted** via `@fontsource-variable/jetbrains-mono` (WOFF2, bundled same-origin, `font-display: swap`) |

Fonts are imported in `src/main.tsx` and bundled by Vite into `dist/assets/*.woff2`, so they are served same-origin and cached by the service worker — **no remote Google Fonts request, no offline fallback gap, no layout shift** (the previous Plus Jakarta Sans / remote Google Fonts dependency was removed). Sans is the default for all UI text. Mono is reserved for **numeric statistics, dates/day numbers, times, streak counts, target units, and backup summary grids** (`font-mono` + `tabular-nums` where alignment matters).

### 2.2 Weight Scale

| Weight | Class | Usage |
|---|---|---|
| 900 | `font-black` | Logo tile icon treatment |
| 800 | `font-extrabold` | Wordmark "HabitFlow", hero H1 greeting |
| 700 | `font-bold` | Card/section headings, stat numbers, active nav, primary buttons |
| 600 | `font-semibold` | Nav links, form labels, badges, secondary buttons, habit titles |
| 500 | `font-medium` | Body labels, mobile tab labels, dropdown items |
| 400 | (default) | Body copy, muted text |

### 2.3 Heading Hierarchy

| Level | Classes | Where |
|---|---|---|
| H1 | `text-2xl sm:text-3xl font-extrabold text-white` | Hero greeting ("Good Morning, {Name}") |
| H2 (modal title) | `text-xl font-bold text-white tracking-tight` | HabitModal, SettingsModal |
| H2 (section) | `text-lg font-bold text-white` / `text-base font-bold text-white tracking-tight` | Library header, settings tab, analytics card headers |
| H3 (card sub-title) | `text-base font-bold text-white tracking-tight` | Freeze/Journal/PWA modal titles |
| Eyebrow label | `text-xs font-bold uppercase tracking-wider text-emerald-400` (+ icon) | Settings modal section headers |
| Kicker | `text-xs font-semibold tracking-wider uppercase text-emerald-400` | Onboarding "Welcome to HabitFlow" |

### 2.4 Body, Labels & Captions

| Role | Classes |
|---|---|
| Body (modal copy) | `text-xs sm:text-sm text-slate-400 leading-relaxed` |
| Form label | `text-xs font-medium/semibold text-slate-300` (often with a 3.5px lucide icon) |
| Optional marker | `text-slate-500 font-normal` "(optional)" |
| Required marker | `text-rose-400` "*" |
| Micro label / badge | `text-[11px]`, `uppercase` for day letters, `font-semibold` for badges |
| Helper text | `text-[11px] text-slate-400` |
| Stat caption | `text-[11px] text-slate-500` (hidden on mobile via `hidden sm:block`) |

> **11px floor (enforced):** the smallest type anywhere in the app is `text-[11px]`. All former `text-[10px]`/`text-[9px]` usages were raised to `11px`. Tiny metadata is used sparingly and never for primary content.

### 2.5 Numeric Statistics

- Big stat values: `text-lg sm:text-2xl font-bold font-mono text-white tabular-nums`.
- Streak pill: `text-xs font-semibold font-mono tabular-nums text-amber-300` with unit suffix `d`/`w` in `text-[11px] text-amber-400/70 font-normal`.
- Percentages in comparisons: `text-sm font-bold text-white font-mono` current, `text-[11px] text-slate-500 font-mono` previous.
- Character counter (journal): `text-[11px] text-slate-500 font-mono`.

---

## 3. Spacing & Layout

### 3.1 Spacing Scale (Tailwind default, 4px base)

Commonly used steps: `0.5` (2px) · `1` (4px) · `1.5` (6px) · `2` (8px) · `2.5` (10px) · `3` (12px) · `3.5` (14px) · `4` (16px) · `5` (20px) · `6` (24px) · `8` (32px).
Vertical rhythm inside sections uses `space-y-1.5` (labels/inputs), `space-y-3`–`space-y-4` (blocks), `space-y-5`–`space-y-6` (modal sections).

### 3.2 Container & Layout Widths

| Element | Value |
|---|---|
| Max content width | `max-w-7xl` (80rem) `mx-auto` |
| Settings tab column | `max-w-2xl mx-auto` |
| Modal width (large: Habit/Settings/Backup/Onboarding) | `max-w-lg` (32rem) |
| Modal width (small: Freeze/Journal/PWA/iOS guide) | `max-w-md` (28rem) / `max-w-sm` (24rem) |
| Page padding | `p-4 sm:p-6 lg:p-8`; header `px-4 sm:px-8 py-3.5` |
| Dashboard grid | `grid-cols-1 lg:grid-cols-12`; left column `lg:col-span-8`, right `lg:col-span-4`, `gap-6`, `items-start` |
| Library grid | `grid-cols-1 md:grid-cols-2 gap-4` |
| Quick stats grid | `grid-cols-3 gap-2.5 sm:gap-4` |
| Mobile bottom clearance | `pb-24 md:pb-12` on `<main>` |

### 3.3 Card Padding

- Large cards / modals: `p-6` (`sm:p-8` on onboarding).
- Analytics panels: `p-4 sm:p-6`.
- Habit card: `p-3.5 sm:p-4`.
- Stat cards & insets: `p-3 sm:p-4`, `p-3.5`.
- Date carousel wrapper: `p-3.5`.

### 3.4 Border-Radius Scale

| Token | Value | Usage |
|---|---|---|
| `rounded-3xl` | 24px | Modals, large analytics panels, empty state |
| `rounded-2xl` | 16px | Cards, stat tiles, insets, date chips, checkboxes (7×7), logo tile (large), banners |
| `rounded-xl` | 12px | Buttons, inputs, dropdown menus, badges, icon chips (8×8), small tiles |
| `rounded-lg` | 8px | Segmented-control inner buttons, streak pill, note chips |
| `rounded-md` | 6px | Target-unit chip |
| `rounded-[4px]` / `rounded-[3px]` | 4/3px | Heatmap cells / legend swatches |
| `rounded-full` | — | Progress bars, status dots, ambient blur circles |

### 3.5 Component Dimensions

| Component | Value |
|---|---|
| Primary button (header) | `px-3.5 py-1.5 text-xs`, icon `w-3.5 h-3.5` |
| Hero buttons | `px-3.5/px-4 py-2 text-xs` |
| Modal submit button | `py-3 text-sm` (onboarding: `h-12`) |
| Icon-only buttons | `w-8 h-8 rounded-xl` (close, settings, menu, carousel arrows) |
| Checkbox touch target | `min-w-[44px] min-h-[44px]` wrapper around a `w-7 h-7` visual box |
| Text input | `px-4 py-2.5 rounded-xl text-sm` (settings variant `px-3.5 py-2`) |
| Textarea (journal) | `rows={3}`, `px-3.5 py-2.5`, `resize-none`, `maxLength=160` |
| Date carousel chip | `min-w-[48px] py-2 px-1.5 rounded-2xl` |
| Heatmap cell | `w-3.5 h-3.5 sm:w-4 sm:h-4` |
| Bottom nav | `h-16`, `grid-cols-4`, `max-w-lg mx-auto`, icons `w-5 h-5`, labels `text-[11px]` |
| Dropdown menu | `w-48 rounded-xl py-1`, items `px-3 py-2 text-xs` |
| Modal max height | `max-h-[90vh] overflow-y-auto` (Habit/Settings/Backup) |
| Starter-habit list | `max-h-48 overflow-y-auto` |
| Logo tile | `w-8 h-8` (header), `w-10 h-10` (onboarding/skeleton) |
| Progress ring SVG | `w-10 h-10 sm:w-12 sm:h-12`, `viewBox 0 0 60 60`, `r=24`, `strokeWidth=4.5`, `-rotate-90` |

### 3.6 Responsive Breakpoints (Tailwind defaults)

| Prefix | Min-width | Key adaptations |
|---|---|---|
| (base) | — | Mobile: single column, bottom tab nav, condensed stat text, `hidden sm:inline` labels |
| `sm:` | 640px | Stat subtext visible, two-column form grids, larger paddings |
| `md:` | 768px | Desktop top nav shown (`hidden md:flex`), bottom nav hidden (`md:hidden`), library 2-col grid |
| `lg:` | 1024px | 12-col dashboard split (8+4), `lg:p-8` |

### 3.7 Z-Index Layers

`z-30` dropdown menu · `z-40` sticky header & bottom nav · `z-50` modals, tooltips, offline toast.

---

## 4. Component Standards

### 4.1 Top Navigation Bar (`App.tsx` header)
Sticky, `bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80`. Strict 3-zone contract: **(1)** brand tile + wordmark, **(2)** 4 text nav links (`Today`, `Analytics`, `Habits (n)`, `Settings`) — active = `text-emerald-400 font-bold`, inactive = `text-slate-400 hover:text-white`, **(3)** PWA install button + emerald "Add Habit" button + settings icon button. Hidden nav on `< md`. The header "Add Habit" is the **single persistent primary create action** — the hero and library toolbar no longer render competing "New Habit"/"Create Habit" buttons (only contextual empty-state CTAs remain), eliminating duplicate prominent add buttons.

### 4.2 Bottom Mobile Navigation (`App.tsx` nav)
Fixed, `md:hidden`, `bg-slate-950/95 backdrop-blur-lg border-t border-slate-800`, 4 equal columns (Today / Analytics / Habits / Settings), icon over `text-[11px]` label. Active: `text-emerald-400 font-bold`. Settings entry opens the SettingsModal directly (no dedicated tab).

### 4.3 Hero Header + Stat Cards (`HeroHeader.tsx`)
Greeting row: date line (`text-xs text-slate-400` + emerald "Live Today"/"Historical Log" pill), H1 with gradient name, time-based subtext; actions: a single Streak Freeze button (switches to sky "Holiday Mode" style when active). The completion subtitle reads "{completed} of {due} due".
Stat cards (×3): `p-3 sm:p-4 rounded-2xl bg-slate-900/90 border-slate-800/80`, label `text-[11px] sm:text-xs text-slate-400`, mono value, optional `text-[11px]` caption, right-side icon chip (`w-8 h-8 sm:w-10 sm:h-10 rounded-xl` tinted bg + border). Completion card includes an SVG progress ring (emerald stroke, `transition-all duration-500 ease-out`).

### 4.4 Date Carousel (`DateCarousel.tsx`)
16 chips: past 14 days + today + tomorrow. Prev/next arrow buttons (`w-8 h-8 rounded-xl`). Chip states: **selected** = solid `bg-emerald-500 text-slate-950 scale-105` + glow; **today** = `bg-slate-800 border-emerald-500/40`; **default** = `bg-slate-900/80 border-slate-800/80 text-slate-400`. Each chip: narrow weekday letter (`text-[11px] uppercase`), mono day number, and a 1.5px status dot — sky = frozen, emerald = all done, amber = partial. Horizontal scroll with hidden scrollbar; active chip auto-centers via `scrollIntoView`. A "Today" pill button appears when a non-today date is selected.

### 4.5 Habit Card (`HabitCard.tsx`)
`rounded-2xl border` with state-driven skin:
- Pending: `bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-sm`
- Completed: `bg-slate-900/60 border-emerald-500/30`
- Frozen: `bg-slate-900/40 border-sky-500/30`
- Rest day: `bg-slate-900/30 border-slate-800/60`
- Missed: `bg-slate-900/80 border-amber-500/20`

Anatomy: 44px checkbox button (7×7 `rounded-xl border-2` box — checked: solid emerald + `scale-105` + glow; frozen: sky tint + `ShieldAlert`; rest: slate + `Moon`) → content column: title (`text-sm font-semibold`, struck-through `text-slate-400 line-through` when complete) + mono target-unit chip + streak pill + `MoreVertical` menu → meta row (category icon/name, reminder time in mono, status badges "Streak Frozen"/"Planned Rest"/"Missed") → journal footer above `border-t border-slate-800/60` (note chip or "Add 1-line daily note" link).

### 4.6 Dropdown Menu (habit ⋮)
`absolute right-0 top-9 w-48 rounded-xl bg-slate-900 border-slate-700 shadow-2xl py-1 text-xs`; items `px-3 py-2 hover:bg-slate-800` with colored leading icons (emerald note, sky freeze, slate edit, amber archive); divider `h-px bg-slate-800`; destructive delete `text-rose-400 hover:bg-rose-500/10`. Closes on `onMouseLeave`. Delete routes through the accessible `ConfirmDialog` (explaining the cascade of logs/notes/freezes) before removing anything.

### 4.7 Modals & Dialogs
Standard shell: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md` overlay → panel `w-full max-w-lg|md bg-slate-900 border-slate-800 rounded-3xl p-6 shadow-2xl` + entrance `animate-in fade-in zoom-in-95`. Header pattern: title block (optionally with tinted `w-8 h-8 rounded-xl` icon chip) + `w-8 h-8 rounded-xl bg-slate-800` close button, separated by `pb-3 border-b border-slate-800 mb-4/5`. Footer pattern: paired Cancel (`bg-slate-800 text-slate-300`) / Primary (`bg-emerald-500 text-slate-950`) buttons `flex-1 py-2.5/3 rounded-xl`. Onboarding modal adds two ambient blur circles (`bg-emerald-500/10`, `bg-sky-500/10`, `blur-3xl`) — the only place this appears.

Every modal panel carries `role="dialog"` + `aria-modal="true"` + `aria-labelledby` and is wired through the shared `useModalA11y` hook: initial focus (autofocus field where present, else first control), Tab focus-trapping, focus restoration to the invoking element, and dismiss via **Escape or backdrop click**. The onboarding gate is the exception — it traps focus but is not dismissible (no `onClose`).

### 4.8 Buttons

| Variant | Classes |
|---|---|
| Primary | `bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold/semibold text-xs shadow-md shadow-emerald-500/20 rounded-xl` |
| Secondary | `bg-slate-800 hover:bg-slate-700 text-slate-300/white border border-slate-700/800 rounded-xl text-xs font-semibold` |
| Ghost/outline | `bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 rounded-xl` |
| Soft accent | `bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20` |
| Danger solid | `bg-rose-500 hover:bg-rose-400 text-white` |
| Danger outline | `border-rose-500/30 text-rose-400 hover:bg-rose-500/10` |
| Info solid | `bg-sky-500 hover:bg-sky-400 text-slate-950` (activate freeze) |
| Segmented control | Track `bg-slate-800/80 p-1 rounded-xl border-slate-700/60`; active segment `bg-emerald-500 text-slate-950 rounded-lg shadow-sm` (sky variant in category-breakdown toggle) |
| Filter chip | Active `bg-emerald-500 text-slate-950`; inactive `bg-slate-900/80 text-slate-400 border-slate-800`; `px-3 py-1.5 rounded-xl text-xs font-semibold` |

All interactive elements carry `cursor-pointer` and `transition`.

### 4.9 Form Controls
Inputs: `w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm transition`. Select: same shell + `cursor-pointer`. Range slider: `accent-emerald-500`. Day-of-week toggles: `flex-1 py-2 rounded-xl text-xs font-semibold`; checked = `bg-emerald-500/20 border-emerald-500/40 text-emerald-300`. Inline validation: error banner `p-3 text-xs rounded-xl bg-rose-500/10 border-rose-500/20 text-rose-300` above fields; error clears on next input change.

### 4.10 Heatmap (`HeatmapAnalytics.tsx`)
Weeks laid out as vertical columns of 7 cells (`flex gap-1.5`), horizontal scroll container. Cells are buttons (click → jump to that date; hover → `scale-125` + fixed-position tooltip `bg-slate-950 border-slate-700 rounded-xl shadow-2xl` showing formatted date + "x of y completed (n%)" / "Streak Frozen" / "Planned Rest Day"). Legend row under grid: frozen swatch left, 0%→100% emerald ramp right. Range selector: 3 Months (84d) / 6 Months (168d) / Full Year (364d).

### 4.11 Progress Bars
Track `w-full h-2 rounded-full bg-slate-800 overflow-hidden`; fill color-coded (see §1.9), `transition-all duration-700 ease-out`; minimum visible width of 3% when any data exists.

### 4.12 Comparison Cards (Week/Month-over-Month)
`p-3.5 rounded-2xl bg-slate-850 border-slate-800`; left: label, mono current %, muted previous %, "x of y habits"; right: delta pill — up `bg-emerald-500/15 text-emerald-400 border-emerald-500/30` + `TrendingUp`, down `bg-rose-500/15 text-rose-400` + `TrendingDown`, flat `bg-slate-800 text-slate-400` + `Minus`.

> **Percentage-point correctness (enforced):** the delta between two rates is rendered as `+N pp` / `−N pp` (percentage points), never as a relative percent. A move from 82% → 32% is labeled `−50 pp`. Each pill carries a `title` and `aria-label` explaining it is a change in percentage points, not a relative percent change.

### 4.13 Toasts & Indicators
- **Toast system** (`Toast.tsx` + `useToasts.ts`): a `ToastStack` renders up to 3 transient toasts (success / error / info), auto-dismissing after ~4s, driven by the `useToasts` hook. Used for freeze allowance feedback, delete/reset confirmations, and reminder triggers.
- **Offline toast** (`OfflineIndicator.tsx`): `fixed bottom-20 left-4 z-50`, solid `bg-amber-500/90 backdrop-blur-md text-slate-950 text-xs font-semibold rounded-xl px-3.5 py-2 border-amber-400 shadow-xl` + `WifiOff` icon, `animate-in slide-in-from-bottom-2`. Auto appears/disappears with `navigator.onLine` events.
- **Settings save feedback**: button label swaps to "Saved" + `Check` icon for 2s.
- **Backup import feedback**: inline banner, success = emerald tint, error = rose tint.

### 4.14 Empty States
Panel `p-8 text-center rounded-3xl bg-slate-900/40 border-slate-800/80 space-y-3`: centered `w-12 h-12 rounded-2xl bg-slate-800 text-slate-500` icon tile, `text-sm font-semibold text-white` title, `text-xs text-slate-400` explanation, soft-emerald CTA button. Implemented states: **first-run empty dashboard** (`FirstRunEmptyState.tsx`, premium welcome + single "create your first habit" CTA), **"No habits scheduled for this date"**, **empty habits library**, and **empty analytics** (no habits → "No analytics yet" panel).

### 4.15 Skeleton / Loading State
Full-screen centered pulsing logo tile + "HabitFlow" wordmark + `text-xs text-slate-500` "Loading your routine..." (`animate-pulse`), shown until localStorage hydration completes.

### 4.16 Iconography
`lucide-react` exclusively. Standard sizes: `w-3 h-3` (inline micro), `w-3.5 h-3.5` (labels/buttons), `w-4 h-4` (default), `w-5 h-5` (nav/hero), `w-6 h-6` (empty state). Emphasis via `stroke-[2.5]`/`stroke-[3]` and `fill-*` (flame). Category icons per §1.7.

### 4.17 Scrollbars
Global webkit scrollbar: 6px, transparent track, thumb `rgba(148,163,184,0.2)` → hover `0.4`, pill radius. Carousel/filter rows use the `no-scrollbar` utility (now defined in `src/index.css` via `@utility` — sets `scrollbar-width: none` and hides `::-webkit-scrollbar`).

---

## 5. Motion & Interaction

### 5.1 Implemented Motion

| Interaction | Specification |
|---|---|
| Checkbox check | `transition-all duration-200`; checked state adds `scale-105` + `shadow-md shadow-emerald-500/25`; hover `scale-105` + border lightening |
| Completion feedback | Web Audio chime (C5→E5→G5 sine arpeggio, 0.35s) when `soundEnabled`; title strike-through; card border turns emerald |
| All-done celebration | Two-sided confetti stream (emerald/cyan palette, 3 particles per side per frame) for 1.2s + rising "streak" chime (D5→A5, 0.5s) |
| Onboarding complete | Single 80-particle confetti burst (spread 70, origin y 0.7, multi-color) |
| Freeze applied | Descending chime (A4→F4, 0.4s) |
| Modal entrance | `animate-in fade-in zoom-in-95 duration-200` — implemented via a Tailwind v4 `@theme` `--animate-in` token (`hf-enter` keyframes) plus composable `@utility` state setters (`fade-in`, `zoom-in-95`, `slide-in-from-bottom-2`). No external `tailwindcss-animate` plugin. |
| Progress ring | `transition-all duration-500 ease-out` on `stroke-dashoffset` |
| Category bars | `transition-all duration-700 ease-out` width |
| Hover/active states | Buttons: `hover:bg-*` lightening + `active:scale-95`/`active:scale-[0.98]`; cards: border lightening; heatmap cells: `hover:scale-125`; generic `transition` (~150ms default) |
| Date chip selection | `scale-105` + glow on selected; smooth `scrollIntoView({behavior:'smooth'})` centering |
| Offline toast | `animate-in slide-in-from-bottom-2` |
| Skeleton | `animate-pulse` |

### 5.2 Reduced-Motion Support

**Implemented.** A `prefers-reduced-motion: reduce` strategy is in place:

- Confetti triggers (`src/utils/confetti.ts`) check `matchMedia('(prefers-reduced-motion: reduce)')` and skip entirely when reduced motion is requested.
- A global CSS block in `src/index.css` collapses animation and transition durations to `0.001ms` under the media query, neutralizing `animate-in`, `animate-pulse`, and non-essential transitions.
- Audio chimes remain governed by the independent `soundEnabled` setting (not tied to motion preference).

### 5.3 Interaction Rules

- All touch targets ≥ 44×44px for primary controls (checkbox wrapper enforces this with negative margin `-m-2`; bottom nav is `h-16`; primary CTAs are `py-3`). Dense data-viz controls (heatmap cells, day-letter toggles) are smaller by necessity but carry full `aria-label`s.
- `-webkit-tap-highlight-color: transparent` globally; mobile date strip is `select-none`.
- Every clickable element uses an explicit `cursor-pointer` (Tailwind v4 preflight no longer defaults buttons to pointer).
- Menus close on mouse-leave. Modals are accessible dialogs (`useModalA11y`): `role="dialog"` + `aria-modal`, initial focus (autofocus field or first control), Tab focus-trapping, focus restoration to the invoking element on close, and dismiss via **Escape key or backdrop click** (in addition to explicit Cancel/Close buttons). The mandatory onboarding gate traps focus but cannot be dismissed.
- Destructive actions (habit delete, clear-all-data) route through an accessible `ConfirmDialog` (`role="alertdialog"`) that explains the cascade before confirming — no `window.confirm`.

---

## 6. Design Principles (guardrails for future work)

1. **Dark navy + emerald only.** No light theme, no glassmorphism beyond the existing header/overlay `backdrop-blur`, no new gradients beyond the two brand gradients.
2. **Emerald = action & success; sky = protection/freeze/info; amber = streaks & warnings; rose = danger.** Never cross-wire these semantics.
3. **Numbers are mono.** Any statistic, date, time, or counter uses `font-mono` (+ `tabular-nums` in tables/rows).
4. **Tinted, not solid.** Secondary surfaces use alpha tints (`/10`–`/20`) of accent colors with matching tinted borders — never full-saturation backgrounds except primary CTAs.
5. **Consistent shell.** Every modal follows the §4.7 header/footer pattern; every card uses `rounded-2xl`/`rounded-3xl` + `border-slate-800` family.
6. **Mobile thumb zone.** Primary navigation and the offline toast respect the bottom nav area (`bottom-20`, `pb-24`).

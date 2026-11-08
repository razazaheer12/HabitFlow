# HabitFlow — Phase 3, Stage 1
## Premium Light Design Foundation (Design Research, Analysis & Specification)

**Phase:** Phase 3 — Premium Light UI Redesign
**Stage:** Stage 1 — Design Research, Analysis & Foundation
**Approved Direction:** D — Premium Hybrid (Soft Premium + Ultra Minimal + Editorial Premium)
**Status:** Documentation & design exploration ONLY. **No production code was modified.**
**Companion visual concepts:** `design/phase-3/dashboard-desktop.png`, `dashboard-mobile.png`, `analytics-desktop.png`, `new-habit-modal.png`

> **Scope note on the inspiration screenshot:** the brief references an inspiration screenshot (Section 5), but no image file was delivered with this assignment (the attachments folder contained only text briefs). The inspiration analysis below is therefore derived from the *described* visual characteristics in the brief — warm light surfaces, white cards, lime-green highlights, dark typography, minimal borders, pastel category colors, clean statistics, compact-but-readable layouts — evaluated against HabitFlow's actual product needs. If the original screenshot is supplied later, Section 3 should be revisited.

---

## Section 1 — Executive Summary

HabitFlow's Phase 3 identity moves from a **dark navy + emerald developer-dashboard aesthetic** to a **warm, editorial, light "premium consumer" aesthetic**. The new identity is built on three fused philosophies (Soft Premium + Ultra Minimal + Editorial Premium) expressed as one coherent language, not three layered styles.

**The core idea:** HabitFlow should feel like a beautifully printed daily planner that happens to be software — calm paper-white surfaces, confident dark-green ink, a single energetic lime accent reserved for *action and achievement*, and generous editorial whitespace that lets each day's routine breathe.

**Major decisions:**

1. **Warm paper, not clinical white.** Page background `#F8F9F5` (a green-tinted off-white) with pure-white cards. This avoids the sterile "AI SaaS" look and gives surfaces a soft, tactile warmth.
2. **Lime is a *fill*, never a text color.** The accent `#B8E65A` fails WCAG as text (1.3:1 on white). It is used only as a solid button/selection fill carrying dark ink `#20251F` (9.7:1), and as a soft tint for highlights. Colored *text* uses a dark olive `#3F6B12` (5.35:1).
3. **One accessible ink ramp.** Primary `#20251F` (AAA), secondary `#5F655C` (AA on all surfaces). The brief's proposed secondary `#777E75` measured only 3.7–3.9:1 and is demoted to large/decorative text only.
4. **Manrope as the primary typeface**, self-hosted, replacing Geist. Numerics use Manrope with tabular figures rather than monospace, reserving JetBrains Mono for genuinely technical contexts (backup/export grids) or removing it.
5. **Pastel category system** harmonized to the lime identity — soft amber, sky, lime, indigo, rose — each with bg/ink/icon/border/progress tokens.
6. **Restrained elevation.** Soft, warm-tinted shadows (never black glows); borders do most of the separation work.

The result is a distinctive, calm, premium product that users will enjoy opening daily — "Make Every Day Count."

---

## Section 2 — Existing Design Audit

The current system (documented in `design.md` v2.0) is a **dark navy + emerald** identity on Tailwind CSS v4 (`@theme` in `src/index.css`, no `tailwind.config.js`), self-hosted Geist Variable + JetBrains Mono, lucide-react icons.

### Strengths (keep as foundations)
- **Token-driven surfaces.** A real surface hierarchy (`surface-base → surface → elevated → interactive`) and custom `slate-750/850` tokens — a disciplined approach worth carrying into light mode.
- **Consistent semantic color wiring.** Emerald = action/success, sky = freeze/info, amber = streak/warning, rose = danger. This semantic discipline is excellent and should be preserved (only the hues shift).
- **Strong accessibility mechanics.** 44px touch targets, `useModalA11y` focus trapping, `role="dialog"`, `prefers-reduced-motion` support, an enforced 11px type floor, percentage-point-correct deltas. These are product-quality and must survive the redesign.
- **Self-hosted fonts.** No remote font dependency; offline-safe. Keep this principle.
- **Coherent component shells.** One modal pattern, one card pattern, one button set — high reuse.

### Weaknesses (why we are redesigning)
- **Developer-dashboard tone.** Dark navy + monospace numerics reads as an analytics tool for engineers, not a warm daily companion for consumers.
- **Heavy visual weight.** Dark surfaces + glows + tinted alphas create density; the eye has little rest. Long daily use feels heavy.
- **Emerald-on-dark contrast is adequate but the palette is cold.** It lacks the approachability a habit tracker needs to encourage daily return.
- **Monospace-everything numerics** (§2.5 of `design.md`) is a developer convention; consumer products present numbers in refined proportional/tabular sans.
- **Limited personality.** The dark system is competent but generic-SaaS-dark; it has no memorable editorial voice.

### Constraints inherited (do not break)
- Tailwind v4 CSS-first theming; no `tailwind.config.js`.
- Local-first localStorage schema, analytics math, routing, PWA/SW — all out of scope for visual change.
- Offline/self-hosted assets must be preserved.

---

## Section 3 — Inspiration Analysis

Evaluated against the described reference direction. Each element is **Adopted / Improved / Reinterpreted / Rejected** with reasoning.

| Reference element | Verdict | Reasoning |
|---|---|---|
| Warm off-white page bg | **Adopt** | Core to the premium-paper feel; `#F8F9F5` is green-tinted (harmonizes with lime) rather than grey. |
| Pure white cards on warm bg | **Adopt** | Creates clean figure/ground separation without heavy borders. |
| Lime-green highlights | **Adopt, with discipline** | Energetic and distinctive, but must be rationed: fills for primary action + selection + achievement, soft tints for emphasis. Never body text. |
| Dark typography | **Adopt** | `#20251F` charcoal-green ink gives strong hierarchy and warmth vs pure black. |
| Minimal borders | **Adopt + improve** | Reference uses near-invisible borders; HabitFlow needs slightly stronger `#E8EBE3` borders + soft shadows because cards carry interactive state (pending/completed/frozen/missed) that must remain legible. |
| Pastel category colors | **Adopt + harmonize** | Reinterpret the five categories into a muted pastel set keyed to the lime identity (Section 5.3), avoiding a saturated rainbow. |
| Clean statistics | **Adopt + improve** | Replace monospace stat numerals with tabular Manrope for a consumer feel; keep tabular alignment. |
| Compact-but-readable layouts | **Adopt** | Preserve HabitFlow's information density (it is a daily tool) but add editorial whitespace around sections. |
| Editorial pull-quote / brand voice | **Rejected (approved)** | The optional hero pull-quote is removed; the dashboard hero remains purely functional (approved 2026-11-09). |
| Any glassmorphism / heavy gradients / glow | **Reject** | Conflicts with Ultra-Minimal; the dark theme's two brand gradients are retired in light mode in favour of solid lime/forest. |
| Over-rounded everything | **Reject** | Cap radius at 16px cards / 24px modals; avoid the "bubble" look. |

---

## Section 4 — Design Philosophy (Approved Premium Hybrid)

One language from three philosophies:

- **Soft Premium** supplies the *material*: warm paper background, white surfaces, soft warm shadows, gentle neutral borders, comfortable whitespace, refined radii.
- **Ultra Minimal** supplies the *discipline*: clean hierarchy, restrained color (one accent), no decorative noise, intentional spacing, minimal effects.
- **Editorial Premium** supplies the *voice*: confident typographic hierarchy (large display greeting, uppercase eyebrows), composed asymmetric hero, distinctive section presentation, whitespace used expressively — without sacrificing density or usability.

**Guiding rules**
1. Paper first: background is warm off-white; white is reserved for content surfaces.
2. Ink over color: hierarchy is carried by type weight/size and dark ink, not by color variety.
3. Lime = energy: only for primary action, selection, and achievement. Everything else is ink or pastel.
4. Whitespace is a feature: sections breathe; cards do not crowd.
5. Every state is legible without color (icon + label + tint), for accessibility.

---

## Section 5 — Color System

All values are HEX. Contrast ratios measured (WCAG 2.2) and noted.

### 5.1 Core / background & surface tokens

| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#F8F9F5` | App page background (warm paper) |
| `--color-bg-secondary` | `#F1F3ED` | Section bands, inset tracks, disabled fills |
| `--color-surface` | `#FFFFFF` | Cards, panels, modals, inputs |
| `--color-surface-elevated` | `#FFFFFF` | Raised cards/dropdowns (differentiated by shadow, not color) |

### 5.2 Ink / text tokens (accessible ramp)

| Token | Hex | Contrast (on `#F8F9F5` / `#FFFFFF`) | Usage |
|---|---|---|---|
| `--color-ink` | `#20251F` | 12.36 / 13.06 (AAA) | Headings, primary text, button ink on lime |
| `--color-ink-secondary` | `#5F655C` | 5.23 / 5.52 (AA) | Body, labels, secondary text |
| `--color-ink-muted` | `#777E75` | 3.74 / 3.95 (AA-large only) | Large text, decorative captions, disabled-adjacent metadata. **Never** for meaningful small text. |
| `--color-ink-on-accent` | `#20251F` | 9.71 on `#B8E65A` (AAA) | Text/icons on lime fills |
| `--color-accent-text` | `#3F6B12` | 5.35 on white (AA) | Colored links / emphasis where green text is required |

> **Correction to the brief's starting palette:** the proposed Secondary Text `#777E75` fails AA for normal text (3.74:1). It is retained only as `ink-muted` for large/decorative use; `ink-secondary #5F655C` is the accessible body/secondary color.

### 5.3 Accent tokens

| Token | Hex | Usage |
|---|---|---|
| `--color-accent` | `#B8E65A` | Primary button fill, selected state, achievement highlights (with `ink-on-accent`) |
| `--color-accent-hover` | `#A5D644` | Hover on accent fills |
| `--color-accent-soft` | `#F1F8E5` | Soft highlight backgrounds, success tint, active nav tint |
| `--color-accent-border` | `#CDE8A0` | Borders on accent-soft surfaces |
| `--color-forest` | `#263629` | Deep brand green: focus rings, dark icon chips, optional dark section bands |

### 5.4 Semantic state tokens

| State | Text/ink | Background | Border | Progress/fill |
|---|---|---|---|---|
| Success / completed | `#3F6B12` | `#F1F8E5` | `#CDE8A0` | `#8CC63F` |
| Warning / missed / streak | `#8A5A00` | `#FBF1DE` | `#F0DCB8` | `#E0A43C` |
| Error / danger | `#B42318` | `#FDECEA` | `#F5C6C0` | `#E0655C` |
| Info / frozen / protection | `#175E88` | `#E7F2F9` | `#BBDCEE` | `#4E9BC8` |
| Neutral / rest day | `#5F655C` | `#F1F3ED` | `#E8EBE3` | `#A8AEA4` |
| Disabled | `#A8AEA4` | `#F1F3ED` | `#E8EBE3` | — |

### 5.5 Border, focus & selection

| Token | Hex | Usage |
|---|---|---|
| `--color-border` | `#E8EBE3` | Default card/panel/input borders, dividers |
| `--color-border-strong` | `#D8DDD0` | Input borders, hovered borders, control outlines |
| `--color-focus` | `#263629` | Focus ring: 2px solid, offset 2px (high contrast on light) |
| `--color-selection-bg` | `#E4F5C4` | Text selection background |
| `--color-selection-ink` | `#20251F` | Text selection foreground |

### 5.6 Category palette (pastel, harmonized to lime)

| Category | Icon | Bg | Ink | Icon color | Border | Progress |
|---|---|---|---|---|---|---|
| Fitness / Body | `Dumbbell` | `#FDF0DC` | `#8A5A00` | `#C77E14` | `#F3DFC0` | `#E0A43C` |
| Mind & Focus | `Brain` | `#E7F1FA` | `#175E88` | `#2E7FB0` | `#CFE3F2` | `#4E9BC8` |
| Productivity | `Zap` | `#F1F8E5` | `#3F6B12` | `#6FA32B` | `#DDEEC4` | `#8CC63F` |
| Learning | `BookOpen` | `#ECEBFA` | `#4A3F9F` | `#6A5FD0` | `#DCD9F2` | `#7A6FE0` |
| Health & Routine | `HeartPulse` | `#FDECEC` | `#B42318` | `#D2554C` | `#F6D5D2` | `#E0655C` |

### 5.7 Analytics color system

| Element | Treatment |
|---|---|
| Heatmap ramp (0→100%) | 0 `#F1F3ED` · 1 `#E9F5D3` · 2 `#CDE8A0` · 3 `#A9D95C` · 4 `#7CB92E` |
| Heatmap frozen | `#CFE3F2` fill + `#9CC6E0` border (info family) |
| Heatmap rest day | `#E8EBE3` fill + moon icon (neutral) |
| Heatmap missed | `#F6D5D2` fill (error tint) |
| Progress bars | Track `#F1F3ED`; fill = category progress color; overall = `#8CC63F` |
| Streak indicator | `#E0A43C` flame on `#FBF1DE` |
| Comparison delta up | ink `#3F6B12` on `#F1F8E5` + `TrendingUp` |
| Comparison delta down | ink `#B42318` on `#FDECEA` + `TrendingDown` |
| Comparison delta flat | ink `#777E75` on `#F1F3ED` + `Minus` |

Color-independence: every heatmap/data state pairs color with an icon or label (frozen = shield, rest = moon, missed = alert) and full `aria-label`s, so meaning never relies on hue alone.

---

## Section 6 — Typography System

### 6.1 Typeface decision

| Candidate | Verdict | Reasoning |
|---|---|---|
| **Manrope** | **SELECTED (primary)** | Geometric-humanist with friendly rounded terminals; excellent small-screen legibility; strong weight range (200–800 variable); distinctive but professional personality; self-hostable via `@fontsource-variable/manrope`; OFL licence. Perfect for a warm consumer product. |
| Geist Sans | Rejected as primary | Current font; competent but neutral/technical — part of the "developer dashboard" tone we are leaving. |
| Inter | Rejected | Highly legible but visually ubiquitous/generic; no distinctive voice. |
| DM Sans | Rejected | Pleasant but less characterful at display sizes than Manrope. |
| Plus Jakarta Sans | Rejected | Good, but Manrope's numerals and display weights suit HabitFlow's stat-heavy UI better. |
| JetBrains Mono | **Restricted (final)** | Retired from consumer statistics. Retained only for genuinely technical/export contexts (e.g. backup summary grids). |

### 6.2 Loading strategy
Self-hosted variable font: `@fontsource-variable/manrope` imported in `src/main.tsx`, bundled by Vite into `dist/assets/*.woff2`, `font-display: swap`. **No remote font requests** (preserves offline/PWA). Remove `@fontsource-variable/geist` once migrated; JetBrains Mono remains only for technical/export grids.

### 6.3 Type scale & hierarchy

| Role | Size / line-height | Weight | Tracking | Notes |
|---|---|---|---|---|
| Display / H1 (hero greeting) | 32/40 (mobile 28/36) | 800 | −0.02em | Editorial hero |
| H2 (page/section title) | 24/32 | 700 | −0.01em | |
| H3 (card/modal title) | 20/28 | 700 | −0.01em | |
| Eyebrow / kicker | 12/16 uppercase | 700 | +0.08em | Date line, section labels |
| Body | 16/24 | 400 | 0 | Modal copy, descriptions |
| Body small | 14/20 | 400 | 0 | Secondary copy |
| Caption | 13/18 | 500 | 0 | Helper text, meta |
| Micro (data-viz only) | 12/16 | 600 | +0.02em | Heatmap/legend labels. **Floor = 12px**; 11px permitted only inside heatmap cells. |
| Button (primary) | 14/20 | 600 | 0 | |
| Button (secondary) | 14/20 | 500 | 0 | |
| Form label | 13/18 | 600 | 0 | |
| Numeric stat (large) | 28/36 | 800 | 0 | `font-variant-numeric: tabular-nums` |
| Numeric stat (secondary) | 20/28 | 700 | 0 | tabular-nums |
| Nav link | 14/20 | 600 | 0 | |

**Numeric principle:** consumer statistics use Manrope with `tabular-nums` (aligned columns where needed), NOT monospace. Monospace is reserved for technical/export grids only.

---

## Section 7 — Spacing & Layout

### 7.1 Spacing scale (4px base)
`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64`

| Application | Value |
|---|---|
| Page padding | mobile 16 · tablet 24 · desktop 32 |
| Main content max width | 1120px (analytics/library); **Today dashboard = 720px centered** (single editorial column) |
| Section spacing | 32–48 |
| Card padding | 20–24 |
| Grid gap | 16–24 |
| Nav item spacing | 24–32 |
| Modal padding | 24 |
| Form field spacing | 16 between fields; 8 label→input |
| Mobile bottom clearance | respects safe-area (`pb-safe`) + bottom-nav height |

### 7.2 Border-radius scale
| Element | Radius |
|---|---|
| Small controls / chips / badges | 8px (pill `full` for streak pills) |
| Inputs / buttons / icon containers | 12px |
| Checkboxes | 10px |
| Standard cards | 16px |
| Large panels | 20px |
| Modals | 24px |

Avoid uniform over-rounding; radii step down for smaller elements.

### 7.3 Shadows & elevation (soft, warm-tinted — never black glows)
| Level | Shadow |
|---|---|
| None (flat) | border-only surfaces |
| Card | `0 1px 2px rgba(32,37,31,.04), 0 1px 3px rgba(32,37,31,.06)` |
| Elevated / interactive | `0 2px 6px rgba(32,37,31,.06), 0 4px 12px rgba(32,37,31,.06)` |
| Dropdown | `0 4px 8px rgba(32,37,31,.08), 0 12px 24px rgba(32,37,31,.10)` |
| Modal | `0 8px 16px rgba(32,37,31,.10), 0 24px 48px rgba(32,37,31,.14)` |

---

## Section 8 — Component Design Standards

### 8.1 Navigation
- **Desktop top nav:** sticky, `bg` = `#F8F9F5` at ~85% + subtle blur, `border-b #E8EBE3`. 3-zone: brand (lime rounded tile + dark wordmark), text links (active = `ink` + 2px lime underline or lime-soft pill; inactive = `ink-secondary`, hover `ink`), actions (lime "Add Habit" + settings icon).
- **Mobile bottom nav:** fixed, white surface, `border-t #E8EBE3`, 4 tabs icon-over-label; active = `ink` + lime indicator dot/pill; inactive `ink-muted`.
- Touch targets ≥44px.

### 8.2 Dashboard hero
Editorial: uppercase eyebrow date line (`ink-muted`), large display greeting (`ink`, 800), one-line personal subtext (`ink-secondary`). Right side: single Streak-Freeze button (info-family when Holiday Mode active). Below: three white stat cards (Completion w/ lime ring, Streak w/ amber flame chip, Active Habits w/ lime chip) using tabular numerals.

### 8.3 Habit cards (states)
White card, `border #E8EBE3`, radius 16, soft shadow. Anatomy: 44px checkbox (rounded 10; checked = solid lime + dark check + subtle ring), pastel category icon chip, habit name (`ink`, 600), reminder time (`ink-muted`, tabular), streak pill (amber-soft), ⋮ menu.
State skins: **pending** white; **completed** `accent-soft` tint + lime border + struck name; **frozen** info tint + shield; **rest** neutral tint + moon; **missed** error tint + alert; **archived** muted, reduced opacity. Hover: border → `border-strong` + slight elevation.

### 8.4 Date navigation
Horizontal chip carousel. Chip = white, `border #E8EBE3`; **selected** = solid lime + `ink-on-accent` + slight scale; **today** = white + lime border; status dot (lime done / amber partial / sky frozen). Hidden scrollbar; smooth centering; "Today" pill when off-today.

### 8.5 Statistics cards
White, radius 16, soft shadow; label (`ink-secondary` 13/18), large tabular value (`ink` 28/36 800), caption (`ink-muted`), right icon chip in semantic tint.

### 8.6 Analytics dashboard
White panels, radius 20. Heatmap uses the 5-step lime ramp + state tints, month labels `ink-muted`, hover tooltip white + dropdown shadow. Comparison cards show large tabular % + `pp` delta pills. Category breakdown = pastel horizontal bars with label + %. No decorative chart junk.

### 8.7 Calendar
Monthly grid; white cells, `border #E8EBE3`; today = lime ring; selected = solid lime + dark ink; activity = lime-tint intensity; frozen/rest/missed tints; category legend below.

### 8.8 Habit create/edit form
White inputs on white card with `border-strong`, radius 12, focus = `focus` ring. Category = pastel selectable chips. Frequency = segmented control (active = solid lime + dark ink). Day toggles = circular chips. Inline validation = error tint banner. Submit = lime; Cancel = neutral.

### 8.9 Modals & dialogs
Overlay = `#20251F` at 40% + slight blur. Panel = white, radius 24, modal shadow, `border #E8EBE3`. Header (title + close), divider `#E8EBE3`, body, footer (Cancel neutral / Primary lime). Confirmation & destructive variants use error-family accents. Preserve `useModalA11y` focus trap + Escape/backdrop dismiss.

### 8.10 Settings
Sectioned white panels; rows with label + control; toggles = lime when on; selects/inputs standard; backup/restore and data-management rows with semantic icons.

### 8.11 Empty states
Centered white panel, radius 20, soft shadow; lime-soft icon tile; title (`ink`), explanation (`ink-secondary`), single lime CTA. States: no habits, no analytics, no history, no search results, no data.

### 8.12 Toasts & notifications
White surface, radius 12, dropdown shadow, left semantic icon + tint bar; success/error/warning/info/offline/save variants; subtle slide-in; auto-dismiss ~4s.

---

## Section 9 — Screen-Level Design Direction

- **Today (Dashboard):** single centered editorial column (720px). Hero greeting → stat trio → date carousel → habit checklist. Calm, one-task-per-row, generous vertical rhythm. *(See `dashboard-desktop.png`, `dashboard-mobile.png`.)*
- **Analytics:** full-width (1120px) composed dashboard: heatmap hero panel, comparison row, category breakdown, historical summary. Clear data hierarchy. *(See `analytics-desktop.png`.)*
- **Habits Library:** 2-column card grid (desktop) / single column (mobile) with search + category filter chips + sort control; archive toggle.
- **Create/Edit Habit:** centered form card with clear sections and sticky footer actions. *(See `new-habit-modal.png`.)*
- **Settings:** narrow (640px) sectioned panels.
- **Onboarding:** warm welcome, single centered card, lime CTA, restrained confetti on completion.
- **404:** minimal centered message + lime "Back to Today".

---

## Section 10 — Responsive Strategy

Mobile-first. Breakpoints: base (mobile) · `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280.

- **Mobile (<640):** single column; bottom tab nav; condensed hero; horizontal date carousel; stat cards stack or 3-across compact; 16px page padding; 44px touch targets.
- **Tablet (640–1023):** 2-column library; wider hero; top nav appears at `md`.
- **Desktop (≥1024):** top nav; dashboard centered 720px; analytics/library 1120px; hover states active; bottom nav hidden.
- **Large (≥1280):** maintain 1120px content cap; increase whitespace, not width.

Guarantees: no horizontal overflow, no clipped labels, no sub-12px meaningful type, no broken grids, no nav collisions, safe-area-aware bottom padding.

---

## Section 11 — Motion System

| Interaction | Spec |
|---|---|
| Checkbox complete | 150ms scale + fill to lime; check draw |
| Progress update | 300–500ms width/ring ease-out |
| Modal open | 200ms fade + scale 0.98→1 (`cubic-bezier(0.16,1,0.3,1)`) |
| Modal close | 150ms fade + scale out |
| Button press | 120ms `scale(0.98)` |
| Card hover | 150ms border + shadow lift (no translate) |
| Nav selection | 150ms color/underline transition |
| Calendar/date select | 150ms fill + scale |
| Streak milestone | restrained confetti (existing), skipped under reduced motion |
| Toast | 200ms slide-in from bottom |

Durations 120–500ms; single easing family; **`prefers-reduced-motion` collapses all** (preserve existing global rule). No parallax, no gratuitous springs.

---

## Section 12 — Accessibility

- **Contrast:** all meaningful text ≥4.5:1 (see Section 5.2 measured values). Lime never used as text. Focus ring `#263629` 2px offset 2px (≥3:1 vs bg).
- **Keyboard:** full tab order, visible focus, modal focus trap + restore (existing `useModalA11y`).
- **Touch:** ≥44px primary targets.
- **Color-independence:** every state pairs color with icon/label; heatmap cells carry `aria-label`s.
- **Reduced motion:** global collapse (existing).
- **Type floor:** 12px meaningful; 11px only heatmap micro-labels.
- **Forms:** explicit labels, required/optional markers, inline error text tied via `aria-describedby`.

---

## Section 13 — Technical Compatibility

- **Tailwind v4 CSS-first:** add all tokens as `--color-*`, `--font-*`, `--radius-*`, `--shadow-*` custom properties inside `@theme` in `src/index.css`. No `tailwind.config.js`.
- **Fonts:** `@fontsource-variable/manrope` (self-hosted, offline-safe). Remove Geist import post-migration; JetBrains Mono optional/technical-only.
- **Icons:** continue `lucide-react`; standardize sizes (16/20/24) and stroke weights.
- **No new runtime dependencies** beyond the font package. No backend, no remote assets.
- **Preserve:** `no-scrollbar`, `pb-safe`, reduced-motion block, `useModalA11y`, localStorage schema, analytics math, routing, SW/PWA.
- **Dark theme:** **Premium Light only — no dark mode, no theme switcher, no automatic system theme switching (approved 2026-11-09).** The light system fully replaces the dark tokens; the `dark:` custom-variant and all dark tokens are removed.

---

## Section 14 — Migration Strategy (dark → light mapping)

| Current (dark) | Proposed (light) |
|---|---|
| `bg-slate-950` (#020617) page | `--color-bg` #F8F9F5 |
| `bg-slate-900` (#0f172a) cards/modals | `--color-surface` #FFFFFF |
| `bg-slate-850/800` insets | `--color-bg-secondary` #F1F3ED / white + border |
| `text-white` / `slate-100/200` | `--color-ink` #20251F |
| `text-slate-300/400` | `--color-ink-secondary` #5F655C |
| `text-slate-500` | `--color-ink-muted` #777E75 (large/decorative only) |
| `border-slate-800/700` | `--color-border` #E8EBE3 / `--color-border-strong` #D8DDD0 |
| `emerald-500/400` accent | `--color-accent` #B8E65A (fill) + `--color-accent-text` #3F6B12 (text) |
| `emerald-500/10` tints | `--color-accent-soft` #F1F8E5 |
| `sky-*` freeze/info | info family (#175E88 / #E7F2F9 / #BBDCEE) |
| `amber-*` streak/warn | warning family (#8A5A00 / #FBF1DE / #E0A43C) |
| `rose-*` danger | error family (#B42318 / #FDECEA / #E0655C) |
| `font-mono` stats | Manrope + `tabular-nums` |
| Geist Variable | Manrope Variable |
| Dark shadows/glows | Soft warm shadows (Section 7.3) |
| Brand gradients (logo/greeting) | Solid lime tile + solid ink greeting (gradients retired) |
| Category text colors | Pastel category tokens (Section 5.6) |
| Heatmap emerald ramp | Lime ramp (Section 5.7) |

Semantic roles (action/success, freeze/info, streak/warn, danger) are **preserved**; only hues shift to the light pastel families.

---

## Section 15 — Design Decisions (FINAL, approved)

### Confirmed design decisions
1. Warm paper + white surfaces; lime as fill-only accent with dark ink.
2. Accessible ink ramp (secondary corrected to `#5F655C`).
3. Manrope primary, self-hosted; tabular sans numerics (mono retired from consumer stats).
4. Pastel category + analytics palettes harmonized to lime.
5. Restrained warm shadows; radius cap 16/24.
6. Preserve all a11y mechanics, semantic state wiring, and technical constraints.

### Resolved product decisions (approved 2026-11-09, pre-implementation)
1. **Premium Light only.** No dark mode, no theme switcher, no automatic system theme switching. The dark theme is fully retired.
2. **No editorial pull-quote** on the dashboard; the hero remains purely functional.
3. **Manrope Variable** is the primary self-hosted font (`@fontsource-variable/manrope`).
4. **JetBrains Mono** is retained only for genuinely technical/export contexts (e.g. backup summary grids); it is removed from consumer statistics.
5. **The five pastel category mappings** (Section 5.6) are approved as final.
6. **The five-step lime heatmap intensity scale** (Section 5.7) is approved as final.

### Mockup usage restrictions (binding for Stage 2)
- Keep the HabitFlow brand and wordmark.
- Preserve the existing desktop top-navigation architecture.
- Preserve the existing mobile bottom-tab navigation.
- Do not introduce a left sidebar.
- Do not use the "Habitly" branding present in the analytics/modal concept renders; those renders inform color, typography and component treatment only.

---

## Section 16 — Stage 2 Readiness

**Finalized (ready to implement):** full color token set (with measured contrast), typography system + scale, spacing/radius/shadow systems, component standards for every major component, screen-level direction, responsive strategy, motion system, accessibility requirements, dark→light migration map, and four visual concept renders.

**Carried into Stage 2:** actual token implementation in `src/index.css` `@theme`; component-by-component restyle; font swap (Geist → Manrope); removal of dark tokens/gradients and the `dark:` variant; in-browser contrast + responsive QA; visual regression pass.

**Assessment:** the design foundation is **complete and implementation-ready**. All product decisions are resolved (Section 15), so a development agent can implement Stage 2 from this document without guessing token values, hierarchy, or state treatments.

---

*End of Phase 3 — Stage 1 Design Foundation.*

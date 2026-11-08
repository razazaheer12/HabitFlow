# HabitFlow — Product Requirements Document (PRD)

**Version:** 1.0 (Phase 1 Documentation)
**Product:** HabitFlow PWA
**Stack:** Vite + React 19 + TypeScript + Tailwind CSS v4 (local-first, no backend)
**Scope note:** Sections marked **[Implemented]** describe behavior verified in the current source code. Sections marked **[Required Change]** describe new requirements approved for Phase 2 that are *not yet implemented*.

---

## 1. Product Overview

### 1.1 Product Name
**HabitFlow** — Habit Tracker & Streak Analytics (PWA).

### 1.2 Purpose & Vision
HabitFlow is a mobile-first, offline-first Progressive Web App that helps people build lasting habits through low-friction daily check-offs, forgiving streak protection (freezes / Holiday Mode), one-line micro-journaling, and motivating consistency analytics (heatmap, category breakdown, period comparisons).

The vision is a *private-by-design* habit tracker: no accounts, no servers, no tracking. All data lives on the user's device and travels with them only through explicit JSON backup files.

### 1.3 Target Users
- Individuals building personal routines (fitness, mindfulness, learning, productivity, health).
- Privacy-conscious users who refuse cloud-synced self-tracking.
- Mobile-first users who want an app-like experience without an app store install (PWA), plus desktop users who keep a browser tab open.

### 1.4 Core User Problems
1. Habit apps punish missed days, causing users to abandon streaks and quit ("what-the-hell" effect). → **Streak Freeze / Holiday Mode** preserves streaks on sick, travel, or overload days within a monthly allowance.
2. Journaling apps demand long entries; users skip them. → **Micro-journaling** caps reflections at one line (160 chars) with quick-prompt chips.
3. Cloud trackers require accounts and harvest behavioral data. → **Local-first**: localStorage only, JSON export/import for portability.
4. Motivation decays without visible progress. → **Heatmap + week/month comparisons + confetti/audio feedback** make consistency tangible.
5. Rigid "every day" scheduling doesn't match real routines. → **Three schedule types** (daily, specific days, weekly target) with planned rest days that never count as misses.

### 1.5 Key Product Features
- Dynamic time-based greeting dashboard with today's completion ring, global streak, and active-habit count.
- Daily execution checklist with 4 distinguishable day statuses (completed / frozen / skipped / missed).
- Date carousel for historical logging (past 14 days + today + tomorrow).
- Habit CRUD with categories, schedule rules, target units, reminder times, motivation notes.
- Habit archiving (preserves history) and deletion.
- Micro-journaling per habit per day.
- Streak engine: per-habit day streaks, weekly-target week streaks, global app streak; freezes preserve without advancing.
- Analytics: percentage heatmap (3/6/12 months), category breakdown (7/30 days), week-over-week and month-over-month comparisons, best-category award.
- Client-side reminders (in-app, while app is open) with per-habit HH:MM times.
- Settings: profile, freeze allowance, sound, notifications, archived-habit visibility.
- JSON backup export / import (merge or full replace) with validation and rollback.
- PWA install flows (Chromium prompt, iOS guide, desktop guide) + offline support via Service Worker.

### 1.6 Local-First Privacy Philosophy
- **Zero network calls for app data.** Everything persists to `localStorage` under `habitflow_*_v2` keys.
- **No accounts, no telemetry, no analytics services.**
- **Data portability by explicit user action**: backup download produces a self-describing JSON file (`schemaVersion`, `exportedAt`, `appVersion` + all entities).
- **No backend services or external databases will be introduced.** Reminders are deliberately client-side only; this limitation is disclosed in Settings ("Local-Only Architecture Notice").
- ⚠️ Current exception to fix: Google Fonts are loaded remotely in `index.html` (see AUDIT.md — offline falls back to system fonts).

### 1.7 Offline-First PWA Strategy
- Service Worker (`public/sw.js`, cache `habitflow-cache-v2`) precaches the app shell (HTML, manifest, icons) on install.
- Navigations: **network-first** with cached `/index.html` fallback → app opens offline.
- Static assets: **cache-first** with runtime caching of same-origin responses.
- All reads/writes are local; the app is fully functional with no connectivity. An amber "Offline Mode" toast reassures users that changes are stored locally.
- Installable: manifest with standalone display, maskable icons, `#090d16` chrome; `beforeinstallprompt` captured for a one-tap install button; iOS Safari gets a step-by-step Add-to-Home-Screen guide.

---

## 2. User Onboarding **[Required Change — Phase 2]**

### 2.1 Requirements
The onboarding modal must collect **only**:

1. **User name** — required. Validation: non-empty after trim; error banner "Please enter your name to personalize your dashboard."
2. **User age** — optional. Validation: integer 5–120 or blank; error banner "Please enter an age between 5 and 120, or leave it blank."

No other data is collected. No date of birth. No goals quiz. **No starter-habit selection.**

### 2.2 Starter-Habit Removal (explicit requirements)
- **Remove the "Choose Starter Habits" list** from `OnboardingModal.tsx` entirely (currently renders 5 seeded habits with checkboxes).
- **Do not auto-populate any sample habits** for new users — at onboarding completion the habits, logs, notes, and freezes stores must be **empty**.
- Remove the seeded 21-day fake history (`getInitialSeedHistory`) from the onboarding path; new users must start with zero logs, zero notes, zero freezes.
- Remove the fallback in `App.tsx` hydration that injects `getInitialStarterHabits()` when the habits store is empty.
- "Reset All Habits & Logs" in Settings must reset to an **empty** state (not to starter templates), keeping the profile.

### 2.3 Post-Onboarding Experience
- On submit: persist profile (`onboardingCompleted: true`, defaults: `theme: 'dark'`, `freezeAllowance: 3`, `soundEnabled: true`, `notificationsEnabled: false`), close modal, land on the dashboard.
- The dashboard must show a **clean, encouraging empty state** (follows design.md §4.14 pattern) with:
  - Headline such as "Your journey starts now".
  - Supporting copy explaining that no habits exist yet.
  - A primary CTA **"Create your first habit"** that opens the Habit creation modal.
- The hero greeting, stat cards (0%, 0 streak, 0 habits), and date carousel still render normally around the empty state.

### 2.4 Backwards Compatibility
- **Existing users and their saved habit data must remain unaffected.** Migration rule: onboarding changes only alter the *new-user* path (`onboardingCompleted === false`) and the empty-store fallback; any localStorage payload with `onboardingCompleted: true` and/or non-empty `habitflow_habits_v2` loads exactly as today.
- Users who previously received starter habits keep them (their data is already persisted).

### 2.5 Current Behavior (for reference) **[Implemented — to be replaced]**
Today onboarding collects name + age **and** renders a starter-habit checklist pre-seeded with 5 habits; on completion it saves the chosen habits plus randomly generated 21-day completion history, a demo journal note, and a demo freeze 4 days ago. (Note: the selection UI is currently broken — see AUDIT.md — but the seeding itself works and must be removed.)

---

## 3. Core Functional Requirements

### 3.1 Dashboard & Dynamic Greeting **[Implemented]**
- **Purpose:** orient the user with time-aware encouragement and today's key numbers.
- **Behavior:** greeting by local hour — Morning (05:00–11:59), Afternoon (12:00–17:59), Evening (else) — each with fixed subtext. User name rendered with emerald→cyan gradient; falls back to "Friend" when empty. Date line shows the selected date plus an emerald pill: "Live Today" or "Historical Log".
- **Stat cards:** Completion % (eligible-instance basis, see 3.8) with SVG progress ring; global current streak (days); active habit count. Sub-caption "x of y done".
- **Edge cases:** no active habits → all stats 0, ring empty; viewing a past/future date → all stats computed relative to the selected date.

### 3.2 Daily Completion Tracking **[Implemented]**
- **Purpose:** one-tap check-off is the core loop.
- **Behavior:** tapping the 44px checkbox toggles a `HabitLog` (`completed: true`, `completedAt` ISO) for (habit, selectedDate). Unchecking removes the log entry for that pair. Completion triggers the success chime (if sound enabled). When the last due habit for the date is completed → streak chime + two-sided confetti (1.2s).
- **Validation/rules:** completion is allowed on any date the habit is scheduled for, including past dates (back-dating) and frozen days.
- **Edge cases:** logs are unique per (habitId, date) — re-checking replaces rather than duplicates; habits created after the selected date are not scheduled and don't appear; archived habits never appear in the daily list.

### 3.3 Habit Creation & Editing **[Implemented]**
- **Purpose:** define what to track and when.
- **Fields & validation:**
  - Title — required, trimmed; error banner if empty.
  - Category — one of 5 (fitness, mind, productivity, learning, health); default productivity.
  - Schedule rule — `daily` | `specific_days` (day-of-week chips, ≥1 day enforced, default Mon–Fri; non-selected days are planned rest) | `times_per_week` (slider 1–7, default 3; streak counted in successful weeks).
  - Target unit — optional free text (e.g., "30 mins").
  - Reminder time — optional HH:MM (native time input).
  - Motivation/trigger note — optional single-line.
- **Behavior (create):** new habit prepended with generated UUID-based id and ISO timestamps.
- **Behavior (edit):** schedule changes are intended to append a `scheduleHistory` revision effective from today so historical stats keep using the old rule. ⚠️ Current implementation records the *new* schedule in history rather than the old one — historical resolution is incorrect (see AUDIT.md, BUG-3). Target documented behavior: history must preserve the **previous** schedule with its effective-from date so past dates resolve against the rule that was active then.
- **Edge cases:** editing title/category only must not create a schedule revision; modal state resets between create and edit opens.

### 3.4 Categories & Frequency Rules **[Implemented]**
- 5 fixed categories with name, accent color, lucide icon, and description (design.md §1.7). Category drives card icon/color and the analytics breakdown. Categories are not user-editable in this phase.
- Frequency semantics:
  - `daily`: scheduled every day from creation date until archive date.
  - `specific_days`: scheduled only on chosen weekdays (0=Sun…6=Sat); other days are **planned rest** (status `skipped`, excluded from streak-breaking and rate denominators).
  - `times_per_week`: eligible every day; success measured per Monday-start calendar week against `targetCount`.

### 3.5 Habit Archiving & Deletion **[Implemented; confirmation Required Change]**
- **Archive:** toggles `archived` + `archivedAt`. Archived habits disappear from daily view and analytics denominators but **retain all logs/notes**; visible in the Habits library when "Archived" filter is on (amber "Archived" badge, dimmed card, restore action).
- **Delete:** removes the habit immediately from the habits array.
  - ⚠️ No confirmation dialog today; associated logs, notes, and freezes are **not** cleaned up (orphans remain in storage).
  - **Required Change:** deletion must ask for confirmation ("Delete '{title}'? This cannot be undone.") and must cascade-delete the habit's logs, notes, and habit-specific freezes.

### 3.6 Micro-Journaling **[Implemented]**
- **Purpose:** capture a one-line reflection per habit per day to build qualitative context.
- **Behavior:** opened from the habit card (menu → Add/Edit Daily Note, or the footer chip/link). Textarea capped at **160 characters** with live counter. Six quick-prompt chips fill the textarea. Saving creates or updates a `JournalNote` keyed by (habitId, date). Empty submit deletes an existing note. Delete button appears when editing an existing note.
- **Display:** saved notes render as an italic quoted chip on the habit card footer; clicking re-opens the editor.
- **Edge cases:** notes are independent of completion — a note can exist on an incomplete day; one note per habit per date (update-in-place).

### 3.7 Streak Calculations **[Implemented]**
- **Per-habit, day-based schedules:** walk backwards from the reference date (max 365 days, stop at creation date). Completed day +1; frozen day preserves without advancing; planned rest / non-scheduled days are skipped; a **missed** scheduled day terminates the streak. An incomplete *current* day never resets an active streak (counting simply starts from yesterday).
- **Per-habit, weekly target:** streak = consecutive Monday-start weeks with completions ≥ targetCount; a week containing any freeze for the habit (or global) preserves the streak. Unit displayed as `w`.
- **Longest streak:** day-based habits audit the past 180 days for the historical maximum; weekly-target and global streaks currently approximate longest as max(current, 1) ⚠️ (known limitation, AUDIT.md).
- **Global streak:** counts a day when ≥1 eligible habit was completed; all-frozen or zero-eligible days are skipped; a fully-missed eligible day breaks it.
- **Statuses (4-state):** `completed` → `frozen` → `skipped` (rest day, non-scheduled, future/today-pending) → `missed` (past scheduled, not done, not frozen).

### 3.8 Completion Rates (eligibility rule) **[Implemented]**
All rates (today %, heatmap, category, period comparisons) use:
`completed eligible instances ÷ eligible scheduled instances`, where **eligible** excludes: dates before habit creation, dates after archiving, non-scheduled days, planned rest days, and frozen days. Rates rounded to whole percent; zero denominator → 0%.

### 3.9 Streak Freeze & Holiday Mode **[Implemented; enforcement Required Change]**
- **Purpose:** protect streaks on legitimately off days without guilt.
- **Per-habit freeze:** habit card menu → "Freeze / Skip Day" toggles a `StreakFreeze` with `habitId` (reason "Rest / Skip Day"). Card switches to sky frozen skin + "Streak Frozen" badge; checkbox shows a shield.
- **Holiday Mode (global freeze):** FreezeModal from the hero button. Choose one of 4 reasons (Sick/Recovery, Travel/Vacation, Holiday Mode, Heavy Workload/Emergency), then "Activate Freeze Day" creates a freeze with **no habitId** (applies to all). Button flips to rose "Deactivate Holiday Mode" when the selected date is globally frozen. Hero button reflects state ("Holiday Mode", sky styling). Heatmap shows frozen days as sky cells; carousel chips show a sky dot.
- **Allowance:** monthly budget (default 3; user-selectable 2/3/5/10) counted as **distinct frozen calendar dates per month**, resetting on the 1st. Remaining allowance is displayed in the modal.
- **Required Change:** the allowance must be **enforced** — when remaining = 0, activation is blocked with an explanatory message (currently display-only, AUDIT.md BUG-4).
- **Edge cases:** freeze on a completed day is allowed (harmless); removing a freeze restores `missed` status for past days and may drop streaks — acceptable by design.

### 3.10 Heatmap Analytics **[Implemented]**
- Percentage-based intensity per design.md §1.8; default range 3 months (84 days), switchable to 6 months (168) / full year (364) — all multiples of 7, ending today.
- Cells are clickable (jump to that date in the daily view; from the Analytics tab this also switches tabs), hoverable (tooltip with date, "x of y completed (n%)", frozen/rest variants), and keyboard-focusable with aria-labels.
- Supporting metrics: consistency rate (% of days with ≥1 completion), week-over-week and month-over-month rate deltas with trend pills, category breakdown bars (7/30-day toggle), best-category award badge.

### 3.11 Weekly & Monthly Comparisons **[Implemented]**
- Week-over-week: current Monday-start week vs previous week (full 7 days each, including future days of the current week which count as scheduled-but-incomplete ⚠️ documented behavior).
- Month-over-month: full current calendar month vs full previous calendar month.
- Output: current rate, previous rate, delta in percentage points (+/−), completed/scheduled counts.

### 3.12 Reminders **[Implemented — with hard platform limits]**
- Per-habit `reminderTime` (HH:MM local). While the app is open, a 30-second interval checks the clock; on an exact minute match a browser Notification (or SW notification when a controller exists) fires: title "Reminder: {habit}", body = habit motivation note or default copy.
- Deduplicated per day via `sessionStorage` key `habitflow_reminded_{date}`.
- Permission is requested explicitly in Settings ("Enable" → `Notification.requestPermission()`); a "Test Alert" button appears once granted.
- **Documented limitation (must stay honest in UI):** reminders only fire while the app is open/active — there is no push server. The Settings "Local-Only Architecture Notice" discloses this. Archived habits and habits without a reminder time are skipped.
- If notifications are unsupported or denied, reminders silently no-op (no error surfaced).

### 3.13 Settings & Preferences **[Implemented]**
- **Profile:** name (required, fallback "Champion" if blanked), age (optional 5–120), monthly freeze allowance (2/3/5/10). Save shows a 2s "Saved" confirmation on the button.
- **Audio chimes:** toggle + Preview button (plays streak chime). Governs completion/streak/freeze sounds.
- **Push notifications:** enable/test flow as in 3.12.
- **Data & archives:** toggle archived-habit visibility in the library; shortcut to the Backup & Recovery panel.
- **Reset:** "Reset All Habits & Logs to Default" behind a `window.confirm`. **Required Change (Phase 2):** reset must produce an empty habit state per §2.2 instead of re-seeding starter templates.
- `theme` preference exists in the profile model (`dark|light|system`) but **only dark is implemented**; the setting is not exposed in UI. Do not document light theme as available.

### 3.14 JSON Export / Import (Backup & Recovery) **[Implemented]**
- **Export:** downloads `habitflow-backup-YYYY-MM-DD.json` containing `{schemaVersion: 2, exportedAt, appVersion, profile, habits, logs, notes, freezes}` (pretty-printed).
- **Import:** file picker (.json) → validation (parses JSON; requires `habits` and `logs` arrays; tolerates missing `schemaVersion` as v1) → preview summary (user, counts, schema version).
- **Modes:** *Merge* (default) — unions by id, keeps newer `updatedAt` for conflicting habits, merges schedule histories, dedupes logs/notes by (habitId, date) and freezes by (date, habitId), enforces referential integrity (drops children of unknown habits). *Full Replace* — overwrites all five stores; requires a two-step confirm.
- **Safety:** an atomic snapshot of current storage is taken before writing; any thrown error triggers automatic rollback and an error banner. Success shows a banner, then re-hydrates the app state and closes after ~1.2s.
- **Schema migration:** v1 payloads (and legacy `habitflow_*` v1 localStorage keys) are migrated on load: stable ids backfilled, `frequency` → `schedule` rename tolerated, notes embedded in v1 logs extracted into the notes store, defaults applied to profile.
- **Known gaps (AUDIT.md):** merge mode does not import the profile; per-record *content* validation (date formats, category values) is shallow; the two-step replace confirm lacks a distinct visual state.

### 3.15 PWA Installation **[Implemented]**
- Header install affordance adapts: hidden when already standalone; solid "Install App" when `beforeinstallprompt` is available; "Install on iOS" guide (Share → Add to Home Screen) on iOS Safari; subtle "Install PWA" button otherwise, opening a modal with platform tabs (iOS / Android / Desktop) and numbered instructions.
- Installed detection: `display-mode: standalone` or iOS `navigator.standalone`.

### 3.16 Offline Support **[Implemented]**
- Full app functionality offline (all data local). SW precache + navigation fallback per §1.7. Offline toast appears on `offline` event, hides on `online`.
- ⚠️ Google Fonts are not cacheable under the current SW rule (`response.type === 'basic'` excludes cross-origin), so offline cold starts render with system fonts — acceptable fallback, tracked in AUDIT.md.

---

## 4. Non-Functional Requirements

| Area | Requirement | Status |
|---|---|---|
| Privacy | No remote data transmission of user content; no third-party analytics | Implemented (fonts are the only remote requests) |
| Persistence | localStorage with corruption quarantine (bad JSON copied to `habitflow_corrupted_*` keys) and quota-exceeded handling | Implemented |
| Multi-tab | Cross-tab sync via `storage` events reloading all stores | Implemented |
| Timezone safety | All calendar math in local time via noon-anchored dates; no UTC string slicing | Implemented (`src/domain/date.ts`) |
| Accessibility | aria-labels on icon buttons, heatmap cells, carousel chips; 44px touch targets; focus styles on heatmap | Partial — no focus trap/Escape in modals (AUDIT.md) |
| Reduced motion | Honor `prefers-reduced-motion` for confetti & animation | **Not implemented — Required Change** |
| Performance | Streak/analytics recomputed in render (O(days × habits)); acceptable for personal-scale data (≤ ~100 habits, ≤ 365-day windows) | Implemented, monitor |
| Compatibility | Evergreen browsers with ES2022, Service Workers, Notification API (graceful degradation when absent) | Implemented |
| Testing | Domain logic covered by `node:test` suite (`src/domain/domain.test.ts`) | Implemented (no npm script wired — AUDIT.md) |

---

## 5. Out of Scope (explicitly excluded)

- Backend services, accounts, cloud sync, external databases of any kind.
- Server-sent push notifications (disclosed as an optional future upgrade only).
- Light theme / system theme switching (model field exists, no implementation).
- AI features (the `@google/genai` dependency is unused scaffolding — slated for removal in AUDIT.md).
- Social features, sharing, leaderboards.
- Custom categories beyond the fixed five.
- Native app store distribution.

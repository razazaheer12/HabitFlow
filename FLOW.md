# HabitFlow — Complete User Journey & Flow Documentation

**Version:** 1.0 (Phase 1)
Flows describe the app as implemented in source. Onboarding (Section 1) documents the **Phase 2 target flow** (name + age only, empty dashboard); the current implemented deviation is noted inline and detailed in `AUDIT.md`.

---

## 0. Global Navigation Model

```mermaid
flowchart TB
    App[App Shell] --> Header[Top Bar: Brand / Desktop Nav / Actions]
    App --> Main[Main Content Router by activeTab]
    App --> BottomNav[Mobile Bottom Nav - md:hidden]
    Main --> Today[Today Tab]
    Main --> Analytics[Analytics Tab]
    Main --> Manage[Habits Library Tab]
    Main --> SettingsTab[Settings Tab]
    Today --> Hero[HeroHeader + Stats]
    Today --> Carousel[DateCarousel]
    Today --> Filters[Category Filter Chips]
    Today --> Cards[HabitCard List]
    Today --> MiniHeat[HeatmapAnalytics Panel]
```

- Tabs: `today | analytics | manage | settings`, switched via header nav (desktop) or bottom nav (mobile). Bottom nav "Settings" opens the Settings **modal** directly instead of the settings tab.
- Every tab keeps the HeroHeader visible; `selectedDate` is global state shared by Today, carousel, freeze modal, and journal modal.

---

## 1. First-Time Onboarding

**Entry:** App hydration finds `profile.onboardingCompleted === false` (and no `?autostart=1` flag) → OnboardingModal opens (non-dismissible full-screen overlay).

**Target flow (Phase 2):**

```mermaid
flowchart TD
    A[App loads, not onboarded] --> B[Onboarding Modal opens]
    B --> C[User enters Name - required]
    C --> D[User enters Age - optional]
    D --> E{Submit Get Started}
    E -->|Name empty| F[Error banner: Please enter your name]
    F --> C
    E -->|Age outside 5-120| G[Error banner: age 5-120 or blank]
    G --> D
    E -->|Valid| H[Save profile: onboardingCompleted=true, defaults]
    H --> I[Stores remain EMPTY: no habits, logs, notes, freezes]
    I --> J[Modal closes -> Dashboard with empty state]
    J --> K[Empty state CTA: Create your first habit -> HabitModal]
```

- **Validation:** name non-empty after trim; age blank or integer 5–120. Errors render as a rose banner at the top of the form and clear on the next keystroke.
- **Success:** profile persisted (`theme:'dark'`, `freezeAllowance:3`, `soundEnabled:true`, `notificationsEnabled:false`); no habits seeded.
- **Current implemented deviation:** the modal also shows a "Choose Starter Habits" list; on completion it seeds the chosen starter habits **plus 21 days of randomized fake logs, a demo note, and a demo freeze**, then fires confetti. (The selection UI is itself broken — IDs never match — so 3 habits are always seeded. See AUDIT.md BUG-1/BUG-2.) This entire branch is removed in Phase 2.

---

## 2. Main Dashboard (Today Tab)

**Layout order:** HeroHeader → (12-col grid) left: DateCarousel card → category filter chips → habit cards; right: heatmap/analytics panel.

```mermaid
flowchart TD
    A[Today Tab] --> B[HeroHeader: greeting + date + 3 stat cards]
    B --> C[Actions: Streak Freeze btn / New Habit btn]
    A --> D[DateCarousel: 14 past + today + tomorrow]
    D --> E[Category Filter Chips: All + 5 categories with due counts]
    E --> F{Habits due on selectedDate?}
    F -->|Yes| G[HabitCard list]
    F -->|No| H[Empty State panel + Add a New Habit CTA]
    A --> I[Right column: HeatmapAnalytics]
```

- **Greeting:** Morning 05–11:59 / Afternoon 12–17:59 / Evening otherwise; name gradient; "Live Today" vs "Historical Log" pill.
- **Due list:** active (non-archived) habits scheduled for `selectedDate`, filtered by selected category.
- **Stat cards:** completion % of *eligible* instances + progress ring; global streak; active habit count.

---

## 3. Empty Dashboard State

Two distinct empty states:

1. **First-run empty (Phase 2 target):** zero habits exist → encouraging panel: icon tile, "Your journey starts now" style headline, explanatory copy, primary CTA **Create your first habit** → opens HabitModal in create mode.
2. **No-habits-due empty (implemented):** habits exist but none scheduled for the selected date/filter → `CheckCircle2` tile, "No habits scheduled for this date", context copy (category filter vs free schedule), soft-emerald "Add a New Habit" CTA.

```mermaid
flowchart TD
    A[Today Tab renders] --> B{Any active habits at all?}
    B -->|No| C[First-run empty state -> CTA opens HabitModal]
    B -->|Yes| D{Any due for selectedDate + filter?}
    D -->|No| E[No-schedule empty state -> CTA opens HabitModal]
    D -->|Yes| F[Render HabitCards]
```

---

## 4. Daily Habit Execution

```mermaid
flowchart TD
    A[HabitCard on selectedDate] --> B{Tap 44px checkbox}
    B -->|Currently incomplete| C[Create HabitLog completed=true]
    C --> D[soundEnabled? -> success chime C5-E5-G5]
    D --> E{All due habits now complete?}
    E -->|Yes| F[streak chime + two-sided confetti 1.2s]
    E -->|No| G[Card turns emerald border, title strike-through, streak pill updates]
    B -->|Currently complete| H[Remove log for habit+date]
    H --> I[Card returns to pending skin, stats recompute]
    A --> J[Card menu ⋮]
    J --> J1[Add/Edit Daily Note -> MicroJournalModal]
    J --> J2[Freeze / Skip Day -> toggle per-habit freeze + freeze chime]
    J --> J3[Edit Habit -> HabitModal prefilled]
    J --> J4[Archive/Restore Habit]
    J --> J5[Delete Habit - immediate, no confirmation ⚠️]
```

**Card visual states:** pending (slate) → completed (emerald border, strike-through) → frozen (sky border, shield checkbox, "Streak Frozen" badge) → planned rest (dimmed, moon icon, "Planned Rest" badge) → missed (amber border, "Missed" badge, past dates only).

**Date navigation:** prev/next arrows step one day; chips scroll & auto-center; "Today" pill returns to the current date. Selecting a past date enables back-dating completions and freezes; the hero shows "Historical Log".

---

## 5. Habit Creation

**Entries:** header "Add Habit" button, hero "New Habit" button, empty-state CTAs, library "Create Habit" button — all open HabitModal with `initialHabit = null`.

```mermaid
flowchart TD
    A[Open HabitModal - create mode] --> B[Defaults: title empty, category productivity, schedule daily, days Mon-Fri, target 3/wk]
    B --> C[Fill Title - required]
    C --> D[Pick Category - 5 chips]
    D --> E{Schedule Rule segmented control}
    E -->|Every Day| F[No extra inputs]
    E -->|Selected Days| G[Day-of-week toggles, min 1 enforced]
    E -->|Weekly Target| H[Range slider 1-7 days/week]
    F & G & H --> I[Optional: Target Unit / Reminder Time / Motivation]
    I --> J{Submit}
    J -->|Title blank| K[Rose error banner, stays open]
    J -->|Valid| L[Create habit with UUID id + ISO timestamps, prepend to list, persist]
    L --> M[Modal closes; card appears if scheduled on selectedDate]
    N[Cancel / X button] --> O[Discard, close, reset editingHabit]
```

---

## 6. Habit Editing

**Entries:** card menu → Edit Habit; library card gear button. Opens the same modal prefilled (`initialHabit` set); title becomes "Edit Habit", submit "Save Changes".

- On save: fields merged, `updatedAt` refreshed.
- **Schedule change intent:** previous schedule should be pushed to `scheduleHistory` effective from today so historical dates keep resolving against the rule that was active then. ⚠️ Current code pushes the *new* schedule into history instead (AUDIT.md BUG-3) — flows should be re-verified after the fix.
- Cancel/X discards changes silently (no unsaved-changes prompt).

---

## 7. Habit Library (Manage Tab)

```mermaid
flowchart TD
    A[Habits Tab] --> B[Header: title + Archived toggle + Create Habit btn]
    B --> C{Archived toggle}
    C -->|Off| D[Show active habits only]
    C -->|On| E[Show all; archived dimmed with amber Archived badge]
    D & E --> F[2-col grid of habit tiles: title, target chip, category, schedule summary, reminder time, motivation quote]
    F --> G[Tile actions: Archive/Restore icon, Edit gear -> HabitModal]
```

- Schedule summary labels: "Every Day" / "{n} specific days" / "{n} days/wk".
- Archived tiles: `opacity-70`, restore via the same archive action.
- Deletion is only available from the Today-tab card menu (not the library) — ⚠️ inconsistency noted in AUDIT.md.

---

## 8. Micro-Journaling

```mermaid
flowchart TD
    A[HabitCard footer] --> B{Note exists for habit+date?}
    B -->|No| C['Add 1-line daily note' link]
    B -->|Yes| D[Italic quoted note chip - click to edit]
    C & D --> E[MicroJournalModal: textarea 160 chars + counter]
    E --> F[Quick prompt chips fill textarea]
    E --> G{Submit}
    G -->|Text non-empty| H[Create or update JournalNote -> close]
    G -->|Text emptied| I[Delete existing note -> close]
    E --> J[Delete Note button - only when editing existing]
    E --> K[Cancel / X -> discard]
    H --> L[Note chip renders on card footer]
```

- Notes are independent of completion state; one note per (habit, date).

---

## 9. Streak Freeze & Holiday Mode

**Per-habit freeze** (quick path): card menu → "Freeze / Skip Day" toggles a freeze record `{date, habitId, reason:'Rest / Skip Day'}` + freeze chime. Menu label flips to "Unfreeze Day". Card switches to frozen skin.

**Holiday Mode** (global):

```mermaid
flowchart TD
    A[Hero: Streak Freeze button] --> B[FreezeModal for selectedDate]
    B --> C[Info banner: how freezes protect streaks]
    C --> D[Allowance row: N freezes available this month]
    D --> E[Pick reason: Sick / Travel / Holiday Mode / Heavy Workload]
    E --> F{Action button}
    F -->|Date not globally frozen| G[Activate Freeze Day -> create global freeze no habitId + chime]
    F -->|Date already globally frozen| H[Deactivate Holiday Mode - rose btn -> remove global freeze]
    G & H --> I[Modal closes]
    I --> J[Reflects everywhere: hero btn becomes Holiday Mode sky style, carousel dot sky, heatmap cell sky, all cards frozen status]
    B --> K[Cancel / X -> no change]
```

- Allowance counts distinct frozen calendar dates in the month of `selectedDate`, resets on the 1st. ⚠️ Display-only today; Phase 2 must block activation at 0 remaining (AUDIT.md BUG-4).

---

## 10. Analytics & Heatmap

**Surfaces:** Today tab right column and full Analytics tab (same component).

```mermaid
flowchart TD
    A[HeatmapAnalytics] --> B[Range selector: 3 Months 84d / 6 Months 168d / Full Year 364d]
    B --> C[Week-column heatmap grid ending today]
    C --> D{Interact with cell}
    D -->|Hover/Focus| E[Tooltip: date + x of y completed pct, or Streak Frozen / Planned Rest Day]
    D -->|Click| F[Jump: setSelectedDate - from Analytics tab also switches to Today tab]
    A --> G[Legend: frozen swatch + 0-100 pct emerald ramp]
    A --> H[Week-over-Week card: current vs prev week rate + delta pill]
    A --> I[Month-over-Month card: current vs prev month rate + delta pill]
    A --> J[Category Breakdown: 7d/30d toggle, per-category bars, Best category award, overall consistency pct]
```

---

## 11. Settings

**Entries:** header gear icon, bottom-nav Settings item, Settings tab → "Configure Settings & Alerts". All open SettingsModal.

```mermaid
flowchart TD
    A[SettingsModal] --> B[Profile form: Name / Age / Freeze allowance select]
    B --> C[Update Profile -> save + 2s Saved checkmark]
    A --> D[Reminders & Audio section]
    D --> D1[Local-Only Architecture Notice banner]
    D --> D2{Notification permission granted?}
    D2 -->|No| D3[Enable btn -> browser permission prompt -> on grant: test notification + notificationsEnabled=true]
    D2 -->|Yes| D4[Test Alert btn -> immediate local notification]
    D --> D5[Chimes: Preview btn + sound on/off toggle - persists instantly]
    A --> E[Data & Archives section]
    E --> E1[Archived Habits visibility toggle]
    E --> E2[Open JSON Backup & Recovery Panel -> closes Settings, opens BackupModal]
    A --> F[Danger zone: Reset All Habits & Logs]
    F --> G{window.confirm}
    G -->|OK| H[Re-seed starter template ⚠️ Phase 2: reset to EMPTY state]
    G -->|Cancel| I[No change]
    A --> J[X -> close; form state persists while app is mounted ⚠️]
```

---

## 12. Backup & Recovery

```mermaid
flowchart TD
    A[BackupModal] --> B[Export section]
    B --> C[Download Backup .JSON -> habitflow-backup-YYYY-MM-DD.json with schemaVersion 2 + all entities]
    A --> D[Restore section]
    D --> E[Choose Backup File -> read .json text]
    E --> F{validateBackupPayload}
    F -->|Parse error / missing habits or logs arrays| G[Rose error banner with reason]
    F -->|Valid| H[Preview: schema v, user, habits/logs/notes counts]
    H --> I{Import mode}
    I -->|Merge default| J[Merge Backup Records btn]
    I -->|Full Replace| K[Confirm Full Overwrite btn - first click arms confirmation, second executes ⚠️ no distinct armed-state styling]
    J & K --> L[Snapshot current storage]
    L --> M[migrateBackupPayload v1->v2]
    M --> N{Mode}
    N -->|Merge| O[Union by ids, newer updatedAt wins, dedupe children, drop orphans]
    N -->|Replace| P[Overwrite profile + all stores]
    O & P --> Q{Write succeeded?}
    Q -->|Yes| R[Success banner -> re-hydrate app state -> auto-close after 1.2s]
    Q -->|Exception| S[rollbackToSnapshot + rose error banner: rolled back safely]
```

---

## 13. PWA Installation

```mermaid
flowchart TD
    A[App header install slot] --> B{display-mode standalone?}
    B -->|Yes| C[Hide install button entirely]
    B -->|No| D{beforeinstallprompt captured?}
    D -->|Yes| E[Solid Install App btn -> prompt -> userChoice]
    E -->|accepted| F[appinstalled event -> hide button]
    E -->|dismissed| G[Button remains]
    D -->|No| H{iOS Safari UA?}
    H -->|Yes| I[Install on iOS btn -> guide modal: Share -> Add to Home Screen -> Add]
    H -->|No| J[Subtle Install PWA btn -> PWAInstallModal]
    J --> K[Modal: already-installed banner OR direct install btn OR platform tabs iOS/Android/Desktop with numbered steps]
    K --> L[Close btn / X dismisses]
```

---

## 14. Offline Experience

```mermaid
flowchart TD
    A[Network lost] --> B[window offline event]
    B --> C[OfflineIndicator toast: bottom-left amber, Offline Mode - all changes stored locally]
    C --> D[All features keep working: reads/writes are localStorage only]
    D --> E[SW serves: navigations network-first -> cached /index.html fallback; assets cache-first]
    E --> F[Reminders still fire while app open - no server needed]
    F --> G[Network restored -> online event -> toast disappears]
    G --> H[No sync step exists or is needed - data never left the device]
```

- Cold start offline: precached shell loads; ⚠️ Google Fonts fail (not SW-cacheable cross-origin) → system font fallback per design.md §2.1.

---

## 15. Modal Interaction Contract (all dialogs)

| Behavior | Current standard |
|---|---|
| Open | Rendered when `isOpen`; overlay `bg-slate-950/85 backdrop-blur-md`; panel entrance `animate-in fade-in zoom-in-95` ⚠️ (animation utilities currently no-op, AUDIT.md) |
| Close | X button and Cancel button only. No overlay-click close, no Escape key ⚠️ |
| Confirmation | `window.confirm` for data reset; two-click arm for Full Replace import; **none** for habit delete ⚠️ |
| Validation | Inline rose banners at form top; clear on input change; submit blocked until valid |
| Success | Inline feedback: 2s "Saved" button state (settings), emerald banner + auto-close 1.2s (import), confetti/chimes (completion, onboarding) |
| Error | Rose banners with specific messages (validation, JSON parse, import failure + rollback notice) |
| Stacking | All modals `z-50`; only one modal is open at a time by app state design (Settings → Backup hand-off closes Settings first) |

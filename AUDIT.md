# HabitFlow — Documentation Gap & Code Audit

**Version:** 1.0 (Phase 1)
Method: full read of every source file (`src/`, `public/`, config, manifest). Every claim below cites the file it was verified in. Severity: 🔴 High (data integrity / core UX) · 🟠 Medium (correctness, polish) · 🟡 Low (hygiene, tech debt).

---

## 1. Existing Functionality — VERIFIED in source

| # | Feature | Evidence |
|---|---|---|
| V1 | Local-first persistence with hardened repository (JSON quarantine, quota handling, cross-tab sync) | `src/storage/localStorage.ts` |
| V2 | Schema v1→v2 migration for both legacy localStorage keys and imported backups (id backfill, `frequency`→`schedule`, embedded-note extraction) | `src/storage/schema.ts` |
| V3 | **JSON Backup & Recovery — fully implemented** (see §2 verification detail) | `src/components/BackupModal.tsx`, `src/storage/*` |
| V4 | 3 schedule types + historical schedule model + planned-rest-day semantics | `src/types/index.ts`, `src/domain/schedule.ts` |
| V5 | Streak engine: 4-state daily status, day streaks w/ freeze preservation, weekly-target streaks, global streak, eligibility-denominator rates | `src/domain/streak.ts`, `src/domain/analytics.ts` |
| V6 | Percentage heatmap w/ 3/6/12-month ranges, tooltip, click-to-date; WoW & MoM comparisons; category breakdown 7/30d; best-category award | `src/components/HeatmapAnalytics.tsx`, `src/domain/analytics.ts` |
| V7 | Micro-journaling (160 chars, quick prompts, update/delete, card footer display) | `src/components/MicroJournalModal.tsx`, `HabitCard.tsx` |
| V8 | Per-habit freeze + global Holiday Mode + monthly allowance accounting (distinct frozen dates, monthly reset) | `App.tsx`, `FreezeModal.tsx`, `streak.ts` |
| V9 | Archive/restore with history preservation + library visibility toggle | `App.tsx`, `SettingsModal.tsx` |
| V10 | Client-side reminders (30s poll, HH:MM match, sessionStorage dedupe) + procedural Web Audio chimes | `src/notifications/service.ts` |
| V11 | PWA: manifest, precaching SW (network-first nav / cache-first assets), adaptive install button, iOS guide, install modal, standalone detection | `public/*`, `usePWAInstall.ts`, `PWAInstallButton.tsx`, `PWAInstallModal.tsx` |
| V12 | Offline indicator toast via online/offline events | `OfflineIndicator.tsx` |
| V13 | Timezone-safe local date math (noon anchoring, no UTC slicing) with unit tests (`node:test`) | `src/domain/date.ts`, `domain.test.ts` |
| V14 | Confetti celebrations (onboarding complete, all-due-complete) | `src/utils/confetti.ts`, `App.tsx` |
| V15 | Dynamic greeting + historical date browsing (carousel T−14…T+1, heatmap click-through) | `HeroHeader.tsx`, `DateCarousel.tsx` |

### V3 detail — Backup & Recovery verification (required before proposing any replacement)

**Conclusion: the existing implementation is sound and should be KEPT, not replaced.** Verified behaviors:
- Export reads all five stores fresh from localStorage (not stale React state), emits versioned payload `{schemaVersion:2, appVersion, exportedAt, profile, habits, logs, notes, freezes}`, pretty-printed, filename `habitflow-backup-YYYY-MM-DD.json`, proper Blob URL cleanup (`localStorage.ts:351-383`).
- Import validates before writing (parse check, required `habits`/`logs` arrays, v1 tolerance) and shows a count summary (`schema.ts:26-64`).
- Merge mode: id-union with newer-`updatedAt` conflict resolution, schedule-history concatenation, child dedupe by natural keys, orphan rejection (`schema.ts:155-220`).
- Replace mode: overwrites all five stores; two-click confirm gate (`BackupModal.tsx:63-66`).
- **Atomicity:** pre-write snapshot + automatic `rollbackToSnapshot` on any exception, with user-visible error (`BackupModal.tsx:69-117`).
- Post-restore re-hydration of App state and cross-tab propagation via storage events (`App.tsx:417-423`).
Only targeted fixes are recommended (§5 R6–R8), not a rewrite.

---

## 2. Incomplete Functionality

| # | Item | Detail | Sev |
|---|---|---|---|
| I1 | Freeze allowance not enforced | `FreezeModal` displays `remainingAllowance` but neither it nor `handleToggleGlobalFreeze`/`handleToggleHabitFreeze` (`App.tsx:258-306`) block activation at 0. Users can freeze unlimited days, hollowing out the streak-protection economy. | 🔴 |
| I2 | Theme preference dead | `UserProfile.theme: 'dark'|'light'|'system'` persisted, but `index.html` hard-codes `class="dark"` and no code reads the setting. Only dark exists. | 🟡 |
| I3 | `notificationDisclaimerAcknowledged` dead | Stored in profile/defaults; no UI reads or writes it. | 🟡 |
| I4 | `habitflow_schema_version` key dead | Declared in `STORAGE_KEYS` (`localStorage.ts:14`), never written or read. | 🟡 |
| I5 | Reduced-motion support absent | No `prefers-reduced-motion` guard on confetti (`utils/confetti.ts`) or CSS animations. Required by PRD §4. | 🟠 |
| I6 | Weekly/global `longestStreak` fake | `streak.ts:218,325` return `Math.max(currentStreak, 1)` — not a historical maximum. UI shows it in the streak pill tooltip ("best"). | 🟠 |
| I7 | No test runner wiring | `domain.test.ts` exists but `package.json` has no `test` script; coverage of App-layer handlers is zero. | 🟠 |
| I8 | `motion` dependency unused | Installed (`package.json`) but never imported — dead weight. | 🟡 |

---

## 3. Potential Bugs

| ID | Bug | Evidence & impact | Sev |
|---|---|---|---|
| BUG-1 | **Starter-habit selector is broken** | `OnboardingModal.tsx:14-17`: `getInitialStarterHabits()` is called **twice**, generating different UUIDs. `selectedHabitIds` (from call #2) never matches `starterHabits` (from call #1) → checkboxes can never appear checked, toggles are no-ops, and the submit filter yields `[]`, always falling back to `starterHabits.slice(0, 3)` (`OnboardingModal.tsx:52`). | 🔴 (moot after Phase 2 removal, but must not regress) |
| BUG-2 | Fake seeded history for new users | `handleOnboardingComplete` (`App.tsx:384-400`) writes 21 days of randomized completions, a demo note, and a demo freeze via `getInitialSeedHistory`. New users see invented streaks/heatmap data that is not theirs. Phase 2 removes this (PRD §2.2). | 🔴 |
| BUG-3 | Schedule history records the wrong schedule | `handleSaveHabit` (`App.tsx:319-327`) pushes `{effectiveFrom: today, schedule: <NEW schedule>}` instead of archiving the **old** schedule. `resolveScheduleForDate` (`schedule.ts:8-28`) then resolves pre-edit dates to the new rule (fallback `allRevisions[0]`), so historical stats/streaks silently change when a schedule is edited. The synthesized "current effective from `updatedAt`" entry also duplicates the new schedule in history. | 🔴 |
| BUG-4 | Empty-store starter injection | `App.tsx:148`: `setHabits(loadedHabits.length > 0 ? loadedHabits : getInitialStarterHabits())` — a returning user who legitimately deleted **all** habits gets 5 un-persisted starter habits resurrected on every reload; the next save operation (e.g., creating one real habit) persists the whole injected array. Also violates PRD §2.2. | 🔴 |
| BUG-5 | No-op Tailwind classes | `bg-slate-850` (`HeatmapAnalytics.tsx:65,167,199`), `hover:bg-slate-750` (`App.tsx:799`, `SettingsModal`, `BackupModal`, `MicroJournalModal`), `no-scrollbar` (`App.tsx:554`, `DateCarousel.tsx:61`) are not generated by Tailwind v4's default theme and no plugin/utility defines them → heatmap 0-intensity cells and comparison cards render transparent; the category-filter row shows a scrollbar in WebKit. | 🟠 |
| BUG-6 | Modal animation classes are no-ops | `animate-in fade-in zoom-in-95 slide-in-from-bottom-2` used across all modals/toast require the `tailwindcss-animate` plugin (or tw-animate-css), which is **not installed** (`package.json`, `index.css`). Modals appear without their intended entrance; offline toast without slide-in. | 🟠 |
| BUG-7 | Habit delete: no confirm, orphans data | `handleDeleteHabit` (`App.tsx:377-381`) removes only the habit; its `logs`, `notes`, and habit-scoped `freezes` stay in storage forever (and travel in every backup). No confirmation dialog; a single mis-click in the ⋮ menu destroys a habit irrecoverably. | 🔴 |
| BUG-8 | `playChime('success')` second oscillator never plays | `notifications/service.ts:112-130`: `osc2` is created and connected but `start()`/`stop()` are never called → the triangle layer is silent (harmless, but not the designed sound). | 🟡 |
| BUG-9 | Stale SettingsModal form state | `SettingsModal.tsx:47-50` initializes `useState` from props once; the component stays mounted in `App.tsx`, so after cross-tab sync or profile restore, reopening Settings can show stale name/age/allowance. | 🟠 |
| BUG-10 | Merge import ignores profile | `BackupModal.tsx:83-97` merges only the four entity stores; restoring a backup into a fresh device in Merge mode leaves the user unnamed/un-onboarded. | 🟠 |
| BUG-11 | SW offline asset fallback references outer `cached` | `public/sw.js:73-76`: in the cache-first chain, the network `.catch` returns `cached` from the enclosing `.then` — for a cache-miss + offline request this resolves `undefined` (request fails with no graceful handling). Behaviorally "fails offline" as intended, but the code suggests a fallback that doesn't exist. | 🟡 |
| BUG-12 | Reminder dedupe keys accumulate | `sessionStorage['habitflow_reminded_<date>']` is created daily and never pruned; also, a backgrounded/throttled tab can skip the exact HH:MM minute and the reminder is lost silently. | 🟡 |
| BUG-13 | Replace-confirm has no armed state | `BackupModal.tsx:63-66,247-258`: first click sets `confirmReplace`, but the button label/style is identical before and after arming — users can't tell the destructive action is one click away (and clicking elsewhere doesn't disarm it). | 🟠 |
| BUG-14 | Completion check ignores freezes interaction | A frozen day can still be checked complete (`handleToggleComplete` has no freeze guard); the log then coexists with the freeze. Status precedence (completed > frozen) hides the freeze, but the allowance day remains consumed. Edge case worth an explicit product decision. | 🟡 |
| BUG-15 | Duplicate `usePWAInstall` instances | `PWAInstallButton` and `PWAInstallModal` each instantiate the hook; both `preventDefault()` the same `beforeinstallprompt`. Installing via the button leaves the modal's state stale (shows "Install Directly Now" with a consumed prompt until reload). | 🟡 |

---

## 4. Missing Edge Cases, UI Inconsistencies & Technical Debt

### Missing edge cases
- No handling for **date rollover while the app is open**: `selectedDate` is initialized once (`App.tsx:75`); a tab left open past midnight keeps "yesterday" selected and reminders compare against a stale `today` for freeze allowance display.
- No **duplicate-log guard at store level** — uniqueness per (habit, date) relies solely on handler filtering; a merge import with malformed dates passes through.
- **Backup validation is shallow**: date format, category enum, schedule shape, and negative counts are not validated per record; a hand-edited file can import garbage that breaks rendering (e.g., unknown category → `CATEGORIES[h.category]` undefined → crash in `App.tsx:706`/`HabitCard.tsx:61`).
- No **error boundary**: any render-time exception (see above) white-screens the app with data intact but unreachable.
- `age` upper/lower validation exists in forms but **not in `migrateBackupPayload`** — imported profiles bypass it.
- **Quota-exceeded writes fail silently** (`safeSetItem` returns false; callers ignore) — a user could lose a completion without any UI signal.

### UI inconsistencies
- Delete habit exists only in the Today-tab card menu, not in the Habits library tiles (`App.tsx:750-769`).
- Library "edit" action uses a `Settings` (gear) icon (`App.tsx:767`) while everywhere else editing uses `Edit2`.
- HeroHeader caption "x of y done" divides by **all active habits**, while the % ring divides by **eligible/due instances** — the two numbers can disagree (e.g., "2 of 5 done" next to "100%").
- `window.confirm` used for reset but custom in-modal confirm for import — inconsistent destructive-action pattern.
- Bottom nav "Settings" opens the modal; desktop nav "Settings" switches to a tab that contains a button to open the same modal — redundant two-level path.
- FreezeModal defaults the reason to "Holiday Mode" regardless of context; the per-habit quick freeze hard-codes "Rest / Skip Day" with no reason picker.
- Modal close affordances: X + Cancel, but no Escape/overlay-click (all dialogs).

### Technical debt
- `package.json` name `react-example`; AI Studio leftovers: `@google/genai`, `express`, `dotenv`, `@types/express`, `esbuild`, `tsx`, `.env.example` (GEMINI_API_KEY), `metadata.json` (claims Gemini capability), template `README.md`, `?autostart=1` demo backdoor in production code (`App.tsx:113-145`).
- Google Fonts loaded remotely (`index.html:25-28`) — conflicts with local-first/offline claims; SW can't cache cross-origin responses under its `type === 'basic'` rule.
- Log/note/freeze ids use `Date.now()` in App handlers (`log-${Date.now()}` etc.) instead of `generateUniqueId` — collision-prone across tabs.
- All analytics recompute on every render (O(days × habits) with per-date array scans, e.g. `isHabitCompleted` linear scans inside loops). Fine at personal scale, quadratic hotspots in `calculateGlobalStreak` (365 days × habits × logs).
- No ESLint/Prettier; no CI; single 900-line `App.tsx` owning all state and handlers.
- SW cache accumulation: old hashed bundles persist until a manual `CACHE_NAME` bump; no runtime cache pruning.
- `.aistudio/` screenshot artifacts and `test-results/` committed in the tree.

### Production risks
1. **BUG-3 + BUG-4** corrupt or fabricate user-visible history/streaks → trust damage (highest risk).
2. **BUG-7** irreversible one-click habit deletion with orphaned data polluting backups.
3. Unenforced freeze allowance (I1) breaks the core product promise.
4. Missing error boundary + shallow import validation → white-screen on malformed backup import.
5. Offline font fallback changes visual identity on first offline load (minor brand risk).

---

## 5. Recommended Improvements (prioritized; none implemented in Phase 1)

| # | Recommendation | Addresses | Priority |
|---|---|---|---|
| R1 | **Phase 2 onboarding change**: strip starter-habit UI + seeding; empty stores for new users; remove `App.tsx:148` fallback; make Settings reset produce an empty state; add first-run empty-state panel (PRD §2) | BUG-1, BUG-2, BUG-4 | P0 |
| R2 | Fix schedule-history recording: push the **old** schedule with the date it became effective (track `scheduleEffectiveFrom` on edit) and stop synthesizing from `updatedAt` | BUG-3 | P0 |
| R3 | Add delete confirmation + cascade cleanup of logs/notes/habit-freezes | BUG-7 | P0 |
| R4 | Enforce freeze allowance: block activation at 0 remaining with inline explanation (both global and per-habit paths) | I1 | P0 |
| R5 | Replace `bg-slate-850/750` with real tokens (e.g. `slate-800`/`slate-700` or `@theme` additions) and define `no-scrollbar` utility; install/replace modal animation utilities (tw-animate-css or hand-rolled keyframes) | BUG-5, BUG-6 | P1 |
| R6 | Backup hardening: per-record validation (date regex, category enum, schedule shape) with a rejection summary; import profile in merge mode (or offer it explicitly); distinct armed state for replace confirm | BUG-10, BUG-13, edge cases | P1 |
| R7 | Add a React error boundary + surface quota-exceeded write failures as a toast | prod risks 4, edge cases | P1 |
| R8 | Honor `prefers-reduced-motion` (skip confetti, disable decorative animation); fix `osc2` start/stop | I5, BUG-8 | P1 |
| R9 | Compute true historical longest streaks for weekly-target and global streaks (reuse the 180-day audit approach) | I6 | P2 |
| R10 | Self-host fonts (or accept + document system-font fallback); exclude fonts from the offline promise | tech debt | P2 |
| R11 | Repo hygiene: rename package, remove unused deps/backdoor/`metadata.json` claims, write a real README, add `test` script (`node --test` via tsx), add ESLint, prune `.aistudio`/`test-results` | tech debt | P2 |
| R12 | Midnight-rollover handling: recompute "today" on an interval or `visibilitychange`; use `generateUniqueId` for all entity ids | edge cases | P2 |
| R13 | Unify destructive-action UX (custom confirm dialog component) and modal closing (Escape + overlay click + focus trap) | UI inconsistencies | P2 |
| R14 | Extract App state into a reducer/store module and split handlers out of `App.tsx` to enable unit testing | tech debt | P3 |

**Explicitly NOT recommended:** replacing the JSON backup system (verified sound, §1 V3), introducing any backend/sync service, migrating to IndexedDB (current data volume is far within localStorage limits; quarantine+rollback already cover corruption), or adopting a new design language (see design.md §6 guardrails).

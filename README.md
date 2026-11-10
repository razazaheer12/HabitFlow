<div align="center">
  <img src="public/logo.png" width="112" height="112" alt="HabitFlow logo" />

# HabitFlow

**Build Better Habits. Track Your Progress. Become Consistent.**

A mobile-first, local-first Progressive Web App for daily habit tracking, streak protection,
micro-journaling and GitHub-style consistency analytics. No account, no backend, no tracking —
your data stays in your browser.

[**Live Demo**](https://habitflow-space.vercel.app/) · [Repository](https://github.com/razazaheer12/HabitFlow) · [License](LICENSE)

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)
![Built with React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=ffffff)
</div>

---

## Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture & Data](#architecture--data)
- [PWA & Offline](#pwa--offline)
- [Testing & Quality](#testing--quality)
- [Deployment](#deployment)
- [Author](#author)
- [License](#license)

---

## Overview

HabitFlow is built around one idea: **consistency is measurable, and measurement should be
honest.** Every habit you create is turned into a set of scheduled check-ins, and every metric in
the app — completion rates, streaks, heatmaps, period comparisons — is derived from that same
check-in model rather than from raw day counts.

That makes the analytics forgiving in the right places. Rest days don't count against you. Frozen
days (a sick day, a trip, Holiday Mode) are removed from both the numerator and the denominator.
A weekly-target habit can never push a rate above 100%. Future days are excluded, so a
partially-elapsed week is measured only over days that have actually arrived.

It is local-first by design: all habits, logs, journal notes and freeze records live in your
browser's `localStorage`. There is no server, no sign-in and no telemetry, which means the app
loads instantly, works offline after the first visit, and can be exported as a plain JSON file you
own.

**Good fit if you** want a fast, private habit tracker you can install on your phone and keep using
without an account — and you care about the maths behind your streaks.

---

## Features

### Tracking

- **Daily check-in dashboard** with a date carousel for reviewing past days and marking completions.
- **Habit CRUD** — create, edit and archive habits; archived habits keep their full history.
- **Five built-in categories** — Fitness / Body, Mind & Focus, Productivity, Learning, Health & Routine.
- **Three schedule types** — every day, specific weekdays, or a target number of times per week.
  Schedule changes are recorded as dated revisions so historical streaks stay accurate.
- **Target units** per habit (e.g. "30 mins", "10 pages") and optional notes as a baseline cue.

### Streaks & protection

- **Streak engine** that distinguishes completed, frozen, skipped and missed days.
- **Streak freezes** with a monthly allowance (3 per month by default), each recorded with a reason.
- **Holiday Mode** — a single global freeze day that protects every habit at once.

### Analytics

- **GitHub-style consistency heatmap** covering the trailing 17 weeks with five intensity levels.
- **Overall completion rate** computed over scheduled check-ins, weighted correctly across habits.
- **Category breakdown** with per-category completion rates and a best-performing-category callout.
- **Week-over-week and month-over-month comparisons**, both measured to-date so periods stay equal length.

### Journaling & feedback

- **Micro-journal** — one-line reflections attached to a habit on a specific day, editable or removable.
- **Local reminders** at a chosen time, delivered through the browser Notification API.
- **Procedural audio chimes** synthesised with the Web Audio API (success, streak and freeze cues) — no audio assets shipped.
- **Confetti celebrations** on completions.

### Data & platform

- **JSON backup and restore** with schema versioning, validation and migration of older data.
- **Local-first persistence** in `localStorage`, with cross-tab synchronisation between open windows.
- **Installable PWA** with a web app manifest, standalone display mode and icon set.
- **Offline support** via a service worker that precaches the app shell and caches hashed assets.
- **Responsive, mobile-first UI** with self-hosted variable fonts (no external font requests).

---

## Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Build tooling | [Vite 8](https://vite.dev/) | Dev server, HMR and production bundling |
| UI framework | [React 19](https://react.dev/) | Component model and rendering |
| Language | [TypeScript 6](https://www.typescriptlang.org/) | Strict typing across UI, domain and storage layers |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) | CSS-first `@theme` design tokens — no `tailwind.config.js` |
| Routing | [React Router 7](https://reactrouter.com/) | URL routes for dashboard, habits, analytics and settings |
| Icons | [lucide-react](https://lucide.dev/) | Icon set used across the interface |
| Fonts | `@fontsource-variable/manrope`, `@fontsource-variable/jetbrains-mono` | Self-hosted variable fonts for full offline typography |
| Celebration | [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) | Completion confetti |
| Testing | `node:test` via [tsx](https://github.com/privatenumber/tsx) | Domain-layer unit tests |
| Linting | [ESLint 9](https://eslint.org/) + `typescript-eslint` | Flat-config static analysis |
| Hosting | [Vercel](https://vercel.com/) | Static hosting with SPA rewrite rules |

---

## Getting Started

### Prerequisites

- **Node.js** `^20.19.0` or `>=22.12.0` (required by Vite 8)
- **npm** 10+

### Installation

```bash
git clone https://github.com/razazaheer12/HabitFlow.git
cd HabitFlow
npm install
```

### Development

```bash
npm run dev
```

The dev server starts on [http://localhost:3000](http://localhost:3000) (strict port — it fails
rather than silently picking another one) and is bound to all interfaces, so you can open it from a
phone on the same network. The production service worker is never registered in development.

### Production build

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server on port 3000 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | TypeScript type checking (`tsc --noEmit`) |
| `npm run lint` | ESLint across the project |
| `npm test` | Domain unit tests (`node:test` via `tsx`) |
| `npm run clean` | Remove the `dist/` build output |

---

## Project Structure

```
HabitFlow/
├─ public/                  Static assets served as-is
│  ├─ manifest.json         PWA manifest (name, display mode, icons, colours)
│  ├─ sw.js                 Production service worker (precache + fetch strategies)
│  ├─ logo.png              Brand mark
│  ├─ favicon.png           Tab icon
│  ├─ apple-touch-icon.png  iOS home-screen icon
│  └─ pwa-*.png             PWA icons (192/512 any + 512 maskable)
├─ src/
│  ├─ main.tsx              Entry point: font imports + service worker registration
│  ├─ App.tsx               App state, handlers and global overlays
│  ├─ index.css             Tailwind import + Premium Light design tokens (@theme)
│  ├─ components/           UI components (shell, nav, cards, modals, heatmap, toasts)
│  ├─ pages/                Route screens (Today, Habits, Analytics, Settings, Onboarding, 404)
│  ├─ domain/               Pure logic: date, schedule, streak, analytics (+ unit tests)
│  ├─ storage/              localStorage repository, schema validation and migration
│  ├─ notifications/        Local reminders and procedural audio chimes
│  ├─ pwa/                  Service worker lifecycle control (dev vs production)
│  ├─ state/                Shared app-state React context
│  ├─ types/                Typed data models and category definitions
│  └─ utils/                Confetti helpers
├─ design/                  Design references (Phase 3 screen mockups)
├─ design-assets/           Brand asset sources (logo artwork)
├─ index.html               Document shell, meta tags and PWA links
├─ package.json             Scripts and dependencies
├─ vite.config.ts           Vite config: React + Tailwind plugins, dev server, path alias
├─ tsconfig.json            TypeScript compiler configuration
├─ eslint.config.js         ESLint flat config
└─ vercel.json              Vercel SPA rewrite rule
```

The `src/domain/` folder contains no React or browser dependencies — streaks, schedule eligibility
and every aggregate metric are pure functions, which is what makes them directly unit-testable.

---

## Architecture & Data

**Local-first, single-device.** HabitFlow has no backend and no user accounts. Everything is read
from and written to the browser's `localStorage` through a single hardened repository
(`src/storage/localStorage.ts`).

Stored collections (each under a versioned key):

| Key | Contents |
| --- | --- |
| `habitflow_profile_v2` | Name, onboarding state, theme, freeze allowance, sound and notification preferences |
| `habitflow_habits_v2` | Habit definitions, schedules and schedule history |
| `habitflow_logs_v2` | Per-day completion logs |
| `habitflow_notes_v2` | Micro-journal entries |
| `habitflow_freezes_v2` | Streak freeze and Holiday Mode records |
| `habitflow_schema_version` | Current data schema version |

Data-integrity behaviour built into the storage layer:

- **Schema versioning and migration** — legacy v1 keys are detected, migrated to the current schema
  and rewritten; imported backups are validated before anything is applied.
- **Corrupted-JSON quarantine** — unparseable payloads are copied to a timestamped
  `habitflow_corrupted_*` key and replaced with a safe fallback instead of crashing the app.
- **Quota defence** — write failures (including `QuotaExceededError`) are caught and reported
  rather than silently losing state.
- **Cross-tab sync** — a `storage` event listener keeps multiple open tabs consistent.
- **Snapshot and rollback** — a full state snapshot is captured before a restore, so a failed import
  can be rolled back.

**Backup and restore.** Settings → Backup exports the complete dataset as a single JSON file
(`habitflow-backup-YYYY-MM-DD.json`) containing the schema version, app version, export timestamp,
profile, habits, logs, notes and freezes. Restoring validates that file before applying it. Clearing
data always requires an explicit confirmation step.

**Privacy.** Because there is no server, no data leaves the device through the app itself. That said,
`localStorage` is scoped to the browser and device and is not encrypted — anyone with access to the
browser profile can read it, and clearing site data removes it. Export a JSON backup if the data
matters to you.

---

## PWA & Offline

**Install.** The app ships a web app manifest with standalone display mode, portrait orientation,
a `#F8F9F5` theme/background colour and four icons (`any` at 192/512 and `maskable` at 512). An
in-app install prompt and button surface when the browser reports the app is installable.

**Service worker.** `public/sw.js` uses a versioned cache namespace (`habitflow-cache-v6`) with three
strategies:

| Request | Strategy |
| --- | --- |
| Navigations (HTML) | Network-first, falling back to the cached app shell when offline |
| `/assets/*` (Vite-fingerprinted) | Cache-first, then network |
| Other same-origin GETs (manifest, icons, fonts) | Network-first with cache fallback |

Cross-origin requests are never intercepted, and obsolete `habitflow-cache-*` versions are purged on
activation. The worker is registered only in production; in development `src/pwa/serviceWorker.ts`
actively removes any stale registration and cache so HMR is never shadowed.

**Offline.** After one successful online load, the app shell, hashed assets, icons and self-hosted
fonts are available offline, and an offline indicator appears when the connection drops. All habit
data is already local, so tracking works with no network at all.

**Limitations.**

- Reminders are **local-only**: they fire while the app is open in a tab or PWA window. Browsers may
  suspend a backgrounded or closed PWA, so delivery is not guaranteed when the app is not running.
  Notifications also require explicit browser permission.
- `localStorage` is per browser and per device — there is no sync between them. Moving devices means
  exporting a backup and restoring it.
- Service worker updates apply on the next natural navigation (or a reload on a returning visit), so
  a freshly deployed version may not appear until you revisit.

---

## Testing & Quality

Quality checks are plain npm scripts, so they run identically locally and in any CI you add later:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint 9 flat config
npm test            # domain unit tests (node:test via tsx)
npm run build       # production build must succeed
```

`npm test` executes `src/domain/domain.test.ts`, a 41-case suite covering the parts of the app where
incorrect maths would be invisible to the eye: schedule eligibility, planned rest days, weekly-target
quotas, streak continuity across freezes and archive boundaries, and the heatmap/comparison
calculations. All four checks currently pass on `main`.

---

## Deployment

HabitFlow is live at **[habitflow-space.vercel.app](https://habitflow-space.vercel.app/)**, hosted on
Vercel as a static build.

`vercel.json` rewrites every path to `/index.html` so client-side routes survive a hard refresh.
No environment variables or build configuration are required beyond the defaults:

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`

To deploy your own copy, import the repository into Vercel (or any static host) and keep the SPA
fallback — without it, `/analytics` and `/habits` will 404 on refresh.

---

## Author

Developed by **[Raza Zaheer](https://github.com/razazaheer12)**.

---

## License

Released under the [MIT License](LICENSE). You are free to use, modify and distribute this project
provided the copyright notice and licence text are retained.

```
MIT License — Copyright (c) 2026 Raza Zaheer
```

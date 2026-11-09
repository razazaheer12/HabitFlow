# HabitFlow

A local-first, offline-capable Progressive Web App for habit tracking, streak
protection, micro-journaling, and GitHub-style activity analytics.

Everything is stored on your device — there is no backend, no account, and no
tracking.

## Stack

- **Vite 8** + **React 19** + **TypeScript**
- **Tailwind CSS v4** (CSS-first `@theme` configuration — no `tailwind.config.js`)
- Self-hosted variable fonts (**Geist**, **JetBrains Mono**) via `@fontsource-variable`
- `canvas-confetti` for restrained celebrations
- Pure domain logic in `src/domain/` (date, schedule, streak, analytics)
- Persistence in `localStorage` with schema versioning, migration, and backup/restore

## Getting started

Prerequisites: Node.js 20+.

```bash
npm install     # install dependencies
npm run dev     # start the dev server on http://localhost:3000
```

## Scripts

| Command             | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Start the Vite dev server                            |
| `npm run build`     | Production build to `dist/`                          |
| `npm run preview`   | Preview the production build                         |
| `npm run typecheck` | TypeScript type checking (`tsc --noEmit`)            |
| `npm run lint`      | ESLint (flat config, `typescript-eslint`)            |
| `npm test`          | Domain unit tests (`node:test` via `tsx`)            |
| `npm run clean`     | Remove the `dist/` build output                      |

## Project structure

```
src/
  App.tsx              Root component: state, handlers, view routing
  main.tsx             Entry point, font imports, service-worker registration
  index.css            Tailwind import + design tokens (@theme)
  components/          UI components (dashboard, modals, cards, analytics)
  domain/              Pure logic: date, schedule, streak, analytics (+ tests)
  storage/             localStorage repository, schema validation & migration
  notifications/       Local reminders + procedural audio chimes
  utils/               Confetti helpers
public/
  manifest.json        PWA manifest
  sw.js                Service worker (app-shell caching, offline fallback)
  favicon.png, logo.png            Brand mark (in-app + tab icon)
  apple-touch-icon.png, pwa-*.png  PWA icons (any + maskable)
```

## Offline & PWA

The service worker precaches the app shell and caches same-origin assets at
runtime, so HabitFlow works offline after the first successful load. Fonts are
self-hosted, so typography renders without a network connection.

Reminders are **local-only**: they fire while the app is open in a tab or PWA
window. Browsers may suspend a backgrounded or closed PWA, so reminder delivery
is not guaranteed when the app is not running.

## Data & privacy

All habit data lives in your browser's `localStorage`. Use **Settings → JSON
Backup & Recovery** to export a full backup or restore/merge one. Clearing data
is always behind an explicit confirmation step.

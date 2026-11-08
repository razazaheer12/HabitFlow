import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { initServiceWorker } from './pwa/serviceWorker';

// Self-hosted variable fonts (offline-capable, no remote requests).
// Manrope is the primary UI typeface; JetBrains Mono is retained only for
// genuinely technical/export grids (e.g. the backup summary).
import '@fontsource-variable/manrope/wght.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import './index.css';

// Development: never register the production worker (and clean up any leftover
// HabitFlow worker/caches). Production: register with a conservative lifecycle.
initServiceWorker();

createRoot(document.getElementById('root')!).render(<App />);

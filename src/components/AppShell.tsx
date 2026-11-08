import React from 'react';
import { NavLink, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { CheckSquare, BarChart2, ListTodo, Settings, Plus, Sparkles } from 'lucide-react';
import { useAppState } from '../state/AppStateContext';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { TodayPage } from '../pages/TodayPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { HabitsPage } from '../pages/HabitsPage';
import { HabitFormPage } from '../pages/HabitFormPage';
import { SettingsPage } from '../pages/SettingsPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { NotFoundPage } from '../pages/NotFoundPage';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${
    isActive
      ? 'bg-accent-soft text-ink'
      : 'text-ink-secondary hover:text-ink hover:bg-bg-secondary'
  }`;

const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center justify-center h-full cursor-pointer transition-colors ${
    isActive
      ? 'text-ink font-semibold shadow-[inset_0_2px_0_0_var(--color-accent)]'
      : 'text-ink-secondary'
  }`;

/**
 * Legacy bookmark/tab compatibility: /today -> / preserving any ?date= query.
 * Renders no Today UI of its own so there is never a second dashboard route.
 */
const LegacyTodayRedirect: React.FC = () => {
  const location = useLocation();
  return <Navigate to={{ pathname: '/', search: location.search }} replace />;
};

/**
 * Shared app shell: desktop top nav, mobile bottom nav, brand, responsive
 * container and the route table. While onboarding is incomplete it renders ONLY
 * the onboarding gate (no navigation) so it cannot be bypassed.
 */
export const AppShell: React.FC = () => {
  const { profile, activeHabits, openPWAInstallModal } = useAppState();
  const navigate = useNavigate();

  if (!profile.onboardingCompleted) {
    return (
      <Routes>
        <Route path="*" element={<OnboardingPage />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col antialiased">
      {/* Top Bar (strict 3-zone contract) */}
      <header className="sticky top-0 z-40 bg-bg/85 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-8 py-2.5">
          {/* Zone 1: Brand */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-ink-on-accent shadow-card">
              <Sparkles className="w-5 h-5" strokeWidth={2.25} />
            </div>
            <NavLink to="/" className="text-lg font-extrabold text-ink tracking-tight">
              HabitFlow
            </NavLink>
          </div>

          {/* Zone 2: Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <NavLink to="/" className={navLinkClass} end>
              Today
            </NavLink>
            <NavLink to="/analytics" className={navLinkClass}>
              Analytics
            </NavLink>
            <NavLink to="/habits" className={navLinkClass}>
              Habits ({activeHabits.length})
            </NavLink>
            <NavLink to="/settings" className={navLinkClass}>
              Settings
            </NavLink>
          </nav>

          {/* Zone 3: Primary action & install */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <PWAInstallButton onOpenModal={openPWAInstallModal} />
            <button
              onClick={() => navigate('/habits/new')}
              className="flex items-center gap-1.5 px-3.5 rounded-xl bg-accent hover:bg-accent-hover active:scale-[0.98] text-ink-on-accent text-sm font-semibold shadow-card transition cursor-pointer whitespace-nowrap h-11"
            >
              <Plus className="w-4 h-4" strokeWidth={2.75} />
              <span className="hidden sm:inline">Add Habit</span>
            </button>
            <NavLink
              to="/settings"
              aria-label="Open Settings"
              className="w-11 h-11 rounded-xl bg-surface border border-border hover:border-border-strong flex items-center justify-center text-ink-secondary hover:text-ink transition cursor-pointer shrink-0"
            >
              <Settings className="w-5 h-5" />
            </NavLink>
          </div>
        </div>
      </header>

      {/* Main Container — full-bleed; each page owns its content max-width */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/today" element={<LegacyTodayRedirect />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/habits" element={<HabitsPage />} />
          <Route path="/habits/new" element={<HabitFormPage />} />
          <Route path="/habits/:habitId/edit" element={<HabitFormPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/onboarding" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Mobile bottom tab bar (thumb-zone navigation) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-border md:hidden pb-safe">
        <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto">
          <NavLink to="/" className={mobileNavClass} end>
            <CheckSquare className="w-5 h-5" />
            <span className="text-xs mt-1">Today</span>
          </NavLink>
          <NavLink to="/analytics" className={mobileNavClass}>
            <BarChart2 className="w-5 h-5" />
            <span className="text-xs mt-1">Analytics</span>
          </NavLink>
          <NavLink to="/habits" className={mobileNavClass}>
            <ListTodo className="w-5 h-5" />
            <span className="text-xs mt-1">Habits</span>
          </NavLink>
          <NavLink to="/settings" className={mobileNavClass}>
            <Settings className="w-5 h-5" />
            <span className="text-xs mt-1">Settings</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

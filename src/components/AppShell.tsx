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
  `hover:text-white transition whitespace-nowrap cursor-pointer ${
    isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'
  }`;

const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center justify-center h-full transition cursor-pointer ${
    isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Bar (strict 3-zone contract) */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Brand */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
              <Sparkles className="w-4 h-4 fill-slate-950" />
            </div>
            <NavLink to="/" className="text-lg font-extrabold text-white">
              HabitFlow
            </NavLink>
          </div>

          {/* Zone 2: Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-400">
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
          <div className="flex items-center gap-2.5 shrink-0">
            <PWAInstallButton onOpenModal={openPWAInstallModal} />
            <button
              onClick={() => navigate('/habits/new')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer whitespace-nowrap min-h-[36px]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Add Habit</span>
            </button>
            <NavLink
              to="/settings"
              aria-label="Open Settings"
              className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer shrink-0"
            >
              <Settings className="w-4 h-4" />
            </NavLink>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-12">
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
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 md:hidden pb-safe">
        <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto">
          <NavLink to="/" className={mobileNavClass} end>
            <CheckSquare className="w-5 h-5" />
            <span className="text-[11px] mt-1 font-medium">Today</span>
          </NavLink>
          <NavLink to="/analytics" className={mobileNavClass}>
            <BarChart2 className="w-5 h-5" />
            <span className="text-[11px] mt-1 font-medium">Analytics</span>
          </NavLink>
          <NavLink to="/habits" className={mobileNavClass}>
            <ListTodo className="w-5 h-5" />
            <span className="text-[11px] mt-1 font-medium">Habits</span>
          </NavLink>
          <NavLink to="/settings" className={mobileNavClass}>
            <Settings className="w-5 h-5" />
            <span className="text-[11px] mt-1 font-medium">Settings</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

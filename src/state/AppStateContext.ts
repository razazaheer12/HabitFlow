import { createContext, useContext } from 'react';
import {
  Habit,
  HabitCategory,
  HabitLog,
  JournalNote,
  StreakFreeze,
  UserProfile
} from '../types';

export interface GlobalStreakValue {
  currentStreak: number;
  longestStreak: number;
  todayRate: number;
  totalCompletions: number;
}

export interface ConfirmConfig {
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
}

/**
 * Shared application state + handlers, provided once by <App> and consumed by
 * every routed page. Keeping the logic in a single provider preserves the exact
 * behaviour of the pre-routing implementation while letting pages be genuine
 * routes.
 */
export interface AppState {
  isHydrated: boolean;

  // Core records
  profile: UserProfile;
  habits: Habit[];
  logs: HabitLog[];
  notes: JournalNote[];
  freezes: StreakFreeze[];

  // View state
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  categoryFilter: 'all' | HabitCategory;
  setCategoryFilter: (c: 'all' | HabitCategory) => void;
  showArchived: boolean;
  setShowArchived: (v: boolean | ((prev: boolean) => boolean)) => void;

  // Derived values
  globalStreak: GlobalStreakValue;
  activeHabits: Habit[];
  dueHabits: Habit[];
  completedDueCount: number;
  isSelectedDateFrozen: boolean;
  archivedCount: number;
  visibleHabits: Habit[];
  remainingAllowance: number;

  // Record handlers
  handleToggleComplete: (habitId: string, date: string) => void;
  handleSaveNote: (habitId: string, date: string, noteText: string) => void;
  handleDeleteNote: (habitId: string, date: string) => void;
  handleToggleHabitFreeze: (habitId: string, date: string) => void;
  handleToggleGlobalFreeze: (date: string, reason: string) => void;
  handleSaveHabit: (habitData: Partial<Habit>) => void;
  handleArchiveHabit: (habitId: string) => void;
  handleDeleteHabit: (habitId: string) => void;
  handleResetData: () => void;
  handleDataRestored: () => void;
  updateProfile: (updated: Partial<UserProfile>) => void;

  // Feedback
  showToast: (message: string, variant?: 'success' | 'error' | 'info') => void;
  requestConfirm: (cfg: ConfirmConfig) => void;

  // Global modal openers
  openNoteModal: (habit: Habit, date: string, note?: string) => void;
  openFreezeModal: () => void;
  openSettingsModal: () => void;
  openBackupModal: () => void;
  openPWAInstallModal: () => void;
}

export const AppStateContext = createContext<AppState | null>(null);

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within an AppStateContext.Provider');
  return ctx;
}

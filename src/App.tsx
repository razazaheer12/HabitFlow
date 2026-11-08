/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

import {
  Habit,
  HabitCategory,
  HabitLog,
  JournalNote,
  StreakFreeze,
  UserProfile
} from './types';
import {
  calculateGlobalStreak,
  isHabitCompleted,
  getRemainingFreezeAllowance
} from './domain/streak';
import {
  LocalStorageRepository,
  generateUniqueId,
  subscribeToCrossTabSync
} from './storage/localStorage';
import { checkHabitReminders, playChime } from './notifications/service';
import { triggerAllCompletedCelebration } from './utils/confetti';

import { AppShell } from './components/AppShell';
import { MicroJournalModal } from './components/MicroJournalModal';
import { FreezeModal } from './components/FreezeModal';
import { SettingsModal } from './components/SettingsModal';
import { BackupModal } from './components/BackupModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ToastStack } from './components/Toast';
import { useToasts } from './components/useToasts';

import { AppState, AppStateContext, ConfirmConfig } from './state/AppStateContext';
import { DEFAULT_PROFILE } from './storage/schema';
import { toLocalDateString } from './domain/date';
import { isHabitScheduledForDate, isPlannedRestDay } from './domain/schedule';

export default function App() {
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [notes, setNotes] = useState<JournalNote[]>([]);
  const [freezes, setFreezes] = useState<StreakFreeze[]>([]);

  const [selectedDate, setSelectedDate] = useState<string>(toLocalDateString());
  const [categoryFilter, setCategoryFilter] = useState<'all' | HabitCategory>('all');
  const [showArchived, setShowArchived] = useState<boolean>(false);

  // Global modal state
  const [showNoteModal, setShowNoteModal] = useState<boolean>(false);
  const [activeNoteHabit, setActiveNoteHabit] = useState<Habit | null>(null);
  const [activeNoteInitial, setActiveNoteInitial] = useState<string>('');

  const [showFreezeModal, setShowFreezeModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);
  const [showPWAInstallModal, setShowPWAInstallModal] = useState<boolean>(false);

  // Toasts + confirmation dialog
  const { toasts, showToast, dismiss } = useToasts();
  const [confirmState, setConfirmState] = useState<(ConfirmConfig & { variant: 'danger' | 'primary' }) | null>(null);

  const requestConfirm = (cfg: ConfirmConfig) => {
    setConfirmState({
      title: cfg.title,
      description: cfg.description,
      confirmLabel: cfg.confirmLabel,
      variant: cfg.variant ?? 'danger',
      onConfirm: cfg.onConfirm
    });
  };

  // Cross-tab synchronization
  useEffect(() => {
    const unsubscribe = subscribeToCrossTabSync(() => {
      setProfile(LocalStorageRepository.loadProfile());
      setHabits(LocalStorageRepository.loadHabits());
      setLogs(LocalStorageRepository.loadLogs());
      setNotes(LocalStorageRepository.loadNotes());
      setFreezes(LocalStorageRepository.loadFreezes());
    });
    return unsubscribe;
  }, []);

  // Safe client-side hydration: never access localStorage during initial render pass
  useEffect(() => {
    // An empty habits array is a legitimate state (new user, or user deleted
    // everything) — never re-seed starter habits here.
    setProfile(LocalStorageRepository.loadProfile());
    setHabits(LocalStorageRepository.loadHabits());
    setLogs(LocalStorageRepository.loadLogs());
    setNotes(LocalStorageRepository.loadNotes());
    setFreezes(LocalStorageRepository.loadFreezes());
    setIsHydrated(true);
  }, []);

  // Periodic reminder checking
  useEffect(() => {
    if (!isHydrated) return;
    checkHabitReminders(habits);
    const interval = setInterval(() => {
      checkHabitReminders(habits);
    }, 30000);
    return () => clearInterval(interval);
  }, [habits, isHydrated]);

  // Dynamic monthly freeze allowance calculation
  const currentYearMonth = selectedDate.slice(0, 7);
  const remainingAllowance = getRemainingFreezeAllowance(profile.freezeAllowance, freezes, currentYearMonth);

  // Global calculations
  const globalStreak = calculateGlobalStreak(habits, logs, freezes, selectedDate);
  const activeHabits = habits.filter((h) => !h.archived);
  const dueHabits = activeHabits.filter((h) => isHabitScheduledForDate(h, selectedDate));
  const completedDueCount = dueHabits.filter((h) => isHabitCompleted(h.id, selectedDate, logs)).length;
  const isSelectedDateFrozen = freezes.some((f) => f.date === selectedDate && !f.habitId);
  const archivedCount = habits.filter((h) => h.archived).length;

  const visibleHabits = dueHabits.filter((h) => {
    if (categoryFilter === 'all') return true;
    return h.category === categoryFilter;
  });

  // Handler: Toggle Habit Complete
  const handleToggleComplete = (habitId: string, date: string) => {
    const isCurrentlyDone = isHabitCompleted(habitId, date, logs);
    let updatedLogs: HabitLog[];

    if (isCurrentlyDone) {
      updatedLogs = logs.filter((l) => !(l.habitId === habitId && l.date === date));
    } else {
      const newLog: HabitLog = {
        id: `log-${Date.now()}`,
        habitId,
        date,
        completed: true,
        completedAt: new Date().toISOString()
      };
      updatedLogs = [...logs.filter((l) => !(l.habitId === habitId && l.date === date)), newLog];

      if (profile.soundEnabled) playChime('success');

      const willBeDoneCount = dueHabits.filter((h) =>
        h.id === habitId ? true : isHabitCompleted(h.id, date, logs)
      ).length;

      if (willBeDoneCount === dueHabits.length && dueHabits.length > 0) {
        if (profile.soundEnabled) playChime('streak');
        triggerAllCompletedCelebration();
      }
    }

    setLogs(updatedLogs);
    LocalStorageRepository.saveLogs(updatedLogs);
  };

  // Handler: Save Micro-Journal Note
  const handleSaveNote = (habitId: string, date: string, noteText: string) => {
    const existingIndex = notes.findIndex((n) => n.habitId === habitId && n.date === date);
    let updatedNotes: JournalNote[];

    if (existingIndex >= 0) {
      updatedNotes = [...notes];
      updatedNotes[existingIndex] = {
        ...updatedNotes[existingIndex],
        note: noteText,
        updatedAt: new Date().toISOString()
      };
    } else {
      const newNote: JournalNote = {
        id: `note-${Date.now()}`,
        habitId,
        date,
        note: noteText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      updatedNotes = [...notes, newNote];
    }

    setNotes(updatedNotes);
    LocalStorageRepository.saveNotes(updatedNotes);
  };

  // Handler: Delete Micro-Journal Note
  const handleDeleteNote = (habitId: string, date: string) => {
    const updatedNotes = notes.filter((n) => !(n.habitId === habitId && n.date === date));
    setNotes(updatedNotes);
    LocalStorageRepository.saveNotes(updatedNotes);
  };

  // Handler: Toggle Habit Freeze for Date (allowance-enforced, deduped, rest-day aware)
  const handleToggleHabitFreeze = (habitId: string, date: string) => {
    const habit = habits.find((h) => h.id === habitId);
    const habitSpecificFrozen = freezes.some((f) => f.date === date && f.habitId === habitId);
    const globallyFrozen = freezes.some((f) => f.date === date && !f.habitId);

    if (habitSpecificFrozen) {
      const updatedFreezes = freezes.filter((f) => !(f.date === date && f.habitId === habitId));
      setFreezes(updatedFreezes);
      LocalStorageRepository.saveFreezes(updatedFreezes);
      showToast('Freeze removed', 'info');
      return;
    }

    if (globallyFrozen) {
      showToast('Holiday Mode already protects this day', 'info');
      return;
    }
    if (!habit) return;
    if (isHabitCompleted(habitId, date, logs)) {
      showToast('This habit is already completed — no freeze needed', 'info');
      return;
    }
    if (!isHabitScheduledForDate(habit, date) || isPlannedRestDay(habit, date)) {
      showToast("This day isn't scheduled — your streak is already safe", 'info');
      return;
    }

    const remaining = getRemainingFreezeAllowance(profile.freezeAllowance, freezes, date.slice(0, 7));
    if (remaining <= 0) {
      showToast('No freeze tokens left this month', 'error');
      return;
    }

    const updatedFreezes: StreakFreeze[] = [
      ...freezes,
      {
        id: `freeze-${Date.now()}`,
        date,
        habitId,
        reason: 'Rest / Skip Day',
        createdAt: new Date().toISOString()
      }
    ];
    if (profile.soundEnabled) playChime('freeze');
    setFreezes(updatedFreezes);
    LocalStorageRepository.saveFreezes(updatedFreezes);
    showToast('Streak freeze activated', 'success');
  };

  // Handler: Toggle Global Freeze (Holiday Mode) — allowance-enforced, deduped
  const handleToggleGlobalFreeze = (date: string, reason: string) => {
    const globallyFrozen = freezes.some((f) => f.date === date && !f.habitId);

    if (globallyFrozen) {
      const updatedFreezes = freezes.filter((f) => !(f.date === date && !f.habitId));
      setFreezes(updatedFreezes);
      LocalStorageRepository.saveFreezes(updatedFreezes);
      showToast('Holiday Mode deactivated', 'info');
      return;
    }

    const remaining = getRemainingFreezeAllowance(profile.freezeAllowance, freezes, date.slice(0, 7));
    if (remaining <= 0) {
      showToast('No freeze tokens left this month', 'error');
      return;
    }

    const updatedFreezes: StreakFreeze[] = [
      ...freezes.filter((f) => !(f.date === date && f.habitId)),
      {
        id: `freeze-global-${Date.now()}`,
        date,
        reason,
        createdAt: new Date().toISOString()
      }
    ];
    if (profile.soundEnabled) playChime('freeze');
    setFreezes(updatedFreezes);
    LocalStorageRepository.saveFreezes(updatedFreezes);
    showToast('Holiday Mode activated', 'success');
  };

  // Handler: Save Habit (Create or Edit)
  const handleSaveHabit = (habitData: Partial<Habit>) => {
    let updatedHabits: Habit[];
    const nowISO = new Date().toISOString();
    const todayStr = toLocalDateString();

    if (habitData.id) {
      updatedHabits = habits.map((h) => {
        if (h.id !== habitData.id) return h;

        const createdDate = h.createdAt ? h.createdAt.slice(0, 10) : todayStr;
        const currentEffectiveFrom = h.scheduleEffectiveFrom || createdDate;
        let newHistory = h.scheduleHistory ? [...h.scheduleHistory] : [];
        let nextEffectiveFrom = h.scheduleEffectiveFrom;

        // BUG-3 fix: when the schedule actually changes, archive the OLD schedule
        // tagged with the date it became effective, and make the NEW schedule
        // effective only from today. Past analytics keep using the old schedule.
        const scheduleChanged =
          habitData.schedule && JSON.stringify(habitData.schedule) !== JSON.stringify(h.schedule);

        if (scheduleChanged) {
          const priorEntry = { effectiveFrom: currentEffectiveFrom, schedule: h.schedule };
          newHistory = newHistory.filter((r) => r.effectiveFrom !== priorEntry.effectiveFrom);
          newHistory.push(priorEntry);
          newHistory.sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
          nextEffectiveFrom = todayStr;
        }

        return {
          ...h,
          ...habitData,
          scheduleHistory: newHistory.length > 0 ? newHistory : h.scheduleHistory,
          scheduleEffectiveFrom: nextEffectiveFrom,
          updatedAt: nowISO
        } as Habit;
      });
    } else {
      const newHabit: Habit = {
        id: generateUniqueId('habit'),
        title: habitData.title || 'Untitled Habit',
        category: habitData.category || 'productivity',
        schedule: habitData.schedule || { type: 'daily' },
        scheduleEffectiveFrom: todayStr,
        reminderTime: habitData.reminderTime,
        targetUnit: habitData.targetUnit,
        notes: habitData.notes,
        createdAt: nowISO,
        updatedAt: nowISO
      };
      updatedHabits = [newHabit, ...habits];
    }

    setHabits(updatedHabits);
    LocalStorageRepository.saveHabits(updatedHabits);
  };

  // Handler: Archive or Restore Habit
  const handleArchiveHabit = (habitId: string) => {
    const updated = habits.map((h) => {
      if (h.id === habitId) {
        const isArchiving = !h.archived;
        return {
          ...h,
          archived: isArchiving,
          archivedAt: isArchiving ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString()
        };
      }
      return h;
    });

    setHabits(updated);
    LocalStorageRepository.saveHabits(updated);
  };

  // Handler: Delete Habit (confirmed, cascading across all related records)
  const handleDeleteHabit = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const relatedLogs = logs.filter((l) => l.habitId === habitId).length;
    const relatedNotes = notes.filter((n) => n.habitId === habitId).length;
    const relatedFreezes = freezes.filter((f) => f.habitId === habitId).length;

    requestConfirm({
      title: `Delete "${habit.title}"?`,
      confirmLabel: 'Delete Habit',
      variant: 'danger',
      description: (
        <div className="space-y-2 text-sm text-slate-300">
          <p>This permanently removes the habit and all of its history. This cannot be undone.</p>
          <ul className="space-y-1 text-xs text-slate-400 list-disc pl-5">
            <li>{relatedLogs} completion {relatedLogs === 1 ? 'log' : 'logs'}</li>
            <li>{relatedNotes} journal {relatedNotes === 1 ? 'note' : 'notes'}</li>
            <li>{relatedFreezes} freeze {relatedFreezes === 1 ? 'record' : 'records'}</li>
            <li>All streak and analytics history tied to this habit</li>
          </ul>
          <p className="text-xs text-slate-500">
            Tip: Archive instead if you want to keep the history but hide it from your routine.
          </p>
        </div>
      ),
      onConfirm: () => {
        const updatedHabits = habits.filter((h) => h.id !== habitId);
        const updatedLogs = logs.filter((l) => l.habitId !== habitId);
        const updatedNotes = notes.filter((n) => n.habitId !== habitId);
        const updatedFreezes = freezes.filter((f) => f.habitId !== habitId);

        setHabits(updatedHabits);
        setLogs(updatedLogs);
        setNotes(updatedNotes);
        setFreezes(updatedFreezes);
        LocalStorageRepository.saveHabits(updatedHabits);
        LocalStorageRepository.saveLogs(updatedLogs);
        LocalStorageRepository.saveNotes(updatedNotes);
        LocalStorageRepository.saveFreezes(updatedFreezes);
        showToast('Habit deleted', 'success');
      }
    });
  };

  // Reset all data to a clean, empty state (profile preserved)
  const handleResetData = () => {
    setHabits([]);
    setLogs([]);
    setNotes([]);
    setFreezes([]);
    LocalStorageRepository.saveHabits([]);
    LocalStorageRepository.saveLogs([]);
    LocalStorageRepository.saveNotes([]);
    LocalStorageRepository.saveFreezes([]);
    showToast('All habit data cleared', 'success');
  };

  // Hydrate fresh state after Backup JSON restore
  const handleDataRestored = () => {
    setProfile(LocalStorageRepository.loadProfile());
    setHabits(LocalStorageRepository.loadHabits());
    setLogs(LocalStorageRepository.loadLogs());
    setNotes(LocalStorageRepository.loadNotes());
    setFreezes(LocalStorageRepository.loadFreezes());
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    const next = { ...profile, ...updated };
    setProfile(next);
    LocalStorageRepository.saveProfile(next);
  };

  const openNoteModal = (habit: Habit, _date: string, note?: string) => {
    setActiveNoteHabit(habit);
    setActiveNoteInitial(note || '');
    setShowNoteModal(true);
  };

  const value = useMemo<AppState>(
    () => ({
      isHydrated,
      profile,
      habits,
      logs,
      notes,
      freezes,
      selectedDate,
      setSelectedDate,
      categoryFilter,
      setCategoryFilter,
      showArchived,
      setShowArchived,
      globalStreak,
      activeHabits,
      dueHabits,
      completedDueCount,
      isSelectedDateFrozen,
      archivedCount,
      visibleHabits,
      remainingAllowance,
      handleToggleComplete,
      handleSaveNote,
      handleDeleteNote,
      handleToggleHabitFreeze,
      handleToggleGlobalFreeze,
      handleSaveHabit,
      handleArchiveHabit,
      handleDeleteHabit,
      handleResetData,
      handleDataRestored,
      updateProfile,
      showToast,
      requestConfirm,
      openNoteModal,
      openFreezeModal: () => setShowFreezeModal(true),
      openSettingsModal: () => setShowSettingsModal(true),
      openBackupModal: () => setShowBackupModal(true),
      openPWAInstallModal: () => setShowPWAInstallModal(true)
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isHydrated, profile, habits, logs, notes, freezes, selectedDate, categoryFilter, showArchived,
      globalStreak, activeHabits, dueHabits, completedDueCount, isSelectedDateFrozen, archivedCount,
      visibleHabits, remainingAllowance, toasts
    ]
  );

  // Skeleton screen while hydration completes
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 fill-slate-950" />
          </div>
          <div className="text-base font-extrabold text-white">HabitFlow</div>
          <div className="text-xs text-slate-500">Loading your routine...</div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppStateContext.Provider value={value}>
        <AppShell />

        {/* Global overlays — driven by shared app state, mounted once */}
        <MicroJournalModal
          isOpen={showNoteModal}
          onClose={() => {
            setShowNoteModal(false);
            setActiveNoteHabit(null);
          }}
          habit={activeNoteHabit}
          dateStr={selectedDate}
          initialNote={activeNoteInitial}
          onSaveNote={handleSaveNote}
          onDeleteNote={handleDeleteNote}
        />

        <FreezeModal
          isOpen={showFreezeModal}
          onClose={() => setShowFreezeModal(false)}
          selectedDate={selectedDate}
          isGloballyFrozen={isSelectedDateFrozen}
          activeFreezes={freezes}
          remainingAllowance={remainingAllowance}
          onToggleGlobalFreeze={handleToggleGlobalFreeze}
        />

        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          profile={profile}
          onUpdateProfile={updateProfile}
          onResetData={() =>
            requestConfirm({
              title: 'Clear all habit data?',
              confirmLabel: 'Clear Everything',
              variant: 'danger',
              description: (
                <div className="space-y-2 text-sm text-slate-300">
                  <p>
                    This permanently deletes all habits, completion logs, journal notes and freeze
                    records from this device. Your profile and settings are kept.
                  </p>
                  <p className="text-xs text-slate-500">
                    Export a JSON backup first if you might want to restore this data later.
                  </p>
                </div>
              ),
              onConfirm: handleResetData
            })
          }
          onOpenBackupModal={() => setShowBackupModal(true)}
          showArchived={showArchived}
          onToggleShowArchived={() => setShowArchived((prev) => !prev)}
          archivedCount={archivedCount}
        />

        <BackupModal
          isOpen={showBackupModal}
          onClose={() => setShowBackupModal(false)}
          onDataRestored={handleDataRestored}
        />

        <PWAInstallModal
          isOpen={showPWAInstallModal}
          onClose={() => setShowPWAInstallModal(false)}
        />

        <ConfirmDialog
          isOpen={confirmState !== null}
          title={confirmState?.title ?? ''}
          description={confirmState?.description ?? ''}
          confirmLabel={confirmState?.confirmLabel ?? 'Confirm'}
          variant={confirmState?.variant ?? 'danger'}
          onConfirm={() => {
            confirmState?.onConfirm();
            setConfirmState(null);
          }}
          onCancel={() => setConfirmState(null)}
        />

        <ToastStack toasts={toasts} onDismiss={dismiss} />
        <OfflineIndicator />
      </AppStateContext.Provider>
    </BrowserRouter>
  );
}

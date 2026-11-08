import {
  BackupPayload,
  BackupValidationResult,
  CURRENT_SCHEMA_VERSION,
  Habit,
  HabitLog,
  JournalNote,
  StreakFreeze,
  UserProfile
} from '../types';

export const DEFAULT_PROFILE: UserProfile = {
  name: '',
  age: '',
  onboardingCompleted: false,
  theme: 'dark',
  freezeAllowance: 3,
  soundEnabled: true,
  notificationsEnabled: false,
  notificationDisclaimerAcknowledged: false
};

/**
 * Validates an uploaded JSON backup string before import
 */
export function validateBackupPayload(rawText: string): BackupValidationResult {
  try {
    const data = JSON.parse(rawText);

    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Backup is not a valid JSON object.' };
    }

    // Check schema version or allow legacy v1
    const version = typeof data.schemaVersion === 'number' ? data.schemaVersion : 1;

    // Validate habits array
    if (!Array.isArray(data.habits)) {
      return { valid: false, error: 'Invalid backup: "habits" array is missing.' };
    }

    // Validate logs array
    if (!Array.isArray(data.logs)) {
      return { valid: false, error: 'Invalid backup: "logs" array is missing.' };
    }

    const userName = data.profile?.name || 'Friend';

    return {
      valid: true,
      summary: {
        habitsCount: data.habits.length,
        logsCount: data.logs.length,
        notesCount: Array.isArray(data.notes) ? data.notes.length : 0,
        freezesCount: Array.isArray(data.freezes) ? data.freezes.length : 0,
        userName,
        schemaVersion: version
      }
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid JSON format.';
    return { valid: false, error: `JSON Parse Error: ${msg}` };
  }
}

/**
 * Migrates data from schema version 1 to current version 2
 */
export function migrateBackupPayload(raw: Record<string, unknown>): BackupPayload {
  const rawHabits = Array.isArray(raw.habits) ? (raw.habits as Record<string, unknown>[]) : [];
  const rawLogs = Array.isArray(raw.logs) ? (raw.logs as Record<string, unknown>[]) : [];
  const rawFreezes = Array.isArray(raw.freezes) ? (raw.freezes as Record<string, unknown>[]) : [];
  const rawNotes = Array.isArray(raw.notes) ? (raw.notes as Record<string, unknown>[]) : [];

  // Migrate habits: ensure stable IDs and schedule structure
  const habits: Habit[] = rawHabits.map((h, idx) => ({
    id: typeof h.id === 'string' && h.id ? h.id : `habit-${Date.now()}-${idx}`,
    title: typeof h.title === 'string' ? h.title : 'Untitled Habit',
    category: (h.category as Habit['category']) || 'productivity',
    schedule: (h.schedule as Habit['schedule']) || (h.frequency as Habit['schedule']) || { type: 'daily' },
    scheduleHistory: Array.isArray(h.scheduleHistory) ? (h.scheduleHistory as Habit['scheduleHistory']) : undefined,
    scheduleEffectiveFrom:
      typeof h.scheduleEffectiveFrom === 'string'
        ? h.scheduleEffectiveFrom
        : typeof h.createdAt === 'string'
        ? h.createdAt.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    targetUnit: typeof h.targetUnit === 'string' ? h.targetUnit : undefined,
    reminderTime: typeof h.reminderTime === 'string' ? h.reminderTime : undefined,
    notes: typeof h.notes === 'string' ? h.notes : undefined,
    createdAt: typeof h.createdAt === 'string' ? h.createdAt : new Date().toISOString(),
    updatedAt: typeof h.updatedAt === 'string' ? h.updatedAt : new Date().toISOString(),
    archived: Boolean(h.archived),
    archivedAt: typeof h.archivedAt === 'string' ? h.archivedAt : undefined
  }));

  // Migrate logs: ensure stable IDs
  const logs: HabitLog[] = rawLogs.map((l, idx) => ({
    id: typeof l.id === 'string' && l.id ? l.id : `log-${Date.now()}-${idx}`,
    habitId: String(l.habitId),
    date: String(l.date),
    completed: Boolean(l.completed),
    completedAt: typeof l.completedAt === 'string' ? l.completedAt : undefined
  }));

  // Migrate notes: extract any notes embedded in v1 logs if notes array empty
  const notes: JournalNote[] = [...rawNotes.map((n, idx) => ({
    id: typeof n.id === 'string' && n.id ? n.id : `note-${Date.now()}-${idx}`,
    habitId: String(n.habitId),
    date: String(n.date),
    note: String(n.note),
    createdAt: typeof n.createdAt === 'string' ? n.createdAt : new Date().toISOString(),
    updatedAt: typeof n.updatedAt === 'string' ? n.updatedAt : new Date().toISOString()
  }))];

  if (notes.length === 0) {
    rawLogs.forEach((l, idx) => {
      if (typeof l.note === 'string' && l.note.trim()) {
        notes.push({
          id: `note-migrated-${idx}`,
          habitId: String(l.habitId),
          date: String(l.date),
          note: l.note.trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });
  }

  // Migrate freezes
  const freezes: StreakFreeze[] = rawFreezes.map((f, idx) => ({
    id: typeof f.id === 'string' && f.id ? f.id : `freeze-${Date.now()}-${idx}`,
    date: String(f.date),
    habitId: typeof f.habitId === 'string' ? f.habitId : undefined,
    reason: typeof f.reason === 'string' ? f.reason : 'Streak Freeze',
    createdAt: typeof f.createdAt === 'string' ? f.createdAt : new Date().toISOString()
  }));

  const profile: UserProfile = {
    ...DEFAULT_PROFILE,
    ...(typeof raw.profile === 'object' && raw.profile ? (raw.profile as Partial<UserProfile>) : {})
  };

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    appVersion: '2.0.0',
    exportedAt: new Date().toISOString(),
    profile,
    habits,
    logs,
    notes,
    freezes
  };
}

/**
 * Merges incoming backup with existing state (detecting duplicate IDs and enforcing referential integrity)
 */
export function mergeBackupWithState(
  existing: { habits: Habit[]; logs: HabitLog[]; notes: JournalNote[]; freezes: StreakFreeze[] },
  incoming: BackupPayload
): { habits: Habit[]; logs: HabitLog[]; notes: JournalNote[]; freezes: StreakFreeze[] } {
  // Merge habits by ID
  const habitsMap = new Map<string, Habit>();
  existing.habits.forEach((h) => habitsMap.set(h.id, h));
  incoming.habits.forEach((h) => {
    if (habitsMap.has(h.id)) {
      const existingH = habitsMap.get(h.id)!;
      // Combine schedule history
      const combinedHistory = [
        ...(existingH.scheduleHistory || []),
        ...(h.scheduleHistory || [])
      ];
      // Keep habit with newest updatedAt
      const useIncoming = (h.updatedAt || '') >= (existingH.updatedAt || '');
      habitsMap.set(h.id, {
        ...(useIncoming ? h : existingH),
        scheduleHistory: combinedHistory.length > 0 ? combinedHistory : undefined
      });
    } else {
      habitsMap.set(h.id, h);
    }
  });

  const validHabitIds = new Set(habitsMap.keys());

  // Merge logs by habitId + date (preserve referential integrity)
  const logsMap = new Map<string, HabitLog>();
  existing.logs.forEach((l) => {
    if (validHabitIds.has(l.habitId)) logsMap.set(`${l.habitId}_${l.date}`, l);
  });
  incoming.logs.forEach((l) => {
    if (validHabitIds.has(l.habitId)) logsMap.set(`${l.habitId}_${l.date}`, l);
  });

  // Merge notes by habitId + date (preserve referential integrity)
  const notesMap = new Map<string, JournalNote>();
  existing.notes.forEach((n) => {
    if (validHabitIds.has(n.habitId)) notesMap.set(`${n.habitId}_${n.date}`, n);
  });
  incoming.notes.forEach((n) => {
    if (validHabitIds.has(n.habitId)) notesMap.set(`${n.habitId}_${n.date}`, n);
  });

  // Merge freezes by date + habitId
  const freezesMap = new Map<string, StreakFreeze>();
  existing.freezes.forEach((f) => {
    if (!f.habitId || validHabitIds.has(f.habitId)) {
      freezesMap.set(`${f.date}_${f.habitId || 'all'}`, f);
    }
  });
  incoming.freezes.forEach((f) => {
    if (!f.habitId || validHabitIds.has(f.habitId)) {
      freezesMap.set(`${f.date}_${f.habitId || 'all'}`, f);
    }
  });

  return {
    habits: Array.from(habitsMap.values()),
    logs: Array.from(logsMap.values()),
    notes: Array.from(notesMap.values()),
    freezes: Array.from(freezesMap.values())
  };
}

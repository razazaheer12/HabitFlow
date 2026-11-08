import {
  BackupPayload,
  CURRENT_SCHEMA_VERSION,
  Habit,
  HabitLog,
  JournalNote,
  StreakFreeze,
  UserProfile
} from '../types';
import { toLocalDateString } from '../domain/date';
import { DEFAULT_PROFILE, migrateBackupPayload } from './schema';

export const STORAGE_KEYS = {
  SCHEMA_VERSION: 'habitflow_schema_version',
  PROFILE: 'habitflow_profile_v2',
  HABITS: 'habitflow_habits_v2',
  LOGS: 'habitflow_logs_v2',
  NOTES: 'habitflow_notes_v2',
  FREEZES: 'habitflow_freezes_v2'
};

const LEGACY_STORAGE_KEYS = {
  PROFILE: 'habitflow_profile',
  HABITS: 'habitflow_habits',
  LOGS: 'habitflow_logs',
  FREEZES: 'habitflow_freezes'
};

export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Generates a collision-resistant unique ID using crypto.randomUUID with fallback
 */
export function generateUniqueId(prefix: string = 'id'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${randomPart}`;
}

/**
 * Safely parses JSON with automatic corrupted data quarantine
 */
function safeParseJSON<T>(raw: string | null, fallback: T, keyName: string): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[HabitFlow] Corrupted JSON detected for key "${keyName}". Quarantining data.`, err);
    if (isBrowser()) {
      try {
        localStorage.setItem(`habitflow_corrupted_${keyName}_${Date.now()}`, raw);
      } catch {
        // Ignore secondary storage error
      }
    }
    return fallback;
  }
}

/**
 * Safely writes to localStorage with storage quota defense
 */
function safeSetItem(key: string, value: string): boolean {
  if (!isBrowser()) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: unknown) {
    const errorName = err instanceof Error ? err.name : '';
    if (errorName === 'QuotaExceededError' || errorName === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.error('[HabitFlow] LocalStorage quota exceeded. Data could not be persisted.', err);
    } else {
      console.error(`[HabitFlow] Failed to write to localStorage for key "${key}":`, err);
    }
    return false;
  }
}

/**
 * Subscribes to cross-tab storage change events so multiple tabs stay in sync
 */
export function subscribeToCrossTabSync(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key && Object.values(STORAGE_KEYS).includes(e.key)) {
      callback();
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

/**
 * Centralized, hardened Storage Repository implementation
 */
export const LocalStorageRepository = {
  loadProfile(): UserProfile {
    if (!isBrowser()) return DEFAULT_PROFILE;
    const rawV2 = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (rawV2) {
      const parsed = safeParseJSON<Partial<UserProfile>>(rawV2, {}, STORAGE_KEYS.PROFILE);
      return { ...DEFAULT_PROFILE, ...parsed };
    }

    // Check legacy v1 key
    const rawLegacy = localStorage.getItem(LEGACY_STORAGE_KEYS.PROFILE);
    if (rawLegacy) {
      const legacyProfile = safeParseJSON<Partial<UserProfile>>(rawLegacy, {}, LEGACY_STORAGE_KEYS.PROFILE);
      const migrated = { ...DEFAULT_PROFILE, ...legacyProfile };
      this.saveProfile(migrated);
      return migrated;
    }

    return DEFAULT_PROFILE;
  },

  saveProfile(profile: UserProfile): void {
    safeSetItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  loadHabits(): Habit[] {
    if (!isBrowser()) return [];
    const rawV2 = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (rawV2) {
      return safeParseJSON<Habit[]>(rawV2, [], STORAGE_KEYS.HABITS);
    }

    // Fallback: check legacy v1 key
    const rawLegacy = localStorage.getItem(LEGACY_STORAGE_KEYS.HABITS);
    if (rawLegacy) {
      const legacyHabits = safeParseJSON<unknown[]>(rawLegacy, [], LEGACY_STORAGE_KEYS.HABITS);
      if (Array.isArray(legacyHabits) && legacyHabits.length > 0) {
        const migrated = migrateBackupPayload({ habits: legacyHabits });
        this.saveHabits(migrated.habits);
        return migrated.habits;
      }
    }

    return [];
  },

  saveHabits(habits: Habit[]): void {
    safeSetItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  },

  loadLogs(): HabitLog[] {
    if (!isBrowser()) return [];
    const rawV2 = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (rawV2) {
      return safeParseJSON<HabitLog[]>(rawV2, [], STORAGE_KEYS.LOGS);
    }

    // Fallback: check legacy v1 key
    const rawLegacy = localStorage.getItem(LEGACY_STORAGE_KEYS.LOGS);
    if (rawLegacy) {
      const legacyLogs = safeParseJSON<unknown[]>(rawLegacy, [], LEGACY_STORAGE_KEYS.LOGS);
      if (Array.isArray(legacyLogs) && legacyLogs.length > 0) {
        const migrated = migrateBackupPayload({ logs: legacyLogs });
        this.saveLogs(migrated.logs);
        return migrated.logs;
      }
    }

    return [];
  },

  saveLogs(logs: HabitLog[]): void {
    safeSetItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  },

  loadNotes(): JournalNote[] {
    if (!isBrowser()) return [];
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    return safeParseJSON<JournalNote[]>(raw, [], STORAGE_KEYS.NOTES);
  },

  saveNotes(notes: JournalNote[]): void {
    safeSetItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  },

  loadFreezes(): StreakFreeze[] {
    if (!isBrowser()) return [];
    const rawV2 = localStorage.getItem(STORAGE_KEYS.FREEZES);
    if (rawV2) {
      return safeParseJSON<StreakFreeze[]>(rawV2, [], STORAGE_KEYS.FREEZES);
    }

    // Fallback: check legacy v1 key
    const rawLegacy = localStorage.getItem(LEGACY_STORAGE_KEYS.FREEZES);
    if (rawLegacy) {
      const legacyFreezes = safeParseJSON<unknown[]>(rawLegacy, [], LEGACY_STORAGE_KEYS.FREEZES);
      if (Array.isArray(legacyFreezes) && legacyFreezes.length > 0) {
        const migrated = migrateBackupPayload({ freezes: legacyFreezes });
        this.saveFreezes(migrated.freezes);
        return migrated.freezes;
      }
    }

    return [];
  },

  saveFreezes(freezes: StreakFreeze[]): void {
    safeSetItem(STORAGE_KEYS.FREEZES, JSON.stringify(freezes));
  },

  /**
   * Captures an atomic snapshot of current state for rollback defense
   */
  createStorageSnapshot(): BackupPayload {
    return this.exportFullBackup();
  },

  /**
   * Restores state from a snapshot during failed import recovery
   */
  rollbackToSnapshot(snapshot: BackupPayload): void {
    this.saveProfile(snapshot.profile);
    this.saveHabits(snapshot.habits);
    this.saveLogs(snapshot.logs);
    this.saveNotes(snapshot.notes);
    this.saveFreezes(snapshot.freezes);
  },

  exportFullBackup(): BackupPayload {
    const profile = this.loadProfile();
    const habits = this.loadHabits();
    const logs = this.loadLogs();
    const notes = this.loadNotes();
    const freezes = this.loadFreezes();

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
  },

  triggerDownloadBackup(): void {
    const payload = this.exportFullBackup();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitflow-backup-${toLocalDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  clearAllData(): void {
    if (!isBrowser()) return;
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.HABITS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.FREEZES);
  }
};

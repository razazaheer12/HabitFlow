import { Habit } from '../types';
import { toLocalDateString } from '../domain/date';

/**
 * Feature detection for Notification API
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Checks current notification permission state
 */
export function getNotificationPermissionState(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Requests browser notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.error('Failed to request notification permission:', err);
    return false;
  }
}

/**
 * Triggers an immediate browser notification via Service Worker or native constructor
 */
export function sendLocalNotification(title: string, body: string): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/favicon.png',
          tag: 'habitflow-reminder'
        });
      });
    } else {
      new Notification(title, {
        body,
        icon: '/pwa-192x192.png'
      });
    }
  } catch (err) {
    console.warn('Notification trigger caught:', err);
  }
}

/**
 * Checks active habit reminder times against local device clock (runs every 30 seconds)
 */
export function checkHabitReminders(
  habits: Habit[],
  onReminderTrigger?: (habit: Habit) => void
): void {
  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeString = `${currentHours}:${currentMinutes}`;
  const today = toLocalDateString();

  const sessionSentKey = `habitflow_reminded_${today}`;
  let alreadySent: string[] = [];
  try {
    // Prune reminder dedupe keys from previous days so sessionStorage does not
    // grow unbounded across long-lived sessions.
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('habitflow_reminded_') && key !== sessionSentKey) {
        sessionStorage.removeItem(key);
      }
    }
    alreadySent = JSON.parse(sessionStorage.getItem(sessionSentKey) || '[]');
  } catch {
    alreadySent = [];
  }

  habits.forEach((habit) => {
    if (habit.archived || !habit.reminderTime) return;

    if (habit.reminderTime === currentTimeString && !alreadySent.includes(habit.id)) {
      sendLocalNotification(
        `Reminder: ${habit.title}`,
        habit.notes || `Scheduled for ${habit.reminderTime}. Take a moment to complete it!`
      );
      if (onReminderTrigger) onReminderTrigger(habit);

      alreadySent.push(habit.id);
      try {
        sessionStorage.setItem(sessionSentKey, JSON.stringify(alreadySent));
      } catch {
        // ignore
      }
    }
  });
}

/**
 * Procedural Audio Chimes via Web Audio API (Zero external assets needed)
 */
export function playChime(type: 'success' | 'streak' | 'freeze' = 'success'): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'success') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.16); // G5
      osc2.frequency.setValueAtTime(659.25, now); // E5 harmony layer

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
      osc1.onended = () => ctx.close();
    } else if (type === 'streak') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
      osc.onended = () => ctx.close();
    } else if (type === 'freeze') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440.00, now); // A4
      osc.frequency.exponentialRampToValueAtTime(349.23, now + 0.2); // F4
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
      osc.onended = () => ctx.close();
    }
  } catch {
    // Audio autoplay or sandbox policy
  }
}

import React, { useEffect, useState } from 'react';
import {
  X,
  User,
  Bell,
  Volume2,
  VolumeX,
  Download,
  RotateCcw,
  ShieldCheck,
  Check,
  Info,
  Archive
} from 'lucide-react';
import { UserProfile } from '../types';
import {
  isNotificationSupported,
  requestNotificationPermission,
  sendLocalNotification,
  playChime
} from '../notifications/service';
import { useModalA11y } from './useModalA11y';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onResetData: () => void;
  onOpenBackupModal: () => void;
  showArchived: boolean;
  onToggleShowArchived: () => void;
  archivedCount: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onResetData,
  onOpenBackupModal,
  showArchived,
  onToggleShowArchived,
  archivedCount
}) => {
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState<number | ''>(profile.age ?? '');
  const [freezeAllowance, setFreezeAllowance] = useState<number>(profile.freezeAllowance || 3);
  const [soundEnabled, setSoundEnabled] = useState(profile.soundEnabled);
  const [notifGranted, setNotifGranted] = useState(
    isNotificationSupported() && Notification.permission === 'granted'
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  // BUG-9 fix: keep the form in sync with the authoritative profile whenever
  // the modal is (re)opened, so edits made elsewhere are never shown stale.
  useEffect(() => {
    if (!isOpen) return;
    setName(profile.name);
    setAge(profile.age ?? '');
    setFreezeAllowance(profile.freezeAllowance || 3);
    setSoundEnabled(profile.soundEnabled);
    setNotifGranted(isNotificationSupported() && Notification.permission === 'granted');
    setSaveSuccess(false);
  }, [isOpen, profile]);

  const dialogRef = useModalA11y<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim() || 'Champion',
      age: age ? Number(age) : undefined,
      freezeAllowance: Number(freezeAllowance),
      soundEnabled
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifGranted(granted);
    if (granted) {
      sendLocalNotification(
        'HabitFlow Reminders Enabled',
        'You will receive in-app and browser alerts for scheduled habits.'
      );
      onUpdateProfile({ notificationsEnabled: true });
    }
  };

  const handleTestSound = () => {
    playChime('streak');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        tabIndex={-1}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-5">
          <h2 id="settings-modal-title" className="text-xl font-bold text-white tracking-tight">App Settings & Data</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Personal Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label htmlFor="settings-name-input" className="text-xs font-medium text-slate-300">Name</label>
                <input
                  id="settings-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="settings-age-input" className="text-xs font-medium text-slate-300">
                  Age <span className="text-slate-500 text-[11px]">(optional)</span>
                </label>
                <input
                  id="settings-age-input"
                  type="number"
                  min="5"
                  max="120"
                  placeholder="Optional"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="settings-freeze-allowance" className="text-xs font-medium text-slate-300">
                Monthly Streak Freeze Allowance
              </label>
              <select
                id="settings-freeze-allowance"
                value={freezeAllowance}
                onChange={(e) => setFreezeAllowance(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value={2}>2 freezes per month (Strict)</option>
                <option value={3}>3 freezes per month (Recommended)</option>
                <option value={5}>5 freezes per month (Flexible)</option>
                <option value={10}>10 freezes per month (High Travel)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">All data stored locally on your device</span>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                {saveSuccess ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                <span>{saveSuccess ? 'Saved' : 'Update Profile'}</span>
              </button>
            </div>
          </form>

          {/* Notifications & Reminders Limitations Banner */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              Reminders & Audio
            </h3>

            {/* Reminder Architecture Limitation Banner */}
            <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Local-Only Architecture Notice</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                HabitFlow is 100% local — no servers, no accounts, no tracking. Because of that,
                reminders only fire while the app is open in a browser tab or PWA window. Browsers
                may suspend a backgrounded or closed PWA, so delivery is not guaranteed when the app
                isn't running. Keep HabitFlow open (or installed and running) for reminders.
              </p>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-white block">Push Notifications</span>
                <span className="text-[11px] text-slate-400 block">
                  {notifGranted
                    ? 'Browser notification permission granted'
                    : 'Receive notifications at scheduled habit reminder times'}
                </span>
              </div>

              {notifGranted ? (
                <button
                  type="button"
                  onClick={() => sendLocalNotification('HabitFlow Reminder Test', 'This is a test reminder alert!')}
                  className="px-3 py-1.5 rounded-xl bg-slate-700 text-xs font-medium text-slate-200 hover:text-white transition cursor-pointer"
                >
                  Test Alert
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestNotifications}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition cursor-pointer"
                >
                  Enable
                </button>
              )}
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-white block">Completion Audio Chimes</span>
                <span className="text-[11px] text-slate-400 block">
                  Subtle audio feedback on habit check-off & streak milestones
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestSound}
                  className="px-2.5 py-1 rounded-lg bg-slate-700 text-[11px] text-slate-300 hover:text-white transition cursor-pointer"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = !soundEnabled;
                    setSoundEnabled(next);
                    onUpdateProfile({ soundEnabled: next });
                  }}
                  className={`p-2 rounded-xl transition cursor-pointer ${
                    soundEnabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Habit Archive & Backup Management */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Data & Archives
            </h3>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-white block flex items-center gap-1.5">
                  <Archive className="w-3.5 h-3.5 text-amber-400" />
                  <span>Archived Habits ({archivedCount})</span>
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Show or hide archived habits in the library
                </span>
              </div>

              <button
                type="button"
                onClick={onToggleShowArchived}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  showArchived
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                {showArchived ? 'Showing' : 'Hidden'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBackupModal();
              }}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-white border border-slate-700 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Open JSON Backup & Recovery Panel</span>
            </button>
          </div>

          {/* Reset / Clear Data */}
          <div className="pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                // App renders an accessible confirmation dialog before clearing.
                onResetData();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All Habits & Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Download, Bell, Archive, Smartphone, ChevronRight } from 'lucide-react';
import { useAppState } from '../state/AppStateContext';

interface RowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  trailing?: React.ReactNode;
}

const Row: React.FC<RowProps> = ({ icon, title, description, onClick, trailing }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-surface border border-border hover:border-border-strong hover:shadow-card transition cursor-pointer text-left group"
  >
    <div className="w-9 h-9 rounded-xl bg-accent-soft border border-accent-border flex items-center justify-center text-accent-text shrink-0">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-sm font-semibold text-ink">{title}</div>
      <div className="text-xs text-ink-secondary mt-0.5 leading-relaxed">{description}</div>
    </div>
    {trailing ?? <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-ink-secondary transition shrink-0" />}
  </button>
);

/**
 * STAGE 4 — Dedicated Settings route. Organized sections that reuse the
 * existing Settings / Backup / PWA-install components and preserve the local
 * JSON backup engine and archived-habit management.
 */
export const SettingsPage: React.FC = () => {
  const { profile, archivedCount, showArchived, setShowArchived, openSettingsModal, openBackupModal, openPWAInstallModal } =
    useAppState();
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink tracking-tight">Settings</h1>
        <p className="text-xs text-ink-secondary mt-0.5">
          Profile, preferences, notifications, backup and installed-app options — all stored locally on this device.
        </p>
      </div>

      <section className="space-y-2.5">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted px-1">Profile & Preferences</h2>
        <Row
          icon={<Settings className="w-4 h-4" />}
          title="Profile & Freeze Allowance"
          description={`Signed in as ${profile.name || 'Anonymous'} · ${profile.freezeAllowance} freeze tokens / month`}
          onClick={openSettingsModal}
        />
      </section>

      <section className="space-y-2.5">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted px-1">Notifications & Sound</h2>
        <Row
          icon={<Bell className="w-4 h-4" />}
          title="Reminders & Chimes"
          description={`Notifications ${profile.notificationsEnabled ? 'on' : 'off'} · Sound ${profile.soundEnabled ? 'on' : 'off'}`}
          onClick={openSettingsModal}
        />
      </section>

      <section className="space-y-2.5">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted px-1">Backup & Recovery</h2>
        <Row
          icon={<Download className="w-4 h-4" />}
          title="JSON Backup & Restore"
          description="Export a full local snapshot or restore from a previously exported file."
          onClick={openBackupModal}
        />
      </section>

      <section className="space-y-2.5">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted px-1">App</h2>
        <Row
          icon={<Smartphone className="w-4 h-4" />}
          title="Install HabitFlow"
          description="Add HabitFlow to your home screen for a full-screen, offline-capable experience."
          onClick={openPWAInstallModal}
        />
        <Row
          icon={<Archive className="w-4 h-4 text-warning" />}
          title="Archived Habits"
          description={showArchived ? 'Currently shown in the Habits library.' : `${archivedCount} archived · hidden from the library.`}
          onClick={() => {
            setShowArchived(true);
            navigate('/habits');
          }}
        />
      </section>
    </div>
  );
};

import React, { useState } from 'react';
import { User, Calendar, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';
import { useModalA11y } from './useModalA11y';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile) => void;
}

const INPUT_CLASS =
  'w-full px-4 py-2.5 rounded-xl bg-surface border border-border-strong text-ink placeholder-ink-muted focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/15 text-sm transition';

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>(''); // Optional, no DOB collected
  const [error, setError] = useState('');
  const dialogRef = useModalA11y<HTMLDivElement>(isOpen);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name to personalize your dashboard.');
      return;
    }

    if (age !== '' && (Number(age) < 5 || Number(age) > 120)) {
      setError('Please enter an age between 5 and 120, or leave it blank.');
      return;
    }

    onComplete({
      name: name.trim(),
      age: age === '' ? undefined : Number(age),
      onboardingCompleted: true,
      theme: 'dark',
      freezeAllowance: 3,
      soundEnabled: true,
      notificationsEnabled: false,
      notificationDisclaimerAcknowledged: false
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        tabIndex={-1}
        className="w-full max-w-md bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-modal relative animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <img src="/logo.png" alt="" aria-hidden="true" className="w-10 h-10 object-contain select-none" />
            <div>
              <span className="text-xs font-semibold tracking-[0.08em] uppercase text-accent-text">Welcome to HabitFlow</span>
              <h2 id="onboarding-title" className="text-2xl font-bold text-ink tracking-tight">Build Lasting Habits</h2>
            </div>
          </div>

          <p className="text-sm text-ink-secondary mb-6 leading-relaxed">
            Track daily progress, preserve streaks on busy days with streak freezes, and micro-journal
            reflections. Everything stays 100% private on your device — no account required.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error && (
              <div role="alert" className="p-3 text-xs rounded-xl bg-error-bg border border-error-border text-error font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="onboard-name" className="text-sm font-medium text-ink-secondary flex items-center gap-1.5">
                <User className="w-4 h-4 text-ink-muted" />
                Your Name <span className="text-error" aria-hidden="true">*</span>
              </label>
              <input
                id="onboard-name"
                type="text"
                required
                autoFocus
                autoComplete="given-name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                className={INPUT_CLASS}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="onboard-age" className="text-sm font-medium text-ink-secondary flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-ink-muted" />
                Your Age <span className="text-ink-muted text-xs font-normal">(optional)</span>
              </label>
              <input
                id="onboard-age"
                type="number"
                min="5"
                max="120"
                inputMode="numeric"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value ? Number(e.target.value) : '');
                  if (error) setError('');
                }}
                className={INPUT_CLASS}
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 h-12 rounded-xl bg-accent hover:bg-accent-hover active:scale-[0.98] text-ink-on-accent font-semibold text-sm flex items-center justify-center gap-2 shadow-card transition-all cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-xs text-ink-secondary text-center leading-relaxed">
              You'll start with a clean dashboard — create your first habit in one tap.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

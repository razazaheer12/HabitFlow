import React, { useState } from 'react';
import { Sparkles, User, Calendar, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';
import { useModalA11y } from './useModalA11y';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile) => void;
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        tabIndex={-1}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Ambient lighting accents */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400">Welcome to HabitFlow</span>
              <h2 id="onboarding-title" className="text-2xl font-bold text-white">Build Lasting Habits</h2>
            </div>
          </div>

          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Track daily progress, preserve streaks on busy days with streak freezes, and micro-journal
            reflections. Everything stays 100% private on your device — no account required.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error && (
              <div role="alert" className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="onboard-name" className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                Your Name <span className="text-rose-400" aria-hidden="true">*</span>
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
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="onboard-age" className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                Your Age <span className="text-slate-500 text-xs font-normal">(optional)</span>
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
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm transition"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-xs text-slate-500 text-center leading-relaxed">
              You'll start with a clean dashboard — create your first habit in one tap.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

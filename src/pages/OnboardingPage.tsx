import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingModal } from '../components/OnboardingModal';
import { useAppState } from '../state/AppStateContext';
import { triggerStreakCelebration } from '../utils/confetti';
import { UserProfile } from '../types';

/**
 * STAGE 4 — Mandatory onboarding route. Collects only Name (+ optional Age),
 * never seeds habits or artificial history. The AppShell hides all navigation
 * while onboarding is incomplete and redirects here from any other route;
 * completed users hitting /onboarding are redirected to the root dashboard.
 */
export const OnboardingPage: React.FC = () => {
  const { updateProfile } = useAppState();
  const navigate = useNavigate();

  const handleComplete = (newProfile: UserProfile) => {
    updateProfile(newProfile);
    triggerStreakCelebration();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <OnboardingModal isOpen onComplete={handleComplete} />
    </div>
  );
};

import React, { useState } from 'react';
import { Download, Smartphone, X, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

interface PWAInstallButtonProps {
  onOpenModal?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ onOpenModal }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 h-11 rounded-xl bg-surface border border-border hover:border-border-strong text-ink-secondary hover:text-ink active:scale-[0.98] text-xs font-semibold shadow-card transition cursor-pointer whitespace-nowrap"
        title="Install App"
      >
        <Download className="w-3.5 h-3.5" strokeWidth={2.5} />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 h-11 rounded-xl border border-border bg-surface text-ink-secondary hover:text-ink hover:border-border-strong text-xs font-medium transition cursor-pointer whitespace-nowrap"
        >
          <Smartphone className="w-3.5 h-3.5 text-ink-muted" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-surface border border-border p-6 shadow-modal relative animate-in fade-in zoom-in-95">
              <button
                onClick={() => setShowIOSGuide(false)}
                aria-label="Close"
                className="absolute top-4 right-4 text-ink-muted hover:text-ink transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-base font-bold text-ink tracking-tight mb-2">Install on iPhone / iPad</h3>
              <p className="text-xs text-ink-secondary mb-4 leading-relaxed">
                Add HabitFlow directly to your home screen for instant offline access:
              </p>
              <div className="space-y-2.5 text-xs text-ink-secondary bg-bg-secondary p-3.5 rounded-2xl border border-border">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-accent-soft border border-accent-border text-accent-text flex items-center justify-center font-bold text-xs shrink-0">1</span>
                  <span>Tap the <Share className="w-3.5 h-3.5 inline text-info-fill mx-1" /> <strong className="text-ink">Share</strong> button in Safari toolbar</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-accent-soft border border-accent-border text-accent-text flex items-center justify-center font-bold text-xs shrink-0">2</span>
                  <span>Scroll down &amp; tap <PlusSquare className="w-3.5 h-3.5 inline text-accent-text mx-1" /> <strong className="text-ink">Add to Home Screen</strong></span>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-accent py-2.5 min-h-[44px] text-xs font-semibold text-ink-on-accent hover:bg-accent-hover active:scale-[0.98] transition cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Ambient install affordance for browsers that don't emit beforeinstallprompt immediately
  return (
    <button
      onClick={() => {
        if (onOpenModal) {
          onOpenModal();
        } else {
          setShowIOSGuide(true);
        }
      }}
      className="hidden sm:flex items-center gap-1.5 px-3 h-11 rounded-xl border border-border bg-surface text-ink-secondary hover:text-ink hover:border-border-strong text-xs font-medium shadow-card transition cursor-pointer whitespace-nowrap"
      title="Install as Progressive Web App"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Install PWA</span>
    </button>
  );
};

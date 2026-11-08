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
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs font-semibold shadow-sm transition cursor-pointer whitespace-nowrap"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer whitespace-nowrap"
        >
          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-base font-bold text-white tracking-tight mb-2">Install on iPhone / iPad</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Add HabitFlow directly to your home screen for instant offline access:
              </p>
              <div className="space-y-2.5 text-xs text-slate-300 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[11px]">1</span>
                  <span>Tap the <Share className="w-3.5 h-3.5 inline text-sky-400 mx-1" /> <strong>Share</strong> button in Safari toolbar</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[11px]">2</span>
                  <span>Scroll down &amp; tap <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400 mx-1" /> <strong>Add to Home Screen</strong></span>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition cursor-pointer"
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
      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 text-xs font-medium transition cursor-pointer whitespace-nowrap"
      title="Install as Progressive Web App"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Install PWA</span>
    </button>
  );
};

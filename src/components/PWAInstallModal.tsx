import React, { useEffect, useState } from 'react';
import { X, Download, Share, PlusSquare, MoreVertical, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';
import { useModalA11y } from './useModalA11y';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const dialogRef = useModalA11y<HTMLDivElement>(isOpen, onClose);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios');
    } else if (/android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }
  }, []);

  if (!isOpen) return null;

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
        aria-labelledby="pwa-install-title"
        tabIndex={-1}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 id="pwa-install-title" className="text-base font-bold text-white tracking-tight">Install HabitFlow PWA</h3>
              <p className="text-xs text-slate-400">Offline-ready native app experience</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {isInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>HabitFlow is already installed and running in standalone mode!</span>
            </div>
          ) : isInstallable ? (
            <div className="space-y-3">
              <p className="text-slate-300 leading-relaxed">
                Click below to add HabitFlow directly to your home screen or desktop application launcher.
              </p>
              <button
                onClick={async () => {
                  await install();
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Install Directly Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Platform Selector Tabs */}
              <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700">
                <button
                  onClick={() => setPlatform('ios')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                    platform === 'ios' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  iOS (Safari)
                </button>
                <button
                  onClick={() => setPlatform('android')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                    platform === 'android' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Android (Chrome)
                </button>
                <button
                  onClick={() => setPlatform('desktop')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                    platform === 'desktop' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Desktop
                </button>
              </div>

              {platform === 'ios' && (
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5 text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[11px] text-white">1</span>
                    <span>Tap the <Share className="w-3.5 h-3.5 inline text-sky-400 mx-1" /> <strong>Share</strong> icon in the Safari bottom toolbar.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[11px] text-white">2</span>
                    <span>Scroll down and select <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400 mx-1" /> <strong>Add to Home Screen</strong>.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[11px] text-white">3</span>
                    <span>Confirm by tapping <strong>Add</strong> in the top right corner.</span>
                  </div>
                </div>
              )}

              {platform === 'android' && (
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5 text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[11px] text-white">1</span>
                    <span>Tap the <MoreVertical className="w-3.5 h-3.5 inline text-slate-300 mx-1" /> <strong>three dots</strong> menu in Chrome.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[11px] text-white">2</span>
                    <span>Select <Download className="w-3.5 h-3.5 inline text-emerald-400 mx-1" /> <strong>Install App</strong> or <strong>Add to Home Screen</strong>.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[11px] text-white">3</span>
                    <span>Tap <strong>Install</strong> to launch like a native application.</span>
                  </div>
                </div>
              )}

              {platform === 'desktop' && (
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2.5 text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[11px] text-white">1</span>
                    <span>In Chrome or Edge, click the <strong>Install</strong> icon in the address bar.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[11px] text-white">2</span>
                    <span>Click <strong>Install</strong> to open HabitFlow in a standalone window.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

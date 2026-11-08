import React, { useEffect, useState } from 'react';
import { X, Download, Share, PlusSquare, MoreVertical, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';
import { useModalA11y } from './useModalA11y';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEP_BADGE =
  'w-5 h-5 rounded-full bg-accent-soft border border-accent-border text-accent-text flex items-center justify-center font-bold text-xs shrink-0';

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

  const tabClass = (active: boolean) =>
    `flex-1 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
      active ? 'bg-accent text-ink-on-accent shadow-card' : 'text-ink-secondary hover:text-ink'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
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
        className="w-full max-w-md bg-surface border border-border rounded-3xl p-6 shadow-modal relative animate-in fade-in zoom-in-95"
      >
        <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-soft border border-accent-border flex items-center justify-center text-accent-text">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 id="pwa-install-title" className="text-base font-bold text-ink tracking-tight">Install HabitFlow PWA</h3>
              <p className="text-xs text-ink-secondary">Offline-ready native app experience</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-xl bg-bg-secondary text-ink-muted hover:text-ink hover:bg-border flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {isInstalled ? (
            <div className="p-4 rounded-2xl bg-success-bg border border-success-border text-success flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-success-fill" />
              <span>HabitFlow is already installed and running in standalone mode!</span>
            </div>
          ) : isInstallable ? (
            <div className="space-y-3">
              <p className="text-ink-secondary leading-relaxed">
                Click below to add HabitFlow directly to your home screen or desktop application launcher.
              </p>
              <button
                onClick={async () => {
                  await install();
                  onClose();
                }}
                className="w-full py-3 min-h-[44px] rounded-xl bg-accent hover:bg-accent-hover text-ink-on-accent font-bold text-xs shadow-card active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" strokeWidth={2.5} />
                <span>Install Directly Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Platform Selector Tabs */}
              <div className="flex rounded-xl bg-bg-secondary p-1 border border-border">
                <button onClick={() => setPlatform('ios')} className={tabClass(platform === 'ios')}>
                  iOS (Safari)
                </button>
                <button onClick={() => setPlatform('android')} className={tabClass(platform === 'android')}>
                  Android (Chrome)
                </button>
                <button onClick={() => setPlatform('desktop')} className={tabClass(platform === 'desktop')}>
                  Desktop
                </button>
              </div>

              {platform === 'ios' && (
                <div className="p-3.5 rounded-2xl bg-bg-secondary border border-border space-y-2.5 text-ink-secondary">
                  <div className="flex items-center gap-2.5">
                    <span className={STEP_BADGE}>1</span>
                    <span>Tap the <Share className="w-3.5 h-3.5 inline text-info-fill mx-1" /> <strong className="text-ink">Share</strong> icon in the Safari bottom toolbar.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className={STEP_BADGE}>2</span>
                    <span>Scroll down and select <PlusSquare className="w-3.5 h-3.5 inline text-accent-text mx-1" /> <strong className="text-ink">Add to Home Screen</strong>.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className={STEP_BADGE}>3</span>
                    <span>Confirm by tapping <strong className="text-ink">Add</strong> in the top right corner.</span>
                  </div>
                </div>
              )}

              {platform === 'android' && (
                <div className="p-3.5 rounded-2xl bg-bg-secondary border border-border space-y-2.5 text-ink-secondary">
                  <div className="flex items-center gap-2.5">
                    <span className={STEP_BADGE}>1</span>
                    <span>Tap the <MoreVertical className="w-3.5 h-3.5 inline text-ink-secondary mx-1" /> <strong className="text-ink">three dots</strong> menu in Chrome.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className={STEP_BADGE}>2</span>
                    <span>Select <Download className="w-3.5 h-3.5 inline text-accent-text mx-1" /> <strong className="text-ink">Install App</strong> or <strong className="text-ink">Add to Home Screen</strong>.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className={STEP_BADGE}>3</span>
                    <span>Tap <strong className="text-ink">Install</strong> to launch like a native application.</span>
                  </div>
                </div>
              )}

              {platform === 'desktop' && (
                <div className="p-3.5 rounded-2xl bg-bg-secondary border border-border space-y-2.5 text-ink-secondary">
                  <div className="flex items-center gap-2.5">
                    <span className={STEP_BADGE}>1</span>
                    <span>In Chrome or Edge, click the <strong className="text-ink">Install</strong> icon in the address bar.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className={STEP_BADGE}>2</span>
                    <span>Click <strong className="text-ink">Install</strong> to open HabitFlow in a standalone window.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 min-h-[44px] rounded-xl bg-bg-secondary hover:bg-border text-ink-secondary hover:text-ink font-semibold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

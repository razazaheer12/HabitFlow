import confetti from 'canvas-confetti';

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function triggerStreakCelebration(): void {
  if (prefersReducedMotion()) return;
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b', '#ec4899']
    });
  } catch {
    // Canvas confetti not available
  }
}

export function triggerAllCompletedCelebration(): void {
  if (prefersReducedMotion()) return;
  try {
    const end = Date.now() + 1.2 * 1000;
    const colors = ['#10b981', '#34d399', '#6ee7b7', '#06b6d4'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch {
    // Ignore
  }
}

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
      colors: ['#B8E65A', '#8CC63F', '#263629', '#E0A43C', '#4E9BC8']
    });
  } catch {
    // Canvas confetti not available
  }
}

export function triggerAllCompletedCelebration(): void {
  if (prefersReducedMotion()) return;
  try {
    const end = Date.now() + 1.2 * 1000;
    const colors = ['#B8E65A', '#A5D644', '#8CC63F', '#7CB92E'];

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

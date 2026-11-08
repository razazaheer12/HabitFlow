import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement
  );
}

/**
 * Wires dialog accessibility into a modal container: initial focus, Tab focus
 * trapping, Escape-to-close, and focus restoration to the invoking element.
 * The returned ref must be attached to the element carrying role="dialog".
 */
export function useModalA11y<T extends HTMLElement>(
  isOpen: boolean,
  onClose?: () => void
): React.RefObject<T | null> {
  const containerRef = useRef<T>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    restoreRef.current = document.activeElement as HTMLElement | null;
    const container = containerRef.current;

    const frame = requestAnimationFrame(() => {
      if (!container) return;
      const active = document.activeElement;
      // Respect an element that already autofocused within the dialog.
      if (active && active !== document.body && container.contains(active)) return;
      const focusables = getFocusable(container);
      (focusables[0] || container).focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (!closeRef.current) return;
        event.stopPropagation();
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab' || !container) return;
      const focusables = getFocusable(container);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown, true);
      const restoreTarget = restoreRef.current;
      if (restoreTarget && document.contains(restoreTarget)) restoreTarget.focus();
    };
  }, [isOpen]);

  return containerRef;
}

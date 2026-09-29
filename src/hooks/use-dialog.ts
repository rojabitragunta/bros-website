"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let lockCount = 0;

/**
 * Accessible dialog behaviour: focus trap, Escape to close, body scroll lock
 * and focus restoration to the element that opened the dialog.
 */
export function useDialog<T extends HTMLElement>(open: boolean, onClose: () => void, opts?: { initialFocus?: string }) {
  const ref = useRef<T>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const node = ref.current;

    // Scroll lock (ref-counted so stacked dialogs behave)
    if (lockCount++ === 0) {
      const sbw = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = sbw ? `${sbw}px` : "";
    }

    const focusFirst = () => {
      if (!node) return;
      const target =
        (opts?.initialFocus && node.querySelector<HTMLElement>(opts.initialFocus)) ||
        node.querySelector<HTMLElement>(FOCUSABLE) ||
        node;
      target.focus({ preventScroll: true });
    };
    const raf = requestAnimationFrame(focusFirst);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      if (--lockCount === 0) {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, opts?.initialFocus]);

  return ref;
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  releaseDialogLock,
  releaseDialogLockIfSpurious,
} from "@/lib/ui/release-dialog-lock";

/**
 * Safety net: after route changes and on first interaction, clear stuck
 * Radix scroll/pointer locks that block the whole app (ficha financeira).
 */
export function DialogLockGuard() {
  const pathname = usePathname();

  useEffect(() => {
    releaseDialogLock();
    const timers = [0, 50, 150, 400].map((ms) =>
      window.setTimeout(releaseDialogLock, ms)
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [pathname]);

  useEffect(() => {
    const onInteract = () => releaseDialogLockIfSpurious();
    document.addEventListener("pointerdown", onInteract, true);
    document.addEventListener("keydown", onInteract, true);
    document.addEventListener("focusin", onInteract, true);
    const id = window.setInterval(releaseDialogLockIfSpurious, 800);
    return () => {
      document.removeEventListener("pointerdown", onInteract, true);
      document.removeEventListener("keydown", onInteract, true);
      document.removeEventListener("focusin", onInteract, true);
      window.clearInterval(id);
    };
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  releaseDialogLock,
  releaseDialogLockIfSpurious,
} from "@/lib/ui/release-dialog-lock";

/**
 * Limpa pointer-events grudado no body após troca de rota / interação.
 * Não remove nós do Radix (isso gerava loop infinito de setState).
 */
export function DialogLockGuard() {
  const pathname = usePathname();

  useEffect(() => {
    releaseDialogLock();
    const t = window.setTimeout(releaseDialogLock, 100);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    const onInteract = () => releaseDialogLockIfSpurious();
    document.addEventListener("pointerdown", onInteract, true);
    document.addEventListener("keydown", onInteract, true);
    return () => {
      document.removeEventListener("pointerdown", onInteract, true);
      document.removeEventListener("keydown", onInteract, true);
    };
  }, []);

  return null;
}

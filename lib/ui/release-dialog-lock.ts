/**
 * Radix Dialog/Sheet (react-remove-scroll) sets `pointer-events: none` on
 * <body> while open. Soft-nav mid-open can leave the style stuck.
 *
 * NÃO remova portais/overlays do DOM aqui — o React/Radix é dono desses
 * nós; remove-los causa "Maximum update depth exceeded" e trava a UI.
 */
export function releaseDialogLock() {
  if (typeof document === "undefined") return;

  const body = document.body;
  const html = document.documentElement;

  for (const el of [body, html]) {
    el.style.pointerEvents = "";
    el.style.removeProperty("pointer-events");
    el.style.removeProperty("overflow");
    el.style.removeProperty("padding-right");
    el.style.removeProperty("margin-right");
    el.removeAttribute("data-scroll-locked");
    el.removeAttribute("inert");
  }

  const hasOpenDialog = Boolean(
    document.querySelector(
      '[role="dialog"][data-state="open"], [data-radix-dialog-content][data-state="open"]'
    )
  );
  if (hasOpenDialog) return;

  // Só limpa aria-hidden/inert grudados nos filhos diretos do body
  // (hideOthers), sem tocar em portais Radix.
  Array.from(body.children).forEach((child) => {
    if (!(child instanceof HTMLElement)) return;
    if (child.hasAttribute("data-radix-portal")) return;
    if (child.querySelector?.('[data-state="open"][role="dialog"]')) return;
    if (child.getAttribute("aria-hidden") === "true") {
      child.removeAttribute("aria-hidden");
      child.removeAttribute("data-aria-hidden");
    }
    if (child.hasAttribute("inert")) child.removeAttribute("inert");
    if (child.style.pointerEvents === "none") {
      child.style.pointerEvents = "";
      child.style.removeProperty("pointer-events");
    }
  });
}

/** True when UI looks locked with no open dialog — safe to force-unlock. */
export function isSpuriousDialogLock(): boolean {
  if (typeof document === "undefined") return false;
  const open = document.querySelector(
    '[role="dialog"][data-state="open"], [data-radix-dialog-content][data-state="open"]'
  );
  if (open) return false;
  const pe = document.body.style.pointerEvents;
  if (pe === "none") return true;
  if (document.body.hasAttribute("data-scroll-locked")) return true;
  return false;
}

export function releaseDialogLockIfSpurious() {
  if (isSpuriousDialogLock()) releaseDialogLock();
}

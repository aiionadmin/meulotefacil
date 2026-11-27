/**
 * Radix Dialog/Sheet (react-remove-scroll) sets `pointer-events: none` on
 * <body> while open and may aria-hide siblings. Navigating away mid-open
 * (ex.: link "Ficha financeira") leaves the lock — clicks and keyboard die.
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

  // Orphan overlays / portals after abrupt unmount
  document
    .querySelectorAll(
      "[data-radix-dialog-overlay], [data-mlf-sheet-overlay], [data-radix-portal]"
    )
    .forEach((node) => {
      const openInside = node.querySelector?.(
        '[data-state="open"][role="dialog"], [data-radix-dialog-content][data-state="open"]'
      );
      if (!openInside) node.remove();
    });

  // hideOthers leftovers on body children (app shell stuck aria-hidden/inert)
  Array.from(body.children).forEach((child) => {
    if (!(child instanceof HTMLElement)) return;
    if (child.querySelector('[data-state="open"][role="dialog"]')) return;
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
  if (document.querySelector("[data-radix-dialog-overlay]")) return true;
  // App root aria-hidden with no dialog
  const stuck = Array.from(document.body.children).some(
    (c) =>
      c instanceof HTMLElement &&
      c.getAttribute("aria-hidden") === "true" &&
      !c.querySelector('[role="dialog"]')
  );
  return stuck;
}

export function releaseDialogLockIfSpurious() {
  if (isSpuriousDialogLock()) releaseDialogLock();
}

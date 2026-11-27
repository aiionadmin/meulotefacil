/**
 * Radix Dialog/Sheet sets `pointer-events: none` on <body> while open.
 * Navigating away (Link inside sheet) or unmounting mid-open can leave
 * the style stuck — UI looks fine but nothing is clickable.
 */
export function releaseDialogLock() {
  if (typeof document === "undefined") return;
  const body = document.body;
  body.style.pointerEvents = "";
  body.style.removeProperty("pointer-events");
  body.removeAttribute("data-scroll-locked");
  // removeScroll / React Remove Scroll leftovers
  if (body.style.overflow === "hidden") {
    body.style.overflow = "";
  }
  const paddingRight = body.style.paddingRight;
  if (paddingRight) body.style.paddingRight = "";
}

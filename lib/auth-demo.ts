export const DEMO_COOKIE = "mlf_demo_session";

export function setDemoSession() {
  document.cookie = `${DEMO_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearDemoSession() {
  document.cookie = `${DEMO_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function hasDemoSession() {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c === `${DEMO_COOKIE}=1`);
}

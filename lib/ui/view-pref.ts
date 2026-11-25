/** Preferências de visão por usuário/sessão — sem localStorage (Bloco A/C). */

const prefs = new Map<string, string>();

export function getViewPref<T extends string>(
  key: string,
  fallback: T
): T {
  const v = prefs.get(key);
  return (v as T) ?? fallback;
}

export function setViewPref(key: string, value: string) {
  prefs.set(key, value);
}

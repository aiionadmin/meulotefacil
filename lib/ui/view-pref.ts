/** Preferências de visão Kanban|Lista — memória + hidratação do store `ui` (C18). */

const prefs = new Map<string, string>();

export function getViewPref<T extends string>(key: string, fallback: T): T {
  const v = prefs.get(key);
  return (v as T) ?? fallback;
}

export function setViewPref(key: string, value: string) {
  prefs.set(key, value);
}

export function hydrateViewPrefs(map: Record<string, string>) {
  for (const [k, v] of Object.entries(map)) {
    if (v) prefs.set(k, v);
  }
}

export function snapshotViewPrefs(): Record<string, string> {
  return Object.fromEntries(prefs.entries());
}

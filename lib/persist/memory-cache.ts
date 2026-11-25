import type { StoreKey } from "./store-keys";

/** Cache em memória no processo (dev sem Supabase). Sem localStorage. */
const memory = new Map<string, unknown>();

export function memoryGet<T>(orgId: string, key: StoreKey): T | null {
  const raw = memory.get(`${orgId}:${key}`);
  return (raw as T) ?? null;
}

export function memorySet(orgId: string, key: StoreKey, payload: unknown) {
  memory.set(`${orgId}:${key}`, payload);
}

export function memoryClear(orgId?: string) {
  if (!orgId) {
    memory.clear();
    return;
  }
  for (const k of [...memory.keys()]) {
    if (k.startsWith(`${orgId}:`)) memory.delete(k);
  }
}

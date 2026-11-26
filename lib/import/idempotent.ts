/** K01 — upsert idempotente por identificador de origem. */

export type OriginKey = {
  legacySystem: string;
  legacyId: string;
};

export type OriginRecord<T extends OriginKey> = T & {
  payload: Record<string, unknown>;
};

export type UpsertResult = {
  created: number;
  updated: number;
  skipped: number;
};

/**
 * Aplica registros legados sobre um mapa indexado por `legacySystem::legacyId`.
 * Reexecução com os mesmos IDs só atualiza (idempotente).
 */
export function upsertByOrigin<T extends OriginKey>(
  existing: Map<string, T>,
  incoming: T[]
): { next: Map<string, T>; result: UpsertResult } {
  const next = new Map(existing);
  const result: UpsertResult = { created: 0, updated: 0, skipped: 0 };

  for (const row of incoming) {
    const key = `${row.legacySystem}::${row.legacyId}`;
    if (!row.legacyId.trim()) {
      result.skipped += 1;
      continue;
    }
    if (next.has(key)) {
      next.set(key, row);
      result.updated += 1;
    } else {
      next.set(key, row);
      result.created += 1;
    }
  }

  return { next, result };
}

export function originKey(system: string, id: string) {
  return `${system}::${id}`;
}

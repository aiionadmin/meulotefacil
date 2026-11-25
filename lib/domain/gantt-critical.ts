import type { CronogramaItem } from "./obras-types";

/** Caminho crítico: cadeia de predecessores com maior duração acumulada. */
export function criticalPathIds(items: CronogramaItem[]): Set<string> {
  if (!items.length) return new Set();
  const byId = new Map(items.map((i) => [i.id, i]));
  const memo = new Map<string, number>();

  function longestTo(id: string, stack: Set<string>): number {
    if (memo.has(id)) return memo.get(id)!;
    if (stack.has(id)) return 0;
    const item = byId.get(id);
    if (!item) return 0;
    stack.add(id);
    const pred = item.predecessorId
      ? longestTo(item.predecessorId, stack)
      : 0;
    stack.delete(id);
    const total = pred + item.duracaoDias;
    memo.set(id, total);
    return total;
  }

  let bestId = items[0].id;
  let best = 0;
  for (const i of items) {
    const len = longestTo(i.id, new Set());
    if (len > best) {
      best = len;
      bestId = i.id;
    }
  }

  const path = new Set<string>();
  let cur: string | undefined = bestId;
  while (cur) {
    path.add(cur);
    cur = byId.get(cur)?.predecessorId;
  }
  return path;
}

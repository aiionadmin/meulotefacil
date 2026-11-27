/** UUID determinístico a partir de id de store (seed/demo) para upserts. */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function hex8(n: number): string {
  return n.toString(16).padStart(8, "0");
}

/** Se já for UUID, devolve; senão gera UUID v4-shaped estável. */
export function stableUuid(seed: string, namespace = "mlf"): string {
  if (UUID_RE.test(seed)) return seed.toLowerCase();
  const a = fnv1a(`${namespace}:${seed}:a`);
  const b = fnv1a(`${namespace}:${seed}:b`);
  const c = fnv1a(`${namespace}:${seed}:c`);
  const d = fnv1a(`${namespace}:${seed}:d`);
  const e = fnv1a(`${namespace}:${seed}:e`);
  // version 4 / variant bits
  const mid = (((b >>> 16) & 0x0fff) | 0x4000).toString(16).padStart(4, "0");
  const clock = (((c >>> 16) & 0x3fff) | 0x8000).toString(16).padStart(4, "0");
  return `${hex8(a)}-${hex8(b).slice(0, 4)}-${mid}-${clock}-${hex8(d).slice(0, 4)}${hex8(e).slice(0, 8)}`.slice(
    0,
    36
  );
}

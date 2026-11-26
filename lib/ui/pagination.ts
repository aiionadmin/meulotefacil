/** Paginação em memória (B17) — listas client-side até o backend paginar. */

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): { items: T[]; page: number; pageSize: number; total: number; totalPages: number } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
}

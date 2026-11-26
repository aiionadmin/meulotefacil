/** B17 — resposta padrão de listas paginadas no servidor. */

import { paginate } from "@/lib/ui/pagination";

export type PagedQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
};

export function parsePagedQuery(url: URL): Required<PagedQuery> {
  return {
    page: Math.max(1, Number(url.searchParams.get("page") || 1)),
    pageSize: Math.min(
      100,
      Math.max(1, Number(url.searchParams.get("pageSize") || 25))
    ),
    q: (url.searchParams.get("q") || "").trim().toLowerCase(),
  };
}

export function pagedJson<T>(
  items: T[],
  query: Required<PagedQuery>,
  started: number
) {
  const page = paginate(items, query.page, query.pageSize);
  return {
    ...page,
    elapsedMs: performance.now() - started,
  };
}

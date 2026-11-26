"use client";

import { useCallback, useEffect, useState } from "react";

export type ServerPage<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  elapsedMs?: number;
};

/**
 * B17 — carrega uma página de `/api/list/...` (ou outra rota paged).
 */
export function useServerPage<T>(opts: {
  url: string;
  page: number;
  pageSize: number;
  q?: string;
  extraParams?: Record<string, string>;
  enabled?: boolean;
}) {
  const { url, page, pageSize, q = "", extraParams, enabled = true } = opts;
  const [data, setData] = useState<ServerPage<T> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const extraKey = extraParams
    ? Object.entries(extraParams)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join("&")
    : "";

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const u = new URL(url, window.location.origin);
      u.searchParams.set("page", String(page));
      u.searchParams.set("pageSize", String(pageSize));
      if (q) u.searchParams.set("q", q);
      if (extraKey) {
        for (const pair of extraKey.split("&")) {
          const eq = pair.indexOf("=");
          if (eq > 0) u.searchParams.set(pair.slice(0, eq), pair.slice(eq + 1));
        }
      }
      const res = await fetch(u.toString());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ServerPage<T>;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao carregar");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url, page, pageSize, q, extraKey, enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}

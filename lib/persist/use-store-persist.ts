"use client";

import { useEffect, useRef } from "react";
import { isDevSeedAllowed } from "@/lib/runtime/demo-mode";
import { DEMO_ORG_ID, type StoreKey } from "./store-keys";
import { loadSnapshot, saveSnapshot } from "./snapshots";
import { mergeTableOverlay } from "./load-from-tables";

/**
 * Hidrata o store: tabelas D/E/G (se houver linhas) por cima do snapshot;
 * snapshot/memória como fallback. Sem localStorage (A01).
 */
export function useStorePersist<T extends object>(opts: {
  storeKey: StoreKey;
  ready: boolean;
  setReady: (v: boolean) => void;
  state: T;
  setState: (next: T) => void;
  seed: () => T;
  orgId?: string;
  merge?: (seed: T, saved: T) => T;
  /** Leitura preferencial das tabelas relacionais (overlay parcial). */
  loadTables?: (orgId: string) => Promise<Partial<T> | null>;
}) {
  const {
    storeKey,
    ready,
    setReady,
    state,
    setState,
    seed,
    orgId = DEMO_ORG_ID,
    merge = (_s, saved) => saved,
    loadTables,
  } = opts;

  const bootstrapped = useRef(false);
  const skipNextSave = useRef(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const seedState = seed();
      const saved = await loadSnapshot<T>(storeKey, orgId);
      let next: T;
      if (saved) {
        next = merge(seedState, saved);
      } else if (isDevSeedAllowed()) {
        next = seedState;
        await saveSnapshot(storeKey, next, orgId);
      } else {
        next = seedState;
      }

      if (loadTables) {
        try {
          const fromTables = await loadTables(orgId);
          if (fromTables) {
            next = mergeTableOverlay(next, fromTables);
          }
        } catch (e) {
          console.warn(
            "[persist] loadTables falhou",
            storeKey,
            e instanceof Error ? e.message : e
          );
        }
      }

      if (cancelled) return;
      setState(next);
      skipNextSave.current = true;
      bootstrapped.current = true;
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap once
  }, [storeKey, orgId]);

  useEffect(() => {
    if (!ready || !bootstrapped.current) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      void saveSnapshot(storeKey, state, orgId);
    }, 400);
    return () => window.clearTimeout(t);
  }, [state, ready, storeKey, orgId]);
}

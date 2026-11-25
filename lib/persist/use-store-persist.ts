"use client";

import { useEffect, useRef } from "react";
import { isDevSeedAllowed } from "@/lib/runtime/demo-mode";
import { DEMO_ORG_ID, type StoreKey } from "./store-keys";
import { loadSnapshot, saveSnapshot } from "./snapshots";

/**
 * Hidrata o store a partir do Supabase (ou memória) e persiste alterações.
 * Sem localStorage (A01). Seed unificado só quando permitido (A06).
 */
export function useStorePersist<T>(opts: {
  storeKey: StoreKey;
  ready: boolean;
  setReady: (v: boolean) => void;
  state: T;
  setState: (next: T) => void;
  seed: () => T;
  orgId?: string;
  merge?: (seed: T, saved: T) => T;
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
  } = opts;

  const bootstrapped = useRef(false);
  const skipNextSave = useRef(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await loadSnapshot<T>(storeKey, orgId);
      if (cancelled) return;
      if (saved) {
        setState(merge(seed(), saved));
      } else if (isDevSeedAllowed()) {
        const next = seed();
        setState(next);
        await saveSnapshot(storeKey, next, orgId);
      } else {
        // Produção sem snapshot: estado vazio do seed estrutural (sem dados demo)
        setState(seed());
      }
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

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useStorePersist } from "@/lib/persist/use-store-persist";
import { hydrateViewPrefs, snapshotViewPrefs } from "@/lib/ui/view-pref";

export type UiState = {
  viewPrefs: Record<string, string>;
};

function seedUi(): UiState {
  return { viewPrefs: {} };
}

type UiApi = {
  state: UiState;
  ready: boolean;
  setViewPrefPersisted: (key: string, value: string) => void;
};

const Ctx = createContext<UiApi | null>(null);

export function UiStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UiState>(seedUi);
  const [ready, setReady] = useState(false);

  useStorePersist({
    storeKey: "ui",
    ready,
    setReady,
    state,
    setState,
    seed: seedUi,
    merge: (seed, saved) => ({
      viewPrefs: { ...seed.viewPrefs, ...(saved.viewPrefs ?? {}) },
    }),
  });

  useEffect(() => {
    if (!ready) return;
    hydrateViewPrefs(state.viewPrefs);
  }, [ready, state.viewPrefs]);

  const api = useMemo<UiApi>(
    () => ({
      state,
      ready,
      setViewPrefPersisted: (key, value) => {
        setState((s) => ({
          viewPrefs: { ...s.viewPrefs, [key]: value },
        }));
      },
    }),
    [state, ready]
  );

  // Flush in-memory prefs back when Map changes via ProcessBoard
  useEffect(() => {
    if (!ready) return;
    const t = window.setInterval(() => {
      const snap = snapshotViewPrefs();
      const same =
        Object.keys(snap).length === Object.keys(state.viewPrefs).length &&
        Object.entries(snap).every(([k, v]) => state.viewPrefs[k] === v);
      if (!same && Object.keys(snap).length) {
        setState({ viewPrefs: snap });
      }
    }, 1500);
    return () => window.clearInterval(t);
  }, [ready, state.viewPrefs]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useUi() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUi fora do UiStoreProvider");
  return ctx;
}

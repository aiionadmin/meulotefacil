"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useStorePersist } from "@/lib/persist/use-store-persist";
import { seedSystemSettings } from "@/lib/domain/system-settings-seed";
import {
  mergeSystemSettings,
  normalizeValidadeReservaDias,
  resolveIndicePadrao,
  validateSystemSettingsPatch,
} from "@/lib/domain/system-settings";
import type {
  AparenciaParams,
  BoletosParams,
  EncargosParams,
  IndexDef,
  ReajusteParams,
  SystemSettingsState,
  VendasParams,
} from "@/lib/domain/system-settings-types";

type SystemSettingsApi = {
  state: SystemSettingsState;
  ready: boolean;
  indicePadrao: string;
  validadeReservaDias: number;
  reset: () => void;
  saveAll: (next: SystemSettingsState) => string | null;
  updateIndicePadrao: (codigo: string) => string | null;
  upsertIndex: (def: IndexDef) => string | null;
  removeIndex: (codigo: string) => string | null;
  updateEncargos: (patch: Partial<EncargosParams>) => string | null;
  updateVendas: (patch: Partial<VendasParams>) => string | null;
  updateReajuste: (patch: Partial<ReajusteParams>) => string | null;
  updateBoletos: (patch: Partial<BoletosParams>) => string | null;
  updateAparencia: (patch: Partial<AparenciaParams>) => string | null;
};

const Ctx = createContext<SystemSettingsApi | null>(null);

export function SystemSettingsStoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<SystemSettingsState>(seedSystemSettings);
  const [ready, setReady] = useState(false);

  useStorePersist({
    storeKey: "systemSettings",
    ready,
    setReady,
    state,
    setState,
    seed: seedSystemSettings,
    merge: mergeSystemSettings,
  });

  const api = useMemo<SystemSettingsApi>(() => {
    const apply = (
      patch: Partial<SystemSettingsState>
    ): string | null => {
      const err = validateSystemSettingsPatch(patch);
      if (err) return err;
      setState((s) => mergeSystemSettings(s, { ...s, ...patch }));
      return null;
    };

    return {
      state,
      ready,
      indicePadrao: resolveIndicePadrao(state),
      validadeReservaDias: normalizeValidadeReservaDias(
        state.vendas.validadeReservaDias
      ),
      reset: () => setState(seedSystemSettings()),
      saveAll: (next) => apply(next),
      updateIndicePadrao: (codigo) => {
        const err = apply({
          indicePadrao: codigo,
          reajuste: { ...state.reajuste, indicePadrao: codigo },
        });
        return err;
      },
      upsertIndex: (def) => {
        const codigo = def.codigo.trim().toUpperCase();
        if (!codigo) return "Código do índice obrigatório";
        if (!def.nome.trim()) return "Nome do índice obrigatório";
        setState((s) => {
          const exists = s.indices.some((i) => i.codigo === codigo);
          const indices = exists
            ? s.indices.map((i) =>
                i.codigo === codigo ? { ...def, codigo } : i
              )
            : [...s.indices, { ...def, codigo }];
          return mergeSystemSettings(s, { indices });
        });
        return null;
      },
      removeIndex: (codigo) => {
        setState((s) => {
          const indices = s.indices.filter((i) => i.codigo !== codigo);
          if (!indices.length) return s;
          const indicePadrao =
            s.indicePadrao === codigo
              ? resolveIndicePadrao({ ...s, indices, indicePadrao: indices[0].codigo })
              : s.indicePadrao;
          return mergeSystemSettings(s, { indices, indicePadrao });
        });
        return null;
      },
      updateEncargos: (patch) =>
        apply({ encargos: { ...state.encargos, ...patch } }),
      updateVendas: (patch) => {
        const next = { ...state.vendas, ...patch };
        if (patch.validadeReservaDias !== undefined) {
          next.validadeReservaDias = normalizeValidadeReservaDias(
            patch.validadeReservaDias
          );
        }
        if (patch.camposLiberados) {
          next.camposLiberados = {
            ...state.vendas.camposLiberados,
            ...patch.camposLiberados,
          };
        }
        return apply({ vendas: next });
      },
      updateReajuste: (patch) => {
        const next = { ...state.reajuste, ...patch };
        const top =
          patch.indicePadrao !== undefined
            ? { indicePadrao: patch.indicePadrao }
            : {};
        return apply({ reajuste: next, ...top });
      },
      updateBoletos: (patch) =>
        apply({ boletos: { ...state.boletos, ...patch } }),
      updateAparencia: (patch) =>
        apply({ aparencia: { ...state.aparencia, ...patch } }),
    };
  }, [state, ready]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useSystemSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useSystemSettings fora do SystemSettingsStoreProvider");
  }
  return ctx;
}

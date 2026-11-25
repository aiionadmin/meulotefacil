"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useFase1 } from "@/lib/store/fase1-store";

export type EmpresaOption = {
  id: string;
  nome: string;
  razaoSocial: string;
  cnpj: string;
};

type EmpresaApi = {
  empresas: EmpresaOption[];
  selectedId: string | "todas";
  selected: EmpresaOption | null;
  setSelectedId: (id: string | "todas") => void;
  filterByEmpresa: <T extends { empresaId?: string; organizationId?: string }>(
    rows: T[]
  ) => T[];
};

const Ctx = createContext<EmpresaApi | null>(null);

/** Preferência de sessão (sem localStorage — C01 / regra A). */
const empresaPref = new Map<string, string | "todas">();
const PREF_KEY = "selected";

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const { state } = useFase1();
  const [selectedId, setSelectedIdState] = useState<string | "todas">(
    state.organization.id
  );

  const empresas: EmpresaOption[] = useMemo(() => {
    const primary: EmpresaOption = {
      id: state.organization.id,
      nome: state.organization.nomeFantasia,
      razaoSocial: state.organization.razaoSocial,
      cnpj: state.organization.cnpj,
    };
    const secondary: EmpresaOption = {
      id: "org-demo-2",
      nome: "MLF Regularizações",
      razaoSocial: "MLF Regularizações Ltda",
      cnpj: "98.765.432/0001-10",
    };
    return [primary, secondary];
  }, [state.organization]);

  useEffect(() => {
    const saved = empresaPref.get(PREF_KEY);
    if (saved) setSelectedIdState(saved);
  }, []);

  const setSelectedId = useCallback((id: string | "todas") => {
    setSelectedIdState(id);
    empresaPref.set(PREF_KEY, id);
  }, []);

  const selected =
    selectedId === "todas"
      ? null
      : empresas.find((e) => e.id === selectedId) ?? empresas[0];

  const api = useMemo<EmpresaApi>(
    () => ({
      empresas,
      selectedId,
      selected,
      setSelectedId,
      filterByEmpresa: (rows) => {
        if (selectedId === "todas") return rows;
        return rows.filter((r) => {
          const id = r.empresaId ?? r.organizationId;
          return !id || id === selectedId;
        });
      },
    }),
    [empresas, selectedId, selected, setSelectedId]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useEmpresa() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEmpresa must be used within EmpresaProvider");
  return ctx;
}

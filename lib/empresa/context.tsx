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
  endereco?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  email?: string;
};

type EmpresaApi = {
  empresas: EmpresaOption[];
  selectedId: string | "todas";
  selected: EmpresaOption | null;
  setSelectedId: (id: string | "todas") => void;
  filterByEmpresa: <T extends { empresaId?: string; organizationId?: string }>(
    rows: T[]
  ) => T[];
  /** Filtra itens ligados a empreendimentos da empresa selecionada (C01). */
  filterByDevelopmentEmpresa: <
    T extends { developmentId?: string; empreendimentoId?: string },
  >(
    rows: T[],
    developments: { id: string; empresaId?: string }[]
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
    const org = state.organization;
    const primary: EmpresaOption = {
      id: org.id,
      nome: org.nomeFantasia,
      razaoSocial: org.razaoSocial,
      cnpj: org.cnpj,
      endereco: org.endereco,
      bairro: org.bairro,
      cidade: org.cidade,
      uf: org.uf,
      cep: org.cep,
      telefone: org.telefone,
      email: org.email,
    };
    /** Segunda empresa emitente: LA (CNPJ oficial). Id estável org-demo-2. */
    const secondary: EmpresaOption = {
      id: "org-demo-2",
      nome: "LA",
      razaoSocial: "LA Regularizações Ltda",
      cnpj: "22.930.670/0001-40",
      endereco: "Av. Albino José B. Oliveira, 2270",
      bairro: "Jd. Afife, Barão Geraldo",
      cidade: "Campinas",
      uf: "SP",
      cep: "13084-120",
      telefone: "(19) 99164-5334",
      email: "contato@laregularizacoes.com.br",
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
      filterByDevelopmentEmpresa: (rows, developments) => {
        if (selectedId === "todas") return rows;
        const allowed = new Set(
          developments
            .filter((d) => !d.empresaId || d.empresaId === selectedId)
            .map((d) => d.id)
        );
        return rows.filter((r) => {
          const did = r.developmentId ?? r.empreendimentoId;
          return !did || allowed.has(did);
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

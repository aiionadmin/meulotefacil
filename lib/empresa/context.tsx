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
import {
  EMPRESA_LA_ID,
  EMPRESA_MLF_ID,
  empresaIdSet,
  resolveRowEmpresaId,
  rowBelongsToEmpresa,
} from "@/lib/empresa/ids";
import { EMITENTES } from "@/lib/export/emitentes";

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
  /** CNPJ da empresa ativa (para PDF/emitente). */
  selectedCnpj: string | undefined;
  filterByEmpresa: <
    T extends { empresaId?: string; organizationId?: string; nome?: string },
  >(
    rows: T[]
  ) => T[];
  /** Filtra itens ligados a empreendimentos da empresa selecionada (C01). */
  filterByDevelopmentEmpresa: <
    T extends { developmentId?: string; empreendimentoId?: string },
  >(
    rows: T[],
    developments: { id: string; empresaId?: string; nome?: string }[]
  ) => T[];
  /** Empreendimentos da empresa ativa (ou todos). */
  scopedDevelopments: <T extends { id: string; empresaId?: string; nome?: string }>(
    developments: T[]
  ) => T[];
  /** Resolve empresaId a partir do nome do empreendimento (leads etc.). */
  empresaIdForEmpNome: (
    empNome: string | undefined,
    developments: { nome: string; empresaId?: string }[]
  ) => string;
};

const Ctx = createContext<EmpresaApi | null>(null);

/** Preferência de aba (sessionStorage) + fallback em memória — C01 / sem localStorage. */
const empresaPref = new Map<string, string | "todas">();
const PREF_KEY = "selected";
const SESSION_KEY = "mlf-empresa-selected";

function readEmpresaPref(): string | "todas" | undefined {
  const mem = empresaPref.get(PREF_KEY);
  if (mem) return mem;
  if (typeof window === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return undefined;
    return raw as string | "todas";
  } catch {
    return undefined;
  }
}

function writeEmpresaPref(id: string | "todas") {
  empresaPref.set(PREF_KEY, id);
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_KEY, id);
  } catch {
    /* ignore quota / private mode */
  }
}

function normalizeSelectedId(id: string | "todas"): string | "todas" {
  if (id === "todas") return "todas";
  if (id === "org-demo") return EMPRESA_MLF_ID;
  return id;
}

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const { state } = useFase1();
  const [selectedId, setSelectedIdState] = useState<string | "todas">(
    EMPRESA_MLF_ID
  );

  const empresas: EmpresaOption[] = useMemo(() => {
    const org = state.organization;
    const mlf = EMITENTES.mlf;
    const la = EMITENTES.la;
    const primary: EmpresaOption = {
      id: EMPRESA_MLF_ID,
      nome: org.nomeFantasia || mlf.nomeFantasia,
      razaoSocial: org.razaoSocial || mlf.razaoSocial,
      cnpj: org.cnpj || mlf.cnpj,
      endereco: org.endereco || mlf.endereco,
      bairro: org.bairro || mlf.bairro,
      cidade: org.cidade || mlf.cidade,
      uf: org.uf || mlf.uf,
      cep: org.cep || mlf.cep,
      telefone: org.telefone || mlf.telefone,
      email: org.email || mlf.email,
    };
    const secondary: EmpresaOption = {
      id: EMPRESA_LA_ID,
      nome: la.nomeFantasia,
      razaoSocial: la.razaoSocial,
      cnpj: la.cnpj,
      endereco: la.endereco,
      bairro: la.bairro,
      cidade: la.cidade,
      uf: la.uf,
      cep: la.cep,
      telefone: la.telefone,
      email: la.email,
    };
    return [primary, secondary];
  }, [state.organization]);

  useEffect(() => {
    const saved = readEmpresaPref();
    if (!saved) return;
    const next = normalizeSelectedId(saved);
    setSelectedIdState(next);
    writeEmpresaPref(next);
  }, []);

  const setSelectedId = useCallback((id: string | "todas") => {
    const next = normalizeSelectedId(id);
    setSelectedIdState(next);
    writeEmpresaPref(next);
  }, []);

  const selected =
    selectedId === "todas"
      ? null
      : empresas.find((e) => e.id === selectedId) ?? empresas[0];

  const selectedCnpj = selected?.cnpj;

  const api = useMemo<EmpresaApi>(
    () => ({
      empresas,
      selectedId,
      selected,
      setSelectedId,
      selectedCnpj,
      filterByEmpresa: (rows) => {
        if (selectedId === "todas") return rows;
        return rows.filter((r) =>
          rowBelongsToEmpresa(
            selectedId,
            r.empresaId,
            r.organizationId,
            r.nome
          )
        );
      },
      scopedDevelopments: (developments) => {
        if (selectedId === "todas") return developments;
        return developments.filter((d) =>
          rowBelongsToEmpresa(selectedId, d.empresaId, undefined, d.nome)
        );
      },
      filterByDevelopmentEmpresa: (rows, developments) => {
        if (selectedId === "todas") return rows;
        const allowed = new Set(
          developments
            .filter((d) =>
              rowBelongsToEmpresa(selectedId, d.empresaId, undefined, d.nome)
            )
            .map((d) => d.id)
        );
        return rows.filter((r) => {
          const did = r.developmentId ?? r.empreendimentoId;
          if (!did) return false;
          return allowed.has(did);
        });
      },
      empresaIdForEmpNome: (empNome, developments) => {
        if (!empNome?.trim()) return EMPRESA_MLF_ID;
        const hit = developments.find(
          (d) => d.nome.trim().toLowerCase() === empNome.trim().toLowerCase()
        );
        return resolveRowEmpresaId(hit?.empresaId, undefined, empNome);
      },
    }),
    [empresas, selectedId, selected, setSelectedId, selectedCnpj]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useEmpresa() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEmpresa must be used within EmpresaProvider");
  return ctx;
}

export { EMPRESA_LA_ID, EMPRESA_MLF_ID, empresaIdSet, rowBelongsToEmpresa };

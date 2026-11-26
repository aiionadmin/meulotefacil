"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  demandasDoCliente,
  demandasDoCorretor,
  seedParte5,
} from "@/lib/domain/parte5-seed";
import { useStorePersist } from "@/lib/persist/use-store-persist";
import { saveSnapshot } from "@/lib/persist/snapshots";
import { DEMO_ORG_ID } from "@/lib/persist/store-keys";
import { isDemoToolsAllowed } from "@/lib/runtime/demo-mode";
import type {
  Demanda,
  DemandaOrigem,
  DemandaPrioridade,
  DemandaStatus,
  Parte5State,
} from "@/lib/domain/parte5-types";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

type Parte5Api = {
  state: Parte5State;
  ready: boolean;
  reset: () => void;
  addDemanda: (input: {
    tipoId: string;
    empreendimentoId: string;
    empreendimentoNome: string;
    quadra?: string;
    lote?: string;
    clienteId?: string;
    clienteNome?: string;
    descricao: string;
    prioridade: DemandaPrioridade;
    responsavel?: string;
    prazo?: string;
    origem: DemandaOrigem;
    corretorId?: string;
    custoPrevisto?: number;
  }) => Demanda | null;
  moverDemanda: (id: string, status: DemandaStatus) => boolean;
  demandasDoCorretor: (corretorId?: string) => Demanda[];
  demandasDoCliente: (clienteId?: string) => Demanda[];
  setPortalCorretor: (corretorId: string, nome: string) => void;
  setPortalCliente: (clienteId: string, nome: string, cpf: string) => void;
};

const Ctx = createContext<Parte5Api | null>(null);

export function Parte5StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Parte5State>(() => seedParte5());
  const [ready, setReady] = useState(false);

    useStorePersist({
    storeKey: "parte5",
    ready,
    setReady,
    state,
    setState,
    seed: seedParte5,
  });


  const api = useMemo<Parte5Api>(
    () => ({
      state,
      ready,
      reset: () => {
        if (!isDemoToolsAllowed()) return;
        const next = seedParte5();
        setState(next);
        void saveSnapshot("parte5", next, DEMO_ORG_ID);
      },
      addDemanda: (input) => {
        if (!input.tipoId || !input.empreendimentoId || !input.descricao.trim()) {
          return null;
        }
        const tipo = state.demandaTipos.find((t) => t.id === input.tipoId);
        if (!tipo) return null;
        const n =
          state.demandas.reduce((m, d) => {
            const num = Number(d.numero.replace(/\D/g, ""));
            return Number.isFinite(num) ? Math.max(m, num) : m;
          }, 99) + 1;
        const prazo =
          input.prazo ??
          (() => {
            const d = new Date();
            d.setDate(d.getDate() + tipo.prazoDias);
            return d.toISOString().slice(0, 10);
          })();
        const dem: Demanda = {
          id: uid("dem"),
          numero: `DEM-${n}`,
          tipoId: input.tipoId,
          empresa: "Meu Lote Fácil",
          empreendimentoId: input.empreendimentoId,
          empreendimentoNome: input.empreendimentoNome,
          quadra: input.quadra,
          lote: input.lote,
          clienteId: input.clienteId,
          clienteNome: input.clienteNome,
          descricao: input.descricao.trim(),
          prioridade: input.prioridade,
          responsavel: input.responsavel ?? tipo.responsavelPadrao,
          prazo,
          origem: input.origem,
          corretorId: input.corretorId,
          custoPrevisto: input.custoPrevisto,
          status: "aberta",
          criadoEm: todayIso(),
        };
        setState((s) => ({ ...s, demandas: [dem, ...s.demandas] }));
        return dem;
      },
      moverDemanda: (id, status) => {
        setState((s) => ({
          ...s,
          demandas: s.demandas.map((d) =>
            d.id === id ? { ...d, status } : d
          ),
        }));
        return true;
      },
      demandasDoCorretor: (corretorId) =>
        demandasDoCorretor(
          state,
          corretorId ?? state.portalCorretor.corretorId
        ),
      demandasDoCliente: (clienteId) =>
        demandasDoCliente(
          state,
          clienteId ?? state.portalCliente.clienteId
        ),
      setPortalCorretor: (corretorId, nome) => {
        setState((s) => ({
          ...s,
          portalCorretor: { corretorId, nome },
        }));
      },
      setPortalCliente: (clienteId, nome, cpf) => {
        setState((s) => ({
          ...s,
          portalCliente: { clienteId, nome, cpf },
        }));
      },
    }),
    [state, ready]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useParte5() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useParte5 must be used within Parte5StoreProvider");
  }
  return ctx;
}

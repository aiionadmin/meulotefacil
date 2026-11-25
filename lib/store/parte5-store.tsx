"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  comissoesDoCorretor,
  criarReserva,
  expirarReservas,
  podeReservarLote,
  totaisComissao,
} from "@/lib/domain/corretor-comissao-reserva";
import {
  PARTE5_STORAGE_KEY,
  demandasDoCliente,
  demandasDoCorretor,
  seedParte5,
} from "@/lib/domain/parte5-seed";
import type {
  Demanda,
  DemandaOrigem,
  DemandaPrioridade,
  DemandaStatus,
  Parte5State,
  ReservaLote,
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
  vincularSc: (demandaId: string, purchaseRequestId: string) => boolean;
  vincularFaturamento: (demandaId: string, faturamentoId: string) => boolean;
  comissoesDoCorretor: (corretorId?: string) => ReturnType<
    typeof comissoesDoCorretor
  >;
  totaisComissao: (corretorId?: string) => ReturnType<typeof totaisComissao>;
  reservarLote: (input: {
    lotId: string;
    empNome: string;
    quadra: string;
    lote: string;
    lotStatus: string;
    clienteNome?: string;
    prazoDias?: number;
  }) => { ok: true; reserva: ReservaLote } | { ok: false; motivo: string };
  expirarReservasVencidas: (
    hoje?: string
  ) => { expiradas: number; lotesLiberados: string[] };
  minhasReservas: (corretorId?: string) => ReservaLote[];
  addComentario: (
    demandaId: string,
    autor: string,
    texto: string
  ) => boolean;
  moverDemandasLote: (ids: string[], status: DemandaStatus) => number;
};

const Ctx = createContext<Parte5Api | null>(null);

export function Parte5StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Parte5State>(() => seedParte5());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PARTE5_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Parte5State>;
        const seed = seedParte5();
        setState({
          ...seed,
          ...parsed,
          demandaTipos: parsed.demandaTipos?.length
            ? parsed.demandaTipos
            : seed.demandaTipos,
          demandas: parsed.demandas?.length ? parsed.demandas : seed.demandas,
          portalCorretor: parsed.portalCorretor ?? seed.portalCorretor,
          portalCliente: parsed.portalCliente ?? seed.portalCliente,
          materiaisVenda: parsed.materiaisVenda?.length
            ? parsed.materiaisVenda
            : seed.materiaisVenda,
          comissoes: parsed.comissoes?.length
            ? parsed.comissoes
            : seed.comissoes,
          reservas: parsed.reservas?.length ? parsed.reservas : seed.reservas,
        });
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(PARTE5_STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  const api = useMemo<Parte5Api>(
    () => ({
      state,
      ready,
      reset: () => {
        const next = seedParte5();
        setState(next);
        localStorage.setItem(PARTE5_STORAGE_KEY, JSON.stringify(next));
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
      vincularSc: (demandaId, purchaseRequestId) => {
        if (!state.demandas.some((d) => d.id === demandaId)) return false;
        setState((s) => ({
          ...s,
          demandas: s.demandas.map((d) =>
            d.id === demandaId
              ? { ...d, purchaseRequestId, status: "em_execucao" as DemandaStatus }
              : d
          ),
        }));
        return true;
      },
      vincularFaturamento: (demandaId, faturamentoId) => {
        if (!state.demandas.some((d) => d.id === demandaId)) return false;
        setState((s) => ({
          ...s,
          demandas: s.demandas.map((d) =>
            d.id === demandaId ? { ...d, faturamentoId } : d
          ),
        }));
        return true;
      },
      comissoesDoCorretor: (corretorId) =>
        comissoesDoCorretor(
          state.comissoes,
          corretorId ?? state.portalCorretor.corretorId
        ),
      totaisComissao: (corretorId) =>
        totaisComissao(
          comissoesDoCorretor(
            state.comissoes,
            corretorId ?? state.portalCorretor.corretorId
          )
        ),
      reservarLote: (input) => {
        const hoje = todayIso();
        const gate = podeReservarLote(
          state.reservas,
          input.lotId,
          input.lotStatus,
          hoje
        );
        if (!gate.ok) return gate;
        const reserva = criarReserva({
          id: uid("rsv"),
          lotId: input.lotId,
          empNome: input.empNome,
          quadra: input.quadra,
          lote: input.lote,
          corretorId: state.portalCorretor.corretorId,
          corretorNome: state.portalCorretor.nome,
          clienteNome: input.clienteNome,
          hoje,
          prazoDias: input.prazoDias,
        });
        setState((s) => ({
          ...s,
          reservas: [reserva, ...s.reservas],
        }));
        return { ok: true as const, reserva };
      },
      expirarReservasVencidas: (hoje) => {
        const dia = hoje ?? todayIso();
        const { reservas, lotesLiberados } = expirarReservas(
          state.reservas,
          dia
        );
        const expiradas = lotesLiberados.length;
        if (expiradas === 0) return { expiradas: 0, lotesLiberados: [] };
        setState((s) => ({ ...s, reservas }));
        return { expiradas, lotesLiberados };
      },
      minhasReservas: (corretorId) => {
        const id = corretorId ?? state.portalCorretor.corretorId;
        return state.reservas.filter((r) => r.corretorId === id);
      },
      addComentario: (demandaId, autor, texto) => {
        const t = texto.trim();
        if (!t || !state.demandas.some((d) => d.id === demandaId)) return false;
        const cmt = {
          id: uid("cmt"),
          autor,
          texto: t,
          criadoEm: todayIso(),
        };
        setState((s) => ({
          ...s,
          demandas: s.demandas.map((d) =>
            d.id === demandaId
              ? { ...d, comentarios: [...(d.comentarios ?? []), cmt] }
              : d
          ),
        }));
        return true;
      },
      moverDemandasLote: (ids, status) => {
        const set = new Set(ids);
        const n = state.demandas.filter(
          (d) => set.has(d.id) && d.status !== status
        ).length;
        if (n === 0) return 0;
        setState((s) => ({
          ...s,
          demandas: s.demandas.map((d) =>
            set.has(d.id) && d.status !== status ? { ...d, status } : d
          ),
        }));
        return n;
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

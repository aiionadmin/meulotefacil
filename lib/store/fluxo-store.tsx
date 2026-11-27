"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  JORNADA_COLS,
  JORNADA_FINAIS,
  JORNADA_ORDER,
} from "@/lib/domain/fluxo-seed";
import { unifiedFluxoSeed } from "@/lib/domain/unified-seed";
import type {
  Agreement,
  FluxoState,
  JornadaColuna,
  Lead,
  LeadOrigem,
  Proposal,
} from "@/lib/domain/fluxo-types";
import { computeLeadScore } from "@/lib/leads/score";
import { useStorePersist } from "@/lib/persist/use-store-persist";
import { saveSnapshot } from "@/lib/persist/snapshots";
import { DEMO_ORG_ID } from "@/lib/persist/store-keys";
import { isDemoToolsAllowed } from "@/lib/runtime/demo-mode";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowLabel() {
  return new Date().toLocaleString("pt-BR");
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function nowIso() {
  return new Date().toISOString();
}

function secondsSince(iso?: string) {
  if (!iso) return undefined;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return undefined;
  return Math.max(0, Math.round((Date.now() - t) / 1000));
}

const MANUAL_COLS: ReadonlySet<JornadaColuna> = new Set(
  JORNADA_COLS.filter((c) => c.manual).map((c) => c.id)
);

const FINAIS: ReadonlySet<string> = new Set(JORNADA_FINAIS);

type FluxoApi = {
  state: FluxoState;
  ready: boolean;
  reset: () => void;
  addLead: (
    data: {
      nome: string;
      telefone: string;
      email?: string;
      empInteresse?: string;
      origem: LeadOrigem;
      campanha?: string;
      corretor?: string;
      tipoInteresse?: string;
      finalidade?: string;
      faixaValor?: string;
      entradaDisponivel?: number;
      parcelaCabe?: number;
      formaPagamento?: string;
      prazoDecidir?: string;
      cidade?: string;
      bairro?: string;
      visitou?: boolean;
      dataVisita?: string;
      melhorHorario?: string;
      canalPreferido?: string;
      objecoes?: string;
      observacoes?: string;
    }
  ) => Lead;
  updateLead: (
    id: string,
    patch: Partial<Omit<Lead, "id" | "criadoEm">>
  ) => Lead | null;
  /** Remove lead se não houver proposta aberta/reservada vinculada. */
  removeLead: (id: string) => { ok: boolean; reason?: string };
  moveLead: (
    id: string,
    para: JornadaColuna,
    opts?: { force?: boolean; motivo?: string; usuario?: string }
  ) => boolean;
  marcarFinal: (
    id: string,
    etapa: "perdido" | "cancelado" | "distrato",
    motivo: string
  ) => boolean;
  marcarPerdido: (id: string, motivo: string) => void;
  addProposal: (data: Omit<Proposal, "id" | "status">) => Proposal;
  converterProposal: (id: string) => Proposal | null;
  registrarContato: (
    caseId: string,
    canal: "whatsapp" | "email" | "telefone" | "tarefa",
    resultado: string
  ) => void;
  /** Conversa no card do cliente (sem caso de cobrança). */
  registrarConversa: (
    cardKey: string,
    canal: "whatsapp" | "email" | "telefone" | "tarefa",
    resultado: string
  ) => void;
  proporAcordo: (
    caseId: string,
    desconto: number,
    qtdParcelas: number
  ) => Agreement | null;
  avancarRegularizacao: (
    id: string,
    para?: string,
    opts?: { force?: boolean; motivo?: string }
  ) => boolean;
  vincularNfe: (id: string) => void;
  toggleReportFavorite: (id: string) => void;
  runReport: (id: string) => void;
  pausarRegua: (caseId: string) => void;
};

const Ctx = createContext<FluxoApi | null>(null);

function canAdvanceJornada(
  de: JornadaColuna,
  para: JornadaColuna,
  force?: boolean
) {
  if (force) return true;
  if (FINAIS.has(para)) return true;
  if (FINAIS.has(de)) return false;
  const order = JORNADA_ORDER as readonly string[];
  // Manual only between first two columns, and only forward (C06)
  if (MANUAL_COLS.has(de) && MANUAL_COLS.has(para)) {
    return order.indexOf(para) >= order.indexOf(de);
  }
  // System events: only forward along the path
  const from = order.indexOf(de);
  const to = order.indexOf(para);
  if (from < 0 || to < 0) return false;
  return to > from;
}

const REG_ORDER = [
  "documentos",
  "prefeitura",
  "cartorio",
  "registro",
  "matricula",
  "entregue",
] as const;

export function FluxoStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FluxoState>(() => unifiedFluxoSeed());
  const [ready, setReady] = useState(false);

  useStorePersist({
    storeKey: "fluxo",
    ready,
    setReady,
    state,
    setState,
    seed: unifiedFluxoSeed,
  });

  const api = useMemo<FluxoApi>(
    () => ({
      state,
      ready,
      reset: () => {
        if (!isDemoToolsAllowed()) return;
        const next = unifiedFluxoSeed();
        setState(next);
        void saveSnapshot("fluxo", next, DEMO_ORG_ID);
      },
      addLead: (data) => {
        const scored = computeLeadScore(data);
        const lead: Lead = {
          ...data,
          id: uid("ld"),
          responsavel: data.corretor || "Atendimento",
          etapa: "novo_contato",
          criadoEm: todayIso(),
          etapaDesde: nowIso(),
          score: scored.score,
          classificacao: scored.classificacao,
        };
        setState((s) => ({ ...s, leads: [lead, ...s.leads] }));
        return lead;
      },
      updateLead: (id, patch) => {
        const current = state.leads.find((l) => l.id === id);
        if (!current) return null;
        const merged = { ...current, ...patch };
        const scored = computeLeadScore(merged);
        const next: Lead = {
          ...merged,
          id,
          criadoEm: current.criadoEm,
          score: patch.score ?? scored.score,
          classificacao: patch.classificacao ?? scored.classificacao,
          responsavel:
            patch.responsavel ??
            patch.corretor ??
            current.responsavel ??
            "Atendimento",
        };
        setState((s) => ({
          ...s,
          leads: s.leads.map((l) => (l.id === id ? next : l)),
        }));
        return next;
      },
      removeLead: (id) => {
        const lead = state.leads.find((l) => l.id === id);
        if (!lead) return { ok: false, reason: "Lead não encontrado" };
        const linked = state.proposals.some(
          (p) =>
            p.leadId === id &&
            (p.status === "aberta" || p.status === "reservada")
        );
        if (linked) {
          return {
            ok: false,
            reason: "Há proposta aberta ou reservada vinculada",
          };
        }
        setState((s) => ({
          ...s,
          leads: s.leads.filter((l) => l.id !== id),
          proposals: s.proposals.map((p) =>
            p.leadId === id ? { ...p, leadId: undefined } : p
          ),
        }));
        return { ok: true };
      },
      moveLead: (id, para, opts) => {
        const lead = state.leads.find((l) => l.id === id);
        if (!lead) return false;
        const de = lead.etapa;
        if (de === para) return true;
        if (!canAdvanceJornada(de, para, opts?.force)) return false;
        const tempo = secondsSince(lead.etapaDesde);
        setState((s) => ({
          ...s,
          leads: s.leads.map((l) =>
            l.id === id
              ? {
                  ...l,
                  etapa: para,
                  ultimoContato: todayIso(),
                  etapaDesde: nowIso(),
                  motivoPerda: FINAIS.has(para)
                    ? opts?.motivo ?? l.motivoPerda
                    : l.motivoPerda,
                }
              : l
          ),
          cardMoves: [
            {
              id: uid("mv"),
              cardId: id,
              de,
              para,
              quando: nowLabel(),
              usuario: opts?.usuario ?? "Sistema",
              motivo: opts?.motivo,
              tempoNaEtapaSegundos: tempo,
            },
            ...s.cardMoves,
          ].slice(0, 80),
        }));
        return true;
      },
      marcarFinal: (id, etapa, motivo) => {
        if (!motivo.trim()) return false;
        const lead = state.leads.find((l) => l.id === id);
        if (!lead) return false;
        const de = lead.etapa;
        const tempo = secondsSince(lead.etapaDesde);
        setState((s) => ({
          ...s,
          leads: s.leads.map((l) =>
            l.id === id
              ? {
                  ...l,
                  etapa,
                  motivoPerda: motivo,
                  ultimoContato: todayIso(),
                  etapaDesde: nowIso(),
                }
              : l
          ),
          cardMoves: [
            {
              id: uid("mv"),
              cardId: id,
              de,
              para: etapa,
              quando: nowLabel(),
              usuario: "Sistema",
              motivo,
              tempoNaEtapaSegundos: tempo,
            },
            ...s.cardMoves,
          ].slice(0, 80),
        }));
        return true;
      },
      marcarPerdido: (id, motivo) => {
        if (!motivo.trim()) return;
        const lead = state.leads.find((l) => l.id === id);
        if (!lead) return;
        const de = lead.etapa;
        const tempo = secondsSince(lead.etapaDesde);
        setState((s) => ({
          ...s,
          leads: s.leads.map((l) =>
            l.id === id
              ? {
                  ...l,
                  etapa: "perdido" as const,
                  motivoPerda: motivo,
                  ultimoContato: todayIso(),
                  etapaDesde: nowIso(),
                }
              : l
          ),
          cardMoves: [
            {
              id: uid("mv"),
              cardId: id,
              de,
              para: "perdido",
              quando: nowLabel(),
              usuario: "Sistema",
              motivo,
              tempoNaEtapaSegundos: tempo,
            },
            ...s.cardMoves,
          ].slice(0, 80),
        }));
      },
      addProposal: (data) => {
        const p: Proposal = { ...data, id: uid("pr"), status: "aberta" };
        setState((s) => {
          const prevLead = data.leadId
            ? s.leads.find((l) => l.id === data.leadId)
            : undefined;
          const leads = data.leadId
            ? s.leads.map((l) =>
                l.id === data.leadId
                  ? {
                      ...l,
                      etapa: "proposta_reserva" as const,
                      etapaDesde: nowIso(),
                    }
                  : l
              )
            : s.leads;
          const moves = data.leadId
            ? [
                {
                  id: uid("mv"),
                  cardId: data.leadId,
                  de: prevLead?.etapa ?? "?",
                  para: "proposta_reserva",
                  quando: nowLabel(),
                  usuario: "Sistema",
                  tempoNaEtapaSegundos: secondsSince(prevLead?.etapaDesde),
                },
                ...s.cardMoves,
              ].slice(0, 80)
            : s.cardMoves;
          return {
            ...s,
            proposals: [p, ...s.proposals],
            leads,
            cardMoves: moves,
          };
        });
        return p;
      },
      converterProposal: (id) => {
        let converted: Proposal | null = null;
        setState((s) => {
          const p = s.proposals.find((x) => x.id === id);
          if (!p) return s;
          converted = { ...p, status: "convertida" };
          return {
            ...s,
            proposals: s.proposals.map((x) =>
              x.id === id ? { ...x, status: "convertida" as const } : x
            ),
            leads: p.leadId
              ? s.leads.map((l) =>
                  l.id === p.leadId
                    ? {
                        ...l,
                        etapa: "contrato" as const,
                        etapaDesde: nowIso(),
                      }
                    : l
                )
              : s.leads,
            cardMoves: p.leadId
              ? [
                  {
                    id: uid("mv"),
                    cardId: p.leadId,
                    de: "proposta_reserva",
                    para: "contrato",
                    quando: nowLabel(),
                    usuario: "Sistema",
                    tempoNaEtapaSegundos: secondsSince(
                      s.leads.find((l) => l.id === p.leadId)?.etapaDesde
                    ),
                  },
                  ...s.cardMoves,
                ].slice(0, 80)
              : s.cardMoves,
          };
        });
        return converted;
      },
      registrarContato: (caseId, canal, resultado) => {
        setState((s) => ({
          ...s,
          contacts: [
            {
              id: uid("ct"),
              caseId,
              quando: nowLabel(),
              canal,
              resultado,
            },
            ...s.contacts,
          ],
          collection: s.collection.map((c) =>
            c.id === caseId ? { ...c, ultimoContato: todayIso() } : c
          ),
        }));
      },
      registrarConversa: (cardKey, canal, resultado) => {
        const caseId = `card:${cardKey}`;
        setState((s) => ({
          ...s,
          contacts: [
            {
              id: uid("ct"),
              caseId,
              quando: nowLabel(),
              canal,
              resultado,
            },
            ...s.contacts,
          ],
        }));
      },
      proporAcordo: (caseId, desconto, qtdParcelas) => {
        const c = state.collection.find((x) => x.id === caseId);
        if (!c) return null;
        const ag: Agreement = {
          id: uid("ag"),
          caseId,
          contratoNumero: c.contratoNumero,
          valorAtualizado: c.valorAtualizado,
          desconto,
          entrada: Math.round(c.valorAtualizado * 0.2 * 100) / 100,
          qtdParcelas,
          status: "ativo",
          criadoEm: todayIso(),
        };
        setState((s) => ({
          ...s,
          agreements: [ag, ...s.agreements],
          collection: s.collection.map((x) =>
            x.id === caseId ? { ...x, faixa: "acordo" as const } : x
          ),
          regraPausada: [...new Set([...s.regraPausada, caseId])],
        }));
        return ag;
      },
      avancarRegularizacao: (id, para, opts) => {
        const current = state.regularization.find((r) => r.id === id);
        if (!current) return false;
        if (FINAIS.has(current.etapa) && !opts?.force) return false;
        let nextEtapa = para;
        if (!nextEtapa) {
          const i = REG_ORDER.indexOf(
            current.etapa as (typeof REG_ORDER)[number]
          );
          if (i < 0 || i >= REG_ORDER.length - 1) return false;
          nextEtapa = REG_ORDER[i + 1];
        }
        if (FINAIS.has(nextEtapa) && !opts?.motivo) return false;
        const from = REG_ORDER.indexOf(
          current.etapa as (typeof REG_ORDER)[number]
        );
        const to = REG_ORDER.indexOf(nextEtapa as (typeof REG_ORDER)[number]);
        if (
          !opts?.force &&
          !FINAIS.has(nextEtapa) &&
          (from < 0 || to < 0 || to <= from)
        ) {
          return false;
        }
        const tempo = secondsSince(current.etapaDesde);
        setState((s) => ({
          ...s,
          regularization: s.regularization.map((r) =>
            r.id === id
              ? {
                  ...r,
                  etapa: nextEtapa as typeof r.etapa,
                  etapaDesde: nowIso(),
                }
              : r
          ),
          cardMoves: [
            {
              id: uid("mv"),
              cardId: id,
              de: current.etapa,
              para: nextEtapa!,
              quando: nowLabel(),
              usuario: "Sistema",
              motivo: opts?.motivo,
              tempoNaEtapaSegundos: tempo,
            },
            ...s.cardMoves,
          ].slice(0, 80),
        }));
        return true;
      },
      vincularNfe: (id) => {
        setState((s) => ({
          ...s,
          fiscal: s.fiscal.map((f) =>
            f.id === id && f.status === "pendente"
              ? { ...f, status: "vinculada" as const }
              : f
          ),
        }));
      },
      toggleReportFavorite: (id) => {
        setState((s) => ({
          ...s,
          reports: s.reports.map((r) =>
            r.id === id ? { ...r, favorito: !r.favorito } : r
          ),
        }));
      },
      runReport: (id) => {
        const r = state.reports.find((x) => x.id === id);
        if (!r) return;
        setState((s) => ({
          ...s,
          reportRuns: [
            {
              id: uid("rr"),
              reportId: id,
              nome: r.nome,
              quando: nowLabel(),
            },
            ...s.reportRuns,
          ].slice(0, 20),
        }));
      },
      pausarRegua: (caseId) => {
        setState((s) => ({
          ...s,
          regraPausada: [...new Set([...s.regraPausada, caseId])],
        }));
      },
    }),
    [state, ready]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useFluxo() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFluxo must be used within FluxoStoreProvider");
  return ctx;
}

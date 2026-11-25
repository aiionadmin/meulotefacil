"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { FLUXO_STORAGE_KEY, seedFluxo } from "@/lib/domain/fluxo-seed";
import {
  JORNADA_FORWARD_ORDER,
  REGULARIZACAO_FORWARD_ORDER,
  canMoveOnBoard,
} from "@/lib/domain/kanban-forward";
import { findDuplicateLead } from "@/lib/domain/lead-duplicate";
import { scoreLead } from "@/lib/domain/lead-score";
import type {
  Agreement,
  FluxoState,
  JornadaColuna,
  Lead,
  Proposal,
  RegularizationCase,
} from "@/lib/domain/fluxo-types";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowLabel() {
  return new Date().toLocaleString("pt-BR");
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

type LeadInput = Omit<
  Lead,
  | "id"
  | "etapa"
  | "criadoEm"
  | "score"
  | "temperatura"
  | "badges"
  | "responsavel"
> &
  Partial<Pick<Lead, "score" | "temperatura" | "badges" | "responsavel">>;

type FluxoApi = {
  state: FluxoState;
  ready: boolean;
  reset: () => void;
  addLead: (
    data: LeadInput
  ) =>
    | { ok: true; lead: Lead }
    | { ok: false; motivo: string; existenteId: string };
  updateLead: (id: string, patch: Partial<Lead>) => void;
  moveLead: (
    id: string,
    para: JornadaColuna,
    opts?: { force?: boolean; motivo?: string }
  ) => boolean;
  marcarPerdido: (id: string, motivo: string) => void;
  addProposal: (data: Omit<Proposal, "id" | "status">) => Proposal | null;
  converterProposal: (id: string) => void;
  registrarContato: (
    caseId: string,
    canal: "whatsapp" | "email" | "telefone" | "tarefa",
    resultado: string
  ) => void;
  proporAcordo: (caseId: string, desconto: number, qtdParcelas: number) => Agreement | null;
  avancarRegularizacao: (id: string) => void;
  moverRegularizacao: (
    id: string,
    para: RegularizationCase["etapa"],
    opts?: { force?: boolean; motivo?: string }
  ) => boolean;
  vincularNfe: (id: string) => void;
  toggleReportFavorite: (id: string) => void;
  runReport: (id: string) => void;
  pausarRegua: (caseId: string) => void;
};

const Ctx = createContext<FluxoApi | null>(null);

export function FluxoStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FluxoState>(() => seedFluxo());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FLUXO_STORAGE_KEY);
      if (raw) setState({ ...seedFluxo(), ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(FLUXO_STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  const api = useMemo<FluxoApi>(
    () => ({
      state,
      ready,
      reset: () => {
        const next = seedFluxo();
        setState(next);
        localStorage.setItem(FLUXO_STORAGE_KEY, JSON.stringify(next));
      },
      addLead: (data) => {
        const dup = findDuplicateLead(state.leads, {
          telefone: data.telefone,
          cpf: data.cpf,
        });
        if (dup) {
          return {
            ok: false as const,
            motivo: dup.motivo,
            existenteId: dup.lead.id,
          };
        }
        const scored = scoreLead(data);
        const lead: Lead = {
          ...data,
          id: uid("ld"),
          responsavel: data.responsavel || "Atendimento",
          etapa: "novo_contato",
          criadoEm: todayIso(),
          score: scored.score,
          temperatura: scored.temperatura,
        };
        setState((s) => ({ ...s, leads: [lead, ...s.leads] }));
        return { ok: true as const, lead };
      },
      updateLead: (id, patch) => {
        setState((s) => ({
          ...s,
          leads: s.leads.map((l) => {
            if (l.id !== id) return l;
            const next = { ...l, ...patch };
            const scored = scoreLead(next);
            return { ...next, score: scored.score, temperatura: scored.temperatura };
          }),
        }));
      },
      moveLead: (id, para, opts) => {
        const lead = state.leads.find((l) => l.id === id);
        if (!lead) return false;
        const de = lead.etapa;
        const allowed = canMoveOnBoard(JORNADA_FORWARD_ORDER, de, para, {
          force: opts?.force,
          allowExit: true,
        });
        if (!allowed) return false;
        setState((s) => ({
          ...s,
          leads: s.leads.map((l) =>
            l.id === id
              ? {
                  ...l,
                  etapa: para,
                  ultimoContato: todayIso(),
                  motivoPerda: para === "perdido" ? opts?.motivo : l.motivoPerda,
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
              usuario: "Admin Demo",
              motivo: opts?.motivo,
            },
            ...s.cardMoves,
          ].slice(0, 80),
        }));
        return true;
      },
      marcarPerdido: (id, motivo) => {
        if (!motivo?.trim()) return;
        setState((s) => ({
          ...s,
          leads: s.leads.map((l) =>
            l.id === id
              ? { ...l, etapa: "perdido" as const, motivoPerda: motivo }
              : l
          ),
          cardMoves: [
            {
              id: uid("mv"),
              cardId: id,
              de: s.leads.find((l) => l.id === id)?.etapa ?? "?",
              para: "perdido",
              quando: nowLabel(),
              usuario: "Admin Demo",
              motivo,
            },
            ...s.cardMoves,
          ],
        }));
      },
      addProposal: (data) => {
        if (!data.empNome?.trim()) return null;
        if (!data.servicoRegularizacao && !data.loteLabel?.trim()) return null;
        const p: Proposal = { ...data, id: uid("pr"), status: "aberta" };
        setState((s) => {
          const leads = data.leadId
            ? s.leads.map((l) =>
                l.id === data.leadId
                  ? { ...l, etapa: "proposta_reserva" as const }
                  : l
              )
            : s.leads;
          return { ...s, proposals: [p, ...s.proposals], leads };
        });
        return p;
      },
      converterProposal: (id) => {
        setState((s) => {
          const p = s.proposals.find((x) => x.id === id);
          if (!p) return s;
          return {
            ...s,
            proposals: s.proposals.map((x) =>
              x.id === id ? { ...x, status: "convertida" as const } : x
            ),
            leads: p.leadId
              ? s.leads.map((l) =>
                  l.id === p.leadId
                    ? { ...l, etapa: "contrato" as const }
                    : l
                )
              : s.leads,
          };
        });
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
            c.id === caseId
              ? { ...c, ultimoContato: todayIso() }
              : c
          ),
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
      avancarRegularizacao: (id) => {
        setState((s) => ({
          ...s,
          regularization: s.regularization.map((r) => {
            if (r.id !== id) return r;
            const i = REGULARIZACAO_FORWARD_ORDER.indexOf(r.etapa);
            if (i < 0 || i >= REGULARIZACAO_FORWARD_ORDER.length - 1) return r;
            return { ...r, etapa: REGULARIZACAO_FORWARD_ORDER[i + 1] };
          }),
          cardMoves: [
            {
              id: uid("mv"),
              cardId: id,
              de: s.regularization.find((x) => x.id === id)?.etapa ?? "?",
              para: "avanco",
              quando: nowLabel(),
              usuario: "Admin Demo",
            },
            ...s.cardMoves,
          ].slice(0, 80),
        }));
      },
      moverRegularizacao: (id, para, opts) => {
        const item = state.regularization.find((r) => r.id === id);
        if (!item) return false;
        const de = item.etapa;
        const allowed = canMoveOnBoard(REGULARIZACAO_FORWARD_ORDER, de, para, {
          force: opts?.force,
          allowExit: false,
        });
        if (!allowed) return false;
        setState((s) => ({
          ...s,
          regularization: s.regularization.map((r) =>
            r.id === id ? { ...r, etapa: para } : r
          ),
          cardMoves: [
            {
              id: uid("mv"),
              cardId: id,
              de,
              para,
              quando: nowLabel(),
              usuario: "Admin Demo",
              motivo: opts?.motivo,
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

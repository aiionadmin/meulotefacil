"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { JORNADA_COLS } from "@/lib/domain/fluxo-seed";
import { unifiedFluxoSeed } from "@/lib/domain/unified-seed";
import type {
  Agreement,
  FluxoState,
  JornadaColuna,
  Lead,
  LeadOrigem,
  Proposal,
} from "@/lib/domain/fluxo-types";
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

type FluxoApi = {
  state: FluxoState;
  ready: boolean;
  reset: () => void;
  addLead: (data: {
    nome: string;
    telefone: string;
    email?: string;
    empInteresse?: string;
    origem: LeadOrigem;
  }) => Lead;
  moveLead: (
    id: string,
    para: JornadaColuna,
    opts?: { force?: boolean; motivo?: string }
  ) => boolean;
  marcarPerdido: (id: string, motivo: string) => void;
  addProposal: (data: Omit<Proposal, "id" | "status">) => Proposal;
  converterProposal: (id: string) => void;
  registrarContato: (
    caseId: string,
    canal: "whatsapp" | "email" | "telefone" | "tarefa",
    resultado: string
  ) => void;
  proporAcordo: (caseId: string, desconto: number, qtdParcelas: number) => Agreement | null;
  avancarRegularizacao: (id: string) => void;
  vincularNfe: (id: string) => void;
  toggleReportFavorite: (id: string) => void;
  runReport: (id: string) => void;
  pausarRegua: (caseId: string) => void;
};

const MANUAL_COLS: ReadonlySet<JornadaColuna> = new Set(
  JORNADA_COLS.filter((c) => c.manual).map((c) => c.id)
);

const Ctx = createContext<FluxoApi | null>(null);

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
        const lead: Lead = {
          ...data,
          id: uid("ld"),
          responsavel: "Atendimento",
          etapa: "novo_contato",
          criadoEm: todayIso(),
        };
        setState((s) => ({ ...s, leads: [lead, ...s.leads] }));
        return lead;
      },
      moveLead: (id, para, opts) => {
        const lead = state.leads.find((l) => l.id === id);
        if (!lead) return false;
        const de = lead.etapa;
        const allowed =
          opts?.force ||
          para === "perdido" ||
          (MANUAL_COLS.has(de) && MANUAL_COLS.has(para));
        if (!allowed) return false;
        setState((s) => ({
          ...s,
          leads: s.leads.map((l) =>
            l.id === id ? { ...l, etapa: para, ultimoContato: todayIso() } : l
          ),
          cardMoves: [
            {
              id: uid("mv"),
              cardId: id,
              de,
              para,
              quando: nowLabel(),
              usuario: "Sistema",
              motivo: opts?.motivo,
            },
            ...s.cardMoves,
          ].slice(0, 80),
        }));
        return true;
      },
      marcarPerdido: (id, motivo) => {
        setState((s) => ({
          ...s,
          leads: s.leads.map((l) =>
            l.id === id ? { ...l, etapa: "perdido" as const } : l
          ),
          cardMoves: [
            {
              id: uid("mv"),
              cardId: id,
              de: s.leads.find((l) => l.id === id)?.etapa ?? "?",
              para: "perdido",
              quando: nowLabel(),
              usuario: "Sistema",
              motivo,
            },
            ...s.cardMoves,
          ],
        }));
      },
      addProposal: (data) => {
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
        const order = [
          "documentos",
          "prefeitura",
          "cartorio",
          "registro",
          "matricula",
          "entregue",
        ] as const;
        setState((s) => ({
          ...s,
          regularization: s.regularization.map((r) => {
            if (r.id !== id) return r;
            const i = order.indexOf(r.etapa);
            if (i < 0 || i >= order.length - 1) return r;
            return { ...r, etapa: order[i + 1] };
          }),
        }));
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

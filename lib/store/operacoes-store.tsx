"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { unifiedOperacoesSeed } from "@/lib/domain/unified-seed";
import type {
  OperacoesState,
  Payable,
  PurchaseStatus,
  Receivable,
  WorkSite,
} from "@/lib/domain/operacoes-types";
import { useStorePersist } from "@/lib/persist/use-store-persist";
import { saveSnapshot } from "@/lib/persist/snapshots";
import { DEMO_ORG_ID } from "@/lib/persist/store-keys";
import { isDemoToolsAllowed } from "@/lib/runtime/demo-mode";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function nowLabel() {
  return new Date().toLocaleString("pt-BR");
}

const PURCHASE_FLOW: PurchaseStatus[] = [
  "rascunho",
  "em_aprovacao",
  "a_atender",
  "em_andamento",
  "concluida",
];

type OperacoesApi = {
  state: OperacoesState;
  ready: boolean;
  reset: () => void;
  baixarPagar: (id: string) => void;
  baixarReceber: (id: string) => void;
  addPayable: (data: Omit<Payable, "id" | "status">) => void;
  addReceivable: (data: Omit<Receivable, "id" | "status">) => void;
  transferir: (input: {
    deContaId: string;
    paraContaId: string;
    valor: number;
    descricao: string;
  }) => boolean;
  aprovarPreEntry: (id: string) => void;
  recusarPreEntry: (id: string) => void;
  updateWorkProgress: (
    id: string,
    patch: Partial<Pick<WorkSite, "fisico" | "realizado">>
  ) => void;
  addPurchase: (data: {
    descricao: string;
    centroCusto: string;
    necessidade: string;
    urgente: boolean;
    itens: number;
    valorEstimado: number;
  }) => void;
  avancarPurchase: (id: string) => void;
  aprovarPurchase: (id: string) => void;
  gerarOrdemCompra: (requestId: string, fornecedor: string) => void;
  runImportEntity: (id: string) => void;
  runImportAllDemo: () => void;
  refreshConference: (actuals: Record<string, number>) => void;
};

const Ctx = createContext<OperacoesApi | null>(null);

export function OperacoesStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OperacoesState>(() =>
    unifiedOperacoesSeed()
  );
  const [ready, setReady] = useState(false);

  useStorePersist({
    storeKey: "operacoes",
    ready,
    setReady,
    state,
    setState,
    seed: unifiedOperacoesSeed,
  });

  const api = useMemo<OperacoesApi>(
    () => ({
      state,
      ready,
      reset: () => {
        if (!isDemoToolsAllowed()) return;
        const next = unifiedOperacoesSeed();
        setState(next);
        void saveSnapshot("operacoes", next, DEMO_ORG_ID);
      },
      baixarPagar: (id) => {
        setState((s) => {
          const item = s.payables.find((p) => p.id === id);
          if (!item || item.status === "pago") return s;
          return {
            ...s,
            payables: s.payables.map((p) =>
              p.id === id
                ? { ...p, status: "pago" as const, pagoEm: todayIso() }
                : p
            ),
            accounts: s.accounts.map((a) =>
              a.id === item.contaId
                ? { ...a, saldo: a.saldo - item.valor }
                : a
            ),
          };
        });
      },
      baixarReceber: (id) => {
        setState((s) => {
          const item = s.receivables.find((p) => p.id === id);
          if (!item || item.status === "recebido") return s;
          return {
            ...s,
            receivables: s.receivables.map((p) =>
              p.id === id
                ? { ...p, status: "recebido" as const, recebidoEm: todayIso() }
                : p
            ),
            accounts: s.accounts.map((a) =>
              a.id === item.contaId
                ? { ...a, saldo: a.saldo + item.valor }
                : a
            ),
          };
        });
      },
      addPayable: (data) => {
        setState((s) => ({
          ...s,
          payables: [
            { ...data, id: uid("ap"), status: "em_aberto" },
            ...s.payables,
          ],
        }));
      },
      addReceivable: (data) => {
        setState((s) => ({
          ...s,
          receivables: [
            { ...data, id: uid("ar"), status: "em_aberto" },
            ...s.receivables,
          ],
        }));
      },
      transferir: ({ deContaId, paraContaId, valor, descricao }) => {
        if (deContaId === paraContaId || valor <= 0) return false;
        const de = state.accounts.find((a) => a.id === deContaId);
        if (!de || de.saldo < valor) return false;
        setState((s) => ({
          ...s,
          accounts: s.accounts.map((a) => {
            if (a.id === deContaId) return { ...a, saldo: a.saldo - valor };
            if (a.id === paraContaId) return { ...a, saldo: a.saldo + valor };
            return a;
          }),
          transfers: [
            {
              id: uid("tr"),
              deContaId,
              paraContaId,
              valor,
              data: todayIso(),
              descricao,
            },
            ...s.transfers,
          ],
        }));
        return true;
      },
      aprovarPreEntry: (id) => {
        setState((s) => {
          const pre = s.preEntries.find((p) => p.id === id);
          if (!pre || pre.status !== "pendente") return s;
          return {
            ...s,
            preEntries: s.preEntries.map((p) =>
              p.id === id ? { ...p, status: "aprovado" as const } : p
            ),
            payables: [
              {
                id: uid("ap"),
                favorecido: pre.solicitante,
                descricao: pre.descricao,
                categoria: "Pré-lançamento",
                centroCusto: pre.centroCusto,
                vencimento: todayIso(),
                valor: pre.valor,
                status: "em_aberto" as const,
                contaId: s.accounts[0]?.id ?? "acc-sicredi",
              },
              ...s.payables,
            ],
          };
        });
      },
      recusarPreEntry: (id) => {
        setState((s) => ({
          ...s,
          preEntries: s.preEntries.map((p) =>
            p.id === id ? { ...p, status: "recusado" as const } : p
          ),
        }));
      },
      updateWorkProgress: (id, patch) => {
        setState((s) => ({
          ...s,
          works: s.works.map((w) => (w.id === id ? { ...w, ...patch } : w)),
        }));
      },
      addPurchase: (data) => {
        const n = state.purchases.length + 1001;
        setState((s) => ({
          ...s,
          purchases: [
            {
              id: uid("sc"),
              numero: `SC-${n}`,
              solicitante: "Usuário demo",
              status: "rascunho",
              ...data,
            },
            ...s.purchases,
          ],
        }));
      },
      avancarPurchase: (id) => {
        setState((s) => ({
          ...s,
          purchases: s.purchases.map((p) => {
            if (p.id !== id) return p;
            const i = PURCHASE_FLOW.indexOf(p.status);
            if (i < 0 || i >= PURCHASE_FLOW.length - 1) return p;
            return { ...p, status: PURCHASE_FLOW[i + 1] };
          }),
        }));
      },
      aprovarPurchase: (id) => {
        setState((s) => ({
          ...s,
          purchases: s.purchases.map((p) =>
            p.id === id && p.status === "em_aprovacao"
              ? { ...p, status: "a_atender" as const }
              : p
          ),
        }));
      },
      gerarOrdemCompra: (requestId, fornecedor) => {
        setState((s) => {
          const req = s.purchases.find((p) => p.id === requestId);
          if (!req) return s;
          const n = s.orders.length + 500;
          return {
            ...s,
            purchases: s.purchases.map((p) =>
              p.id === requestId
                ? { ...p, status: "em_andamento" as const }
                : p
            ),
            orders: [
              {
                id: uid("oc"),
                numero: `OC-${n}`,
                fornecedor,
                centroCusto: req.centroCusto,
                valor: req.valorEstimado,
                status: "aprovado",
                requestId,
              },
              ...s.orders,
            ],
            payables: [
              {
                id: uid("ap"),
                favorecido: fornecedor,
                descricao: `OC de ${req.numero} · ${req.descricao}`,
                categoria: "Compras",
                centroCusto: req.centroCusto,
                vencimento: todayIso(),
                valor: req.valorEstimado,
                status: "em_aberto" as const,
                contaId: s.accounts[0]?.id ?? "acc-sicredi",
              },
              ...s.payables,
            ],
          };
        });
      },
      runImportEntity: (id) => {
        setState((s) => ({
          ...s,
          lastImportAt: nowLabel(),
          importQueue: s.importQueue.map((e) => {
            if (e.id !== id) return e;
            const imported = Math.min(
              e.expected,
              Math.round(e.expected * (0.85 + Math.random() * 0.15))
            );
            const status =
              imported === e.expected
                ? ("ok" as const)
                : imported === 0
                  ? ("pendente" as const)
                  : ("parcial" as const);
            return {
              ...e,
              imported,
              status,
              legacyIdSample: `lw-${e.entidade}-demo`,
            };
          }),
        }));
      },
      runImportAllDemo: () => {
        setState((s) => ({
          ...s,
          lastImportAt: nowLabel(),
          importQueue: s.importQueue.map((e) => {
            const imported =
              e.entidade === "parcelas" || e.entidade === "recebimentos"
                ? Math.round(e.expected * 0.92)
                : e.expected;
            return {
              ...e,
              imported,
              status:
                imported === e.expected
                  ? ("ok" as const)
                  : ("parcial" as const),
              legacyIdSample: `lw-${e.entidade}-demo`,
            };
          }),
          conference: s.conference.map((c) => ({
            ...c,
            actual:
              c.unit === "money"
                ? Math.round(c.expected * 0.98 * 100) / 100
                : c.expected,
          })),
        }));
      },
      refreshConference: (actuals) => {
        setState((s) => ({
          ...s,
          conference: s.conference.map((c) =>
            actuals[c.id] !== undefined
              ? { ...c, actual: actuals[c.id] }
              : c
          ),
        }));
      },
    }),
    [state, ready]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useOperacoes() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useOperacoes must be used within OperacoesStoreProvider");
  return ctx;
}

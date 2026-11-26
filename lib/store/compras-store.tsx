"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  contadoresItens,
  seedCompras,
} from "@/lib/domain/compras-seed";
import { useStorePersist } from "@/lib/persist/use-store-persist";
import { saveSnapshot } from "@/lib/persist/snapshots";
import { DEMO_ORG_ID } from "@/lib/persist/store-keys";
import { isDemoToolsAllowed } from "@/lib/runtime/demo-mode";
import type {
  CentroCusto,
  ComprasState,
  Cotacao,
  CotacaoStatus,
  OcAprovacao,
  OrdemCompra,
  ScStatus,
  Solicitacao,
} from "@/lib/domain/compras-types";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

type ComprasApi = {
  state: ComprasState;
  ready: boolean;
  reset: () => void;
  contadores: typeof contadoresItens;
  addSolicitacao: (input: {
    descricao: string;
    centro: CentroCusto;
    necessidade: string;
    urgente: boolean;
    solicitante: string;
    itens: {
      descricao: string;
      unidade: string;
      quantidade: number;
      insumoId?: string;
      budgetNodeId?: string;
    }[];
  }) => Solicitacao | null;
  enviarSolicitacao: (id: string) => boolean;
  aprovarSolicitacao: (id: string) => boolean;
  recusarSolicitacao: (id: string, motivo: string) => boolean;
  marcarRecebimento: (scId: string, itemId: string, qtd: number) => boolean;
  criarCotacaoDeSc: (
    requestId: string,
    fornecedores: { fornecedor: string; email?: string; telefone?: string }[]
  ) => Cotacao | null;
  setVencedor: (cotacaoId: string, itemId: string, supplierId: string) => boolean;
  gerarOrdensDaCotacao: (cotacaoId: string) => OrdemCompra[];
  aprovarOrdem: (id: string) => { ok: boolean; payable?: { id: string; valor: number; favorecido: string; descricao: string; centro: string } };
  negarOrdem: (id: string) => boolean;
  marcarOcComprada: (id: string) => boolean;
  marcarOcEntregue: (id: string, parcial?: boolean) => boolean;
};

const Ctx = createContext<ComprasApi | null>(null);

export function ComprasStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ComprasState>(() => seedCompras());
  const [ready, setReady] = useState(false);

  useStorePersist({
    storeKey: "compras",
    ready,
    setReady,
    state,
    setState,
    seed: seedCompras,
  });

  const api = useMemo<ComprasApi>(
    () => ({
      state,
      ready,
      contadores: contadoresItens,
      reset: () => {
        if (!isDemoToolsAllowed()) return;
        const next = seedCompras();
        setState(next);
        void saveSnapshot("compras", next, DEMO_ORG_ID);
      },
      addSolicitacao: (input) => {
        if (!input.centro?.label) return null;
        if (!input.itens.length) return null;
        const n =
          state.solicitacoes.reduce((m, s) => {
            const num = Number(s.numero.replace(/\D/g, ""));
            return Number.isFinite(num) ? Math.max(m, num) : m;
          }, 2000) + 1;
        const sc: Solicitacao = {
          id: uid("sc"),
          numero: `SC-${n}`,
          descricao: input.descricao,
          centro: input.centro,
          solicitante: input.solicitante,
          criadoEm: todayIso(),
          necessidade: input.necessidade,
          urgente: input.urgente,
          status: "rascunho",
          itens: input.itens.map((it) => ({
            id: uid("sci"),
            descricao: it.descricao,
            unidade: it.unidade,
            quantidade: it.quantidade,
            quantidadeCotada: 0,
            quantidadeComprada: 0,
            quantidadeRecebida: 0,
            insumoId: it.insumoId,
            budgetNodeId: it.budgetNodeId,
            status: "solicitado",
          })),
          cotacaoIds: [],
          ordemIds: [],
        };
        setState((s) => ({
          ...s,
          solicitacoes: [sc, ...s.solicitacoes],
        }));
        return sc;
      },
      enviarSolicitacao: (id) => {
        const sc = state.solicitacoes.find((x) => x.id === id);
        if (!sc || sc.status !== "rascunho") return false;
        if (!sc.centro?.label) return false;
        setState((s) => ({
          ...s,
          solicitacoes: s.solicitacoes.map((x) =>
            x.id === id ? { ...x, status: "em_aprovacao" as ScStatus } : x
          ),
        }));
        return true;
      },
      aprovarSolicitacao: (id) => {
        const sc = state.solicitacoes.find((x) => x.id === id);
        if (!sc || sc.status !== "em_aprovacao") return false;
        setState((s) => ({
          ...s,
          solicitacoes: s.solicitacoes.map((x) =>
            x.id === id ? { ...x, status: "a_atender" as ScStatus } : x
          ),
        }));
        return true;
      },
      recusarSolicitacao: (id, motivo) => {
        if (!motivo.trim()) return false;
        const sc = state.solicitacoes.find((x) => x.id === id);
        if (!sc || sc.status !== "em_aprovacao") return false;
        setState((s) => ({
          ...s,
          solicitacoes: s.solicitacoes.map((x) =>
            x.id === id
              ? {
                  ...x,
                  status: "recusada" as ScStatus,
                  motivoRecusa: motivo.trim(),
                }
              : x
          ),
        }));
        return true;
      },
      marcarRecebimento: (scId, itemId, qtd) => {
        if (qtd <= 0) return false;
        setState((s) => ({
          ...s,
          solicitacoes: s.solicitacoes.map((sc) => {
            if (sc.id !== scId) return sc;
            const itens = sc.itens.map((it) => {
              if (it.id !== itemId) return it;
              const recebida = Math.min(
                it.quantidade,
                it.quantidadeRecebida + qtd
              );
              return {
                ...it,
                quantidadeRecebida: recebida,
                status:
                  recebida >= it.quantidade ? "recebido" : "recebido_parcial",
              };
            });
            const all = itens.every(
              (it) => it.quantidadeRecebida >= it.quantidade
            );
            return {
              ...sc,
              itens,
              status: all ? ("concluida" as ScStatus) : sc.status,
            };
          }),
        }));
        return true;
      },
      criarCotacaoDeSc: (requestId, fornecedores) => {
        const sc = state.solicitacoes.find((x) => x.id === requestId);
        if (!sc || sc.status === "rascunho" || sc.status === "em_aprovacao") {
          return null;
        }
        if (sc.status === "recusada") return null;
        if (fornecedores.length < 1) return null;
        const n =
          Math.max(
            state.config.cotacaoNumeroInicial - 1,
            ...state.cotacoes.map((c) =>
              Number(c.numero.replace(/\D/g, "")) || 0
            )
          ) + 1;
        const itens = sc.itens.map((it) => ({
          id: uid("coti"),
          requestItemId: it.id,
          descricao: it.descricao,
          unidade: it.unidade,
          quantidade: it.quantidade,
          valorOrcamento: 0,
        }));
        const fors = fornecedores.map((f) => ({
          id: uid("for"),
          fornecedor: f.fornecedor,
          email: f.email,
          telefone: f.telefone,
          qualificacao: 3,
          publicToken: uid("tok"),
          respondido: true,
        }));
        const precos = itens.flatMap((it) =>
          fors.map((f, idx) => ({
            id: uid("pr"),
            itemId: it.id,
            supplierId: f.id,
            precoUnitario: 50 + idx * 3 + Math.round(Math.random() * 5),
            quantidadeCotada: it.quantidade,
            prazoDias: 3 + idx,
            vencedor: false,
          }))
        );
        const cot: Cotacao = {
          id: uid("cot"),
          numero: `COT-${n}`,
          descricao: `Cotação · ${sc.descricao}`,
          requestId: sc.id,
          centro: sc.centro,
          status: "cotado",
          prioridade: sc.urgente,
          necessidade: sc.necessidade,
          solicitante: sc.solicitante,
          criadoEm: todayIso(),
          itens,
          fornecedores: fors,
          precos,
          ordemIds: [],
        };
        setState((s) => ({
          ...s,
          cotacoes: [cot, ...s.cotacoes],
          solicitacoes: s.solicitacoes.map((x) =>
            x.id === sc.id
              ? {
                  ...x,
                  status: "em_andamento" as ScStatus,
                  cotacaoIds: [...x.cotacaoIds, cot.id],
                  itens: x.itens.map((it) => ({
                    ...it,
                    quantidadeCotada: it.quantidade,
                    status: "em_cotacao",
                  })),
                }
              : x
          ),
        }));
        return cot;
      },
      setVencedor: (cotacaoId, itemId, supplierId) => {
        setState((s) => ({
          ...s,
          cotacoes: s.cotacoes.map((c) => {
            if (c.id !== cotacaoId) return c;
            return {
              ...c,
              precos: c.precos.map((p) =>
                p.itemId === itemId
                  ? { ...p, vencedor: p.supplierId === supplierId }
                  : p
              ),
            };
          }),
        }));
        return true;
      },
      gerarOrdensDaCotacao: (cotacaoId) => {
        const cot = state.cotacoes.find((c) => c.id === cotacaoId);
        if (!cot) return [];
        const winners = cot.precos.filter((p) => p.vencedor);
        if (!winners.length) return [];
        const bySupplier = new Map<string, typeof winners>();
        for (const w of winners) {
          const list = bySupplier.get(w.supplierId) ?? [];
          list.push(w);
          bySupplier.set(w.supplierId, list);
        }
        const created: OrdemCompra[] = [];
        let nBase = Math.max(
          state.config.ocNumeroInicial - 1,
          ...state.ordens.map((o) => Number(o.numero.replace(/\D/g, "")) || 0)
        );
        for (const [supplierId, ws] of bySupplier) {
          const forn = cot.fornecedores.find((f) => f.id === supplierId);
          if (!forn) continue;
          nBase += 1;
          const itens = ws.map((w) => {
            const item = cot.itens.find((i) => i.id === w.itemId)!;
            const valor =
              Math.round(w.precoUnitario * w.quantidadeCotada * 100) / 100;
            return {
              id: uid("oci"),
              quotationItemId: item.id,
              descricao: item.descricao,
              unidade: item.unidade,
              quantidade: w.quantidadeCotada,
              valorUnitario: w.precoUnitario,
              valor,
            };
          });
          const valor = itens.reduce((a, i) => a + i.valor, 0);
          const oc: OrdemCompra = {
            id: uid("oc"),
            numero: `OC-${nBase}`,
            fornecedor: forn.fornecedor,
            descricao: cot.descricao,
            centro: cot.centro,
            quotationId: cot.id,
            requestId: cot.requestId,
            valor,
            frete: 0,
            outrasDespesas: 0,
            impostos: 0,
            desconto: 0,
            aprovacaoStatus: "aguardando_aprovacao",
            compraStatus: "aguardando",
            criadoEm: todayIso(),
            itens,
          };
          created.push(oc);
        }
        if (!created.length) return [];
        setState((s) => {
          const orderIds = created.map((o) => o.id);
          return {
            ...s,
            ordens: [...created, ...s.ordens],
            cotacoes: s.cotacoes.map((c) =>
              c.id === cotacaoId
                ? {
                    ...c,
                    status: "finalizado" as CotacaoStatus,
                    ordemIds: [...c.ordemIds, ...orderIds],
                  }
                : c
            ),
            solicitacoes: s.solicitacoes.map((sc) => {
              if (sc.id !== cot.requestId) return sc;
              return {
                ...sc,
                ordemIds: [...sc.ordemIds, ...orderIds],
                itens: sc.itens.map((it) => {
                  const linked = created
                    .flatMap((o) => o.itens)
                    .filter((oi) => {
                      const qi = cot.itens.find(
                        (i) => i.id === oi.quotationItemId
                      );
                      return qi?.requestItemId === it.id;
                    });
                  const comprada = linked.reduce(
                    (a, i) => a + i.quantidade,
                    it.quantidadeComprada
                  );
                  return {
                    ...it,
                    quantidadeComprada: Math.min(it.quantidade, comprada),
                    status: "em_compra",
                  };
                }),
              };
            }),
          };
        });
        return created;
      },
      aprovarOrdem: (id) => {
        const oc = state.ordens.find((o) => o.id === id);
        if (!oc || oc.aprovacaoStatus === "aprovado") {
          return { ok: false };
        }
        if (!oc.quotationId && !state.config.permitirOcSemCotacao) {
          return { ok: false };
        }
        const payableId = uid("pay");
        const total =
          oc.valor + oc.frete + oc.outrasDespesas + oc.impostos - oc.desconto;
        setState((s) => ({
          ...s,
          ordens: s.ordens.map((o) =>
            o.id === id
              ? {
                  ...o,
                  aprovacaoStatus: "aprovado" as OcAprovacao,
                  compraStatus: "comprado",
                  payableId,
                }
              : o
          ),
        }));
        return {
          ok: true,
          payable: {
            id: payableId,
            valor: Math.round(total * 100) / 100,
            favorecido: oc.fornecedor,
            descricao: `OC ${oc.numero} · ${oc.descricao}`,
            centro: oc.centro.label,
          },
        };
      },
      negarOrdem: (id) => {
        setState((s) => ({
          ...s,
          ordens: s.ordens.map((o) =>
            o.id === id
              ? { ...o, aprovacaoStatus: "negado" as OcAprovacao }
              : o
          ),
        }));
        return true;
      },
      marcarOcComprada: (id) => {
        setState((s) => ({
          ...s,
          ordens: s.ordens.map((o) =>
            o.id === id ? { ...o, compraStatus: "comprado" } : o
          ),
        }));
        return true;
      },
      marcarOcEntregue: (id, parcial) => {
        setState((s) => ({
          ...s,
          ordens: s.ordens.map((o) =>
            o.id === id
              ? {
                  ...o,
                  compraStatus: parcial ? "entregue_parcial" : "entregue_total",
                }
              : o
          ),
        }));
        return true;
      },
    }),
    [state, ready]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCompras() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useCompras must be used within ComprasStoreProvider");
  }
  return ctx;
}

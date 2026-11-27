"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  categoriaNome,
  planoDaCategoria,
  seedFinanceiro,
} from "@/lib/domain/financeiro-seed";
import {
  dualWriteCategoria,
  dualWriteConta,
  dualWriteFaturamento,
  dualWriteLancamento,
  dualWriteNatureza,
  dualWritePagamento,
  dualWritePlano,
  dualWritePreLancamento,
  dualWriteRecebimento,
  dualWriteTransferencia,
} from "@/lib/persist/dual-write";
import { loadFinanceiroFromTables } from "@/lib/persist/load-from-tables";
import { useStorePersist } from "@/lib/persist/use-store-persist";
import { saveSnapshot } from "@/lib/persist/snapshots";
import { DEMO_ORG_ID } from "@/lib/persist/store-keys";
import { isDemoToolsAllowed } from "@/lib/runtime/demo-mode";
import type {
  Categoria,
  CentroFin,
  CondicaoPagamento,
  ContaBancaria,
  Faturamento,
  FinanceiroConfig,
  FinanceiroState,
  FormaPagamento,
  Lancamento,
  MeuCnpj,
  NaturezaReceita,
  NotaFiscal,
  Pagamento,
  PagamentoStatus,
  PlanoConta,
  PreLancamento,
  Recebimento,
  Transferencia,
} from "@/lib/domain/financeiro-types";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

type FinanceiroApi = {
  state: FinanceiroState;
  ready: boolean;
  reset: () => void;
  categoriaNome: (id: string) => string;
  planoDaCategoria: (id: string) => ReturnType<typeof planoDaCategoria>;
  addLancamento: (input: {
    descricao: string;
    favorecido: string;
    categoriaId: string;
    competencia: string;
    vencimento: string;
    pagador: string;
    contaId: string;
    valor: number;
    forma: FormaPagamento;
    condicao: CondicaoPagamento;
    parcelas?: number;
    centros: CentroFin[];
    numeroDoc?: string;
    marcarPago?: boolean;
    observacoes?: string;
    retencoes?: { tipo: string; valor: number }[];
  }) => { ok: boolean; lancamento?: Lancamento; pagamentos?: Pagamento[] };
  baixarPagamento: (
    id: string,
    valor: number,
    forma?: FormaPagamento
  ) => boolean;
  estornarPagamento: (id: string) => boolean;
  conciliarPagamento: (id: string) => boolean;
  desconciliarPagamento: (id: string) => boolean;
  /** C15 — baixar / conciliar em lote. */
  baixarPagamentosLote: (ids: string[]) => number;
  conciliarPagamentosLote: (ids: string[]) => number;
  setPagamentoStatus: (id: string, status: PagamentoStatus) => boolean;
  setRecebimentoStatus: (
    id: string,
    status: Recebimento["status"]
  ) => boolean;
  addFaturamento: (input: {
    descricao: string;
    cliente: string;
    naturezaId: string;
    competencia: string;
    vencimento: string;
    centro: CentroFin;
    contaId: string;
    valorBruto: number;
    impostosRetidos?: number;
    forma: FormaPagamento;
    marcarRecebido?: boolean;
  }) => { ok: boolean; faturamento?: Faturamento };
  baixarRecebimento: (id: string, valor: number) => boolean;
  estornarRecebimento: (id: string) => boolean;
  /** C15 — baixar recebimentos em lote. */
  baixarRecebimentosLote: (ids: string[]) => number;
  addConta: (input: Omit<ContaBancaria, "id" | "saldo" | "ativa"> & { ativa?: boolean }) => ContaBancaria;
  transferir: (input: {
    data: string;
    descricao: string;
    deContaId: string;
    paraContaId: string;
    valor: number;
    pago: boolean;
  }) => Transferencia | null;
  /** G15 — conciliar (marcar como paga) em lote. */
  conciliarTransferencias: (ids: string[]) => number;
  addPreLancamento: (input: {
    descricao: string;
    valor: number;
    centro: CentroFin;
    solicitante: string;
  }) => PreLancamento;
  aprovarPre: (id: string) => boolean;
  recusarPre: (id: string, motivo: string) => boolean;
  /** C15 — aprovar pré-lançamentos em lote. */
  aprovarPresLote: (ids: string[]) => number;
  resultadosPorGrupo: (visao: "geral" | "empresa" | "obra", obraId?: string) => {
    grupo: string;
    valor: number;
  }[];
  fluxoMensal: (visao: "geral" | "empresa" | "obra", obraId?: string) => {
    receitas: number;
    despesas: number;
    saldo: number;
  };
  /** G20 — parâmetros financeiros. */
  updateConfig: (patch: Partial<FinanceiroConfig>) => void;
  addNota: (input: Omit<NotaFiscal, "id">) => NotaFiscal;
  vincularNota: (notaId: string, lancamentoId: string) => boolean;
  desvincularNota: (notaId: string) => boolean;
  updateMeuCnpj: (
    id: string,
    patch: Partial<
      Pick<
        MeuCnpj,
        | "certificadoNome"
        | "certificadoValidade"
        | "emissaoNfse"
        | "capturaAutomatica"
      >
    >
  ) => boolean;
  addPlano: (data: Omit<PlanoConta, "id">) => PlanoConta;
  updatePlano: (id: string, patch: Partial<PlanoConta>) => boolean;
  removePlano: (id: string) => { ok: boolean; reason?: string };
  addCategoria: (data: Omit<Categoria, "id">) => Categoria;
  updateCategoria: (id: string, patch: Partial<Categoria>) => boolean;
  removeCategoria: (id: string) => { ok: boolean; reason?: string };
  addNatureza: (data: Omit<NaturezaReceita, "id">) => NaturezaReceita;
  updateNatureza: (id: string, patch: Partial<NaturezaReceita>) => boolean;
  removeNatureza: (id: string) => { ok: boolean; reason?: string };
};

const Ctx = createContext<FinanceiroApi | null>(null);

function matchCentro(
  label: string,
  visao: "geral" | "empresa" | "obra",
  _obraId?: string
) {
  if (visao === "geral") return true;
  if (visao === "empresa") {
    return /empresa|meu lote/i.test(label);
  }
  // obra: tudo que não é só centro empresa
  return !/^meu lote fácil$/i.test(label.trim());
}

export function FinanceiroStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FinanceiroState>(() => seedFinanceiro());
  const [ready, setReady] = useState(false);

  useStorePersist({
    storeKey: "financeiro",
    ready,
    setReady,
    state,
    setState,
    seed: seedFinanceiro,
    loadTables: loadFinanceiroFromTables,
  });

  const api = useMemo<FinanceiroApi>(
    () => ({
      state,
      ready,
      reset: () => {
        if (!isDemoToolsAllowed()) return;
        const next = seedFinanceiro();
        setState(next);
        void saveSnapshot("financeiro", next, DEMO_ORG_ID);
      },
      categoriaNome: (id) => categoriaNome(state, id),
      planoDaCategoria: (id) => planoDaCategoria(state, id),
      addLancamento: (input) => {
        if (!input.categoriaId || !input.contaId || input.valor <= 0) {
          return { ok: false };
        }
        if (!input.centros.length || !input.centros.every((c) => c.label)) {
          return { ok: false };
        }
        if (
          state.config.numeroDocObrigatorioLancamento &&
          !input.numeroDoc?.trim()
        ) {
          return { ok: false };
        }
        const nParc =
          input.condicao === "parcelado"
            ? Math.max(2, input.parcelas ?? 2)
            : 1;
        const base = Math.round((input.valor / nParc) * 100) / 100;
        const lan: Lancamento = {
          id: uid("lan"),
          descricao: input.descricao,
          favorecido: input.favorecido,
          categoriaId: input.categoriaId,
          competencia: input.competencia,
          vencimento: input.vencimento,
          pagador: input.pagador,
          contaId: input.contaId,
          valor: input.valor,
          numeroDoc: input.numeroDoc,
          forma: input.forma,
          condicao: input.condicao,
          centros: input.centros,
          observacoes: input.observacoes,
          retencoes: input.retencoes?.filter((r) => r.tipo && r.valor > 0),
          criadoEm: todayIso(),
        };
        const pags: Pagamento[] = [];
        for (let i = 0; i < nParc; i++) {
          const d = new Date(input.vencimento + "T12:00:00");
          d.setMonth(d.getMonth() + i);
          const venc = d.toISOString().slice(0, 10);
          const valor =
            i === nParc - 1
              ? Math.round((input.valor - base * (nParc - 1)) * 100) / 100
              : base;
          const centroLabel =
            input.centros.length === 1
              ? input.centros[0].label
              : input.centros
                  .map(
                    (c) =>
                      `${c.label}${c.pct != null ? ` (${c.pct}%)` : c.valor != null ? ` (${c.valor})` : ""}`
                  )
                  .join(" · ");
          const pago = !!input.marcarPago && nParc === 1;
          pags.push({
            id: uid("pag"),
            lancamentoId: lan.id,
            parcela: `${i + 1}/${nParc}`,
            vencimento: venc,
            valor,
            valorPago: pago ? valor : 0,
            status: pago ? "pago" : ("em_aberto" as PagamentoStatus),
            favorecido: input.favorecido,
            descricao: input.descricao,
            categoriaId: input.categoriaId,
            contaId: input.contaId,
            centroLabel,
            forma: input.forma,
            condicao: input.condicao,
            numeroDoc: input.numeroDoc,
            pagoEm: pago ? todayIso() : undefined,
            conciliado: false,
            historico: pago
              ? [
                  {
                    valor,
                    data: todayIso(),
                    contaId: input.contaId,
                    forma: input.forma,
                    quem: "Admin Demo",
                  },
                ]
              : [],
          });
        }
        setState((s) => {
          let contas = s.contas;
          if (input.marcarPago && nParc === 1) {
            contas = s.contas.map((c) =>
              c.id === input.contaId
                ? { ...c, saldo: Math.round((c.saldo - input.valor) * 100) / 100 }
                : c
            );
          }
          return {
            ...s,
            lancamentos: [lan, ...s.lancamentos],
            pagamentos: [...pags, ...s.pagamentos],
            contas,
          };
        });
        void dualWriteLancamento(lan);
        for (const p of pags) void dualWritePagamento(p);
        return { ok: true, lancamento: lan, pagamentos: pags };
      },
      baixarPagamento: (id, valor, forma) => {
        if (valor <= 0) return false;
        const pag = state.pagamentos.find((p) => p.id === id);
        if (!pag || pag.status === "pago") return false;
        const resto = Math.round((pag.valor - pag.valorPago) * 100) / 100;
        const baixa = Math.min(valor, resto);
        const valorPago = Math.round((pag.valorPago + baixa) * 100) / 100;
        const status: PagamentoStatus =
          valorPago >= pag.valor
            ? "pago"
            : valorPago > 0
              ? "parcial"
              : pag.status;
        const next: Pagamento = {
          ...pag,
          valorPago,
          status,
          forma: forma ?? pag.forma,
          pagoEm: status === "pago" ? todayIso() : pag.pagoEm,
          historico: [
            ...pag.historico,
            {
              valor: baixa,
              data: todayIso(),
              contaId: pag.contaId,
              forma: forma ?? pag.forma,
              quem: "Admin Demo",
            },
          ],
        };
        setState((s) => ({
          ...s,
          pagamentos: s.pagamentos.map((p) => (p.id === id ? next : p)),
          contas: s.contas.map((c) =>
            c.id === pag.contaId
              ? { ...c, saldo: Math.round((c.saldo - baixa) * 100) / 100 }
              : c
          ),
        }));
        void dualWritePagamento(next);
        return true;
      },
      estornarPagamento: (id) => {
        const pag = state.pagamentos.find((p) => p.id === id);
        if (!pag || pag.valorPago <= 0) return false;
        const estorno = pag.valorPago;
        const next: Pagamento = {
          ...pag,
          valorPago: 0,
          status: "em_aberto",
          pagoEm: undefined,
          conciliado: false,
          historico: [],
        };
        setState((s) => ({
          ...s,
          pagamentos: s.pagamentos.map((p) => (p.id === id ? next : p)),
          contas: s.contas.map((c) =>
            c.id === pag.contaId
              ? { ...c, saldo: Math.round((c.saldo + estorno) * 100) / 100 }
              : c
          ),
        }));
        void dualWritePagamento(next);
        return true;
      },
      conciliarPagamento: (id) => {
        const pag = state.pagamentos.find((p) => p.id === id);
        if (!pag) return false;
        const next = { ...pag, conciliado: true };
        setState((s) => ({
          ...s,
          pagamentos: s.pagamentos.map((p) => (p.id === id ? next : p)),
        }));
        void dualWritePagamento(next);
        return true;
      },
      desconciliarPagamento: (id) => {
        const p = state.pagamentos.find((x) => x.id === id);
        if (!p?.conciliado) return false;
        const next = { ...p, conciliado: false };
        setState((s) => ({
          ...s,
          pagamentos: s.pagamentos.map((x) => (x.id === id ? next : x)),
        }));
        void dualWritePagamento(next);
        return true;
      },
      baixarPagamentosLote: (ids) => {
        const set = new Set(ids);
        let n = 0;
        setState((s) => {
          const alvos = s.pagamentos.filter(
            (p) => set.has(p.id) && p.status !== "pago"
          );
          n = alvos.length;
          if (!n) return s;
          let contas = s.contas;
          const pagamentos = s.pagamentos.map((p) => {
            if (!set.has(p.id) || p.status === "pago") return p;
            const baixa = Math.round((p.valor - p.valorPago) * 100) / 100;
            if (baixa <= 0) return p;
            contas = contas.map((c) =>
              c.id === p.contaId
                ? { ...c, saldo: Math.round((c.saldo - baixa) * 100) / 100 }
                : c
            );
            return {
              ...p,
              valorPago: p.valor,
              status: "pago" as PagamentoStatus,
              pagoEm: todayIso(),
              historico: [
                ...p.historico,
                {
                  valor: baixa,
                  data: todayIso(),
                  contaId: p.contaId,
                  forma: p.forma,
                  quem: "Lote C15",
                },
              ],
            };
          });
          return { ...s, pagamentos, contas };
        });
        return n;
      },
      conciliarPagamentosLote: (ids) => {
        const set = new Set(ids);
        let n = 0;
        setState((s) => {
          n = s.pagamentos.filter(
            (p) => set.has(p.id) && p.status === "pago" && !p.conciliado
          ).length;
          if (!n) return s;
          return {
            ...s,
            pagamentos: s.pagamentos.map((p) =>
              set.has(p.id) && p.status === "pago" && !p.conciliado
                ? { ...p, conciliado: true }
                : p
            ),
          };
        });
        return n;
      },
      setPagamentoStatus: (id, status) => {
        const p = state.pagamentos.find((x) => x.id === id);
        if (!p) return false;
        setState((s) => ({
          ...s,
          pagamentos: s.pagamentos.map((x) =>
            x.id === id
              ? {
                  ...x,
                  status,
                  valorPago: status === "pago" ? x.valor : x.valorPago,
                  pagoEm: status === "pago" ? todayIso() : x.pagoEm,
                }
              : x
          ),
        }));
        return true;
      },
      setRecebimentoStatus: (id, status) => {
        const r = state.recebimentos.find((x) => x.id === id);
        if (!r) return false;
        if (r.origem === "contrato" && status === "recebido") {
          // parcelas de contrato só via carteira
          return false;
        }
        setState((s) => ({
          ...s,
          recebimentos: s.recebimentos.map((x) =>
            x.id === id
              ? {
                  ...x,
                  status,
                  valorRecebido:
                    status === "recebido" ? x.valor : x.valorRecebido,
                }
              : x
          ),
        }));
        return true;
      },
      addFaturamento: (input) => {
        if (!input.naturezaId || !input.centro?.label || input.valorBruto <= 0) {
          return { ok: false };
        }
        const impostos = input.impostosRetidos ?? 0;
        const liquido =
          Math.round((input.valorBruto - impostos) * 100) / 100;
        const fat: Faturamento = {
          id: uid("fat"),
          descricao: input.descricao,
          cliente: input.cliente,
          naturezaId: input.naturezaId,
          competencia: input.competencia,
          vencimento: input.vencimento,
          centro: input.centro,
          contaId: input.contaId,
          valorBruto: input.valorBruto,
          impostosRetidos: impostos,
          valorLiquido: liquido,
          forma: input.forma,
          criadoEm: todayIso(),
        };
        const rec: Recebimento = {
          id: uid("rec"),
          faturamentoId: fat.id,
          origem: "faturamento",
          parcela: "1/1",
          vencimento: input.vencimento,
          valor: liquido,
          valorRecebido: input.marcarRecebido ? liquido : 0,
          status: input.marcarRecebido ? "recebido" : "em_aberto",
          cliente: input.cliente,
          descricao: input.descricao,
          naturezaId: input.naturezaId,
          contaId: input.contaId,
          centroLabel: input.centro.label,
          forma: input.forma,
          recebidoEm: input.marcarRecebido ? todayIso() : undefined,
          conciliado: false,
        };
        setState((s) => {
          let contas = s.contas;
          if (input.marcarRecebido) {
            contas = s.contas.map((c) =>
              c.id === input.contaId
                ? { ...c, saldo: Math.round((c.saldo + liquido) * 100) / 100 }
                : c
            );
          }
          return {
            ...s,
            faturamentos: [fat, ...s.faturamentos],
            recebimentos: [rec, ...s.recebimentos],
            contas,
          };
        });
        void dualWriteFaturamento(fat);
        void dualWriteRecebimento(rec);
        return { ok: true, faturamento: fat };
      },
      baixarRecebimento: (id, valor) => {
        if (valor <= 0) return false;
        const rec = state.recebimentos.find((r) => r.id === id);
        if (!rec || rec.status === "recebido") return false;
        const resto = Math.round((rec.valor - rec.valorRecebido) * 100) / 100;
        const baixa = Math.min(valor, resto);
        const valorRecebido =
          Math.round((rec.valorRecebido + baixa) * 100) / 100;
        const next: Recebimento = {
          ...rec,
          valorRecebido,
          status:
            valorRecebido >= rec.valor
              ? "recebido"
              : valorRecebido > 0
                ? "parcial"
                : rec.status,
          recebidoEm:
            valorRecebido >= rec.valor ? todayIso() : rec.recebidoEm,
        };
        setState((s) => ({
          ...s,
          recebimentos: s.recebimentos.map((r) =>
            r.id === id ? next : r
          ),
          contas: s.contas.map((c) =>
            c.id === rec.contaId
              ? { ...c, saldo: Math.round((c.saldo + baixa) * 100) / 100 }
              : c
          ),
        }));
        void dualWriteRecebimento(next);
        return true;
      },
      estornarRecebimento: (id) => {
        const rec = state.recebimentos.find((r) => r.id === id);
        if (!rec || rec.valorRecebido <= 0) return false;
        const estorno = rec.valorRecebido;
        const next: Recebimento = {
          ...rec,
          valorRecebido: 0,
          status: "em_aberto",
          recebidoEm: undefined,
          conciliado: false,
        };
        setState((s) => ({
          ...s,
          recebimentos: s.recebimentos.map((r) =>
            r.id === id ? next : r
          ),
          contas: s.contas.map((c) =>
            c.id === rec.contaId
              ? { ...c, saldo: Math.round((c.saldo - estorno) * 100) / 100 }
              : c
          ),
        }));
        void dualWriteRecebimento(next);
        return true;
      },
      baixarRecebimentosLote: (ids) => {
        const set = new Set(ids);
        let n = 0;
        setState((s) => {
          const alvos = s.recebimentos.filter(
            (r) =>
              set.has(r.id) &&
              r.status !== "recebido" &&
              r.origem !== "contrato"
          );
          n = alvos.length;
          if (!n) return s;
          let contas = s.contas;
          const recebimentos = s.recebimentos.map((r) => {
            if (
              !set.has(r.id) ||
              r.status === "recebido" ||
              r.origem === "contrato"
            ) {
              return r;
            }
            const baixa = Math.round((r.valor - r.valorRecebido) * 100) / 100;
            if (baixa <= 0) return r;
            contas = contas.map((c) =>
              c.id === r.contaId
                ? { ...c, saldo: Math.round((c.saldo + baixa) * 100) / 100 }
                : c
            );
            return {
              ...r,
              valorRecebido: r.valor,
              status: "recebido" as const,
              recebidoEm: todayIso(),
            };
          });
          return { ...s, recebimentos, contas };
        });
        return n;
      },
      addConta: (input) => {
        const c: ContaBancaria = {
          id: uid("cta"),
          ...input,
          saldo: input.valorInicial,
          ativa: input.ativa ?? true,
        };
        setState((s) => ({ ...s, contas: [...s.contas, c] }));
        void dualWriteConta(c);
        return c;
      },
      transferir: (input) => {
        if (
          input.valor <= 0 ||
          input.deContaId === input.paraContaId ||
          !input.deContaId ||
          !input.paraContaId
        ) {
          return null;
        }
        const tr: Transferencia = {
          id: uid("tr"),
          data: input.data,
          descricao: input.descricao,
          deContaId: input.deContaId,
          paraContaId: input.paraContaId,
          valor: input.valor,
          pago: input.pago,
        };
        setState((s) => {
          let contas = s.contas;
          if (input.pago) {
            contas = s.contas.map((c) => {
              if (c.id === input.deContaId) {
                return {
                  ...c,
                  saldo: Math.round((c.saldo - input.valor) * 100) / 100,
                };
              }
              if (c.id === input.paraContaId) {
                return {
                  ...c,
                  saldo: Math.round((c.saldo + input.valor) * 100) / 100,
                };
              }
              return c;
            });
          }
          return {
            ...s,
            transferencias: [tr, ...s.transferencias],
            contas,
          };
        });
        void dualWriteTransferencia(tr);
        return tr;
      },
      conciliarTransferencias: (ids) => {
        const setIds = new Set(ids);
        const alvos = state.transferencias.filter(
          (t) => setIds.has(t.id) && !t.pago
        );
        if (!alvos.length) return 0;
        setState((s) => {
          let contas = s.contas;
          for (const t of alvos) {
            contas = contas.map((c) => {
              if (c.id === t.deContaId) {
                return {
                  ...c,
                  saldo: Math.round((c.saldo - t.valor) * 100) / 100,
                };
              }
              if (c.id === t.paraContaId) {
                return {
                  ...c,
                  saldo: Math.round((c.saldo + t.valor) * 100) / 100,
                };
              }
              return c;
            });
          }
          const alvoSet = new Set(alvos.map((t) => t.id));
          const transferencias = s.transferencias.map((t) =>
            alvoSet.has(t.id) ? { ...t, pago: true } : t
          );
          for (const t of transferencias.filter((x) => alvoSet.has(x.id))) {
            void dualWriteTransferencia(t);
          }
          return {
            ...s,
            contas,
            transferencias,
          };
        });
        return alvos.length;
      },
      addPreLancamento: (input) => {
        const pre: PreLancamento = {
          id: uid("pre"),
          descricao: input.descricao,
          valor: input.valor,
          centro: input.centro,
          solicitante: input.solicitante,
          status: "pendente",
          criadoEm: todayIso(),
        };
        setState((s) => ({
          ...s,
          preLancamentos: [pre, ...s.preLancamentos],
        }));
        void dualWritePreLancamento(pre);
        return pre;
      },
      aprovarPre: (id) => {
        const pre = state.preLancamentos.find((p) => p.id === id);
        if (!pre || pre.status !== "pendente") return false;
        const cat =
          state.categorias.find((c) => c.nome === "Outras Despesas") ??
          state.categorias[0];
        const conta = state.contas[0];
        if (!cat || !conta) return false;
        const lanId = uid("lan");
        const pagId = uid("pag");
        const lan: Lancamento = {
          id: lanId,
          descricao: pre.descricao,
          favorecido: pre.solicitante,
          categoriaId: cat.id,
          competencia: `${todayIso().slice(0, 7)}-01`,
          vencimento: todayIso(),
          pagador: "Meu Lote Fácil",
          contaId: conta.id,
          valor: pre.valor,
          forma: "dinheiro",
          condicao: "a_vista",
          centros: [pre.centro],
          criadoEm: todayIso(),
        };
        const pag: Pagamento = {
          id: pagId,
          lancamentoId: lanId,
          parcela: "1/1",
          vencimento: todayIso(),
          valor: pre.valor,
          valorPago: 0,
          status: "em_aberto",
          favorecido: pre.solicitante,
          descricao: pre.descricao,
          categoriaId: cat.id,
          contaId: conta.id,
          centroLabel: pre.centro.label,
          forma: "dinheiro",
          condicao: "a_vista",
          conciliado: false,
          historico: [],
        };
        const preNext = {
          ...pre,
          status: "aprovado" as const,
          lancamentoId: lanId,
        };
        setState((s) => ({
          ...s,
          lancamentos: [lan, ...s.lancamentos],
          pagamentos: [pag, ...s.pagamentos],
          preLancamentos: s.preLancamentos.map((p) =>
            p.id === id ? preNext : p
          ),
        }));
        void dualWritePreLancamento(preNext);
        void dualWriteLancamento(lan);
        void dualWritePagamento(pag);
        return true;
      },
      recusarPre: (id, motivo) => {
        if (!motivo.trim()) return false;
        const pre = state.preLancamentos.find((p) => p.id === id);
        if (!pre) return false;
        const next = {
          ...pre,
          status: "recusado" as const,
          motivoRecusa: motivo.trim(),
        };
        setState((s) => ({
          ...s,
          preLancamentos: s.preLancamentos.map((p) =>
            p.id === id ? next : p
          ),
        }));
        void dualWritePreLancamento(next);
        return true;
      },
      aprovarPresLote: (ids) => {
        const set = new Set(ids);
        const cat =
          state.categorias.find((c) => c.nome === "Outras Despesas") ??
          state.categorias[0];
        const conta = state.contas[0];
        if (!cat || !conta) return 0;
        let n = 0;
        setState((s) => {
          const alvos = s.preLancamentos.filter(
            (p) => set.has(p.id) && p.status === "pendente"
          );
          n = alvos.length;
          if (!n) return s;
          const novosLan: Lancamento[] = [];
          const novosPag: Pagamento[] = [];
          const mapLan = new Map<string, string>();
          for (const pre of alvos) {
            const lanId = uid("lan");
            mapLan.set(pre.id, lanId);
            novosLan.push({
              id: lanId,
              descricao: pre.descricao,
              favorecido: pre.solicitante,
              categoriaId: cat.id,
              competencia: `${todayIso().slice(0, 7)}-01`,
              vencimento: todayIso(),
              pagador: "Meu Lote Fácil",
              contaId: conta.id,
              valor: pre.valor,
              forma: "dinheiro",
              condicao: "a_vista",
              centros: [pre.centro],
              criadoEm: todayIso(),
            });
            novosPag.push({
              id: uid("pag"),
              lancamentoId: lanId,
              parcela: "1/1",
              vencimento: todayIso(),
              valor: pre.valor,
              valorPago: 0,
              status: "em_aberto",
              favorecido: pre.solicitante,
              descricao: pre.descricao,
              categoriaId: cat.id,
              contaId: conta.id,
              centroLabel: pre.centro.label,
              forma: "dinheiro",
              condicao: "a_vista",
              conciliado: false,
              historico: [],
            });
          }
          return {
            ...s,
            lancamentos: [...novosLan, ...s.lancamentos],
            pagamentos: [...novosPag, ...s.pagamentos],
            preLancamentos: s.preLancamentos.map((p) =>
              mapLan.has(p.id)
                ? {
                    ...p,
                    status: "aprovado" as const,
                    lancamentoId: mapLan.get(p.id),
                  }
                : p
            ),
          };
        });
        return n;
      },
      resultadosPorGrupo: (visao, obraId) => {
        const pagos = state.pagamentos.filter(
          (p) =>
            p.status === "pago" &&
            matchCentro(p.centroLabel, visao, obraId)
        );
        const map = new Map<string, number>();
        for (const p of pagos) {
          const plano = planoDaCategoria(state, p.categoriaId);
          if (!plano || plano.grupoResultados === "Somente Fluxo de Caixa") {
            continue;
          }
          map.set(
            plano.grupoResultados,
            (map.get(plano.grupoResultados) ?? 0) + p.valorPago
          );
        }
        const recs = state.recebimentos.filter(
          (r) =>
            r.status === "recebido" &&
            matchCentro(r.centroLabel, visao, obraId)
        );
        const recTotal = recs.reduce((a, r) => a + r.valorRecebido, 0);
        if (recTotal) {
          map.set(
            "Receita Operacional Bruta",
            (map.get("Receita Operacional Bruta") ?? 0) + recTotal
          );
        }
        return [...map.entries()].map(([grupo, valor]) => ({ grupo, valor }));
      },
      fluxoMensal: (visao, obraId) => {
        const despesas = state.pagamentos
          .filter(
            (p) =>
              p.status === "pago" &&
              matchCentro(p.centroLabel, visao, obraId)
          )
          .reduce((a, p) => a + p.valorPago, 0);
        const receitas = state.recebimentos
          .filter(
            (r) =>
              r.status === "recebido" &&
              matchCentro(r.centroLabel, visao, obraId)
          )
          .reduce((a, r) => a + r.valorRecebido, 0);
        return {
          receitas,
          despesas,
          saldo: Math.round((receitas - despesas) * 100) / 100,
        };
      },
      updateConfig: (patch) => {
        setState((s) => ({
          ...s,
          config: {
            ...s.config,
            ...patch,
            mesesProvisionamento: Math.max(
              0,
              Math.min(
                36,
                patch.mesesProvisionamento ?? s.config.mesesProvisionamento
              )
            ),
          },
        }));
      },
      addNota: (input) => {
        const nota: NotaFiscal = { ...input, id: uid("nf") };
        setState((s) => ({
          ...s,
          notas: [nota, ...(s.notas ?? [])],
        }));
        return nota;
      },
      vincularNota: (notaId, lancamentoId) => {
        if (!state.lancamentos.some((l) => l.id === lancamentoId)) return false;
        let ok = false;
        setState((s) => {
          if (!s.notas.some((n) => n.id === notaId)) return s;
          ok = true;
          return {
            ...s,
            notas: s.notas.map((n) =>
              n.id === notaId
                ? { ...n, lancada: true, lancamentoId }
                : n
            ),
          };
        });
        return ok;
      },
      desvincularNota: (notaId) => {
        let ok = false;
        setState((s) => {
          if (!s.notas.some((n) => n.id === notaId)) return s;
          ok = true;
          return {
            ...s,
            notas: s.notas.map((n) =>
              n.id === notaId
                ? { ...n, lancada: false, lancamentoId: undefined }
                : n
            ),
          };
        });
        return ok;
      },
      updateMeuCnpj: (id, patch) => {
        let ok = false;
        setState((s) => {
          const list = s.meusCnpjs ?? [];
          if (!list.some((c) => c.id === id)) return s;
          ok = true;
          return {
            ...s,
            meusCnpjs: list.map((c) =>
              c.id === id ? { ...c, ...patch } : c
            ),
          };
        });
        return ok;
      },
      addPlano: (data) => {
        const plano: PlanoConta = { ...data, id: uid("pla") };
        setState((s) => ({ ...s, planos: [plano, ...s.planos] }));
        void dualWritePlano(plano);
        return plano;
      },
      updatePlano: (id, patch) => {
        const cur = state.planos.find((p) => p.id === id);
        if (!cur) return false;
        const next = { ...cur, ...patch };
        setState((s) => ({
          ...s,
          planos: s.planos.map((p) => (p.id === id ? next : p)),
        }));
        void dualWritePlano(next);
        return true;
      },
      removePlano: (id) => {
        if (state.categorias.some((c) => c.planoId === id && c.ativo)) {
          return { ok: false, reason: "Há categorias vinculadas" };
        }
        const cur = state.planos.find((p) => p.id === id);
        if (!cur) {
          return { ok: false, reason: "Plano não encontrado" };
        }
        const next = { ...cur, ativo: false };
        setState((s) => ({
          ...s,
          planos: s.planos.map((p) => (p.id === id ? next : p)),
        }));
        void dualWritePlano(next);
        return { ok: true };
      },
      addCategoria: (data) => {
        const cat: Categoria = { ...data, id: uid("cat") };
        setState((s) => ({ ...s, categorias: [cat, ...s.categorias] }));
        void dualWriteCategoria(cat);
        return cat;
      },
      updateCategoria: (id, patch) => {
        const cur = state.categorias.find((c) => c.id === id);
        if (!cur) return false;
        const next = { ...cur, ...patch };
        setState((s) => ({
          ...s,
          categorias: s.categorias.map((c) => (c.id === id ? next : c)),
        }));
        void dualWriteCategoria(next);
        return true;
      },
      removeCategoria: (id) => {
        const usada =
          state.lancamentos.some((l) => l.categoriaId === id) ||
          state.pagamentos.some((p) => p.categoriaId === id);
        if (usada) {
          return { ok: false, reason: "Há lançamentos/pagamentos vinculados" };
        }
        const cur = state.categorias.find((c) => c.id === id);
        if (!cur) {
          return { ok: false, reason: "Categoria não encontrada" };
        }
        const next = { ...cur, ativo: false };
        setState((s) => ({
          ...s,
          categorias: s.categorias.map((c) => (c.id === id ? next : c)),
        }));
        void dualWriteCategoria(next);
        return { ok: true };
      },
      addNatureza: (data) => {
        const nat: NaturezaReceita = { ...data, id: uid("nat") };
        setState((s) => ({ ...s, naturezas: [nat, ...s.naturezas] }));
        void dualWriteNatureza(nat);
        return nat;
      },
      updateNatureza: (id, patch) => {
        const cur = state.naturezas.find((n) => n.id === id);
        if (!cur) return false;
        const next = { ...cur, ...patch };
        setState((s) => ({
          ...s,
          naturezas: s.naturezas.map((n) => (n.id === id ? next : n)),
        }));
        void dualWriteNatureza(next);
        return true;
      },
      removeNatureza: (id) => {
        const usada = state.faturamentos.some((f) => f.naturezaId === id);
        if (usada) {
          return { ok: false, reason: "Há faturamentos vinculados" };
        }
        const cur = state.naturezas.find((n) => n.id === id);
        if (!cur) {
          return { ok: false, reason: "Natureza não encontrada" };
        }
        const next = { ...cur, ativo: false };
        setState((s) => ({
          ...s,
          naturezas: s.naturezas.map((n) => (n.id === id ? next : n)),
        }));
        void dualWriteNatureza(next);
        return { ok: true };
      },
    }),
    [state, ready]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useFinanceiro() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useFinanceiro must be used within FinanceiroStoreProvider");
  }
  return ctx;
}

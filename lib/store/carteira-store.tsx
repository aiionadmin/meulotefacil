"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { unifiedCarteiraSeed } from "@/lib/domain/unified-seed";
import type {
  BankSlip,
  CaixaFechamento,
  CaixaMovimento,
  Cartorio,
  CarteiraState,
  Contract,
  ContractOperation,
  Development,
  Escritura,
  Installment,
  Lot,
  LotStatus,
} from "@/lib/domain/carteira-types";
import { resolveInstallmentStatus } from "@/lib/money/installment-status";
import { buildCnab400Remessa } from "@/lib/cnab/remessa";
import { aplicarFatorReajuste } from "@/lib/money/reajuste";
import { useStorePersist } from "@/lib/persist/use-store-persist";
import { saveSnapshot } from "@/lib/persist/snapshots";
import { DEMO_ORG_ID } from "@/lib/persist/store-keys";
import { isDemoToolsAllowed } from "@/lib/runtime/demo-mode";
import type { ReceiptParams } from "@/lib/domain/carteira-types";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function nowLabel() {
  return new Date().toLocaleString("pt-BR");
}

type CarteiraApi = {
  state: CarteiraState;
  ready: boolean;
  reset: () => void;
  addDevelopment: (
    data: Omit<Development, "id" | "qtdLotes"> & { qtdLotes?: number }
  ) => Development;
  updateDevelopment: (id: string, patch: Partial<Development>) => void;
  massGenerateLots: (input: {
    developmentId: string;
    quadra: string;
    qtd: number;
    area: number;
    valor: number;
  }) => number;
  importLots: (
    developmentId: string,
    rows: {
      quadra: string;
      lote: string;
      area: number;
      precoVista: number;
      situacao: LotStatus;
      frente?: string;
      fundo?: string;
      direita?: string;
      esquerda?: string;
      matricula?: string;
    }[]
  ) => { created: number; updated: number };
  updateLot: (id: string, patch: Partial<Lot>) => void;
  changeLotStatus: (
    ids: string[],
    status: LotStatus,
    motivo: string
  ) => void;
  saldoDevedor: (contractId: string) => number;
  refreshEncargos: (consulta?: string) => void;
  baixarParcela: (installmentId: string) => void;
  estornarParcela: (installmentId: string) => void;
  gerarBoletosMes: () => number;
  gerarRemessa: () => { qtd: number; arquivo?: { nome: string; conteudo: string } };
  /** H23 — se `nossoNumeros` vier do .ret, baixa só esses; senão todos em remessa. */
  processarRetorno: (nossoNumeros?: string[]) => number;
  aplicarReajuste: (
    fator: number,
    indice: string,
    opts?: { mesBase?: number; gerarResiduo?: boolean }
  ) => number;
  desfazerUltimoReajuste: () => boolean;
  updateReceiptParams: (patch: Partial<ReceiptParams>) => void;
  registrarOperacao: (
    contractId: string,
    tipo: ContractOperation["tipo"],
    detalhe: string
  ) => void;
  addContract: (data: {
    developmentId: string;
    lotId: string;
    compradorNome: string;
    preco: number;
    entrada: number;
    qtdParcelas: number;
    valorParcela: number;
  }) => Contract | null;
  updateInstallment: (
    id: string,
    patch: Partial<{
      vencimento: string;
      valor: number;
      tipo: string;
      nossoNumero: string;
    }>
  ) => void;
  addInstallment: (input: {
    contractId: string;
    tipo: string;
    vencimento: string;
    valor: number;
  }) => boolean;
  cancelarBoleto: (installmentId: string) => boolean;
  /** C15 — cancelar boletos por id do slip. */
  cancelarBoletosPorIds: (ids: string[]) => number;
  /** H20 — recebimento e estorno no caixa. */
  receberNoCaixa: (input: {
    cliente: string;
    valor: number;
    forma: string;
    vias: 1 | 2;
    contratoNumero?: string;
  }) => CaixaMovimento | null;
  estornarCaixa: (id: string) => boolean;
  /** H12 — liberar / pagar comissão. */
  liberarComissao: (id: string) => boolean;
  pagarComissao: (id: string) => boolean;
  /** H25 — cartórios e escrituras. */
  addCartorio: (input: {
    nome: string;
    cidade: string;
    uf: string;
    contato?: string;
  }) => Cartorio | null;
  addEscritura: (input: {
    contractId: string;
    cartorioId: string;
    protocolo: string;
  }) => Escritura | null;
  setEscrituraStatus: (
    id: string,
    status: Escritura["status"]
  ) => boolean;
  /** H20 — fechar caixa do dia. */
  fecharCaixa: (quem?: string) => CaixaFechamento | null;
  /** C05 — polígono do lote na planta. */
  setLotPlantaPoligono: (
    lotId: string,
    pontos: { x: number; y: number }[]
  ) => boolean;
};

const Ctx = createContext<CarteiraApi | null>(null);

export function CarteiraStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CarteiraState>(() => unifiedCarteiraSeed());
  const [ready, setReady] = useState(false);

  useStorePersist({
    storeKey: "carteira",
    ready,
    setReady,
    state,
    setState,
    seed: unifiedCarteiraSeed,
    merge: (seed, saved) => ({
      ...seed,
      ...saved,
      receiptParams: {
        ...seed.receiptParams,
        ...(saved as CarteiraState).receiptParams,
      },
      adjustments: ((saved as CarteiraState).adjustments ?? []).map((a) => ({
        ...a,
        residuosGerados: a.residuosGerados ?? 0,
        residuoIds: a.residuoIds ?? [],
      })),
    }),
  });

  const saldoDevedor = useCallback(
    (contractId: string) =>
      state.installments
        .filter(
          (p) =>
            p.contractId === contractId &&
            p.status !== "paga" &&
            p.status !== "cancelada"
        )
        .reduce(
          (a, p) =>
            a + p.valor + p.juros + p.multa + p.correcao + p.despesaBancaria - p.desconto,
          0
        ),
    [state.installments]
  );

  const api = useMemo<CarteiraApi>(() => {
    return {
      state,
      ready,
      reset: () => {
        if (!isDemoToolsAllowed()) return;
        const next = unifiedCarteiraSeed();
        setState(next);
        void saveSnapshot("carteira", next, DEMO_ORG_ID);
      },
      addDevelopment: (data) => {
        const dev: Development = {
          ...data,
          id: uid("dev"),
          qtdLotes: data.qtdLotes ?? 0,
        };
        setState((s) => ({
          ...s,
          developments: [dev, ...s.developments],
        }));
        return dev;
      },
      updateDevelopment: (id, patch) => {
        setState((s) => ({
          ...s,
          developments: s.developments.map((d) =>
            d.id === id ? { ...d, ...patch } : d
          ),
        }));
      },
      massGenerateLots: ({ developmentId, quadra, qtd, area, valor }) => {
        const emp = state.developments.find((d) => d.id === developmentId);
        if (!emp) return 0;
        const existing = state.lots.filter(
          (l) => l.developmentId === developmentId && l.quadra === quadra
        ).length;
        const created: Lot[] = [];
        for (let i = 1; i <= qtd; i++) {
          const n = String(existing + i).padStart(2, "0");
          created.push({
            id: uid("lot"),
            developmentId,
            empNome: emp.nome,
            quadra,
            lote: n,
            area,
            padrao: "Padrão",
            custo: Math.round(valor * 0.22),
            valor,
            valorM2: Math.round((valor / area) * 100) / 100,
            status: "disponivel",
            bloqueiaVenda: false,
            bloqueiaFinanceiro: false,
          });
        }
        setState((s) => ({
          ...s,
          lots: [...created, ...s.lots],
          developments: s.developments.map((d) =>
            d.id === developmentId
              ? { ...d, qtdLotes: d.qtdLotes + created.length }
              : d
          ),
        }));
        return created.length;
      },
      importLots: (developmentId, rows) => {
        const emp = state.developments.find((d) => d.id === developmentId);
        if (!emp || !rows.length) return { created: 0, updated: 0 };
        let created = 0;
        let updated = 0;
        setState((s) => {
          const lots = [...s.lots];
          for (const r of rows) {
            const idx = lots.findIndex(
              (l) =>
                l.developmentId === developmentId &&
                l.quadra === r.quadra &&
                l.lote === r.lote
            );
            const valorM2 =
              r.area > 0
                ? Math.round((r.precoVista / r.area) * 100) / 100
                : 0;
            if (idx >= 0) {
              lots[idx] = {
                ...lots[idx],
                area: r.area,
                valor: r.precoVista,
                valorM2,
                status: r.situacao,
                frente: r.frente,
                fundo: r.fundo,
                direita: r.direita,
                esquerda: r.esquerda,
                matricula: r.matricula,
              };
              updated += 1;
            } else {
              lots.unshift({
                id: uid("lot"),
                developmentId,
                empNome: emp.nome,
                quadra: r.quadra,
                lote: r.lote,
                area: r.area,
                padrao: "Padrão",
                custo: Math.round(r.precoVista * 0.22),
                valor: r.precoVista,
                valorM2,
                status: r.situacao,
                bloqueiaVenda:
                  r.situacao !== "disponivel" && r.situacao !== "reservado",
                bloqueiaFinanceiro: false,
                frente: r.frente,
                fundo: r.fundo,
                direita: r.direita,
                esquerda: r.esquerda,
                matricula: r.matricula,
              });
              created += 1;
            }
          }
          return {
            ...s,
            lots,
            developments: s.developments.map((d) =>
              d.id === developmentId
                ? {
                    ...d,
                    qtdLotes: lots.filter((l) => l.developmentId === d.id)
                      .length,
                  }
                : d
            ),
          };
        });
        return { created, updated };
      },
      updateLot: (id, patch) => {
        setState((s) => ({
          ...s,
          lots: s.lots.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        }));
      },
      changeLotStatus: (ids, status, motivo) => {
        setState((s) => {
          const history = [...s.lotHistory];
          const lots = s.lots.map((l) => {
            if (!ids.includes(l.id)) return l;
            history.unshift({
              id: uid("lh"),
              lotId: l.id,
              de: l.status,
              para: status,
              motivo,
              quando: todayIso(),
            });
            return {
              ...l,
              status,
              bloqueiaVenda:
                status === "vendido" ||
                status === "reservado" ||
                status === "quitado" ||
                status === "escritura" ||
                status === "advogado" ||
                status === "caucionado" ||
                status === "invadido" ||
                status === "juridico",
              bloqueiaFinanceiro:
                status === "advogado" ||
                status === "caucionado" ||
                status === "invadido" ||
                status === "juridico",
            };
          });
          return { ...s, lots, lotHistory: history.slice(0, 80) };
        });
      },
      saldoDevedor,
      refreshEncargos: (consulta = todayIso()) => {
        setState((s) => ({
          ...s,
          installments: s.installments.map((p) => {
            if (p.status === "paga" || p.status === "cancelada") return p;
            const ct = s.contracts.find((c) => c.id === p.contractId);
            const r = resolveInstallmentStatus({
              status: p.status,
              valor: p.valor,
              vencimento: p.vencimento,
              consulta,
              taxaMoraMes: ct?.taxaMoraMes ?? 0.01,
              taxaMulta: ct?.multaPct ?? 0.02,
              diasTolerancia: ct?.diasTolerancia ?? 0,
            });
            return {
              ...p,
              juros: r.juros,
              multa: r.multa,
              status: r.status,
            };
          }),
          cards: s.cards.map((card) => {
            if (!card.contractId) return card;
            const atrasada = s.installments.some(
              (p) =>
                p.contractId === card.contractId &&
                p.status === "vencida"
            );
            if (atrasada && card.coluna === "carteira_em_dia") {
              return { ...card, coluna: "cobranca" as const };
            }
            return card;
          }),
        }));
      },
      baixarParcela: (installmentId) => {
        setState((s) => {
          const parc = s.installments.find((p) => p.id === installmentId);
          if (!parc || parc.status === "paga") return s;
          const total =
            parc.valor +
            parc.juros +
            parc.multa +
            parc.correcao +
            parc.despesaBancaria -
            parc.desconto;
          return {
            ...s,
            caixaSaldo: s.caixaSaldo + total,
            installments: s.installments.map((p) =>
              p.id === installmentId
                ? { ...p, status: "paga" as const, pagoEm: todayIso(), juros: 0, multa: 0 }
                : p
            ),
            bankSlips: s.bankSlips.map((b) =>
              b.installmentId === installmentId
                ? { ...b, status: "pago" as const }
                : b
            ),
            cards: s.cards.map((c) =>
              c.contractId === parc.contractId && c.coluna === "cobranca"
                ? { ...c, coluna: "carteira_em_dia" as const }
                : c
            ),
          };
        });
      },
      estornarParcela: (installmentId) => {
        setState((s) => {
          const parc = s.installments.find((p) => p.id === installmentId);
          if (!parc || parc.status !== "paga") return s;
          return {
            ...s,
            caixaSaldo: Math.max(0, s.caixaSaldo - parc.valor),
            installments: s.installments.map((p) =>
              p.id === installmentId
                ? { ...p, status: "em_aberto" as const, pagoEm: undefined }
                : p
            ),
            bankSlips: s.bankSlips.map((b) =>
              b.installmentId === installmentId
                ? { ...b, status: "registrado" as const }
                : b
            ),
          };
        });
      },
      gerarBoletosMes: () => {
        let n = 0;
        setState((s) => {
          const novos: BankSlip[] = [];
          for (const p of s.installments) {
            if (p.status !== "em_aberto" && p.status !== "vencida") continue;
            if (s.bankSlips.some((b) => b.installmentId === p.id && b.status !== "cancelado"))
              continue;
            const ct = s.contracts.find((c) => c.id === p.contractId);
            if (!ct?.emiteBoleto) continue;
            const lot = s.lots.find((l) => l.id === ct.lotId);
            if (lot?.bloqueiaFinanceiro) continue;
            n += 1;
            const nosso = `${ct.numero}${String(p.n).padStart(3, "0")}`;
            novos.push({
              id: uid("bol"),
              installmentId: p.id,
              contractId: ct.id,
              contratoNumero: ct.numero,
              nossoNumero: nosso,
              banco: "341",
              valor: p.valor + p.juros + p.multa,
              vencimento: p.vencimento,
              status: "gerado",
            });
          }
          return {
            ...s,
            bankSlips: [...novos, ...s.bankSlips],
            installments: s.installments.map((p) => {
              const b = novos.find((x) => x.installmentId === p.id);
              return b ? { ...p, nossoNumero: b.nossoNumero } : p;
            }),
          };
        });
        return n;
      },
      gerarRemessa: () => {
        let qtd = 0;
        let arquivo: { nome: string; conteudo: string } | undefined;
        setState((s) => {
          const alvos = s.bankSlips.filter((b) => b.status === "gerado");
          qtd = alvos.length;
          if (!qtd) return s;
          const remId = uid("rem");
          const nome = `CNAB-341-${todayIso().replace(/-/g, "")}.rem`;
          const conteudo = buildCnab400Remessa(
            alvos.map((b) => {
              const parc = s.installments.find((i) => i.id === b.installmentId);
              return {
                nossoNumero: b.nossoNumero,
                vencimento: b.vencimento,
                valor: b.valor,
                contratoNumero: b.contratoNumero,
                sacadoNome: parc?.compradorNome,
              };
            })
          );
          arquivo = { nome, conteudo };
          return {
            ...s,
            remittances: [
              {
                id: remId,
                nome,
                criadoEm: nowLabel(),
                qtd,
                status: "gerada",
                conteudo,
              },
              ...s.remittances,
            ],
            bankSlips: s.bankSlips.map((b) =>
              alvos.some((a) => a.id === b.id)
                ? { ...b, status: "remessa" as const, remessaId: remId }
                : b
            ),
          };
        });
        return { qtd, arquivo };
      },
      processarRetorno: (nossoNumeros) => {
        let qtd = 0;
        setState((s) => {
          const filterNn = nossoNumeros?.length
            ? new Set(
                nossoNumeros.map((n) => n.replace(/\D/g, "").replace(/^0+/, ""))
              )
            : null;
          const alvos = s.bankSlips.filter((b) => {
            if (b.status !== "remessa") return false;
            if (!filterNn) return true;
            const nn = b.nossoNumero.replace(/\D/g, "").replace(/^0+/, "");
            return filterNn.has(nn);
          });
          qtd = alvos.length;
          if (!qtd) return s;
          const alvoIds = new Set(alvos.map((b) => b.id));
          let caixa = s.caixaSaldo;
          const paidInst = new Set<string>();
          for (const b of alvos) {
            const p = s.installments.find((i) => i.id === b.installmentId);
            if (p && p.status !== "paga") {
              caixa += b.valor;
              paidInst.add(p.id);
            }
          }
          return {
            ...s,
            caixaSaldo: caixa,
            bankSlips: s.bankSlips.map((b) =>
              alvoIds.has(b.id) ? { ...b, status: "pago" as const } : b
            ),
            remittances: s.remittances.map((r) =>
              r.status === "gerada" ? { ...r, status: "processada" as const } : r
            ),
            installments: s.installments.map((p) =>
              paidInst.has(p.id)
                ? { ...p, status: "paga" as const, pagoEm: todayIso(), juros: 0, multa: 0 }
                : p
            ),
          };
        });
        return qtd;
      },
      aplicarReajuste: (fator, indice, opts) => {
        let qtd = 0;
        setState((s) => {
          const mesBase = opts?.mesBase ?? new Date().getMonth() + 1;
          const gerarResiduo = opts?.gerarResiduo ?? true;
          const { atualizadas, qtd: n, residuos } = aplicarFatorReajuste(
            s.installments,
            fator,
            { gerarResiduo }
          );
          qtd = n;
          const touched = new Set(
            atualizadas
              .filter((p) => p.status !== "paga" && p.status !== "cancelada")
              .map((p) => p.contractId)
          );
          const extras: Installment[] = residuos.map((r) => {
            const ct = s.contracts.find((c) => c.id === r.contractId);
            const maxN = Math.max(
              0,
              ...atualizadas
                .filter((p) => p.contractId === r.contractId)
                .map((p) => p.n)
            );
            return {
              id: uid("par"),
              contractId: r.contractId,
              contratoNumero: ct?.numero ?? r.contractId,
              compradorNome: ct?.compradorNome ?? "",
              tipo: "Resíduo",
              n: maxN + 1,
              vencimento: todayIso(),
              valor: r.valor,
              juros: 0,
              multa: 0,
              correcao: 0,
              despesaBancaria: 0,
              desconto: 0,
              status: "em_aberto" as const,
            };
          });
          return {
            ...s,
            installments: [...atualizadas, ...extras],
            contracts: s.contracts.map((c) =>
              touched.has(c.id) ? { ...c, mesBase, tipoReajuste: indice } : c
            ),
            adjustments: [
              {
                id: uid("adj"),
                indice,
                fator,
                mesBase,
                ano: new Date().getFullYear(),
                qtdParcelas: n,
                residuosGerados: extras.length,
                residuoIds: extras.map((e) => e.id),
                criadoEm: nowLabel(),
                desfeito: false,
              },
              ...s.adjustments,
            ],
          };
        });
        return qtd;
      },
      desfazerUltimoReajuste: () => {
        const last = state.adjustments.find((a) => !a.desfeito);
        if (!last || last.fator === 0) return false;
        const inv = 1 / last.fator;
        const drop = new Set(last.residuoIds ?? []);
        setState((s) => {
          const semResiduos = s.installments.filter((p) => !drop.has(p.id));
          const { atualizadas } = aplicarFatorReajuste(semResiduos, inv);
          return {
            ...s,
            installments: atualizadas,
            adjustments: s.adjustments.map((a) =>
              a.id === last.id ? { ...a, desfeito: true } : a
            ),
          };
        });
        return true;
      },
      updateReceiptParams: (patch) => {
        setState((s) => ({
          ...s,
          receiptParams: { ...s.receiptParams, ...patch },
        }));
      },
      registrarOperacao: (contractId, tipo, detalhe) => {
        setState((s) => {
          let lots = s.lots;
          let contracts = s.contracts;
          let cards = s.cards;
          if (tipo === "retomada" || tipo === "distrato") {
            const ct = s.contracts.find((c) => c.id === contractId);
            if (ct) {
              contracts = contracts.map((c) =>
                c.id === contractId ? { ...c, status: "cancelado" as const } : c
              );
              lots = lots.map((l) =>
                l.id === ct.lotId
                  ? {
                      ...l,
                      status: "disponivel" as const,
                      bloqueiaVenda: false,
                      compradorNome: undefined,
                      contractId: undefined,
                    }
                  : l
              );
              cards = cards.map((c) =>
                c.contractId === contractId
                  ? { ...c, coluna: "retomado" as const }
                  : c
              );
            }
          }
          return {
            ...s,
            lots,
            contracts,
            cards,
            operations: [
              {
                id: uid("op"),
                contractId,
                tipo,
                quando: nowLabel(),
                detalhe,
                desfeita: false,
              },
              ...s.operations,
            ],
          };
        });
      },
      addContract: ({
        developmentId,
        lotId,
        compradorNome,
        preco,
        entrada,
        qtdParcelas,
        valorParcela,
      }) => {
        const emp = state.developments.find((d) => d.id === developmentId);
        const lot = state.lots.find((l) => l.id === lotId);
        if (!emp || !lot || lot.bloqueiaVenda || lot.status !== "disponivel") {
          return null;
        }
        const numero = String(
          1000 + state.contracts.length + 1
        );
        const id = uid("ct");
        const contract: Contract = {
          id,
          numero,
          developmentId,
          lotId,
          empNome: emp.nome,
          quadra: lot.quadra,
          lote: lot.lote,
          compradorId: uid("p"),
          compradorNome,
          preco,
          status: "ativo",
          dataContrato: todayIso(),
          dataPrimeiraParcela: todayIso(),
          multaPct: emp.taxaMulta,
          taxaMoraMes: emp.taxaMoraMes,
          diasTolerancia: emp.diasMora,
          descontoPontualidadePct: 0,
          diaLimiteDesconto: 5,
          emiteBoleto: true,
          tipoReajuste: "IGPM",
          mesBase: new Date().getMonth() + 1,
        };
        const pars: Installment[] = [];
        if (entrada > 0) {
          pars.push({
            id: uid("par"),
            contractId: id,
            contratoNumero: numero,
            compradorNome,
            tipo: "Entrada",
            n: 1,
            vencimento: todayIso(),
            valor: entrada,
            juros: 0,
            multa: 0,
            correcao: 0,
            despesaBancaria: 0,
            desconto: 0,
            status: "em_aberto",
          });
        }
        for (let i = 0; i < qtdParcelas; i++) {
          const d = new Date();
          d.setMonth(d.getMonth() + i + 1);
          pars.push({
            id: uid("par"),
            contractId: id,
            contratoNumero: numero,
            compradorNome,
            tipo: "Prestação",
            n: pars.length + 1,
            vencimento: d.toISOString().slice(0, 10),
            valor: valorParcela,
            juros: 0,
            multa: 0,
            correcao: 0,
            despesaBancaria: 0,
            desconto: 0,
            status: "em_aberto",
          });
        }
        setState((s) => ({
          ...s,
          contracts: [contract, ...s.contracts],
          installments: [...pars, ...s.installments],
          lots: s.lots.map((l) =>
            l.id === lotId
              ? {
                  ...l,
                  status: "vendido" as const,
                  bloqueiaVenda: true,
                  compradorNome,
                  contractId: id,
                }
              : l
          ),
          cards: [
            {
              id: uid("card"),
              contractId: id,
              lotId,
              pessoaNome: compradorNome,
              empNome: emp.nome,
              coluna: "contrato",
            },
            ...s.cards,
          ],
        }));
        return contract;
      },
      updateInstallment: (id, patch) => {
        setState((s) => ({
          ...s,
          installments: s.installments.map((p) =>
            p.id === id ? { ...p, ...patch } : p
          ),
        }));
      },
      addInstallment: ({ contractId, tipo, vencimento, valor }) => {
        const ct = state.contracts.find((c) => c.id === contractId);
        if (!ct || valor <= 0) return false;
        const n =
          state.installments.filter((p) => p.contractId === contractId)
            .length + 1;
        setState((s) => ({
          ...s,
          installments: [
            {
              id: uid("par"),
              contractId,
              contratoNumero: ct.numero,
              compradorNome: ct.compradorNome,
              tipo,
              n,
              vencimento,
              valor,
              juros: 0,
              multa: 0,
              correcao: 0,
              despesaBancaria: 0,
              desconto: 0,
              status: "em_aberto" as const,
            },
            ...s.installments,
          ],
        }));
        return true;
      },
      cancelarBoleto: (installmentId) => {
        let ok = false;
        setState((s) => {
          const has = s.bankSlips.some(
            (b) =>
              b.installmentId === installmentId && b.status !== "cancelado"
          );
          if (!has) return s;
          ok = true;
          return {
            ...s,
            bankSlips: s.bankSlips.map((b) =>
              b.installmentId === installmentId && b.status !== "cancelado"
                ? { ...b, status: "cancelado" as const }
                : b
            ),
          };
        });
        return ok;
      },
      cancelarBoletosPorIds: (ids) => {
        const set = new Set(ids);
        let n = 0;
        setState((s) => {
          n = s.bankSlips.filter(
            (b) => set.has(b.id) && b.status !== "cancelado"
          ).length;
          if (!n) return s;
          return {
            ...s,
            bankSlips: s.bankSlips.map((b) =>
              set.has(b.id) && b.status !== "cancelado"
                ? { ...b, status: "cancelado" as const }
                : b
            ),
          };
        });
        return n;
      },
      receberNoCaixa: (input) => {
        if (!input.cliente.trim() || input.valor <= 0) return null;
        const mov: CaixaMovimento = {
          id: uid("cx"),
          data: todayIso(),
          cliente: input.cliente.trim(),
          valor: Math.round(input.valor * 100) / 100,
          forma: input.forma,
          autenticacao: `AUTH-${Date.now().toString(36).toUpperCase()}`,
          vias: input.vias,
          contratoNumero: input.contratoNumero,
        };
        setState((s) => ({
          ...s,
          caixa: [mov, ...s.caixa],
          caixaSaldo: Math.round((s.caixaSaldo + mov.valor) * 100) / 100,
        }));
        return mov;
      },
      estornarCaixa: (id) => {
        let ok = false;
        setState((s) => {
          const mov = s.caixa.find((m) => m.id === id && !m.estornado);
          if (!mov) return s;
          ok = true;
          return {
            ...s,
            caixa: s.caixa.map((m) =>
              m.id === id ? { ...m, estornado: true } : m
            ),
            caixaSaldo: Math.max(
              0,
              Math.round((s.caixaSaldo - mov.valor) * 100) / 100
            ),
          };
        });
        return ok;
      },
      liberarComissao: (id) => {
        let ok = false;
        setState((s) => {
          const c = s.comissoes.find((x) => x.id === id);
          if (!c || c.status === "paga") return s;
          ok = true;
          return {
            ...s,
            comissoes: s.comissoes.map((x) =>
              x.id === id
                ? {
                    ...x,
                    status: "liberada" as const,
                    valorLiberado: x.valorPrevisto,
                  }
                : x
            ),
          };
        });
        return ok;
      },
      pagarComissao: (id) => {
        let ok = false;
        setState((s) => {
          const c = s.comissoes.find((x) => x.id === id);
          if (!c || c.status === "paga") return s;
          const valor = c.valorLiberado || c.valorPrevisto;
          ok = true;
          return {
            ...s,
            comissoes: s.comissoes.map((x) =>
              x.id === id
                ? {
                    ...x,
                    status: "paga" as const,
                    valorLiberado: valor,
                    valorPago: valor,
                  }
                : x
            ),
            caixaSaldo: Math.max(
              0,
              Math.round((s.caixaSaldo - valor) * 100) / 100
            ),
          };
        });
        return ok;
      },
      addCartorio: (input) => {
        if (!input.nome.trim() || !input.cidade.trim() || !input.uf.trim()) {
          return null;
        }
        const c: Cartorio = {
          id: uid("crt"),
          nome: input.nome.trim(),
          cidade: input.cidade.trim(),
          uf: input.uf.trim().toUpperCase().slice(0, 2),
          contato: input.contato?.trim() || undefined,
        };
        setState((s) => ({ ...s, cartorios: [c, ...s.cartorios] }));
        return c;
      },
      addEscritura: (input) => {
        if (
          !input.contractId ||
          !input.cartorioId ||
          !input.protocolo.trim()
        ) {
          return null;
        }
        const e: Escritura = {
          id: uid("esc"),
          contractId: input.contractId,
          cartorioId: input.cartorioId,
          protocolo: input.protocolo.trim(),
          status: "em_andamento",
          data: todayIso(),
        };
        setState((s) => ({ ...s, escrituras: [e, ...s.escrituras] }));
        return e;
      },
      setEscrituraStatus: (id, status) => {
        let ok = false;
        setState((s) => {
          if (!s.escrituras.some((e) => e.id === id)) return s;
          ok = true;
          return {
            ...s,
            escrituras: s.escrituras.map((e) =>
              e.id === id ? { ...e, status } : e
            ),
          };
        });
        return ok;
      },
      fecharCaixa: (quem) => {
        let fech: CaixaFechamento | null = null;
        setState((s) => {
          const abertos = s.caixa.filter(
            (m) => !m.fechamentoId && !m.estornado
          );
          const estornos = s.caixa.filter(
            (m) => !m.fechamentoId && m.estornado
          );
          if (!abertos.length && !estornos.length) return s;
          const id = uid("cxf");
          const entradas = abertos.reduce((a, m) => a + m.valor, 0);
          const valorEstornos = estornos.reduce((a, m) => a + m.valor, 0);
          fech = {
            id,
            data: todayIso(),
            saldoAntes: s.caixaSaldo - entradas + valorEstornos,
            entradas: Math.round(entradas * 100) / 100,
            estornos: Math.round(valorEstornos * 100) / 100,
            saldoDepois: s.caixaSaldo,
            qtdMovimentos: abertos.length,
            quem: quem ?? "Admin Demo",
          };
          return {
            ...s,
            caixa: s.caixa.map((m) =>
              !m.fechamentoId ? { ...m, fechamentoId: id } : m
            ),
            caixaFechamentos: [fech!, ...(s.caixaFechamentos ?? [])],
          };
        });
        return fech;
      },
      setLotPlantaPoligono: (lotId, pontos) => {
        let ok = false;
        setState((s) => {
          if (!s.lots.some((l) => l.id === lotId)) return s;
          ok = true;
          return {
            ...s,
            lots: s.lots.map((l) =>
              l.id === lotId ? { ...l, plantaPoligono: pontos } : l
            ),
          };
        });
        return ok;
      },
    };
  }, [state, ready, saldoDevedor]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCarteira() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCarteira must be used within CarteiraStoreProvider");
  return ctx;
}

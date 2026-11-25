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
  CarteiraState,
  Contract,
  ContractOperation,
  Development,
  Installment,
  Lot,
  LotStatus,
} from "@/lib/domain/carteira-types";
import { resolveInstallmentStatus } from "@/lib/money/installment-status";
import { aplicarFatorReajuste } from "@/lib/money/reajuste";
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
  gerarRemessa: () => number;
  processarRetorno: () => number;
  aplicarReajuste: (fator: number, indice: string) => number;
  desfazerUltimoReajuste: () => boolean;
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
                status === "bloqueado" ||
                status === "vendido" ||
                status === "reservado" ||
                status === "quitado" ||
                status === "escritura",
              bloqueiaFinanceiro: status === "bloqueado",
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
        setState((s) => {
          const ids = s.bankSlips
            .filter((b) => b.status === "gerado")
            .map((b) => b.id);
          qtd = ids.length;
          if (!qtd) return s;
          const remId = uid("rem");
          return {
            ...s,
            remittances: [
              {
                id: remId,
                nome: `CNAB-341-${todayIso().replace(/-/g, "")}.rem`,
                criadoEm: nowLabel(),
                qtd,
                status: "gerada",
              },
              ...s.remittances,
            ],
            bankSlips: s.bankSlips.map((b) =>
              ids.includes(b.id)
                ? { ...b, status: "remessa" as const, remessaId: remId }
                : b
            ),
          };
        });
        return qtd;
      },
      processarRetorno: () => {
        let qtd = 0;
        setState((s) => {
          const alvos = s.bankSlips.filter((b) => b.status === "remessa");
          qtd = alvos.length;
          if (!qtd) return s;
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
              b.status === "remessa" ? { ...b, status: "pago" as const } : b
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
      aplicarReajuste: (fator, indice) => {
        let qtd = 0;
        setState((s) => {
          const { atualizadas, qtd: n } = aplicarFatorReajuste(
            s.installments,
            fator
          );
          qtd = n;
          return {
            ...s,
            installments: atualizadas,
            adjustments: [
              {
                id: uid("adj"),
                indice,
                fator,
                mesBase: new Date().getMonth() + 1,
                ano: new Date().getFullYear(),
                qtdParcelas: n,
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
        setState((s) => {
          const { atualizadas } = aplicarFatorReajuste(s.installments, inv);
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
      registrarOperacao: (contractId, tipo, detalhe) => {
        setState((s) => {
          let lots = s.lots;
          let contracts = s.contracts;
          let cards = s.cards;
          if (tipo === "retomada") {
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
    };
  }, [state, ready, saldoDevedor]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCarteira() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCarteira must be used within CarteiraStoreProvider");
  return ctx;
}

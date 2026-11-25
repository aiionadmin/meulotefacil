"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CARTEIRA_STORAGE_KEY, seedCarteira } from "@/lib/domain/carteira-seed";
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
import { calcAtraso } from "@/lib/money/atraso";
import { aplicarFatorReajuste } from "@/lib/money/reajuste";

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
  importLots: (input: {
    developmentId: string;
    rows: {
      quadra: string;
      lote: string;
      area: number;
      frente?: string;
      fundo?: string;
      direita?: string;
      esquerda?: string;
      matricula?: string;
      precoAvista: number;
      situacao: string;
    }[];
    updateExisting: boolean;
  }) => { created: number; updated: number; refused: number };
  addPlantPdf: (input: {
    developmentId: string;
    nomeArquivo: string;
    dataUrl?: string;
    autor?: string;
  }) => void;
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
  const [state, setState] = useState<CarteiraState>(() => seedCarteira());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CARTEIRA_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CarteiraState>;
        const seed = seedCarteira();
        const developments = (parsed.developments ?? seed.developments).map(
          (d) => ({
            ...d,
            modalidade:
              d.modalidade ??
              (d.tipo === "regularizacao"
                ? ("regularizacao" as const)
                : ("loteamento" as const)),
            plantPdfs: d.plantPdfs ?? [],
          })
        );
        setState({
          ...seed,
          ...parsed,
          developments,
        });
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(CARTEIRA_STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

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
        const next = seedCarteira();
        setState(next);
        localStorage.setItem(CARTEIRA_STORAGE_KEY, JSON.stringify(next));
      },
      addDevelopment: (data) => {
        const dev: Development = {
          ...data,
          id: uid("dev"),
          modalidade: data.modalidade ?? "loteamento",
          qtdLotes: data.qtdLotes ?? 0,
          plantPdfs: data.plantPdfs ?? [],
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
      importLots: ({ developmentId, rows, updateExisting }) => {
        const emp = state.developments.find((d) => d.id === developmentId);
        if (!emp || emp.modalidade === "regularizacao") {
          return { created: 0, updated: 0, refused: rows.length };
        }
        let created = 0;
        let updated = 0;
        let refused = 0;
        setState((s) => {
          let lots = [...s.lots];
          for (const row of rows) {
            const status = (row.situacao || "disponivel") as LotStatus;
            const existing = lots.find(
              (l) =>
                l.developmentId === developmentId &&
                l.quadra === row.quadra &&
                l.lote === row.lote
            );
            if (existing) {
              if (!updateExisting) {
                refused += 1;
                continue;
              }
              lots = lots.map((l) =>
                l.id === existing.id
                  ? {
                      ...l,
                      area: row.area,
                      valor: row.precoAvista || l.valor,
                      valorM2:
                        row.area > 0
                          ? Math.round(
                              ((row.precoAvista || l.valor) / row.area) * 100
                            ) / 100
                          : l.valorM2,
                      frente: row.frente ?? l.frente,
                      fundo: row.fundo ?? l.fundo,
                      direita: row.direita ?? l.direita,
                      esquerda: row.esquerda ?? l.esquerda,
                      matricula: row.matricula ?? l.matricula,
                      status,
                    }
                  : l
              );
              updated += 1;
            } else {
              lots.unshift({
                id: uid("lot"),
                developmentId,
                empNome: emp.nome,
                quadra: row.quadra,
                lote: row.lote,
                area: row.area,
                custo: 0,
                valor: row.precoAvista,
                valorM2:
                  row.area > 0
                    ? Math.round((row.precoAvista / row.area) * 100) / 100
                    : 0,
                status,
                bloqueiaVenda:
                  status === "bloqueado" ||
                  status === "vendido" ||
                  status === "reservado",
                bloqueiaFinanceiro: status === "bloqueado",
                frente: row.frente,
                fundo: row.fundo,
                direita: row.direita,
                esquerda: row.esquerda,
                matricula: row.matricula,
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
        return { created, updated, refused };
      },
      addPlantPdf: ({ developmentId, nomeArquivo, dataUrl, autor }) => {
        setState((s) => ({
          ...s,
          developments: s.developments.map((d) => {
            if (d.id !== developmentId) return d;
            const versao = (d.plantPdfs?.length ?? 0) + 1;
            return {
              ...d,
              plantPdfs: [
                ...(d.plantPdfs ?? []),
                {
                  id: uid("pdf"),
                  developmentId,
                  versao,
                  folha: 1,
                  nomeArquivo,
                  dataUrl,
                  autor,
                  criadoEm: todayIso(),
                },
              ],
            };
          }),
        }));
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
        // Encargos em lote só sob demanda (botão). A ficha financeira
        // pagina e calcula só a página visível via lib/money/ficha-parcelas.
        // Atraso NÃO move card de coluna — vira selo (Parte 1 §2.3 / §2.7).
        setState((s) => {
          const installments = s.installments.map((p) => {
            if (p.status === "paga" || p.status === "cancelada") return p;
            const ct = s.contracts.find((c) => c.id === p.contractId);
            if (!ct) return p;
            const r = calcAtraso({
              valor: p.valor,
              vencimento: p.vencimento,
              consulta,
              taxaMoraMes: ct.taxaMoraMes,
              taxaMulta: ct.multaPct,
              diasTolerancia: ct.diasTolerancia,
            });
            const nextStatus: Installment["status"] = r.emAtraso
              ? "vencida"
              : p.status === "vencida"
                ? "em_aberto"
                : p.status;
            return {
              ...p,
              juros: r.juros,
              multa: r.multa,
              status: nextStatus,
            };
          });
          const atrasados = new Set(
            installments
              .filter((p) => p.status === "vencida")
              .map((p) => p.contractId)
          );
          return {
            ...s,
            installments,
            cards: s.cards.map((card) => {
              if (!card.contractId || !atrasados.has(card.contractId)) {
                return {
                  ...card,
                  badges: (card.badges ?? []).filter((b) => b !== "Em atraso"),
                };
              }
              const badges = new Set(card.badges ?? []);
              badges.add("Em atraso");
              return { ...card, badges: [...badges] };
            }),
          };
        });
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

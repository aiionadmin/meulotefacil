"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedObras } from "@/lib/domain/obras-seed";
import type {
  Composicao,
  Insumo,
  Obra,
  ObrasCatalogState,
  OrcamentoNode,
  RelatorioGerencial,
  Rdo,
  RdoStatus,
} from "@/lib/domain/obras-types";
import { custoLinha, totaisOrcamento } from "@/lib/money/orcamento";
import { dualWriteObra } from "@/lib/persist/dual-write";
import { loadObrasFromTables } from "@/lib/persist/load-from-tables";
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

type ObrasApi = {
  state: ObrasCatalogState;
  ready: boolean;
  reset: () => void;
  addInsumo: (data: Omit<Insumo, "id">) => Insumo;
  updateInsumo: (id: string, patch: Partial<Insumo>) => void;
  toggleInsumoFavorito: (id: string) => void;
  addComposicao: (data: Omit<Composicao, "id">) => Composicao;
  addObra: (
    data: Omit<Obra, "id" | "fisicoPct" | "orcado" | "realizado"> & {
      fisicoPct?: number;
      orcado?: number;
      realizado?: number;
    }
  ) => Obra;
  updateObra: (id: string, patch: Partial<Obra>) => void;
  duplicateObra: (id: string) => Obra | null;
  softRemoveObra: (id: string) => void;
  addNode: (
    data: Omit<OrcamentoNode, "id" | "orcado" | "realizado" | "fisicoPct"> & {
      orcado?: number;
      realizado?: number;
      fisicoPct?: number;
    }
  ) => OrcamentoNode;
  recomputeObraTotais: (obraId: string) => void;
  apropriarDespesa: (nodeId: string, valor: number) => boolean;
  addRdo: (data: {
    obraId: string;
    data: string;
    responsavel: string;
    atividades?: Rdo["atividades"];
  }) => Rdo | null;
  copyRdoFromPrevious: (obraId: string, data: string) => Rdo | null;
  updateRdoStatus: (
    id: string,
    status: RdoStatus,
    motivo?: string
  ) => boolean;
  setRelatorioGerencialStatus: (
    id: string,
    status: RelatorioGerencial["status"]
  ) => boolean;
  gerarCurvaS: (obraId: string) => void;
  /** D11 — expediente / BDI / arredondamento. */
  updateObrasConfig: (patch: {
    expedienteHoras?: number;
    bdiModo?: "dinamico" | "fixo";
    arredondamento?: number;
  }) => void;
  nodesDaObra: (obraId: string) => OrcamentoNode[];
  totaisDaObra: (obraId: string) => {
    custo: number;
    bdi: number;
    preco: number;
  };
};

const Ctx = createContext<ObrasApi | null>(null);

export function ObrasStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ObrasCatalogState>(() => seedObras());
  const [ready, setReady] = useState(false);

  useStorePersist({
    storeKey: "obras",
    ready,
    setReady,
    state,
    setState,
    seed: seedObras,
    loadTables: loadObrasFromTables,
  });

  const api = useMemo<ObrasApi>(() => {
    const nodesDaObra = (obraId: string) =>
      state.nodes
        .filter((n) => n.obraId === obraId)
        .sort((a, b) => a.ordem - b.ordem || a.codigo.localeCompare(b.codigo));

    const totaisDaObra = (obraId: string) => {
      const itens = nodesDaObra(obraId).filter((n) => n.kind === "item");
      const obra = state.obras.find((o) => o.id === obraId);
      return totaisOrcamento(
        itens.map((n) => ({
          quantidade: n.quantidade,
          custoUnit: n.custoUnit,
          bdiPct: n.bdiPct,
        })),
        obra?.bdiPct ?? 0.25
      );
    };

    const recomputeObraTotais = (obraId: string) => {
      setState((s) => {
        const itens = s.nodes.filter(
          (n) => n.obraId === obraId && n.kind === "item"
        );
        const obra = s.obras.find((o) => o.id === obraId);
        const tot = totaisOrcamento(
          itens.map((n) => ({
            quantidade: n.quantidade,
            custoUnit: n.custoUnit,
            bdiPct: n.bdiPct,
          })),
          obra?.bdiPct ?? 0.25
        );
        const realizado = itens.reduce((a, n) => a + n.realizado, 0);
        const fisico =
          itens.length === 0
            ? 0
            : Math.round(
                (itens.reduce((a, n) => a + n.fisicoPct, 0) / itens.length) *
                  100
              ) / 100;
        return {
          ...s,
          obras: s.obras.map((o) =>
            o.id === obraId
              ? {
                  ...o,
                  orcado: tot.custo,
                  realizado,
                  fisicoPct: fisico,
                }
              : o
          ),
        };
      });
    };

    return {
      state,
      ready,
      reset: () => {
        if (!isDemoToolsAllowed()) return;
        const next = seedObras();
        setState(next);
        void saveSnapshot("obras", next, DEMO_ORG_ID);
      },
      addInsumo: (data) => {
        const row: Insumo = { ...data, id: uid("ins") };
        setState((s) => ({ ...s, insumos: [row, ...s.insumos] }));
        return row;
      },
      updateInsumo: (id, patch) => {
        setState((s) => ({
          ...s,
          insumos: s.insumos.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        }));
      },
      toggleInsumoFavorito: (id) => {
        setState((s) => ({
          ...s,
          insumos: s.insumos.map((i) =>
            i.id === id ? { ...i, favorito: !i.favorito } : i
          ),
        }));
      },
      addComposicao: (data) => {
        const row: Composicao = { ...data, id: uid("comp") };
        setState((s) => ({ ...s, composicoes: [row, ...s.composicoes] }));
        return row;
      },
      addObra: (data) => {
        const obra: Obra = {
          ...data,
          id: uid("obr"),
          fisicoPct: data.fisicoPct ?? 0,
          orcado: data.orcado ?? 0,
          realizado: data.realizado ?? 0,
          unidade: data.unidade || "m²",
          visivelPara: data.visivelPara?.length
            ? data.visivelPara
            : ["Administrador"],
          exibirLancamentos: data.exibirLancamentos ?? true,
          exibirFaturamentos: data.exibirFaturamentos ?? true,
          exibirCompras: data.exibirCompras ?? true,
          propostaStatus: data.propostaStatus ?? "em_elaboracao",
        };
        setState((s) => ({ ...s, obras: [obra, ...s.obras] }));
        void dualWriteObra(obra);
        return obra;
      },
      updateObra: (id, patch) => {
        setState((s) => {
          const obras = s.obras.map((o) =>
            o.id === id ? { ...o, ...patch } : o
          );
          const next = obras.find((o) => o.id === id);
          if (next) void dualWriteObra(next);
          return { ...s, obras };
        });
      },
      duplicateObra: (id) => {
        const src = state.obras.find((o) => o.id === id);
        if (!src) return null;
        const nova: Obra = {
          ...src,
          id: uid("obr"),
          codigo: `${src.codigo}-C`,
          nome: `${src.nome} (cópia)`,
          status: "em_orcamento",
          fisicoPct: 0,
          realizado: 0,
          propostaStatus: "contato_inicial",
        };
        const nodes = state.nodes
          .filter((n) => n.obraId === id)
          .map((n) => ({
            ...n,
            id: uid("n"),
            obraId: nova.id,
            realizado: 0,
            fisicoPct: 0,
          }));
        setState((s) => ({
          ...s,
          obras: [nova, ...s.obras],
          nodes: [...nodes, ...s.nodes],
        }));
        return nova;
      },
      softRemoveObra: (id) => {
        setState((s) => ({
          ...s,
          obras: s.obras.filter((o) => o.id !== id),
        }));
      },
      addNode: (data) => {
        const orcado =
          data.orcado ??
          (data.kind === "item"
            ? custoLinha({
                quantidade: data.quantidade,
                custoUnit: data.custoUnit,
              })
            : 0);
        const node: OrcamentoNode = {
          ...data,
          id: uid("n"),
          orcado,
          realizado: data.realizado ?? 0,
          fisicoPct: data.fisicoPct ?? 0,
        };
        setState((s) => ({ ...s, nodes: [...s.nodes, node] }));
        queueMicrotask(() => recomputeObraTotais(data.obraId));
        return node;
      },
      recomputeObraTotais,
      apropriarDespesa: (nodeId, valor) => {
        const node = state.nodes.find((n) => n.id === nodeId);
        if (!node || node.kind !== "item" || valor <= 0) return false;
        setState((s) => ({
          ...s,
          nodes: s.nodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  realizado: Math.round((n.realizado + valor) * 100) / 100,
                }
              : n
          ),
        }));
        queueMicrotask(() => recomputeObraTotais(node.obraId));
        return true;
      },
      addRdo: ({ obraId, data, responsavel, atividades }) => {
        const exists = state.rdos.some(
          (r) => r.obraId === obraId && r.data === data
        );
        if (exists) return null;
        const nums = state.rdos
          .filter((r) => r.obraId === obraId)
          .map((r) => r.numero);
        const numero = (nums.length ? Math.max(...nums) : 0) + 1;
        const rdo: Rdo = {
          id: uid("rdo"),
          obraId,
          numero,
          data,
          responsavel,
          status: "rascunho",
          clima: {
            manha: { clima: "claro", condicao: "praticavel" },
            tarde: { clima: "claro", condicao: "praticavel" },
            noite: { clima: "claro", condicao: "praticavel" },
          },
          efetivo: [],
          equipamentos: [],
          atividades: atividades ?? [],
          materiais: [],
          ocorrencias: [],
          efetivoTotal: 0,
        };
        setState((s) => ({ ...s, rdos: [rdo, ...s.rdos] }));
        return rdo;
      },
      copyRdoFromPrevious: (obraId, data) => {
        const prev = [...state.rdos]
          .filter((r) => r.obraId === obraId && r.data < data)
          .sort((a, b) => b.data.localeCompare(a.data))[0];
        if (!prev) return null;
        const exists = state.rdos.some(
          (r) => r.obraId === obraId && r.data === data
        );
        if (exists) return null;
        const nums = state.rdos
          .filter((r) => r.obraId === obraId)
          .map((r) => r.numero);
        const numero = (nums.length ? Math.max(...nums) : 0) + 1;
        const rdo: Rdo = {
          id: uid("rdo"),
          obraId,
          numero,
          data,
          responsavel: prev.responsavel,
          status: "rascunho",
          clima: { ...prev.clima },
          efetivo: prev.efetivo.map((e) => ({ ...e })),
          equipamentos: prev.equipamentos.map((e) => ({ ...e })),
          atividades: prev.atividades.map((a) => ({ ...a })),
          materiais: [],
          ocorrencias: [],
          efetivoTotal: prev.efetivoTotal,
        };
        setState((s) => ({ ...s, rdos: [rdo, ...s.rdos] }));
        return rdo;
      },
      updateRdoStatus: (id, status, motivo) => {
        const rdo = state.rdos.find((r) => r.id === id);
        if (!rdo) return false;
        if (rdo.status === "aprovado" && status !== "aprovado") return false;
        if (status === "devolvido" && !motivo?.trim()) return false;

        setState((s) => {
          let nodes = s.nodes;
          let obras = s.obras;
          let curvaS = s.curvaS;
          if (status === "aprovado") {
            for (const at of rdo.atividades) {
              if (!at.nodeId) continue;
              nodes = nodes.map((n) =>
                n.id === at.nodeId
                  ? {
                      ...n,
                      fisicoPct: Math.max(n.fisicoPct, at.fisicoAcumulado),
                    }
                  : n
              );
            }
            const itens = nodes.filter(
              (n) => n.obraId === rdo.obraId && n.kind === "item"
            );
            const fisico =
              itens.length === 0
                ? 0
                : Math.round(
                    (itens.reduce((a, n) => a + n.fisicoPct, 0) /
                      itens.length) *
                      100
                  ) / 100;
            obras = obras.map((o) =>
              o.id === rdo.obraId ? { ...o, fisicoPct: fisico } : o
            );
            // D22 — alimenta Curva S
            const obra = obras.find((o) => o.id === rdo.obraId);
            if (obra) {
              const base = todayIso().slice(0, 7);
              const pontos = [0, 1, 2].map((i) => {
                const d = new Date(`${base}-01T12:00:00Z`);
                d.setUTCMonth(d.getUTCMonth() + i);
                const periodo = d.toISOString().slice(0, 7);
                const factor = (i + 1) / 3;
                return {
                  periodo,
                  planejadoFisico: Math.round(100 * factor),
                  realizadoFisico: Math.round(obra.fisicoPct * factor),
                  planejadoFinanceiro:
                    Math.round(obra.orcado * factor * 100) / 100,
                  realizadoFinanceiro:
                    Math.round(obra.realizado * factor * 100) / 100,
                };
              });
              curvaS = { ...curvaS, [rdo.obraId]: pontos };
            }
          }
          return {
            ...s,
            nodes,
            obras,
            curvaS,
            rdos: s.rdos.map((r) =>
              r.id === id
                ? {
                    ...r,
                    status,
                    motivoDevolucao:
                      status === "devolvido" ? motivo : r.motivoDevolucao,
                  }
                : r
            ),
          };
        });
        return true;
      },
      setRelatorioGerencialStatus: (id, status) => {
        const rg = state.relatoriosGerenciais.find((r) => r.id === id);
        if (!rg) return false;
        setState((s) => ({
          ...s,
          relatoriosGerenciais: s.relatoriosGerenciais.map((r) =>
            r.id === id ? { ...r, status } : r
          ),
        }));
        return true;
      },
      gerarCurvaS: (obraId) => {
        const obra = state.obras.find((o) => o.id === obraId);
        if (!obra) return;
        const base = todayIso().slice(0, 7);
        const pontos = [0, 1, 2].map((i) => {
          const d = new Date(`${base}-01T12:00:00Z`);
          d.setUTCMonth(d.getUTCMonth() + i);
          const periodo = d.toISOString().slice(0, 7);
          const factor = (i + 1) / 3;
          return {
            periodo,
            planejadoFisico: Math.round(100 * factor),
            realizadoFisico: Math.round(obra.fisicoPct * factor),
            planejadoFinanceiro: Math.round(obra.orcado * factor * 100) / 100,
            realizadoFinanceiro:
              Math.round(obra.realizado * factor * 100) / 100,
          };
        });
        setState((s) => ({
          ...s,
          curvaS: { ...s.curvaS, [obraId]: pontos },
        }));
      },
      updateObrasConfig: (patch) => {
        setState((s) => ({
          ...s,
          expedienteHoras: Math.max(
            1,
            Math.min(24, patch.expedienteHoras ?? s.expedienteHoras ?? 8)
          ),
          bdiModo: patch.bdiModo ?? s.bdiModo,
          arredondamento:
            patch.arredondamento ?? s.arredondamento,
        }));
      },
      nodesDaObra,
      totaisDaObra,
    };
  }, [state, ready]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useObras() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useObras must be used within ObrasStoreProvider");
  return ctx;
}

export type { ObraStatus } from "@/lib/domain/obras-types";
export { precoComBdi } from "@/lib/money/orcamento";

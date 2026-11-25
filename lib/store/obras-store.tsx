"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { OBRAS_STORAGE_KEY, seedObras } from "@/lib/domain/obras-seed";
import type {
  Composicao,
  Insumo,
  Obra,
  ObraStatus,
  ObrasCatalogState,
  OrcamentoNode,
  Rdo,
  RdoStatus,
} from "@/lib/domain/obras-types";
import { custoLinha, precoComBdi, totaisOrcamento } from "@/lib/money/orcamento";

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
  updateRdoStatus: (
    id: string,
    status: RdoStatus,
    motivo?: string
  ) => boolean;
  addRdoFoto: (
    id: string,
    foto: { legenda: string; dataUrl: string }
  ) => boolean;
  removeRdoFoto: (id: string, fotoId: string) => boolean;
  gerarCurvaS: (obraId: string) => void;
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(OBRAS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ObrasCatalogState>;
        const seed = seedObras();
        setState({
          ...seed,
          ...parsed,
          insumos: parsed.insumos?.length ? parsed.insumos : seed.insumos,
          composicoes: parsed.composicoes?.length
            ? parsed.composicoes
            : seed.composicoes,
          obras: parsed.obras?.length ? parsed.obras : seed.obras,
          nodes: parsed.nodes?.length ? parsed.nodes : seed.nodes,
          rdos: parsed.rdos?.length ? parsed.rdos : seed.rdos,
        });
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(OBRAS_STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

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
                (itens.reduce((a, n) => a + n.fisicoPct, 0) / itens.length) * 100
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
        const next = seedObras();
        setState(next);
        localStorage.setItem(OBRAS_STORAGE_KEY, JSON.stringify(next));
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
        };
        setState((s) => ({ ...s, obras: [obra, ...s.obras] }));
        return obra;
      },
      updateObra: (id, patch) => {
        setState((s) => ({
          ...s,
          obras: s.obras.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        }));
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
              ? { ...n, realizado: Math.round((n.realizado + valor) * 100) / 100 }
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
          fotos: [],
        };
        setState((s) => ({ ...s, rdos: [rdo, ...s.rdos] }));
        return rdo;
      },
      addRdoFoto: (id, foto) => {
        const rdo = state.rdos.find((r) => r.id === id);
        if (!rdo || !foto.dataUrl) return false;
        setState((s) => ({
          ...s,
          rdos: s.rdos.map((r) =>
            r.id === id
              ? {
                  ...r,
                  fotos: [
                    ...(r.fotos ?? []),
                    {
                      id: uid("foto"),
                      legenda: foto.legenda.trim() || "Foto do canteiro",
                      dataUrl: foto.dataUrl,
                    },
                  ],
                }
              : r
          ),
        }));
        return true;
      },
      removeRdoFoto: (id, fotoId) => {
        setState((s) => ({
          ...s,
          rdos: s.rdos.map((r) =>
            r.id === id
              ? {
                  ...r,
                  fotos: (r.fotos ?? []).filter((f) => f.id !== fotoId),
                }
              : r
          ),
        }));
        return true;
      },
      updateRdoStatus: (id, status, motivo) => {
        const rdo = state.rdos.find((r) => r.id === id);
        if (!rdo) return false;
        if (rdo.status === "aprovado" && status !== "aprovado") return false;
        if (status === "devolvido" && !motivo?.trim()) return false;

        setState((s) => {
          let nodes = s.nodes;
          let obras = s.obras;
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
          }
          return {
            ...s,
            nodes,
            obras,
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

export type { ObraStatus };
export { precoComBdi };

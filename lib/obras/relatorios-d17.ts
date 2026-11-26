/** D17 — relatórios da obra (sintético, analítico, ABC, insumos). */

import type { Insumo, OrcamentoNode } from "@/lib/domain/obras-types";

export type RelatorioSinteticoLinha = {
  codigo: string;
  descricao: string;
  orcado: number;
  realizado: number;
  saldo: number;
  fisicoPct: number;
};

export type RelatorioAnaliticoLinha = RelatorioSinteticoLinha & {
  kind: string;
  unidade: string;
  quantidade: number;
  grupo: string;
};

export type CurvaAbcLinha = {
  codigo: string;
  descricao: string;
  orcado: number;
  acumuladoPct: number;
  classe: "A" | "B" | "C";
};

export type InsumoOxRLinha = {
  codigo: string;
  nome: string;
  unidade: string;
  orcado: number;
  realizado: number;
  saldo: number;
};

export function orcamentoSintetico(
  nodes: OrcamentoNode[]
): RelatorioSinteticoLinha[] {
  return nodes
    .filter((n) => n.kind === "etapa" || n.kind === "subetapa")
    .sort((a, b) => a.ordem - b.ordem || a.codigo.localeCompare(b.codigo))
    .map((n) => ({
      codigo: n.codigo,
      descricao: n.descricao,
      orcado: n.orcado,
      realizado: n.realizado,
      saldo: Math.round((n.orcado - n.realizado) * 100) / 100,
      fisicoPct: n.fisicoPct,
    }));
}

export function orcamentoAnalitico(
  nodes: OrcamentoNode[]
): RelatorioAnaliticoLinha[] {
  return nodes
    .filter((n) => n.kind === "item")
    .sort((a, b) => a.ordem - b.ordem || a.codigo.localeCompare(b.codigo))
    .map((n) => ({
      codigo: n.codigo,
      descricao: n.descricao,
      kind: n.kind,
      unidade: n.unidade,
      quantidade: n.quantidade,
      grupo: n.grupo ?? "outros",
      orcado: n.orcado,
      realizado: n.realizado,
      saldo: Math.round((n.orcado - n.realizado) * 100) / 100,
      fisicoPct: n.fisicoPct,
    }));
}

/** Curva ABC pelo orçado dos itens (80/95/100). */
export function curvaAbc(nodes: OrcamentoNode[]): CurvaAbcLinha[] {
  const itens = nodes
    .filter((n) => n.kind === "item")
    .slice()
    .sort((a, b) => b.orcado - a.orcado);
  const total = itens.reduce((a, n) => a + n.orcado, 0) || 1;
  let acc = 0;
  return itens.map((n) => {
    acc += n.orcado;
    const acumuladoPct = Math.round((acc / total) * 1000) / 10;
    const classe: "A" | "B" | "C" =
      acumuladoPct <= 80 ? "A" : acumuladoPct <= 95 ? "B" : "C";
    return {
      codigo: n.codigo,
      descricao: n.descricao,
      orcado: n.orcado,
      acumuladoPct,
      classe,
    };
  });
}

/**
 * Insumos orçados × realizados: orçado = Σ (custoUnit×coef×qtd item) via composições;
 * realizado aproximado pela proporção do item (realizado/orcado) × orçado do insumo.
 */
export function insumosOrcadosXRealizados(input: {
  nodes: OrcamentoNode[];
  insumos: Insumo[];
  composicoes: {
    id: string;
    itens: { insumoId: string; coeficiente: number }[];
  }[];
}): InsumoOxRLinha[] {
  const map = new Map<string, { orcado: number; realizado: number }>();
  const insumoById = new Map(input.insumos.map((i) => [i.id, i]));
  const compById = new Map(input.composicoes.map((c) => [c.id, c]));

  for (const n of input.nodes.filter((x) => x.kind === "item")) {
    const ratio = n.orcado > 0 ? n.realizado / n.orcado : 0;
    if (n.insumoId) {
      const ins = insumoById.get(n.insumoId);
      const custo = (ins?.custoUnitario ?? n.custoUnit) * n.quantidade;
      const cur = map.get(n.insumoId) ?? { orcado: 0, realizado: 0 };
      cur.orcado += custo;
      cur.realizado += custo * ratio;
      map.set(n.insumoId, cur);
      continue;
    }
    if (n.composicaoId) {
      const comp = compById.get(n.composicaoId);
      if (!comp) continue;
      for (const it of comp.itens) {
        const ins = insumoById.get(it.insumoId);
        const custo =
          (ins?.custoUnitario ?? 0) * it.coeficiente * n.quantidade;
        const cur = map.get(it.insumoId) ?? { orcado: 0, realizado: 0 };
        cur.orcado += custo;
        cur.realizado += custo * ratio;
        map.set(it.insumoId, cur);
      }
    }
  }

  return [...map.entries()]
    .map(([id, v]) => {
      const ins = insumoById.get(id);
      return {
        codigo: ins?.codigo ?? id,
        nome: ins?.descricao ?? id,
        unidade: ins?.unidade ?? "un",
        orcado: Math.round(v.orcado * 100) / 100,
        realizado: Math.round(v.realizado * 100) / 100,
        saldo: Math.round((v.orcado - v.realizado) * 100) / 100,
      };
    })
    .sort((a, b) => b.orcado - a.orcado);
}

export function desempenhoCustos(nodes: OrcamentoNode[]): {
  orcado: number;
  realizado: number;
  saldo: number;
  fisicoMedio: number;
  itens: number;
} {
  const itens = nodes.filter((n) => n.kind === "item");
  const orcado = itens.reduce((a, n) => a + n.orcado, 0);
  const realizado = itens.reduce((a, n) => a + n.realizado, 0);
  const fisicoMedio =
    itens.length === 0
      ? 0
      : Math.round(
          itens.reduce((a, n) => a + n.fisicoPct, 0) / itens.length
        );
  return {
    orcado: Math.round(orcado * 100) / 100,
    realizado: Math.round(realizado * 100) / 100,
    saldo: Math.round((orcado - realizado) * 100) / 100,
    fisicoMedio,
    itens: itens.length,
  };
}

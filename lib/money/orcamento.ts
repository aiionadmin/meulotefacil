/** Cálculos de orçamento / BDI (Parte 2). */

export type LinhaCusto = {
  quantidade: number;
  custoUnit: number;
  bdiPct?: number;
};

export function custoLinha(l: LinhaCusto): number {
  return Math.round(l.quantidade * l.custoUnit * 100) / 100;
}

export function precoComBdi(custo: number, bdiPct: number): number {
  const bdi = Number.isFinite(bdiPct) ? bdiPct : 0;
  return Math.round(custo * (1 + bdi) * 100) / 100;
}

export function totaisOrcamento(
  linhas: LinhaCusto[],
  bdiPadrao: number
): { custo: number; bdi: number; preco: number } {
  const custo = linhas.reduce((a, l) => a + custoLinha(l), 0);
  const preco = linhas.reduce(
    (a, l) => a + precoComBdi(custoLinha(l), l.bdiPct ?? bdiPadrao),
    0
  );
  const bdi = custo > 0 ? Math.round((preco / custo - 1) * 10000) / 10000 : bdiPadrao;
  return {
    custo: Math.round(custo * 100) / 100,
    bdi,
    preco: Math.round(preco * 100) / 100,
  };
}

export function custoPorGrupo(
  itens: { grupo: string; custo: number }[]
): Record<string, number> {
  const out: Record<string, number> = {
    material: 0,
    mao_de_obra: 0,
    equipamento: 0,
    outros: 0,
  };
  for (const i of itens) {
    const g = i.grupo in out ? i.grupo : "outros";
    out[g] = Math.round((out[g] + i.custo) * 100) / 100;
  }
  return out;
}

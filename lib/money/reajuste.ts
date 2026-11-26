/**
 * Reajuste anual — H18.
 * Multiplica parcelas em aberto pelo fator; opcionalmente gera resíduo
 * (diferença de arredondamento por contrato).
 */

export type ReajusteParcela = {
  id: string;
  contractId?: string;
  valor: number;
  status: string;
  correcao?: number;
};

export type ResiduoGerado = {
  contractId: string;
  valor: number;
};

export function aplicarFatorReajuste<T extends ReajusteParcela>(
  parcelas: T[],
  fator: number,
  opts?: { gerarResiduo?: boolean }
): { atualizadas: T[]; qtd: number; residuos: ResiduoGerado[] } {
  let qtd = 0;
  const acc = new Map<string, number>();

  const atualizadas = parcelas.map((p) => {
    if (p.status === "paga" || p.status === "cancelada") return p;
    qtd += 1;
    const bruto = p.valor * fator;
    const arred = Math.round(bruto * 100) / 100;
    const delta = Math.round((bruto - arred) * 10000) / 10000;
    if (opts?.gerarResiduo && p.contractId && Math.abs(delta) >= 0.0001) {
      acc.set(p.contractId, (acc.get(p.contractId) ?? 0) + delta);
    }
    const correcao =
      Math.round(((p.correcao ?? 0) + (arred - p.valor)) * 100) / 100;
    return {
      ...p,
      valor: arred,
      correcao,
    };
  });

  const residuos: ResiduoGerado[] = [];
  if (opts?.gerarResiduo) {
    for (const [contractId, raw] of acc) {
      const valor = Math.round(raw * 100) / 100;
      if (Math.abs(valor) >= 0.01) {
        residuos.push({ contractId, valor: Math.abs(valor) });
      }
    }
  }

  return { atualizadas, qtd, residuos };
}

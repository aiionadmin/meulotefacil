/**
 * Reajuste anual simplificado — docs/especificacao.md §11.4.
 * Multiplica parcelas em aberto pelo fator do índice; guarda valor anterior no caller.
 */

export type ReajusteParcela = {
  id: string;
  valor: number;
  status: string;
};

export function aplicarFatorReajuste<T extends ReajusteParcela>(
  parcelas: T[],
  fator: number
): { atualizadas: T[]; qtd: number } {
  let qtd = 0;
  const atualizadas = parcelas.map((p) => {
    if (p.status === "paga" || p.status === "cancelada") return p;
    qtd += 1;
    return {
      ...p,
      valor: Math.round(p.valor * fator * 100) / 100,
    };
  });
  return { atualizadas, qtd };
}

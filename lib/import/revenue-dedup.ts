/** K04 — não duplicar receita LoteWin × Mais Controle. */

export type ReceitaOrigem = "contrato_lotewin" | "faturamento_mais_controle";

export type ReceitaCandidata = {
  id: string;
  origem: ReceitaOrigem;
  /** Identificador de negócio (contrato + parcela ou doc MC). */
  chaveNegocio: string;
  valor: number;
  /** Marcado no MC como recebimento genérico de venda de lote. */
  vendaLoteGenerica?: boolean;
};

/**
 * Parcelas do LoteWin entram; recebimentos genéricos de venda de lote
 * no Mais Controle são excluídos para não somar duas vezes a mesma receita.
 */
export function filtrarReceitasSemDuplicar(
  itens: ReceitaCandidata[]
): ReceitaCandidata[] {
  const lotewinKeys = new Set(
    itens
      .filter((i) => i.origem === "contrato_lotewin")
      .map((i) => i.chaveNegocio)
  );

  return itens.filter((i) => {
    if (i.origem === "contrato_lotewin") return true;
    if (i.vendaLoteGenerica) return false;
    if (lotewinKeys.has(i.chaveNegocio)) return false;
    return true;
  });
}

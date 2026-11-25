import type { ComprasState, Cotacao, CotacaoFornecedor } from "./compras-types";

export type CotacaoPublicaContext = {
  cotacao: Cotacao;
  fornecedor: CotacaoFornecedor;
};

/** Resolve cotação + fornecedor pelo token público do link. */
export function findCotacaoByPublicToken(
  state: ComprasState,
  token: string
): CotacaoPublicaContext | null {
  const t = token.trim();
  if (!t) return null;
  for (const cotacao of state.cotacoes) {
    const fornecedor = cotacao.fornecedores.find((f) => f.publicToken === t);
    if (fornecedor) return { cotacao, fornecedor };
  }
  return null;
}

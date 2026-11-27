/**
 * Ponto de integração para importar orçamento do fornecedor em PDF.
 * No Mais Controle isso usa IA; aqui o upload alimenta anexos e o
 * preenchimento de preços permanece manual até haver provedor.
 */

export type CotacaoPdfParseResult = {
  ok: boolean;
  itens: { descricao: string; precoUnitario: number; quantidade?: number }[];
  aviso?: string;
};

/** Stub: não extrai preços automaticamente. */
export async function parseCotacaoPdf(
  _file: File | ArrayBuffer,
  _opts?: { fornecedor?: string }
): Promise<CotacaoPdfParseResult> {
  return {
    ok: true,
    itens: [],
    aviso:
      "Upload registrado. Preencha os preços manualmente no mapa (parser/IA preparado, desligado).",
  };
}

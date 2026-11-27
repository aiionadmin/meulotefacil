/** Formas de pagamento em venda/contrato (LoteWin). */

export type FormaPagamentoVenda =
  | "plano"
  | "a_vista"
  | "boleto"
  | "pix"
  | "transferencia"
  | "dinheiro"
  | "cartao"
  | "permuta";

export const FORMAS_PAGAMENTO_VENDA: {
  value: FormaPagamentoVenda;
  label: string;
}[] = [
  { value: "plano", label: "Plano de pagamento" },
  { value: "a_vista", label: "À vista" },
  { value: "boleto", label: "Boleto" },
  { value: "pix", label: "Pix" },
  { value: "transferencia", label: "Transferência" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao", label: "Cartão" },
  { value: "permuta", label: "Permuta" },
];

export function labelFormaPagamentoVenda(
  forma: FormaPagamentoVenda | string | undefined
): string {
  if (!forma) return "—";
  return (
    FORMAS_PAGAMENTO_VENDA.find((f) => f.value === forma)?.label ?? forma
  );
}

/** Bloqueia salvar quando permuta sem descrição. */
export function validatePermutaDescricao(
  forma: string | undefined,
  descricao: string | undefined
): string | null {
  if (forma !== "permuta") return null;
  if (!descricao?.trim()) {
    return "Descreva como foi a permuta (obrigatório)";
  }
  return null;
}

/**
 * Indicadores nomeados (B03/B04) — uma regra por nome.
 */

export type InstallmentLike = {
  status: string;
  valor: number;
  juros?: number;
  multa?: number;
  correcao?: number;
  despesaBancaria?: number;
  desconto?: number;
};

export type PayableLike = { status: string; valor: number };
export type ReceivableLike = { status: string; valor: number };

/** Soma do saldo em aberto de parcelas de contrato (original + encargos gravados). */
export function aReceberContratos(installments: InstallmentLike[]) {
  return installments
    .filter((p) => p.status !== "paga" && p.status !== "cancelada")
    .reduce(
      (a, p) =>
        a +
        p.valor +
        (p.juros ?? 0) +
        (p.multa ?? 0) +
        (p.correcao ?? 0) +
        (p.despesaBancaria ?? 0) -
        (p.desconto ?? 0),
      0
    );
}

/** Títulos a receber do financeiro operacional (não contrato). */
export function aReceberFinanceiro(receivables: ReceivableLike[]) {
  return receivables
    .filter((r) => r.status !== "recebido")
    .reduce((a, r) => a + r.valor, 0);
}

/** Títulos do módulo Financeiro (Mais Controle) — saldo = valor − recebido. */
export function aReceberFinanceiroTitulos(
  recebimentos: {
    status: string;
    valor: number;
    valorRecebido?: number;
  }[]
) {
  return recebimentos
    .filter((r) => r.status !== "recebido")
    .reduce((a, r) => a + (r.valor - (r.valorRecebido ?? 0)), 0);
}

/** Em atraso no Financeiro (títulos vencidos). */
export function emAtrasoFinanceiroTitulos(
  recebimentos: {
    status: string;
    valor: number;
    valorRecebido?: number;
  }[]
) {
  return recebimentos
    .filter((r) => r.status === "vencido")
    .reduce((a, r) => a + (r.valor - (r.valorRecebido ?? 0)), 0);
}

/** A receber total = contratos + financeiro operacional. */
export function aReceberTotal(
  installments: InstallmentLike[],
  receivables: ReceivableLike[]
) {
  return aReceberContratos(installments) + aReceberFinanceiro(receivables);
}

export function emAtrasoContratos(installments: InstallmentLike[]) {
  return installments
    .filter((p) => p.status === "vencida")
    .reduce(
      (a, p) =>
        a +
        p.valor +
        (p.juros ?? 0) +
        (p.multa ?? 0) +
        (p.correcao ?? 0) +
        (p.despesaBancaria ?? 0) -
        (p.desconto ?? 0),
      0
    );
}

export function emAtrasoCobranca(
  cases: { valorAtualizado: number }[]
) {
  return cases.reduce((a, c) => a + c.valorAtualizado, 0);
}

export function countUsuariosAtivos(users: { status: string }[]) {
  return users.filter((u) => u.status === "ativo").length;
}

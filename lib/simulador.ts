/**
 * Simulador de parcelas, Meu Lote Fácil
 *
 * AVISO: Esta é uma simulação educativa, sem valor de proposta comercial.
 * Os valores não constituem oferta vinculante. Consulte um consultor para
 * condições reais de financiamento e documentação.
 *
 * Fórmula simplificada (juros compostos sobre o saldo):
 *   saldo = valorLote - entrada
 *   parcela = saldo * (i * (1+i)^n) / ((1+i)^n - 1)
 * onde i = taxa mensal e n = número de parcelas.
 */

export type SimuladorInput = {
  valorLote: number;
  entrada: number;
  parcelas: number;
  /** Taxa mensal decimal. Default ~0.99%/mês (aprox. tabela Price ilustrativa). */
  taxaMensal?: number;
};

export type SimuladorResultado = {
  saldo: number;
  parcela: number;
  totalPago: number;
  totalJuros: number;
  entradaPercentual: number;
};

export function simularParcelas(input: SimuladorInput): SimuladorResultado {
  const { valorLote, entrada, parcelas } = input;
  const taxaMensal = input.taxaMensal ?? 0.0099;

  const entradaClamp = Math.min(Math.max(entrada, 0), valorLote);
  const n = Math.max(1, Math.floor(parcelas));
  const saldo = Math.max(0, valorLote - entradaClamp);

  let parcela = 0;
  if (saldo === 0) {
    parcela = 0;
  } else if (taxaMensal <= 0) {
    parcela = saldo / n;
  } else {
    const fator = Math.pow(1 + taxaMensal, n);
    parcela = (saldo * (taxaMensal * fator)) / (fator - 1);
  }

  const totalPago = entradaClamp + parcela * n;
  const totalJuros = Math.max(0, totalPago - valorLote);
  const entradaPercentual = valorLote > 0 ? (entradaClamp / valorLote) * 100 : 0;

  return {
    saldo,
    parcela,
    totalPago,
    totalJuros,
    entradaPercentual,
  };
}

export function buildWhatsAppSimulacaoUrl(
  resultado: SimuladorResultado & SimuladorInput,
  phone = "5511999999999"
) {
  const text = [
    "Olá! Simulei no Meu Lote Fácil e gostaria de falar com um consultor.",
    `Valor do lote: R$ ${resultado.valorLote.toLocaleString("pt-BR")}`,
    `Entrada: R$ ${resultado.entrada.toLocaleString("pt-BR")}`,
    `Parcelas: ${resultado.parcelas}x de R$ ${Math.round(resultado.parcela).toLocaleString("pt-BR")}`,
    "(Simulação ilustrativa, sem valor de proposta)",
  ].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

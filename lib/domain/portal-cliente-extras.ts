/** Portal do cliente — informe anual, encargos e pedido cadastral (§6.4). */

import { calcAtraso } from "@/lib/money/atraso";

export type ParcelaPortal = {
  id: string;
  valor: number;
  vencimento: string;
  status: string;
  cliente: string;
  contratoRef?: string;
  recebidoEm?: string;
};

export type InformeAnualLinha = {
  contratoRef: string;
  vencimento: string;
  pagoEm: string;
  valor: number;
};

export type InformeAnual = {
  ano: number;
  linhas: InformeAnualLinha[];
  totalPago: number;
};

/** Pagamentos do ano (parcelas recebidas) para o cliente. */
export function informeAnualPagamentos(
  parcelas: ParcelaPortal[],
  clienteNome: string,
  ano: number
): InformeAnual {
  const first = clienteNome.trim().toLowerCase().split(/\s+/)[0] ?? "";
  const linhas = parcelas
    .filter((p) => {
      if (p.status !== "recebido" || !p.recebidoEm) return false;
      if (!p.recebidoEm.startsWith(String(ano))) return false;
      return p.cliente.toLowerCase().includes(first);
    })
    .map((p) => ({
      contratoRef: p.contratoRef ?? "—",
      vencimento: p.vencimento,
      pagoEm: p.recebidoEm!,
      valor: p.valor,
    }))
    .sort((a, b) => a.pagoEm.localeCompare(b.pagoEm));
  const totalPago = Math.round(
    linhas.reduce((s, l) => s + l.valor, 0) * 100
  ) / 100;
  return { ano, linhas, totalPago };
}

export type ValorAtualizado = {
  valor: number;
  juros: number;
  multa: number;
  total: number;
  diasAtraso: number;
  emAtraso: boolean;
};

/** Valor atualizado de parcela (juros/multa) — data pura, sem fuso. */
export function valorAtualizadoParcela(
  parcela: { valor: number; vencimento: string; status: string },
  consulta: string,
  taxas?: { taxaMoraMes: number; taxaMulta: number; diasTolerancia?: number }
): ValorAtualizado {
  if (parcela.status === "recebido") {
    return {
      valor: parcela.valor,
      juros: 0,
      multa: 0,
      total: parcela.valor,
      diasAtraso: 0,
      emAtraso: false,
    };
  }
  const r = calcAtraso({
    valor: parcela.valor,
    vencimento: parcela.vencimento,
    consulta,
    taxaMoraMes: taxas?.taxaMoraMes ?? 0.01,
    taxaMulta: taxas?.taxaMulta ?? 0.02,
    diasTolerancia: taxas?.diasTolerancia ?? 0,
  });
  return {
    valor: parcela.valor,
    juros: r.juros,
    multa: r.multa,
    total: r.total,
    diasAtraso: r.diasAtraso,
    emAtraso: r.emAtraso,
  };
}

export type PedidoCadastroInput = {
  clienteId: string;
  clienteNome: string;
  campo: string;
  valorAtual: string;
  valorNovo: string;
};

export function descricaoPedidoCadastro(input: PedidoCadastroInput): string {
  return `Atualização cadastral · ${input.campo}: "${input.valorAtual}" → "${input.valorNovo}" (cliente ${input.clienteNome})`;
}

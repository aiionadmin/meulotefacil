/**
 * Status único de parcela (B05) — mesma função para Financeiro e Ficha.
 */
import { calcAtraso } from "./atraso";
import type { InstallmentStatus } from "@/lib/domain/carteira-types";

export type InstallmentStatusInput = {
  status: InstallmentStatus | string;
  valor: number;
  vencimento: string; // YYYY-MM-DD
  consulta: string; // YYYY-MM-DD
  taxaMoraMes?: number;
  taxaMulta?: number;
  diasTolerancia?: number;
};

export type InstallmentView = {
  status: InstallmentStatus;
  valorOriginal: number;
  valorAtualizado: number;
  juros: number;
  multa: number;
  diasAtraso: number;
  emAtraso: boolean;
};

export function resolveInstallmentStatus(
  input: InstallmentStatusInput
): InstallmentView {
  const valorOriginal = input.valor;
  if (input.status === "paga" || input.status === "cancelada") {
    return {
      status: input.status as InstallmentStatus,
      valorOriginal,
      valorAtualizado: valorOriginal,
      juros: 0,
      multa: 0,
      diasAtraso: 0,
      emAtraso: false,
    };
  }

  const atraso = calcAtraso({
    valor: valorOriginal,
    vencimento: input.vencimento,
    consulta: input.consulta,
    taxaMoraMes: input.taxaMoraMes ?? 0.01,
    taxaMulta: input.taxaMulta ?? 0.02,
    diasTolerancia: input.diasTolerancia ?? 0,
  });

  const status: InstallmentStatus = atraso.emAtraso ? "vencida" : "em_aberto";

  return {
    status,
    valorOriginal,
    valorAtualizado: atraso.total,
    juros: atraso.juros,
    multa: atraso.multa,
    diasAtraso: atraso.diasAtraso,
    emAtraso: atraso.emAtraso,
  };
}

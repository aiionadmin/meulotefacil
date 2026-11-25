import { NextResponse } from "next/server";
import { resolveInstallmentStatus } from "@/lib/money/installment-status";
import { seedCarteira } from "@/lib/domain/carteira-seed";
import type { Installment } from "@/lib/domain/carteira-types";

/**
 * B18 — pagina parcelas e calcula encargos só da página.
 * Aceite: contrato com 240 parcelas abre rápido.
 */

function buildLargeContract(count: number): Installment[] {
  const out: Installment[] = [];
  for (let i = 1; i <= count; i++) {
    const month = ((i - 1) % 12) + 1;
    const year = 2020 + Math.floor((i - 1) / 12);
    const mm = String(month).padStart(2, "0");
    out.push({
      id: `perf-p-${i}`,
      contractId: "ct-perf-240",
      contratoNumero: "PERF-240",
      compradorNome: "Ana Souza",
      n: i,
      tipo: "P",
      vencimento: `${year}-${mm}-10`,
      valor: 238.75,
      juros: 0,
      multa: 0,
      correcao: 0,
      despesaBancaria: 0,
      desconto: 0,
      status: "em_aberto",
    });
  }
  return out;
}

export async function GET(request: Request) {
  const started = performance.now();
  const { searchParams } = new URL(request.url);
  const contractId = searchParams.get("contractId") || "";
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 20)));
  const consulta = searchParams.get("consulta") || "2026-11-24";
  const synthetic = searchParams.get("synthetic") === "240";

  const seed = seedCarteira();
  const list = synthetic
    ? buildLargeContract(240)
    : seed.installments.filter((p) =>
        contractId ? p.contractId === contractId : true
      );

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const slice = list.slice(start, start + pageSize);

  // Encargos só para a página exibida
  const items = slice.map((p) => {
    const view = resolveInstallmentStatus({
      status: p.status,
      valor: p.valor,
      vencimento: p.vencimento,
      consulta,
    });
    return {
      ...p,
      status: view.status,
      valorOriginal: view.valorOriginal,
      valorAtualizado: view.valorAtualizado,
      juros: view.juros,
      multa: view.multa,
      diasAtraso: view.diasAtraso,
    };
  });

  const elapsedMs = performance.now() - started;

  return NextResponse.json({
    items,
    page: safePage,
    pageSize,
    total,
    totalPages,
    elapsedMs,
  });
}

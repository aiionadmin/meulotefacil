/**
 * B18 — ficha com 240 parcelas: encargos só da página, < 2s.
 * npx tsx lib/money/ficha-perf.test.ts
 */
import { resolveInstallmentStatus } from "./installment-status";
import { paginate } from "@/lib/ui/pagination";

function build240() {
  return Array.from({ length: 240 }, (_, i) => {
    const n = i + 1;
    const month = ((n - 1) % 12) + 1;
    const year = 2020 + Math.floor((n - 1) / 12);
    const mm = String(month).padStart(2, "0");
    return {
      id: `p-${n}`,
      valor: 238.75,
      vencimento: `${year}-${mm}-10`,
      status: "em_aberto" as const,
    };
  });
}

const started = performance.now();
const all = build240();
const page = paginate(all, 1, 20);
const enriched = page.items.map((p) =>
  resolveInstallmentStatus({
    status: p.status,
    valor: p.valor,
    vencimento: p.vencimento,
    consulta: "2026-11-24",
  })
);
const elapsed = performance.now() - started;

if (page.total !== 240 || enriched.length !== 20) {
  console.error("FALHOU paginação", page.total, enriched.length);
  process.exit(1);
}
if (elapsed > 2000) {
  console.error("FALHOU desempenho", elapsed, "ms");
  process.exit(1);
}

console.log("OK ficha B18", {
  total: page.total,
  pageSize: enriched.length,
  elapsedMs: Math.round(elapsed * 100) / 100,
});

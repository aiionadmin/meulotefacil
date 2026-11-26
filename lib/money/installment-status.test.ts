/**
 * B05 — npx tsx lib/money/installment-status.test.ts
 */
import { resolveInstallmentStatus } from "./installment-status";

const aberto = resolveInstallmentStatus({
  status: "em_aberto",
  valor: 100,
  vencimento: "2026-12-01",
  consulta: "2026-11-24",
});
if (aberto.status !== "em_aberto" || aberto.emAtraso) {
  console.error("FALHOU aberto", aberto);
  process.exit(1);
}

const vencida = resolveInstallmentStatus({
  status: "em_aberto", // origem divergente — função unifica
  valor: 238.75,
  vencimento: "2026-07-10",
  consulta: "2026-11-24",
});
if (vencida.status !== "vencida" || !vencida.emAtraso) {
  console.error("FALHOU vencida", vencida);
  process.exit(1);
}
if (vencida.valorOriginal !== 238.75 || vencida.valorAtualizado !== 254.43) {
  console.error("FALHOU valores", vencida);
  process.exit(1);
}

console.log("OK installment-status B05");

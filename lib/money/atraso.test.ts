/**
 * Caso §11.3 — executável com: npx tsx lib/money/atraso.test.ts
 */
import { calcAtraso } from "./atraso";

const r = calcAtraso({
  valor: 238.75,
  vencimento: "2026-07-10",
  consulta: "2026-11-24",
  taxaMoraMes: 0.01,
  taxaMulta: 0.02,
});

const ok =
  r.diasAtraso === 137 &&
  r.juros === 10.9 &&
  r.multa === 4.78 &&
  r.total === 254.43;

if (!ok) {
  console.error("FALHOU caso §11.3", r);
  process.exit(1);
}

console.log("OK caso §11.3", r);

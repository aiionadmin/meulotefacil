/**
 * B01/B02 — npx tsx lib/dates/format.test.ts
 */
import { formatDateBR, formatDateTimeBR } from "./format";

const cases: Array<[string, string]> = [
  ["2026-07-10", "10/07/2026"],
  ["2026-11-15", "15/11/2026"],
  ["2026-11-25T12:00:00.000Z", "25/11/2026"],
];

let failed = 0;
for (const [input, expected] of cases) {
  const got = formatDateBR(input);
  if (got !== expected) {
    console.error("FALHOU formatDateBR", input, "→", got, "esperado", expected);
    failed += 1;
  }
}

const dt = formatDateTimeBR("2026-11-25T12:00:00.000Z");
if (!dt.startsWith("25/11/2026")) {
  console.error("FALHOU formatDateTimeBR", dt);
  failed += 1;
}

if (failed) process.exit(1);
console.log("OK datas B01/B02", cases.length + 1, "casos");

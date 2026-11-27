import {
  competenciaFromMesBase,
  findIndexQuote,
  normalizeCompetencia,
} from "./index-quote";
import type { IndexQuote } from "@/lib/domain/carteira-types";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const quotes: IndexQuote[] = [
  { id: "1", indice: "IGPM", competencia: "2026-10", fator: 1.0042 },
  { id: "2", indice: "IGPM", competencia: "2026-11", fator: 1.0031 },
  { id: "3", indice: "IPCA", competencia: "2026-11", fator: 1.002 },
];

assert(normalizeCompetencia("2026/3") === "2026-03", "norm");
assert(competenciaFromMesBase(11, 2026) === "2026-11", "comp");

const exact = findIndexQuote(quotes, "igpm", "2026-11");
assert(exact?.fator === 1.0031, `exact ${exact?.fator}`);

const latest = findIndexQuote(quotes, "IGPM");
assert(latest?.competencia === "2026-11", `latest ${latest?.competencia}`);

const older = findIndexQuote(quotes, "IGPM", "2026-10");
assert(older?.fator === 1.0042, `older ${older?.fator}`);

const missing = findIndexQuote(quotes, "INCC", "2026-11");
assert(missing === null, "missing");

console.log("ok: index-quote");

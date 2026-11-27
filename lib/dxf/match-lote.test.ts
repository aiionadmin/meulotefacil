import {
  formatLotRef,
  inferQuadraFromLayer,
  matchLotsFromPick,
  normalizeLotCode,
  parseQuadraLote,
} from "./match-lote";
import type { Lot } from "@/lib/domain/carteira-types";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(formatLotRef("A", "5") === "A/05", "format pads lote");
assert(normalizeLotCode("A/5") === "A/05", "normalize A/5");
assert(normalizeLotCode("05") === "05", "normalize digits");
assert(parseQuadraLote("B/02")?.quadra === "B", "parse quadra");
assert(inferQuadraFromLayer("03-Numero-Lote") === "3", "layer quadra");

const lots = [
  {
    id: "1",
    developmentId: "d",
    empNome: "X",
    quadra: "A",
    lote: "05",
    area: 1,
    padrao: "",
    custo: 0,
    valor: 0,
    valorM2: 0,
    status: "disponivel",
    bloqueiaVenda: false,
    bloqueiaFinanceiro: false,
  },
  {
    id: "2",
    developmentId: "d",
    empNome: "X",
    quadra: "B",
    lote: "05",
    area: 1,
    padrao: "",
    custo: 0,
    valor: 0,
    valorM2: 0,
    status: "disponivel",
    bloqueiaVenda: false,
    bloqueiaFinanceiro: false,
  },
] as Lot[];

const byLayer = matchLotsFromPick(
  { text: "5", layer: "03-Numero", x: 0, y: 0, code: "05" },
  lots
);
// layer 03 não casa A/B — devolve ambos para escolha Quadra/Lote (sem “5 de 2”)
assert(byLayer.length === 2, "ambiguous same number → both quadras");

const scoped = matchLotsFromPick(
  { text: "A/05", layer: "Numero", x: 0, y: 0, code: "A/05" },
  lots
);
assert(scoped.length === 1 && scoped[0].quadra === "A", "exact quadra/lote");

console.log("ok: match-lote");

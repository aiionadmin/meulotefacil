import { unifiedFase1Seed } from "./unified-seed";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const seed = unifiedFase1Seed();
const codes = new Set(seed.lookups.map((l) => l.codigo));

for (const c of [
  "motivos_perda",
  "tipos_demanda",
  "tipos_obra",
  "unidades",
  "tipos_retencao",
  "bases_insumo",
  "bases_composicao",
  "solicitantes",
  "condicoes_pagamento",
  "segmentos_fornecedor",
  "fontes_cliente",
  "setores_cliente",
  "tags_arquivo",
]) {
  assert(codes.has(c), `lookup ${c}`);
}

console.log("ok: fase1-lookups");

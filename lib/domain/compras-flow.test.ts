/** npx tsx lib/domain/compras-flow.test.ts */
import { contadoresItens, seedCompras } from "./compras-seed";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FALHOU", msg);
    process.exit(1);
  }
}

const seed = seedCompras();
assert(seed.config.permitirOcSemCotacao === false, "OC exige cotação por padrão");

for (const sc of seed.solicitacoes) {
  assert(!!sc.centro?.label, `SC ${sc.numero} tem centro de custo`);
}

const sc = seed.solicitacoes[0];
const c = contadoresItens(sc.itens);
assert(c.cotados.includes("de"), "contador cotados");
assert(c.comprados.includes("de"), "contador comprados");
assert(c.recebidos.includes("de"), "contador recebidos");
assert(seed.cotacoes[0].fornecedores.length === 3, "3 fornecedores no seed");
assert(
  seed.cotacoes[0].precos.some((p) => p.vencedor),
  "há vencedor no mapa"
);
assert(
  seed.cotacoes[0].centro.label === sc.centro.label,
  "cotação herda centro da SC"
);

console.log("OK compras-flow", { c, config: seed.config });

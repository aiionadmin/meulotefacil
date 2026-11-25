/** npx tsx lib/domain/parte5-isolation.test.ts */
import {
  demandasDoCliente,
  demandasDoCorretor,
  seedParte5,
} from "./parte5-seed";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FALHOU", msg);
    process.exit(1);
  }
}

const seed = seedParte5();

const corr1 = demandasDoCorretor(seed, "corr-1");
assert(
  corr1.every((d) => d.corretorId === "corr-1"),
  "corretor só vê próprias demandas"
);
assert(
  !demandasDoCorretor(seed, "corr-OUTRO").some((d) => d.corretorId === "corr-1"),
  "outro corretor não vê demandas de corr-1"
);

const cli1 = demandasDoCliente(seed, "cli-1");
assert(
  cli1.every((d) => d.clienteId === "cli-1"),
  "cliente só vê próprias demandas"
);
assert(
  demandasDoCliente(seed, "cli-OUTRO").length === 0 ||
    demandasDoCliente(seed, "cli-OUTRO").every((d) => d.clienteId === "cli-OUTRO"),
  "outro cliente isolado"
);

assert(
  seed.demandaTipos.length >= 7,
  "tipos de demanda configuráveis"
);

console.log("OK parte5-isolation", {
  corr1: corr1.length,
  cli1: cli1.length,
  tipos: seed.demandaTipos.length,
});

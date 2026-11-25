/** npx tsx lib/domain/portal-leads.test.ts */
import { findDuplicateLead } from "./lead-duplicate";
import { seedFluxo } from "./fluxo-seed";
import {
  regularizacoesDoCliente,
  timelineRegularizacao,
} from "./regularizacao-timeline";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FALHOU", msg);
    process.exit(1);
  }
}

const seed = seedFluxo();

const dupTel = findDuplicateLead(seed.leads, {
  telefone: "(19) 99911-2233",
});
assert(!!dupTel, "bloqueia telefone duplicado");
assert(dupTel!.lead.id === "ld-1", "primeiro atendimento por telefone");
assert(dupTel!.por === "telefone", "motivo telefone");

const dupCpf = findDuplicateLead(seed.leads, {
  telefone: "(19) 90000-0000",
  cpf: "111.222.333-44",
});
assert(!!dupCpf, "bloqueia CPF duplicado");
assert(dupCpf!.lead.id === "ld-1", "primeiro atendimento por CPF");

const livre = findDuplicateLead(seed.leads, {
  telefone: "(19) 91111-9999",
  cpf: "999.888.777-66",
});
assert(livre === null, "aceita lead novo");

const maria = seed.regularization.find((r) => r.id === "rg-4");
assert(!!maria, "caso Maria no seed");
const tl = timelineRegularizacao(maria!);
assert(tl.etapas.length === 6, "6 etapas na linha do tempo");
assert(
  tl.etapas.find((e) => e.status === "atual")?.etapa === "cartorio",
  "etapa atual cartório"
);
assert(tl.docsPendentes.length >= 1, "docs pendentes");
assert(!!tl.previsaoEscritura, "previsão escritura");

const portal = regularizacoesDoCliente(
  seed.regularization,
  "Maria Souza",
  "123.456.789-00"
);
assert(portal.length === 1, "portal só vê o próprio processo");
assert(portal[0].caso.id === "rg-4", "caso da Maria");

const outros = regularizacoesDoCliente(
  seed.regularization,
  "Maria Souza",
  "123.456.789-00"
);
assert(
  !outros.some((v) => v.caso.cliente === "Carla Mota"),
  "não vaza processo de outro cliente"
);

console.log("OK portal-leads", {
  dupTel: dupTel!.motivo,
  portal: portal[0].caso.loteLabel,
  etapaAtual: tl.etapas.find((e) => e.status === "atual")?.label,
});

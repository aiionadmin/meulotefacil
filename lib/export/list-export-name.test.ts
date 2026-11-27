import { exportFileSlug, exportTitleFromName } from "./list-export";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(exportFileSlug("Empreendimentos") === "empreendimentos", "emp");
assert(exportFileSlug("leads.csv") === "leads", "leads");
assert(exportFileSlug("processos-reurb") === "processos-reurb", "reurb");
assert(exportFileSlug("  ") === "lista", "empty");
assert(exportTitleFromName("empreendimentos") === "Empreendimentos", "title emp");
assert(exportTitleFromName("processos-reurb") === "Processos REURB", "title reurb");
assert(exportTitleFromName("ficha-financeira") === "Ficha Financeira", "ficha");

console.log("ok: list-export-name");

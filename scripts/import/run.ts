/**
 * Runner de importação — dry-run até existir cópia autorizada do legado.
 * Uso: npx tsx scripts/import/run.ts --entity=pessoas --dry-run
 */
import {
  IMPORT_ORDER,
  LOTEWIN_CONFERENCE,
  describeEntity,
  type ImportEntityName,
} from "./entities";

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0) return process.argv[i + 1] ?? "true";
  return process.argv.includes(`--${name}`) ? "true" : undefined;
}

const entityArg = arg("entity") ?? "all";
const dryRun = arg("dry-run") !== undefined || arg("yes") === undefined;
const entities: ImportEntityName[] =
  entityArg === "all"
    ? [...IMPORT_ORDER]
    : IMPORT_ORDER.includes(entityArg as ImportEntityName)
      ? [entityArg as ImportEntityName]
      : [];

if (!entities.length) {
  console.error("Entidade inválida. Use:", IMPORT_ORDER.join(", "), "ou all");
  process.exit(1);
}

console.log("Import LoteWin / Mais Controle");
console.log("Conferência alvo:", LOTEWIN_CONFERENCE.asOf);
console.log("Modo:", dryRun ? "dry-run (sem escrita)" : "execução");
console.log("");

for (const e of entities) {
  console.log(`→ ${e}: ${describeEntity(e)}`);
  if (!process.env.LEGACY_LW_PATH && e !== "financeiro" && e !== "obras" && e !== "compras") {
    console.log("  skip: LEGACY_LW_PATH não definido");
    continue;
  }
  if (!process.env.DATABASE_URL) {
    console.log("  skip: DATABASE_URL não definido");
    continue;
  }
  console.log(dryRun ? "  dry-run ok" : "  TODO: conectar e upsert por legacy_id");
}

console.log("");
console.log("Painel esperado:", LOTEWIN_CONFERENCE);

/**
 * Matriz de permissões — npx tsx lib/permissions/routines.test.ts
 */
import { can, defaultPermissionsForProfile } from "./routines";

const admin = defaultPermissionsForProfile("administrador");
const corretor = defaultPermissionsForProfile("corretor");
const financeiro = defaultPermissionsForProfile("financeiro");

const checks: Array<[string, boolean]> = [
  ["admin vê auditoria", can(admin, "auditoria", "ver")],
  ["admin remove usuários", can(admin, "usuarios", "remover")],
  ["corretor vê leads", can(corretor, "leads", "ver")],
  ["corretor não vê financeiro", !can(corretor, "financeiro", "ver")],
  ["financeiro altera boletos", can(financeiro, "boletos", "inserirAlterar")],
  ["financeiro não remove auditoria", !can(financeiro, "auditoria", "remover")],
];

let failed = 0;
for (const [label, ok] of checks) {
  if (!ok) {
    console.error("FALHOU:", label);
    failed += 1;
  }
}

if (failed) {
  process.exit(1);
}

console.log("OK permissões A04", checks.length, "casos");

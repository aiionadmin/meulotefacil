/** npx tsx lib/domain/polish-gaps.test.ts */
import { seedCompras } from "./compras-seed";
import { findCotacaoByPublicToken } from "./cotacao-publica";
import {
  PERMISSION_ROUTINES,
  buildDefaultPermissionMatrix,
  can,
} from "./permissoes";
import { seedObras } from "./obras-seed";
import { buildRdoPrintHtml } from "./rdo-pdf";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FALHOU", msg);
    process.exit(1);
  }
}

const compras = seedCompras();
const pub = findCotacaoByPublicToken(compras, "tok-sul");
assert(Boolean(pub), "token tok-sul resolve cotação");
assert(pub!.fornecedor.fornecedor.includes("Sul"), "fornecedor Sul");
assert(
  !findCotacaoByPublicToken(compras, "tok-inexistente"),
  "token inválido"
);

const matrix = buildDefaultPermissionMatrix([
  "administrador",
  "corretor",
  "cliente",
  "engenharia",
  "direcao",
]);
assert(PERMISSION_ROUTINES.length >= 9, "rotinas especiais");
assert(can(matrix, "administrador", "rdo", "ver"), "admin vê RDO");
assert(can(matrix, "engenharia", "aprovar_rdo", "inserir"), "eng aprova RDO");
assert(
  !can(matrix, "corretor", "dashboard_gerencial", "ver"),
  "corretor sem gerencial"
);
assert(
  can(matrix, "corretor", "portal_corretor", "ver"),
  "corretor no portal"
);
assert(
  can(matrix, "cliente", "portal_cliente", "ver"),
  "cliente no portal"
);
assert(
  !can(matrix, "cliente", "rdo", "ver"),
  "cliente sem RDO interno"
);

const obras = seedObras();
assert(
  obras.cronograma.filter((c) => c.obraId === "obr-1").length >= 4,
  "cronograma com etapas para Gantt"
);
const rdo = obras.rdos[0];
const html = buildRdoPrintHtml(rdo, obras.obras[0]);
assert(html.includes("Meu Lote Fácil"), "PDF stub com logo");
assert(html.includes(`RDO nº ${rdo.numero}`), "PDF stub com número");

console.log("OK polish-gaps");

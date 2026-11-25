/** npx tsx lib/domain/kanban-forward.test.ts */
import {
  JORNADA_FORWARD_ORDER,
  REGULARIZACAO_FORWARD_ORDER,
  canMoveForward,
} from "./kanban-forward";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FALHOU", msg);
    process.exit(1);
  }
}

assert(
  canMoveForward(JORNADA_FORWARD_ORDER, "novo_contato", "em_atendimento"),
  "avançar 1→2"
);
assert(
  !canMoveForward(JORNADA_FORWARD_ORDER, "em_atendimento", "novo_contato"),
  "bloquear voltar"
);
assert(
  canMoveForward(JORNADA_FORWARD_ORDER, "em_atendimento", "perdido"),
  "saída perdido"
);
assert(
  canMoveForward(JORNADA_FORWARD_ORDER, "escritura", "novo_contato", {
    force: true,
  }),
  "admin force"
);
assert(
  canMoveForward(REGULARIZACAO_FORWARD_ORDER, "documentos", "prefeitura"),
  "reg avançar"
);
assert(
  !canMoveForward(REGULARIZACAO_FORWARD_ORDER, "cartorio", "documentos"),
  "reg bloquear voltar"
);

console.log("OK kanban-forward");

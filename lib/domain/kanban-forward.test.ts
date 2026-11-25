/** npx tsx lib/domain/kanban-forward.test.ts */
import {
  JORNADA_FORWARD_ORDER,
  REGULARIZACAO_FORWARD_ORDER,
  canMoveForward,
  canMoveOnBoard,
  neighborStep,
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
  "canMoveForward ainda bloqueia voltar"
);
assert(
  canMoveOnBoard(JORNADA_FORWARD_ORDER, "em_atendimento", "novo_contato"),
  "canMoveOnBoard permite voltar"
);
assert(
  canMoveOnBoard(JORNADA_FORWARD_ORDER, "novo_contato", "proposta_reserva"),
  "pular etapas à frente"
);
assert(
  canMoveOnBoard(JORNADA_FORWARD_ORDER, "em_atendimento", "perdido"),
  "saída perdido"
);
assert(
  !canMoveOnBoard(JORNADA_FORWARD_ORDER, "em_atendimento", "em_atendimento"),
  "mesmo status bloqueado"
);
assert(
  canMoveOnBoard(REGULARIZACAO_FORWARD_ORDER, "cartorio", "documentos"),
  "reg voltar"
);
assert(
  neighborStep(JORNADA_FORWARD_ORDER, "em_atendimento", "voltar") ===
    "novo_contato",
  "vizinho voltar"
);
assert(
  neighborStep(JORNADA_FORWARD_ORDER, "em_atendimento", "avancar") ===
    "proposta_reserva",
  "vizinho avançar"
);
assert(
  neighborStep(JORNADA_FORWARD_ORDER, "novo_contato", "voltar") === null,
  "sem voltar na primeira"
);

console.log("OK kanban-forward (avancar+voltar)");

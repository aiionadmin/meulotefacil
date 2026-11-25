/** Regras de avanço unidirecional nos quadros (Parte 1 §2.3). */

export const JORNADA_FORWARD_ORDER = [
  "novo_contato",
  "em_atendimento",
  "proposta_reserva",
  "contrato",
  "carteira_em_dia",
  "cobranca",
  "quitado",
  "escritura",
] as const;

export const REGULARIZACAO_FORWARD_ORDER = [
  "documentos",
  "prefeitura",
  "cartorio",
  "registro",
  "matricula",
  "entregue",
] as const;

export const JORNADA_EXIT_STATES = new Set(["perdido", "retomado", "cancelado", "distrato"]);

export function canMoveForward(
  order: readonly string[],
  from: string,
  to: string,
  opts?: { force?: boolean; allowExit?: boolean }
): boolean {
  if (opts?.force) return true;
  if (from === to) return false;
  if (opts?.allowExit !== false && JORNADA_EXIT_STATES.has(to)) return true;
  const i = order.indexOf(from);
  const j = order.indexOf(to);
  if (i < 0 || j < 0) return false;
  return j > i;
}

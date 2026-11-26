/** J03 — checagem de alçada por tipo e valor. */

export type ApprovalRuleLike = {
  tipo: string;
  perfilNome: string;
  valorMinimo?: number;
  ativo: boolean;
};

export function findApprovalRule(
  rules: ApprovalRuleLike[],
  tipo: string
): ApprovalRuleLike | undefined {
  const t = tipo.trim().toLowerCase();
  return rules.find((r) => r.ativo && r.tipo.trim().toLowerCase() === t);
}

/**
 * Retorna se o perfil pode aprovar o valor informado.
 * Sem regra ativa → permite (fluxo livre).
 * Com valorMinimo: valores abaixo do mínimo passam sem alçada especial;
 * valores >= mínimo exigem que o perfil batam com a regra.
 */
export function canApprove(opts: {
  rules: ApprovalRuleLike[];
  tipo: string;
  valor?: number;
  perfilNome: string;
}): { ok: boolean; reason?: string; rule?: ApprovalRuleLike } {
  const rule = findApprovalRule(opts.rules, opts.tipo);
  if (!rule) return { ok: true };
  const valor = opts.valor ?? 0;
  if (rule.valorMinimo != null && valor < rule.valorMinimo) {
    return { ok: true, rule };
  }
  const perfilOk =
    rule.perfilNome.trim().toLowerCase() ===
      opts.perfilNome.trim().toLowerCase() ||
    opts.perfilNome.trim().toLowerCase() === "administrador";
  if (!perfilOk) {
    return {
      ok: false,
      rule,
      reason: `Requer perfil ${rule.perfilNome}${
        rule.valorMinimo != null ? ` (a partir de ${rule.valorMinimo})` : ""
      }`,
    };
  }
  return { ok: true, rule };
}

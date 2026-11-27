/** J03 — checagem de alçada por tipo, faixa de valor e centro de custo. */

export type CentroAlcada = "obra" | "empresa" | "qualquer";

export type ApprovalRuleLike = {
  tipo: string;
  perfilNome: string;
  valorMinimo?: number;
  valorMaximo?: number;
  centroTipo?: CentroAlcada;
  ativo: boolean;
};

function tipoMatch(ruleTipo: string, tipo: string) {
  return ruleTipo.trim().toLowerCase() === tipo.trim().toLowerCase();
}

function centroMatch(
  ruleCentro: CentroAlcada | undefined,
  centro?: "obra" | "empresa"
) {
  const rc = ruleCentro ?? "qualquer";
  if (rc === "qualquer") return true;
  if (!centro) return true;
  return rc === centro;
}

function faixaMatch(rule: ApprovalRuleLike, valor: number) {
  if (rule.valorMinimo != null && valor < rule.valorMinimo) return false;
  if (rule.valorMaximo != null && valor > rule.valorMaximo) return false;
  return true;
}

/** Todas as regras ativas do tipo (sem filtrar faixa/centro). */
export function findApprovalRule(
  rules: ApprovalRuleLike[],
  tipo: string
): ApprovalRuleLike | undefined {
  return rules.find((r) => r.ativo && tipoMatch(r.tipo, tipo));
}

/** Regras que se aplicam ao valor + centro informados. */
export function matchingApprovalRules(
  rules: ApprovalRuleLike[],
  tipo: string,
  opts?: { valor?: number; centroTipo?: "obra" | "empresa" }
): ApprovalRuleLike[] {
  const valor = opts?.valor ?? 0;
  return rules.filter(
    (r) =>
      r.ativo &&
      tipoMatch(r.tipo, tipo) &&
      centroMatch(r.centroTipo, opts?.centroTipo) &&
      faixaMatch(r, valor)
  );
}

/**
 * Sem regra aplicável → permite.
 * Com regras na faixa/centro → perfil deve bater com alguma delas (ou Administrador).
 */
export function canApprove(opts: {
  rules: ApprovalRuleLike[];
  tipo: string;
  valor?: number;
  perfilNome: string;
  centroTipo?: "obra" | "empresa";
}): { ok: boolean; reason?: string; rule?: ApprovalRuleLike } {
  const matched = matchingApprovalRules(opts.rules, opts.tipo, {
    valor: opts.valor,
    centroTipo: opts.centroTipo,
  });
  if (!matched.length) return { ok: true };

  const perfil = opts.perfilNome.trim().toLowerCase();
  if (perfil === "administrador") {
    return { ok: true, rule: matched[0] };
  }
  const hit = matched.find(
    (r) => r.perfilNome.trim().toLowerCase() === perfil
  );
  if (hit) return { ok: true, rule: hit };

  const desc = matched
    .map((r) => {
      const faixa =
        r.valorMinimo != null || r.valorMaximo != null
          ? ` [${r.valorMinimo ?? 0}–${r.valorMaximo ?? "∞"}]`
          : "";
      const centro =
        r.centroTipo && r.centroTipo !== "qualquer"
          ? ` · ${r.centroTipo}`
          : "";
      return `${r.perfilNome}${faixa}${centro}`;
    })
    .join(" ou ");
  return {
    ok: false,
    rule: matched[0],
    reason: `Requer perfil ${desc}`,
  };
}

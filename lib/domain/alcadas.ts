import type { ApprovalRule } from "./fase1-types";

/** Perfis ordenados do mais privilegiado ao menos (demo). */
const RANK: Record<string, number> = {
  Administrador: 100,
  Direção: 90,
  Financeiro: 70,
  Engenharia: 50,
  Comercial: 40,
  "Portal Corretor": 10,
  Cliente: 5,
};

export function perfilRank(nome: string): number {
  return RANK[nome] ?? 0;
}

/**
 * Pode aprovar se existir regra ativa do tipo e o perfil do usuário
 * cobre o valor mínimo (valor do documento >= mínimo → precisa do perfil da regra ou superior).
 */
export function podeAprovarPorAlcada(
  rules: ApprovalRule[],
  tipo: string,
  valor: number,
  perfilUsuario: string
): { ok: boolean; motivo?: string; regra?: ApprovalRule } {
  const ativos = rules.filter(
    (r) => r.ativo && r.tipo.toLowerCase() === tipo.toLowerCase()
  );
  if (!ativos.length) return { ok: true };

  // Usa a regra com maior valorMinimo que o documento atinge
  const aplicavel = [...ativos]
    .filter((r) => (r.valorMinimo ?? 0) <= valor)
    .sort((a, b) => (b.valorMinimo ?? 0) - (a.valorMinimo ?? 0))[0];

  if (!aplicavel) {
    // Documento abaixo de todos os mínimos → qualquer um aprova
    return { ok: true };
  }

  const need = perfilRank(aplicavel.perfilNome);
  const have = perfilRank(perfilUsuario);
  if (have >= need) return { ok: true, regra: aplicavel };

  return {
    ok: false,
    motivo: `Alçada ${aplicavel.perfilNome} (a partir de ${aplicavel.valorMinimo ?? 0}) — seu perfil: ${perfilUsuario}`,
    regra: aplicavel,
  };
}

export function podeConciliar(
  rules: ApprovalRule[],
  perfilUsuario: string,
  desconciliar = false
): { ok: boolean; motivo?: string } {
  const tipo = desconciliar
    ? "Desconciliação bancária"
    : "Conciliação bancária";
  const regra = rules.find(
    (r) => r.ativo && r.tipo.toLowerCase() === tipo.toLowerCase()
  );
  if (!regra) return { ok: true };
  if (perfilRank(perfilUsuario) >= perfilRank(regra.perfilNome)) {
    return { ok: true };
  }
  return {
    ok: false,
    motivo: `Somente ${regra.perfilNome} pode ${desconciliar ? "desconciliar" : "conciliar"}`,
  };
}

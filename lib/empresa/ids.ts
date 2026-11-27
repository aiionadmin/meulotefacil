import { DEMO_ORG_ID } from "@/lib/persist/store-keys";

/** Empresa principal (Meu Lote Fácil) — id canônico nos seeds/carteira. */
export const EMPRESA_MLF_ID = DEMO_ORG_ID;

/** Segunda empresa emitente (LA). */
export const EMPRESA_LA_ID = "org-demo-2";

/** Alias legado do seed fase1 (`organization.id`). */
export const EMPRESA_MLF_ALIAS = "org-demo";

/** Todos os ids que representam a mesma empresa MLF. */
export const EMPRESA_MLF_IDS = [EMPRESA_MLF_ID, EMPRESA_MLF_ALIAS] as const;

/** Normaliza qualquer id/alias conhecido para o canônico. */
export function canonicalEmpresaId(
  id: string | null | undefined
): string | undefined {
  if (!id) return undefined;
  if (EMPRESA_MLF_IDS.includes(id as (typeof EMPRESA_MLF_IDS)[number])) {
    return EMPRESA_MLF_ID;
  }
  return id;
}

/** Ids equivalentes ao selecionado (para comparar seeds mistos). */
export function empresaIdSet(selectedId: string | "todas"): Set<string> | null {
  if (selectedId === "todas") return null;
  const canon = canonicalEmpresaId(selectedId) ?? selectedId;
  if (canon === EMPRESA_MLF_ID) {
    return new Set(EMPRESA_MLF_IDS);
  }
  return new Set([canon, selectedId]);
}

/**
 * Infere empresa pelo nome do empreendimento quando o snapshot antigo
 * não trouxe `empresaId` (multiempresa quebrava e tudo caía na MLF).
 */
export function inferEmpresaIdFromEmpNome(
  nome?: string | null
): string | undefined {
  if (!nome?.trim()) return undefined;
  const n = nome.trim().toLowerCase();
  if (n.includes("jardins do sol") || n === "jds") return EMPRESA_LA_ID;
  if (n.includes("horizonte") || n === "hor") return EMPRESA_MLF_ID;
  return undefined;
}

/**
 * Atribui empresa a um registro.
 * Sem `empresaId`, tenta organizationId / nome do emp; senão assume MLF
 * (evita “vazar” linhas sem tag para todas as empresas).
 */
export function resolveRowEmpresaId(
  empresaId?: string | null,
  organizationId?: string | null,
  empNome?: string | null
): string {
  return (
    canonicalEmpresaId(empresaId ?? undefined) ??
    canonicalEmpresaId(organizationId ?? undefined) ??
    inferEmpresaIdFromEmpNome(empNome) ??
    EMPRESA_MLF_ID
  );
}

export function rowBelongsToEmpresa(
  selectedId: string | "todas",
  empresaId?: string | null,
  organizationId?: string | null,
  empNome?: string | null
): boolean {
  const allowed = empresaIdSet(selectedId);
  if (!allowed) return true;
  return allowed.has(resolveRowEmpresaId(empresaId, organizationId, empNome));
}

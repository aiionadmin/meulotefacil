/** Centro de custo transversal (Obra | Empresa) — prompt réplica §2. */

export type CentroCustoKind = "obra" | "empresa";

export type CentroCusto = {
  kind: CentroCustoKind;
  /** Presente quando kind = obra */
  obraId?: string;
  obraNome?: string;
  label: string;
};

export const CENTRO_CUSTO_EMPRESA: CentroCusto = {
  kind: "empresa",
  label: "Empresa",
};

export function centroCustoObra(
  obraId: string,
  obraNome: string
): CentroCusto {
  return {
    kind: "obra",
    obraId,
    obraNome,
    label: obraNome || obraId,
  };
}

export function parseCentroCusto(
  value: string | null | undefined
): CentroCusto | null {
  if (!value) return null;
  if (value === "empresa" || value === "Empresa") return CENTRO_CUSTO_EMPRESA;
  if (value.startsWith("obra:")) {
    const obraId = value.slice(5);
    return { kind: "obra", obraId, label: obraId };
  }
  return { kind: "obra", obraId: value, label: value };
}

export function centroCustoKey(c: CentroCusto): string {
  return c.kind === "empresa" ? "empresa" : `obra:${c.obraId ?? ""}`;
}

export function formatCentroCusto(c: CentroCusto | null | undefined): string {
  if (!c) return "—";
  return c.label;
}

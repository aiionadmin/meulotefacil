/** Matriz de permissões (Ver / Inserir·Alterar / Remover) — demo Parte 5+. */

export type PermKey = "ver" | "inserir" | "remover";

export type PermissionRoutine = {
  codigo: string;
  nome: string;
  externo?: boolean;
  /** Rotina especial pedida no prompt (além das telas). */
  especial?: boolean;
};

export type ProfilePermRow = Record<PermKey, boolean>;

export type PermissionMatrix = Record<
  string,
  Record<string, ProfilePermRow>
>;

/** Rotinas novas + portais externos (prompt §6.5). */
export const PERMISSION_ROUTINES: PermissionRoutine[] = [
  { codigo: "rdo", nome: "RDO", especial: true },
  { codigo: "aprovar_rdo", nome: "Aprovar RDO", especial: true },
  { codigo: "demandas", nome: "Demandas", especial: true },
  {
    codigo: "dashboard_gerencial",
    nome: "Dashboard gerencial",
    especial: true,
  },
  { codigo: "importacao_lote", nome: "Importação em lote", especial: true },
  { codigo: "edicao_lote", nome: "Edição em lote", especial: true },
  {
    codigo: "corrigir_avanco_card",
    nome: "Corrigir avanço de card",
    especial: true,
  },
  {
    codigo: "portal_corretor",
    nome: "Portal Corretor",
    externo: true,
    especial: true,
  },
  {
    codigo: "portal_cliente",
    nome: "Portal Cliente",
    externo: true,
    especial: true,
  },
];

const full: ProfilePermRow = { ver: true, inserir: true, remover: true };
const read: ProfilePermRow = { ver: true, inserir: false, remover: false };
const none: ProfilePermRow = { ver: false, inserir: false, remover: false };
const writeNoDel: ProfilePermRow = { ver: true, inserir: true, remover: false };

function rowFor(
  profileCodigo: string,
  routine: PermissionRoutine
): ProfilePermRow {
  if (routine.externo) {
    if (routine.codigo === "portal_corretor") {
      return profileCodigo === "corretor" || profileCodigo === "administrador"
        ? full
        : none;
    }
    if (routine.codigo === "portal_cliente") {
      return profileCodigo === "cliente" || profileCodigo === "administrador"
        ? full
        : none;
    }
  }

  if (profileCodigo === "administrador") return full;
  if (profileCodigo === "cliente") return none;
  if (profileCodigo === "corretor") {
    if (routine.codigo === "demandas") return writeNoDel;
    return none;
  }

  switch (routine.codigo) {
    case "rdo":
      if (["engenharia", "obras", "direcao"].includes(profileCodigo))
        return writeNoDel;
      return read;
    case "aprovar_rdo":
      if (["engenharia", "direcao", "financeiro"].includes(profileCodigo))
        return writeNoDel;
      return none;
    case "demandas":
      if (
        ["atendimento", "comercial", "obras", "direcao", "regularizacao"].includes(
          profileCodigo
        )
      )
        return writeNoDel;
      return read;
    case "dashboard_gerencial":
      if (["direcao", "financeiro"].includes(profileCodigo)) return read;
      return none;
    case "importacao_lote":
    case "edicao_lote":
      if (["administrador", "comercial", "atendimento"].includes(profileCodigo))
        return writeNoDel;
      return none;
    case "corrigir_avanco_card":
      if (["administrador", "direcao", "atendimento"].includes(profileCodigo))
        return writeNoDel;
      return none;
    default:
      return none;
  }
}

/** Matriz padrão para os códigos de perfil da demo. */
export function buildDefaultPermissionMatrix(
  profileCodigos: string[]
): PermissionMatrix {
  const matrix: PermissionMatrix = {};
  for (const codigo of profileCodigos) {
    matrix[codigo] = {};
    for (const routine of PERMISSION_ROUTINES) {
      matrix[codigo][routine.codigo] = rowFor(codigo, routine);
    }
  }
  return matrix;
}

export function can(
  matrix: PermissionMatrix,
  profileCodigo: string,
  routineCodigo: string,
  key: PermKey
): boolean {
  return Boolean(matrix[profileCodigo]?.[routineCodigo]?.[key]);
}

/** Rotinas da matriz de permissões (A04). */

export const PERMISSION_ROUTINES = [
  { id: "dashboard", label: "Painel" },
  { id: "cadastros.pessoas", label: "Cadastros > Pessoas" },
  { id: "cadastros.listas", label: "Cadastros > Listas" },
  { id: "empreendimentos", label: "Empreendimentos e lotes" },
  { id: "carteira", label: "Carteira e contratos" },
  { id: "boletos", label: "Boletos" },
  { id: "vendas", label: "Vendas e propostas" },
  { id: "leads", label: "Leads / Jornada" },
  { id: "cobranca", label: "Cobrança" },
  { id: "juridico", label: "Jurídico" },
  { id: "financeiro", label: "Financeiro" },
  { id: "compras", label: "Compras" },
  { id: "obras", label: "Obras e RDO" },
  { id: "fiscal", label: "Fiscal" },
  { id: "relatorios", label: "Relatórios" },
  { id: "tarefas", label: "Tarefas" },
  { id: "arquivos", label: "Arquivos" },
  { id: "configuracoes", label: "Configurações" },
  { id: "auditoria", label: "Auditoria" },
  { id: "usuarios", label: "Usuários e perfis" },
] as const;

export type PermissionRoutineId = (typeof PERMISSION_ROUTINES)[number]["id"];

export type PermissionFlags = {
  ver: boolean;
  inserirAlterar: boolean;
  remover: boolean;
};

export type ProfilePermissionRow = PermissionFlags & {
  rotina: PermissionRoutineId | string;
};

/** Matriz padrão por código de perfil (espelha seed SQL). */
export function defaultPermissionsForProfile(
  codigo: string
): ProfilePermissionRow[] {
  const all = PERMISSION_ROUTINES.map((r) => r.id);
  const full = (ids: string[]): ProfilePermissionRow[] =>
    all.map((rotina) => ({
      rotina,
      ver: ids.includes(rotina),
      inserirAlterar: ids.includes(rotina),
      remover: ids.includes(rotina) && codigo === "administrador",
    }));

  switch (codigo) {
    case "administrador":
      return all.map((rotina) => ({
        rotina,
        ver: true,
        inserirAlterar: true,
        remover: true,
      }));
    case "direcao":
      return all.map((rotina) => ({
        rotina,
        ver: true,
        inserirAlterar: ["auditoria", "relatorios", "dashboard"].includes(
          rotina
        ),
        remover: false,
      }));
    case "financeiro":
      return full([
        "dashboard",
        "financeiro",
        "boletos",
        "carteira",
        "fiscal",
        "relatorios",
        "cadastros.pessoas",
      ]);
    case "engenharia":
    case "obras":
      return full(["dashboard", "obras", "compras", "tarefas", "arquivos"]);
    case "suprimentos":
      return full([
        "dashboard",
        "compras",
        "cadastros.pessoas",
        "tarefas",
        "arquivos",
      ]);
    case "comercial":
      return full([
        "dashboard",
        "leads",
        "vendas",
        "empreendimentos",
        "carteira",
        "cadastros.pessoas",
        "tarefas",
      ]);
    case "corretor":
      return full(["dashboard", "leads", "vendas", "empreendimentos"]);
    case "atendimento":
      return full([
        "dashboard",
        "cadastros.pessoas",
        "carteira",
        "boletos",
        "tarefas",
      ]);
    case "cobranca":
      return full([
        "dashboard",
        "cobranca",
        "carteira",
        "boletos",
        "cadastros.pessoas",
        "relatorios",
      ]);
    case "juridico":
      return full([
        "dashboard",
        "juridico",
        "cobranca",
        "carteira",
        "arquivos",
        "relatorios",
      ]);
    case "regularizacao":
      return full([
        "dashboard",
        "empreendimentos",
        "arquivos",
        "cadastros.pessoas",
        "tarefas",
        "relatorios",
      ]);
    default:
      return all.map((rotina) => ({
        rotina,
        ver: rotina === "dashboard",
        inserirAlterar: false,
        remover: false,
      }));
  }
}

export function can(
  rows: ProfilePermissionRow[] | undefined,
  rotina: string,
  acao: keyof PermissionFlags
): boolean {
  if (!rows?.length) return false;
  const row = rows.find((r) => r.rotina === rotina);
  if (!row) return false;
  return Boolean(row[acao]);
}

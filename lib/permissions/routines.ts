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
  { id: "financeiro.pagamentos", label: "Financeiro > Pagamentos" },
  { id: "financeiro.recebimentos", label: "Financeiro > Recebimentos" },
  { id: "financeiro.pre", label: "Financeiro > Pré-lançamentos" },
  { id: "financeiro.pre.todos", label: "Financeiro > Gerenciar todos Pré-lançamentos" },
  { id: "financeiro.notas", label: "Financeiro > Notas Fiscais" },
  { id: "financeiro.cobranca_facil", label: "Financeiro > Cobrança Fácil" },
  { id: "financeiro.contas", label: "Financeiro > Contas Bancárias" },
  { id: "financeiro.transferencias", label: "Financeiro > Transferências" },
  { id: "financeiro.fluxo", label: "Financeiro > Fluxo de Caixa" },
  { id: "financeiro.resultados", label: "Financeiro > Resultados" },
  { id: "compras", label: "Compras" },
  { id: "compras.sc.propria", label: "Compras > Solicitação Própria" },
  { id: "compras.sc.terceiros", label: "Compras > Solicitação de Terceiros" },
  { id: "compras.sc.atender", label: "Compras > Atender Solicitação" },
  { id: "compras.cotacao", label: "Compras > Cotação" },
  { id: "compras.oc", label: "Compras > Ordem de Compra" },
  { id: "compras.alcada", label: "Compras > Configurar Alçada" },
  { id: "obras", label: "Obras e RDO" },
  { id: "obras.cadastro", label: "Obras > Cadastro de Obras" },
  { id: "obras.visibilidade", label: "Obras > Gerenciar Visibilidade" },
  { id: "obras.orcamento.custo", label: "Obras > Orçamento de Custo" },
  { id: "obras.orcamento.venda", label: "Obras > Orçamento de Venda" },
  { id: "obras.gestao", label: "Obras > Gestão" },
  { id: "obras.medicao.obras", label: "Obras > Medição de Obras" },
  { id: "obras.medicao.contratos", label: "Obras > Medição de Contratos" },
  { id: "obras.rdo", label: "Obras > RDO" },
  { id: "obras.rdo.aprovar", label: "Obras > Aprovar RDO" },
  { id: "catalogo.insumos", label: "Catálogo > Insumos" },
  { id: "catalogo.composicoes", label: "Catálogo > Composições" },
  { id: "centro_custo.empresa", label: "Visualizar Centro de Custo Empresa" },
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
  const matches = (rotina: string, ids: string[]) =>
    ids.some((id) => rotina === id || rotina.startsWith(`${id}.`));
  const full = (ids: string[]): ProfilePermissionRow[] =>
    all.map((rotina) => ({
      rotina,
      ver: matches(rotina, ids),
      inserirAlterar: matches(rotina, ids),
      remover: matches(rotina, ids) && codigo === "administrador",
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
      // Cadastro liberado em todos os menus (ver + inserir/alterar; sem remover).
      return all.map((rotina) => ({
        rotina,
        ver: true,
        inserirAlterar: true,
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
      return full([
        "dashboard",
        "obras",
        "catalogo",
        "compras",
        "tarefas",
        "arquivos",
      ]);
    case "suprimentos":
      return full([
        "dashboard",
        "compras",
        "catalogo",
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

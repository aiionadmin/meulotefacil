/** Navegação — réplica Mais Controle (Obras/Compras/Financeiro) + demais módulos. */

import { isDemoToolsAllowed } from "@/lib/runtime/demo-mode";

export type AppNavItem = {
  href: string;
  label: string;
  description?: string;
  stub?: boolean;
  demoOnly?: boolean;
};

export type AppNavGroup = {
  id: string;
  label: string;
  items: AppNavItem[];
};

export const APP_NAV: AppNavGroup[] = [
  {
    id: "inicio",
    label: "1. Início",
    items: [
      { href: "/dashboard", label: "Painel", description: "Visão geral" },
      {
        href: "/dashboard/operacional",
        label: "Números gerais",
        description: "Painel operacional clicável",
      },
      {
        href: "/dashboard/gerencial",
        label: "Gerencial",
        description: "Painel da direção",
      },
      { href: "/demandas", label: "Demandas", description: "Tipos, kanban e prazos" },
      {
        href: "/portal/corretor",
        label: "Portal do corretor",
        description: "Leads, reservas e comissões",
      },
      {
        href: "/portal/cliente",
        label: "Portal do cliente",
        description: "Contratos, boletos e demandas",
      },
    ],
  },
  {
    id: "quadros",
    label: "2. Quadros",
    items: [
      {
        href: "/quadros/jornada",
        label: "Jornada do cliente",
        description: "Kanban com regra de arraste",
      },
      { href: "/quadros/cobranca", label: "Cobrança", description: "Faixas de atraso" },
      {
        href: "/quadros/regularizacao",
        label: "Regularização e escritura",
        description: "Processo por lote",
      },
      { href: "/quadros/compras", label: "Compras", description: "SC por status" },
      { href: "/quadros/obras", label: "Obras", description: "Status da obra" },
      { href: "/quadros/tarefas", label: "Tarefas", description: "Quadro de tarefas" },
    ],
  },
  {
    id: "comercial",
    label: "3. Comercial",
    items: [
      { href: "/leads", label: "Leads", description: "Origem e funil" },
      {
        href: "/vendas",
        label: "Propostas e reservas",
        description: "Converter em contrato",
      },
      { href: "/vendas/nova", label: "Nova venda", description: "Wizard LoteWin multi-lote" },
      {
        href: "/veiculos-comunicacao",
        label: "Veículos de comunicação",
        description: "Origem da venda",
      },
      {
        href: "/documentos-contrato",
        label: "Documentos do contrato",
        description: "Contrato, promissórias, mala direta",
      },
      {
        href: "/despesas-empreendimento",
        label: "Despesas do empreendimento",
        description: "Custos por empreendimento",
      },
      {
        href: "/cadastros/pre-cadastro",
        label: "Pré-cadastro",
        description: "Origem da venda",
      },
      {
        href: "/contratos",
        label: "Contratos",
        description: "Venda, saldo e operações",
      },
    ],
  },
  {
    id: "empreendimentos",
    label: "4. Empreendimentos",
    items: [
      {
        href: "/empreendimentos",
        label: "Empreendimentos e lotes",
        description: "Cadastro completo, status e estoque",
      },
      {
        href: "/empreendimentos/planta",
        label: "Planta do loteamento",
        description: "Lotes clicáveis por status",
      },
      {
        href: "/empreendimentos/dxf-wizard",
        label: "Wizard DXF → lotes",
        description: "Importar DXF e gerar cadastro de lotes",
      },
      {
        href: "/empreendimentos/hub",
        label: "Visão do empreendimento",
        description: "Abas resumo à arquivos",
      },
      {
        href: "/planos-pagamento",
        label: "Planos de pagamento",
        description: "Entradas, prestações e moedas",
      },
      {
        href: "/comissoes",
        label: "Comissões",
        description: "Previsto, liberado e pago",
      },
      {
        href: "/cartorios",
        label: "Cartórios e escrituras",
        description: "RI e protocolos",
      },
    ],
  },
  {
    id: "contratos",
    label: "5. Contratos e ficha",
    items: [
      {
        href: "/carteira",
        label: "Ficha financeira",
        description: "Parcelas, encargos e caixa",
      },
      { href: "/indices", label: "Índices", description: "Cotações por competência" },
      {
        href: "/reajustes",
        label: "Reajustes",
        description: "Correção anual e resíduos",
      },
    ],
  },
  {
    id: "recebimentos",
    label: "6. Recebimentos",
    items: [
      {
        href: "/boletos",
        label: "Boletos, remessa e retorno",
        description: "Emissão CNAB",
      },
      { href: "/caixa", label: "Caixa", description: "Recebimento e recibo" },
    ],
  },
  {
    id: "cobranca",
    label: "7. Cobrança e jurídico",
    items: [
      {
        href: "/cobranca",
        label: "Inadimplentes e acordos",
        description: "Régua e contatos",
      },
      {
        href: "/juridico",
        label: "Processos judiciais",
        description: "Ações e prazos",
      },
    ],
  },
  {
    id: "regularizacao",
    label: "8. Regularização",
    items: [
      {
        href: "/processos",
        label: "Processos REURB",
        description: "Acompanhamento",
      },
      { href: "/nucleos", label: "Núcleos", description: "Portfólio operacional" },
      {
        href: "/documentos",
        label: "Documentos",
        description: "Checklist do morador",
      },
      {
        href: "/protocolo",
        label: "Protocolo",
        description: "Consulta por número",
      },
    ],
  },
  {
    id: "obras",
    label: "9. Obras",
    items: [
      {
        href: "/obras",
        label: "Minhas Obras",
        description: "Cadastro independente",
      },
      {
        href: "/orcamentos",
        label: "Orçamento",
        description: "Lista de Orçamentos e Funil de Vendas",
      },
      {
        href: "/medicoes/obras",
        label: "Medição de Obras",
        description: "Medição para o cliente",
      },
      {
        href: "/medicoes/contratos",
        label: "Medição de Contratos",
        description: "Medição de empreiteiros",
      },
      {
        href: "/gestao",
        label: "Gestão",
        description: "Orçado x realizado e Curva S",
      },
      {
        href: "/rdo",
        label: "RDO",
        description: "Relatório Diário de Obras",
      },
    ],
  },
  {
    id: "catalogo",
    label: "10. Catálogo",
    items: [
      {
        href: "/catalogo/insumos",
        label: "Insumos",
        description: "Catálogo de insumos",
      },
      {
        href: "/catalogo/composicoes",
        label: "Composições",
        description: "Insumos com coeficiente e BDI",
      },
    ],
  },
  {
    id: "compras",
    label: "11. Compras",
    items: [
      {
        href: "/compras/solicitacoes",
        label: "Solicitação",
        description: "SC com centro de custo",
      },
      {
        href: "/compras/cotacoes",
        label: "Cotação",
        description: "Mapa e fornecedores",
      },
      {
        href: "/compras/ordens",
        label: "Ordem de Compra",
        description: "OC a partir da cotação",
      },
    ],
  },
  {
    id: "financeiro",
    label: "12. Financeiro",
    items: [
      {
        href: "/financeiro/pagamentos",
        label: "Pagamentos",
        description: "Lançamentos e pagamentos",
      },
      {
        href: "/financeiro/recebimentos",
        label: "Recebimentos",
        description: "Faturamentos e recebimentos",
      },
      {
        href: "/financeiro/pre-lancamentos",
        label: "Pré-lançamentos",
        description: "Aprovação prévia",
      },
      {
        href: "/financeiro/notas-fiscais",
        label: "Notas Fiscais",
        description: "XML/PDF e CNPJs",
      },
      {
        href: "/financeiro/cobranca-facil",
        label: "Cobrança Fácil",
        description: "Boletos por conta bancária",
      },
      {
        href: "/financeiro/contas",
        label: "Contas Bancárias",
        description: "Saldos, extrato e transferências",
      },
      {
        href: "/financeiro/transferencias",
        label: "Transferências",
        description: "Entre contas",
      },
      {
        href: "/financeiro/fluxo-de-caixa",
        label: "Fluxo de Caixa",
        description: "Matriz por plano",
      },
      {
        href: "/financeiro/resultados",
        label: "Resultados",
        description: "Demonstrativo mensal",
      },
      {
        href: "/financeiro/plano-contas",
        label: "Plano de contas",
        description: "Plano, categorias e naturezas",
      },
    ],
  },
  {
    id: "fiscal",
    label: "13. Fiscal",
    items: [
      {
        href: "/fiscal",
        label: "NFe / NFSe / exportações",
        description: "Notas e obrigações",
      },
    ],
  },
  {
    id: "cadastros",
    label: "14. Cadastros",
    items: [
      {
        href: "/cadastros/pessoas",
        label: "Pessoas",
        description: "Cadastro único com papéis",
      },
      { href: "/cadastros/clientes", label: "Clientes", description: "Visão filtrada" },
      {
        href: "/cadastros/fornecedores",
        label: "Fornecedores",
        description: "Visão filtrada",
      },
      {
        href: "/cadastros/profissionais",
        label: "Profissionais",
        description: "Visão filtrada",
      },
      {
        href: "/cadastros/corretores",
        label: "Corretores",
        description: "Visão filtrada",
      },
    ],
  },
  {
    id: "relatorios",
    label: "15. Relatórios e arquivos",
    items: [
      {
        href: "/relatorios",
        label: "Central de relatórios",
        description: "Favoritos e execução",
      },
      {
        href: "/arquivos",
        label: "Arquivos",
        description: "Repositório com tags",
      },
    ],
  },
  {
    id: "configuracoes",
    label: "16. Configurações",
    items: [
      { href: "/configuracoes/empresa", label: "Empresa" },
      { href: "/configuracoes/usuarios", label: "Usuários" },
      { href: "/configuracoes/perfis", label: "Perfis de acesso" },
      { href: "/configuracoes/alcadas", label: "Alçadas" },
      { href: "/configuracoes/listas", label: "Listas de apoio" },
      { href: "/configuracoes/indices", label: "Índices e regras" },
      { href: "/configuracoes/auditoria", label: "Auditoria" },
      {
        href: "/configuracoes",
        label: "Parâmetros",
        description: "Índice, reserva, encargos, vendas…",
      },
    ],
  },
];

export function getAppNav(): AppNavGroup[] {
  const allowDemo = isDemoToolsAllowed();
  return APP_NAV.map((g) => ({
    ...g,
    items: g.items.filter((i) => allowDemo || !i.demoOnly),
  })).filter((g) => g.items.length > 0);
}

export const APP_FLAT_NAV = getAppNav().flatMap((g) =>
  g.items.map((item) => ({ ...item, group: g.label }))
);

/** Botão Novo global — abre o formulário via `?novo=1` (J05 / réplica). */
export type NovoAtalho = {
  href: string;
  label: string;
  /** Rotina da matriz A04 usada para liberar o atalho. */
  rotina: string;
};

export const NOVO_ATALHOS: readonly NovoAtalho[] = [
  {
    href: "/financeiro/pagamentos?novo=1",
    label: "Lançamento",
    rotina: "financeiro.pagamentos",
  },
  {
    href: "/financeiro/recebimentos?novo=1",
    label: "Faturamento",
    rotina: "financeiro.recebimentos",
  },
  {
    href: "/financeiro/transferencias?novo=1",
    label: "Transferência",
    rotina: "financeiro.transferencias",
  },
  {
    href: "/financeiro/pre-lancamentos?novo=1",
    label: "Pré-lançamento",
    rotina: "financeiro.pre",
  },
  {
    href: "/financeiro/contas?novo=1",
    label: "Conta bancária",
    rotina: "financeiro.contas",
  },
  {
    href: "/compras/solicitacoes?novo=1",
    label: "Solicitação",
    rotina: "compras.sc.propria",
  },
  {
    href: "/compras/cotacoes?novo=1",
    label: "Cotação",
    rotina: "compras.cotacao",
  },
  {
    href: "/compras/ordens?novo=1",
    label: "Ordem de compra",
    rotina: "compras.oc",
  },
  { href: "/leads?novo=1", label: "Lead", rotina: "leads" },
  { href: "/vendas?novo=1", label: "Proposta", rotina: "vendas" },
  {
    href: "/cadastros/pessoas?novo=1",
    label: "Pessoa",
    rotina: "cadastros.pessoas",
  },
  {
    href: "/cadastros/pre-cadastro?novo=1",
    label: "Pré-cadastro",
    rotina: "cadastros.pessoas",
  },
  { href: "/contratos?novo=1", label: "Venda / contrato", rotina: "carteira" },
  { href: "/tarefas?novo=1", label: "Tarefa", rotina: "tarefas" },
  { href: "/demandas?novo=1", label: "Demanda", rotina: "tarefas" },
  { href: "/boletos?novo=1", label: "Boleto", rotina: "boletos" },
  { href: "/obras?novo=1", label: "Obra", rotina: "obras.cadastro" },
  { href: "/rdo?novo=1", label: "RDO", rotina: "obras.rdo" },
  {
    href: "/empreendimentos?novo=1",
    label: "Empreendimento",
    rotina: "empreendimentos",
  },
  {
    href: "/catalogo/insumos?novo=1",
    label: "Insumo",
    rotina: "catalogo.insumos",
  },
  {
    href: "/catalogo/composicoes?novo=1",
    label: "Composição",
    rotina: "catalogo.composicoes",
  },
  {
    href: "/cartorios?novo=1",
    label: "Cartório",
    rotina: "empreendimentos",
  },
  {
    href: "/planos-pagamento?novo=1",
    label: "Plano de pagamento",
    rotina: "empreendimentos",
  },
  {
    href: "/veiculos-comunicacao?novo=1",
    label: "Veículo de comunicação",
    rotina: "vendas",
  },
  {
    href: "/configuracoes/listas?novo=1",
    label: "Item de lista",
    rotina: "cadastros.listas",
  },
] as const;

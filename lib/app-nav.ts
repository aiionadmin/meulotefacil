/** Navegação do sistema unificado (Mais Controle + LoteWin + REURB). */

export type AppNavItem = {
  href: string;
  label: string;
  description?: string;
};

export type AppNavGroup = {
  id: string;
  label: string;
  items: AppNavItem[];
};

export const APP_NAV: AppNavGroup[] = [
  {
    id: "inicio",
    label: "Início",
    items: [
      {
        href: "/dashboard",
        label: "Painel",
        description: "Carteira, obras, financeiro e notificações",
      },
    ],
  },
  {
    id: "cadastros",
    label: "Cadastros",
    items: [
      {
        href: "/pessoas",
        label: "Pessoas",
        description: "Clientes, compradores, fornecedores, corretores",
      },
      {
        href: "/usuarios",
        label: "Usuários e auditoria",
        description: "Perfis, alçadas, histórico de alterações",
      },
      {
        href: "/empreendimentos",
        label: "Empreendimentos e lotes",
        description: "Quadras, status, planta e tabela de preços",
      },
    ],
  },
  {
    id: "comercial",
    label: "Comercial e carteira",
    items: [
      {
        href: "/vendas",
        label: "Vendas e contratos",
        description: "Assistente de venda, planos e comissões",
      },
      {
        href: "/carteira",
        label: "Carteira e caixa",
        description: "Parcelas, recebimento, encargos",
      },
      {
        href: "/boletos",
        label: "Boletos e remessa",
        description: "CNAB, carnê, baixa e retorno",
      },
      {
        href: "/reajustes",
        label: "Reajuste e operações",
        description: "Índices, transferência, renegociação, retomada",
      },
    ],
  },
  {
    id: "obras",
    label: "Obras e compras",
    items: [
      {
        href: "/obras",
        label: "Obras e orçamento",
        description: "Insumos, Gantt, orçado x realizado",
      },
      {
        href: "/compras",
        label: "Compras",
        description: "Solicitação, cotação e ordem de compra",
      },
    ],
  },
  {
    id: "financeiro",
    label: "Financeiro e fiscal",
    items: [
      {
        href: "/financeiro",
        label: "Financeiro",
        description: "Pagar, receber, contas, fluxo e DRE",
      },
      {
        href: "/fiscal",
        label: "Fiscal e contábil",
        description: "NFe, NFSe, DIMOB, exportação",
      },
    ],
  },
  {
    id: "reurb",
    label: "Regularização",
    items: [
      {
        href: "/processos",
        label: "Processos REURB",
        description: "Etapas, documentos e prazos",
      },
      {
        href: "/nucleos",
        label: "Núcleos",
        description: "Portfólio operacional de núcleos",
      },
      {
        href: "/documentos",
        label: "Documentos do morador",
        description: "Checklist por processo",
      },
      {
        href: "/protocolo",
        label: "Consulta de protocolo",
        description: "Acompanhamento por número",
      },
    ],
  },
  {
    id: "gestao",
    label: "Gestão",
    items: [
      {
        href: "/relatorios",
        label: "Relatórios",
        description: "Central de relatórios e favoritos",
      },
      {
        href: "/tarefas",
        label: "Tarefas e agenda",
        description: "Kanban, recados e comunicação",
      },
      {
        href: "/arquivos",
        label: "Arquivos",
        description: "Repositório central com tags",
      },
      {
        href: "/configuracoes",
        label: "Configurações",
        description: "Empresa, encargos, boletos, compras, obras",
      },
    ],
  },
];

export const APP_FLAT_NAV = APP_NAV.flatMap((g) =>
  g.items.map((item) => ({ ...item, group: g.label }))
);

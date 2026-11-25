/** Navegação — 15 menus (docs/especificacao.md §2). B07/B13 limpos. */

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
      { href: "/dashboard", label: "Painel", description: "Carteira, obras, funil e alertas" },
      { href: "/notificacoes", label: "Notificações", description: "Não lidas e histórico" },
      { href: "/tarefas", label: "Minhas tarefas", description: "Tarefas do usuário" },
    ],
  },
  {
    id: "quadros",
    label: "2. Quadros",
    items: [
      { href: "/quadros/jornada", label: "Jornada do cliente", description: "Kanban com regra de arraste" },
      { href: "/quadros/cobranca", label: "Cobrança", description: "Faixas de atraso" },
      { href: "/quadros/regularizacao", label: "Regularização e escritura", description: "Processo por lote" },
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
      { href: "/vendas", label: "Propostas e reservas", description: "Converter em contrato" },
      { href: "/contratos", label: "Contratos", description: "Venda, saldo e operações" },
    ],
  },
  {
    id: "empreendimentos",
    label: "4. Empreendimentos",
    items: [
      { href: "/empreendimentos", label: "Empreendimentos e lotes", description: "Estoque, status, geração em massa" },
      { href: "/empreendimentos/planta", label: "Planta do loteamento", description: "Lotes clicáveis por status" },
    ],
  },
  {
    id: "contratos",
    label: "5. Contratos e ficha",
    items: [
      { href: "/carteira", label: "Ficha financeira", description: "Parcelas, encargos e caixa" },
      { href: "/reajustes", label: "Reajuste e operações", description: "Índice anual e operações" },
    ],
  },
  {
    id: "recebimentos",
    label: "6. Recebimentos",
    items: [
      { href: "/boletos", label: "Boletos, remessa e retorno", description: "Emissão CNAB" },
    ],
  },
  {
    id: "cobranca",
    label: "7. Cobrança e jurídico",
    items: [
      { href: "/cobranca", label: "Inadimplentes e acordos", description: "Régua e contatos" },
      { href: "/juridico", label: "Processos judiciais", description: "Ações e prazos" },
    ],
  },
  {
    id: "regularizacao",
    label: "8. Regularização",
    items: [
      { href: "/processos", label: "Processos REURB", description: "Acompanhamento" },
      { href: "/nucleos", label: "Núcleos", description: "Portfólio operacional" },
      { href: "/documentos", label: "Documentos", description: "Checklist do morador" },
      { href: "/protocolo", label: "Protocolo", description: "Consulta por número" },
    ],
  },
  {
    id: "obras",
    label: "9. Obras",
    items: [
      { href: "/obras", label: "Obras e orçamento", description: "Gestão de custos e árvore" },
    ],
  },
  {
    id: "compras",
    label: "10. Compras",
    items: [
      { href: "/compras", label: "Solicitações e OC", description: "Fluxo SC → cotação → OC" },
    ],
  },
  {
    id: "financeiro",
    label: "11. Financeiro",
    items: [
      { href: "/financeiro", label: "Pagar, receber e contas", description: "Lançamentos e contas" },
      { href: "/importacao", label: "Importação / conferência", description: "LoteWin / Mais Controle" },
    ],
  },
  {
    id: "fiscal",
    label: "12. Fiscal",
    items: [
      { href: "/fiscal", label: "NFe / NFSe / exportações", description: "Notas e obrigações" },
    ],
  },
  {
    id: "cadastros",
    label: "13. Cadastros",
    items: [
      { href: "/cadastros/pessoas", label: "Pessoas", description: "Cadastro único com papéis" },
      { href: "/cadastros/clientes", label: "Clientes", description: "Visão filtrada" },
      { href: "/cadastros/fornecedores", label: "Fornecedores", description: "Visão filtrada" },
      { href: "/cadastros/profissionais", label: "Profissionais", description: "Visão filtrada" },
      { href: "/cadastros/corretores", label: "Corretores", description: "Visão filtrada" },
    ],
  },
  {
    id: "relatorios",
    label: "14. Relatórios e arquivos",
    items: [
      { href: "/relatorios", label: "Central de relatórios", description: "Favoritos e execução" },
      { href: "/arquivos", label: "Arquivos", description: "Repositório com tags" },
    ],
  },
  {
    id: "configuracoes",
    label: "15. Configurações",
    items: [
      { href: "/configuracoes/empresa", label: "Empresa" },
      { href: "/configuracoes/usuarios", label: "Usuários" },
      { href: "/configuracoes/perfis", label: "Perfis de acesso" },
      { href: "/configuracoes/alcadas", label: "Alçadas" },
      { href: "/configuracoes/listas", label: "Listas de apoio" },
      { href: "/configuracoes/auditoria", label: "Auditoria" },
      {
        href: "/configuracoes",
        label: "Parâmetros",
        description: "Tela legada de toggles — substituída no Bloco J",
        demoOnly: true,
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

export const NOVO_ATALHOS = [
  { href: "/leads", label: "Lead" },
  { href: "/vendas", label: "Proposta" },
  { href: "/cadastros/pessoas?novo=1", label: "Pessoa" },
  { href: "/contratos", label: "Venda / contrato" },
  { href: "/tarefas?novo=1", label: "Tarefa" },
  { href: "/boletos", label: "Boleto" },
  { href: "/compras", label: "Solicitação de compra" },
  { href: "/financeiro", label: "Lançamento a pagar" },
] as const;

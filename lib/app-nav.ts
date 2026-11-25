/** Navegação — 15 menus (docs/especificacao.md §2). */

export type AppNavItem = {
  href: string;
  label: string;
  description?: string;
  /** Fase ainda não entregue — mostra stub */
  stub?: boolean;
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
      { href: "/quadros/jornada", label: "Jornada do cliente", description: "Cards por etapa (Fase 3; dnd na 8)" },
      { href: "/quadros/cobranca", label: "Cobrança", stub: true },
      { href: "/quadros/regularizacao", label: "Regularização e escritura", stub: true },
      { href: "/quadros/compras", label: "Compras", stub: true },
      { href: "/quadros/obras", label: "Obras", stub: true },
      { href: "/quadros/tarefas", label: "Tarefas", stub: true },
    ],
  },
  {
    id: "comercial",
    label: "3. Comercial",
    items: [
      { href: "/contratos", label: "Efetuar venda / contratos", description: "Venda gera contrato e parcelas (Fase 3)" },
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
    label: "5. Contratos",
    items: [
      { href: "/contratos", label: "Contratos", description: "Lista, saldo e operações" },
      { href: "/carteira", label: "Ficha financeira", description: "Parcelas e encargos" },
      { href: "/reajustes", label: "Reajuste e operações", description: "Índice anual e operações" },
    ],
  },
  {
    id: "recebimentos",
    label: "6. Recebimentos",
    items: [
      { href: "/carteira", label: "Caixa (receber)", description: "Baixa e estorno de parcelas" },
      { href: "/boletos", label: "Boletos, remessa e retorno", description: "Emissão CNAB demo" },
    ],
  },
  {
    id: "cobranca",
    label: "7. Cobrança e jurídico",
    items: [
      { href: "/quadros/cobranca", label: "Cobrança (quadro)", stub: true },
    ],
  },
  {
    id: "regularizacao",
    label: "8. Regularização",
    items: [
      { href: "/processos", label: "Processos", description: "Demo REURB" },
      { href: "/nucleos", label: "Núcleos", description: "Portfólio" },
      { href: "/documentos", label: "Documentos", description: "Checklist do morador" },
      { href: "/protocolo", label: "Protocolo", description: "Consulta por número" },
    ],
  },
  {
    id: "obras",
    label: "9. Obras",
    items: [
      { href: "/obras", label: "Obras e orçamento", description: "Demo provisório até Fase 7" },
    ],
  },
  {
    id: "compras",
    label: "10. Compras",
    items: [
      { href: "/compras", label: "Compras", description: "Demo provisório até Fase 7" },
    ],
  },
  {
    id: "financeiro",
    label: "11. Financeiro",
    items: [
      { href: "/financeiro", label: "Financeiro", description: "Demo provisório até Fase 6" },
    ],
  },
  {
    id: "fiscal",
    label: "12. Fiscal",
    items: [
      { href: "/fiscal", label: "Fiscal e contábil", description: "Demo provisório até Fase 10" },
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
      { href: "/relatorios", label: "Central de relatórios", description: "Demo provisório até Fase 10" },
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
      { href: "/configuracoes", label: "Parâmetros (legado demo)" },
    ],
  },
];

export const APP_FLAT_NAV = APP_NAV.flatMap((g) =>
  g.items.map((item) => ({ ...item, group: g.label }))
);

export const NOVO_ATALHOS = [
  { href: "/cadastros/pessoas?novo=1", label: "Pessoa" },
  { href: "/contratos", label: "Venda / contrato" },
  { href: "/tarefas?novo=1", label: "Tarefa" },
  { href: "/boletos", label: "Boleto" },
  { href: "/empreendimentos", label: "Empreendimento" },
  { href: "/compras", label: "Solicitação de compra", stub: true },
] as const;

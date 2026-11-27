import type {
  Categoria,
  ClassificacaoObra,
  FinanceiroState,
  PlanoConta,
  ResultadoGrupo,
} from "./financeiro-types";

export const FINANCEIRO_STORAGE_KEY = "mlf-financeiro-store-v1";

const PLANOS_DESPESA: { nome: string; grupo: ResultadoGrupo }[] = [
  { nome: "Aluguel, Condomínio e IPTU", grupo: "Despesas Operacionais" },
  { nome: "Compra de Terreno", grupo: "Despesas Variáveis" },
  { nome: "Despesas Financeiras", grupo: "Resultado Financeiro" },
  { nome: "Devolução de Compras", grupo: "Somente Fluxo de Caixa" },
  { nome: "Distribuição de Lucros", grupo: "Somente Fluxo de Caixa" },
  { nome: "Equipamentos", grupo: "Despesas Variáveis" },
  { nome: "Gerais e Administrativas", grupo: "Despesas Operacionais" },
  { nome: "Impostos", grupo: "Receita Operacional Bruta (dedução)" },
  { nome: "Materiais", grupo: "Despesas Variáveis" },
  { nome: "Mão de Obra", grupo: "Despesas Variáveis" },
  { nome: "Mão de Obra Terceirizada", grupo: "Despesas Variáveis" },
  { nome: "Outras Despesas", grupo: "Despesas Variáveis" },
  { nome: "Pagamento de Empréstimo", grupo: "Somente Fluxo de Caixa" },
  { nome: "Pessoal Administrativo", grupo: "Despesas Operacionais" },
  { nome: "Pro Labore", grupo: "Despesas Operacionais" },
  { nome: "Propaganda e Marketing", grupo: "Despesas Variáveis" },
];

const PLANOS_RECEITA: { nome: string; grupo: ResultadoGrupo }[] = [
  { nome: "Receita Operacional Bruta", grupo: "Receita Operacional Bruta" },
  { nome: "Receitas Financeiras", grupo: "Resultado Financeiro" },
];

const CATS_CONF: { nome: string; plano: string; classif: ClassificacaoObra }[] = [
  { nome: "13º Salário Mão de Obra", plano: "Mão de Obra", classif: "Mão de Obra (Salários)" },
  {
    nome: "13º Salário Pessoal Administrativo",
    plano: "Pessoal Administrativo",
    classif: "Outros",
  },
  { nome: "Aluguel de Equipamento", plano: "Equipamentos", classif: "Equipamentos" },
  {
    nome: "Assistência Médica Mão de Obra",
    plano: "Mão de Obra",
    classif: "Mão de Obra (Encargos)",
  },
  { nome: "Cartório", plano: "Outras Despesas", classif: "Outros" },
  {
    nome: "Comissão de Vendedores",
    plano: "Gerais e Administrativas",
    classif: "Outros",
  },
  {
    nome: "Devolução de Compras",
    plano: "Devolução de Compras",
    classif: "Oculta na Gestão",
  },
  { nome: "Distrato", plano: "Outras Despesas", classif: "Oculta na Gestão" },
  {
    nome: "Despesas Financeiras (JUROS e MULTAS)",
    plano: "Despesas Financeiras",
    classif: "a classificar",
  },
  {
    nome: "Distribuição de Lucros",
    plano: "Distribuição de Lucros",
    classif: "Oculta na Gestão",
  },
  { nome: "Empréstimo", plano: "Despesas Financeiras", classif: "Oculta na Gestão" },
  { nome: "Materiais", plano: "Materiais", classif: "Materiais" },
  {
    nome: "Mão de Obra Terceirizada",
    plano: "Mão de Obra Terceirizada",
    classif: "Mão de Obra (Terceirizada)",
  },
  {
    nome: "Pagamento de Empréstimo",
    plano: "Pagamento de Empréstimo",
    classif: "Oculta na Gestão",
  },
  {
    nome: "Plataforma",
    plano: "Gerais e Administrativas",
    classif: "Mão de Obra (Terceirizada)",
  },
];

const DEMAIS = [
  "Aluguel",
  "Aquisição de Equipamento",
  "Assistência Médica Pessoal Administrativo",
  "Compra de Terreno",
  "Condomínio",
  "Contabilidade",
  "Cursos e Treinamentos",
  "DOAÇÃO",
  "Encargos Mão de Obra",
  "Encargos Pessoal Administrativo",
  "Energia Elétrica",
  "Horas Extras Mão de Obra",
  "Horas Extras Pessoal Administrativo",
  "Hospedagem",
  "Impostos",
  "Internet",
  "IPTU",
  "Juros",
  "Limpeza",
  "Manutenção",
  "Manutenção de Equipamentos",
  "Material de Escritório",
  "Outras Despesas",
  "Pro Labore",
  "Propaganda e Marketing",
  "Rescisões Trabalhistas Mão de Obra",
  "Rescisões Trabalhistas Pessoal Administrativo",
  "Salário Mão de Obra",
  "Salário Pessoal Administrativo",
  "SERVIÇOS DE TERCEIROS",
  "Telefone Celular",
  "Telefone Fixo",
  "Transporte",
  "Vale Alimentação Mão de Obra",
  "Vale Alimentação Pessoal Administrativo",
  "Vale Transporte Mão de Obra",
  "Vale Transporte Pessoal Administrativo",
  "Viagens",
  "Água e Esgoto",
];

const NATUREZAS: { nome: string; linha: string }[] = [
  { nome: "Outras receitas", linha: "Outras receitas" },
  { nome: "Contrato", linha: "Contrato" },
  { nome: "Execução de Obras", linha: "Execução de Obras" },
  { nome: "Venda de Imóveis", linha: "Venda de Imóveis" },
  { nome: "Prestação de Serviços", linha: "Prestação de Serviços" },
  { nome: "Venda de Bens", linha: "Venda de Bens" },
  { nome: "Aluguel", linha: "Aluguel" },
  { nome: "Juros de Contrato", linha: "Juros de Recebimentos" },
  { nome: "Licitação", linha: "Outras receitas" },
  { nome: "Medição", linha: "Execução de Obras" },
  { nome: "Projetos", linha: "Prestação de Serviços" },
  { nome: "Reembolso", linha: "Outras receitas" },
  { nome: "Taxa de Administração", linha: "Prestação de Serviços" },
  { nome: "Venda", linha: "Venda de Bens" },
  { nome: "Juros de Aplicação Financeira", linha: "Juros de Aplicações Financeiras" },
];

function inferPlanoClassif(
  nome: string,
  planosByNome: Map<string, string>
): { planoId: string; classif: ClassificacaoObra } {
  if (nome.endsWith("Mão de Obra")) {
    return {
      planoId: planosByNome.get("Mão de Obra")!,
      classif: nome.includes("Encargos")
        ? "Mão de Obra (Encargos)"
        : "Mão de Obra (Salários)",
    };
  }
  if (nome.endsWith("Pessoal Administrativo")) {
    return {
      planoId: planosByNome.get("Pessoal Administrativo")!,
      classif: "Outros",
    };
  }
  const same = planosByNome.get(nome);
  if (same) {
    return { planoId: same, classif: "a classificar" };
  }
  return {
    planoId: planosByNome.get("Outras Despesas")!,
    classif: "a classificar",
  };
}

export function seedFinanceiro(): FinanceiroState {
  const planos: PlanoConta[] = [
    ...PLANOS_DESPESA.map((p, i) => ({
      id: `pl-d-${i + 1}`,
      nome: p.nome,
      fluxo: "despesas" as const,
      grupoResultados: p.grupo,
      ativo: true,
    })),
    ...PLANOS_RECEITA.map((p, i) => ({
      id: `pl-r-${i + 1}`,
      nome: p.nome,
      fluxo: "receitas" as const,
      grupoResultados: p.grupo,
      ativo: true,
    })),
  ];
  const planosByNome = new Map(planos.map((p) => [p.nome, p.id]));

  const categorias: Categoria[] = [
    ...CATS_CONF.map((c, i) => ({
      id: `cat-${i + 1}`,
      nome: c.nome,
      planoId: planosByNome.get(c.plano)!,
      classificacaoObra: c.classif,
      ativo: true,
    })),
    ...DEMAIS.map((nome, i) => {
      const inf = inferPlanoClassif(nome, planosByNome);
      return {
        id: `cat-d-${i + 1}`,
        nome,
        planoId: inf.planoId,
        classificacaoObra: inf.classif,
        ativo: true,
      };
    }),
  ];

  const catMateriais = categorias.find((c) => c.nome === "Materiais")!;

  return {
    config: {
      mesesProvisionamento: 12,
      numeroDocObrigatorioLancamento: false,
      numeroDocObrigatorioPagamento: false,
    },
    planos,
    categorias,
    naturezas: NATUREZAS.map((n, i) => ({
      id: `nat-${i + 1}`,
      nome: n.nome,
      linhaResultados: n.linha,
      ativo: true,
    })),
    contas: [
      {
        id: "cta-1",
        nome: "Conta Operacional",
        banco: "Itaú",
        tipo: "corrente",
        proprietario: "empresa",
        dataInicial: "2026-01-01",
        valorInicial: 85000,
        saldo: 85000,
        ativa: true,
        boleto: true,
        empresaId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      },
      {
        id: "cta-2",
        nome: "Caixa Escritório",
        banco: "Caixa",
        tipo: "caixa",
        proprietario: "empresa",
        dataInicial: "2026-01-01",
        valorInicial: 2500,
        saldo: 2500,
        ativa: true,
        boleto: false,
        empresaId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      },
      {
        id: "cta-3",
        nome: "Conta Regularizações",
        banco: "Bradesco",
        tipo: "corrente",
        proprietario: "empresa",
        dataInicial: "2026-01-01",
        valorInicial: 12000,
        saldo: 12000,
        ativa: true,
        boleto: false,
        empresaId: "org-demo-2",
      },
    ],
    lancamentos: [
      {
        id: "lan-1",
        descricao: "Cimento canteiro Horizonte",
        favorecido: "Distribuidora Sul",
        categoriaId: catMateriais.id,
        competencia: "2026-11-01",
        vencimento: "2026-11-28",
        pagador: "Meu Lote Fácil",
        contaId: "cta-1",
        valor: 7400,
        forma: "pix",
        condicao: "a_vista",
        centros: [
          {
            tipo: "obra",
            obraId: "obr-1",
            label: "Infraestrutura Residencial Horizonte",
            valor: 7400,
          },
        ],
        criadoEm: "2026-11-21",
      },
    ],
    pagamentos: [
      {
        id: "pag-1",
        lancamentoId: "lan-1",
        parcela: "1/1",
        vencimento: "2026-11-28",
        valor: 7400,
        valorPago: 0,
        status: "em_aberto",
        favorecido: "Distribuidora Sul",
        descricao: "Cimento canteiro Horizonte",
        categoriaId: catMateriais.id,
        contaId: "cta-1",
        centroLabel: "Infraestrutura Residencial Horizonte",
        forma: "pix",
        condicao: "a_vista",
        conciliado: false,
        historico: [],
      },
      {
        id: "pag-2",
        lancamentoId: "lan-demo",
        parcela: "1/2",
        vencimento: "2026-11-15",
        valor: 5000,
        valorPago: 0,
        status: "vencido",
        favorecido: "Engenharia Terceiros",
        descricao: "Mão de obra terceirizada — rateio",
        categoriaId:
          categorias.find((c) => c.nome === "Mão de Obra Terceirizada")!.id,
        contaId: "cta-1",
        centroLabel: "Infraestrutura Residencial Horizonte (60%)",
        forma: "boleto",
        condicao: "parcelado",
        conciliado: false,
        historico: [],
      },
      {
        id: "pag-3",
        lancamentoId: "lan-demo",
        parcela: "2/2",
        vencimento: "2026-12-15",
        valor: 5000,
        valorPago: 0,
        status: "em_aberto",
        favorecido: "Engenharia Terceiros",
        descricao: "Mão de obra terceirizada — rateio",
        categoriaId:
          categorias.find((c) => c.nome === "Mão de Obra Terceirizada")!.id,
        contaId: "cta-1",
        centroLabel: "Meu Lote Fácil (40%)",
        forma: "boleto",
        condicao: "parcelado",
        conciliado: false,
        historico: [],
      },
    ],
    faturamentos: [
      {
        id: "fat-1",
        descricao: "Medição novembro — obra Horizonte",
        cliente: "Construtora Demo",
        naturezaId: "nat-3",
        competencia: "2026-11-01",
        vencimento: "2026-12-10",
        centro: {
          tipo: "obra",
          obraId: "obr-1",
          label: "Infraestrutura Residencial Horizonte",
        },
        contaId: "cta-1",
        valorBruto: 45000,
        impostosRetidos: 1350,
        valorLiquido: 43650,
        forma: "boleto",
        criadoEm: "2026-11-22",
      },
    ],
    recebimentos: [
      {
        id: "rec-1",
        faturamentoId: "fat-1",
        origem: "faturamento",
        parcela: "1/1",
        vencimento: "2026-12-10",
        valor: 43650,
        valorRecebido: 0,
        status: "em_aberto",
        cliente: "Construtora Demo",
        descricao: "Medição novembro — obra Horizonte",
        naturezaId: "nat-3",
        contaId: "cta-1",
        centroLabel: "Infraestrutura Residencial Horizonte",
        forma: "boleto",
        conciliado: false,
      },
      {
        id: "rec-c1",
        origem: "contrato",
        contratoRef: "CTR-1001",
        parcela: "3/48",
        vencimento: "2026-11-20",
        valor: 1850.5,
        valorRecebido: 0,
        status: "vencido",
        cliente: "Maria Souza",
        descricao: "Parcela contrato lote Q12-L05",
        contaId: "cta-1",
        centroLabel: "Residencial Horizonte",
        forma: "boleto",
        conciliado: false,
      },
    ],
    preLancamentos: [
      {
        id: "pre-1",
        descricao: "Combustível visita de obra",
        valor: 180,
        centro: { tipo: "empresa", label: "Meu Lote Fácil" },
        solicitante: "Eng. Paula",
        status: "pendente",
        criadoEm: "2026-11-24",
      },
    ],
    transferencias: [],
    notas: [
      {
        id: "nf-1",
        emissao: "2026-11-18",
        serie: "1",
        numero: "4521",
        situacao: "autorizada",
        emissor: "Distribuidora Sul",
        cnpj: "12.345.678/0001-90",
        valor: 7400,
        lancada: true,
        lancamentoId: "lan-1",
        meuCnpj: "00.000.000/0001-00",
      },
      {
        id: "nf-2",
        emissao: "2026-11-22",
        serie: "1",
        numero: "4602",
        situacao: "autorizada",
        emissor: "Materiais Centro",
        cnpj: "98.765.432/0001-10",
        valor: 2150,
        lancada: false,
        meuCnpj: "00.000.000/0001-00",
      },
    ],
    meusCnpjs: [
      {
        id: "cnpj-1",
        cnpj: "00.000.000/0001-00",
        razaoSocial: "Meu Lote Fácil Ltda",
        emissaoNfse: false,
        capturaAutomatica: false,
      },
    ],
  };
}

export function categoriaNome(
  state: FinanceiroState,
  categoriaId: string
): string {
  return state.categorias.find((c) => c.id === categoriaId)?.nome ?? "—";
}

export function planoDaCategoria(
  state: FinanceiroState,
  categoriaId: string
): PlanoConta | undefined {
  const cat = state.categorias.find((c) => c.id === categoriaId);
  if (!cat) return undefined;
  return state.planos.find((p) => p.id === cat.planoId);
}

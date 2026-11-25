/** Dados mock do sistema unificado (Mais Controle + LoteWin + REURB). */

export const sistemaKpis = {
  empreendimentos: 41,
  lotes: 12995,
  lotesVendidos: 3690,
  compradores: 3504,
  contratosAtivos: 2074,
  contratosTotal: 3690,
  carteiraReceber: 38936075.88,
  usuarios: 7,
  inadimplentes: 186,
  vencimentos30d: 412,
  obrasAtivas: 9,
  pagamentosAbertos: 54,
  recebimentosAbertos: 128,
  preLancamentos: 6,
  nfeSemLancamento: 3,
};

export function brl(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export const pessoasMock = [
  {
    id: "p1",
    nome: "Bruno Lima",
    doc: "123.456.789-00",
    papeis: ["Comprador", "Cliente"],
    cidade: "Campinas",
    status: "Ativo",
    contato: "(19) 99100-1001",
  },
  {
    id: "p2",
    nome: "Construtora Horizonte Ltda",
    doc: "12.345.678/0001-90",
    papeis: ["Fornecedor"],
    cidade: "Campinas",
    status: "Ativo",
    contato: "(19) 3232-4400",
  },
  {
    id: "p3",
    nome: "Ana Paula Corretores",
    doc: "987.654.321-00",
    papeis: ["Corretor"],
    cidade: "Valinhos",
    status: "Ativo",
    contato: "(19) 98888-2200",
  },
  {
    id: "p4",
    nome: "José Favorecido Silva",
    doc: "111.222.333-44",
    papeis: ["Profissional", "Fornecedor"],
    cidade: "Hortolândia",
    status: "Afastado",
    contato: "(19) 97777-3300",
  },
  {
    id: "p5",
    nome: "Maria Souza",
    doc: "555.666.777-88",
    papeis: ["Comprador", "Pré-cadastro"],
    cidade: "Amparo",
    status: "Ativo",
    contato: "(19) 96666-4400",
  },
];

export const usuariosMock = [
  {
    id: "u1",
    nome: "Admin Sistema",
    email: "admin@meulotefacil.com.br",
    perfil: "Administrador",
    status: "Ativo",
    chave: true,
  },
  {
    id: "u2",
    nome: "Financeiro",
    email: "financeiro@meulotefacil.com.br",
    perfil: "Financeiro",
    status: "Ativo",
    chave: false,
  },
  {
    id: "u3",
    nome: "Obra Norte",
    email: "obras@meulotefacil.com.br",
    perfil: "Gestão de obra",
    status: "Ativo",
    chave: false,
  },
  {
    id: "u4",
    nome: "Comercial",
    email: "vendas@meulotefacil.com.br",
    perfil: "Comercial",
    status: "Ativo",
    chave: false,
  },
];

export const auditoriaMock = [
  {
    quando: "24/11/2026 18:12",
    usuario: "Admin Sistema",
    rotina: "Carteira > Recebimento",
    acao: "Baixa de parcela CTR-2091 / 12",
  },
  {
    quando: "24/11/2026 16:40",
    usuario: "Financeiro",
    rotina: "Compras > Ordem",
    acao: "Aprovou OC-441",
  },
  {
    quando: "24/11/2026 11:05",
    usuario: "Comercial",
    rotina: "Vendas",
    acao: "Criou contrato CTR-3102",
  },
  {
    quando: "23/11/2026 19:22",
    usuario: "Admin Sistema",
    rotina: "Lotes",
    acao: "Status Horizonte A/03 → Reservado",
  },
];

export const empreendimentosSistema = [
  {
    id: "e1",
    codigo: "HOR",
    nome: "Residencial Horizonte",
    tipo: "Loteamento",
    status: "Em venda",
    cidade: "Campinas",
    uf: "SP",
    quadras: 12,
    lotes: 420,
    vendidos: 286,
    area: "18,4 ha",
  },
  {
    id: "e2",
    codigo: "COL",
    nome: "Colinas do Sol",
    tipo: "Loteamento",
    status: "Em obra",
    cidade: "Valinhos",
    uf: "SP",
    quadras: 8,
    lotes: 210,
    vendidos: 94,
    area: "9,1 ha",
  },
  {
    id: "e3",
    codigo: "VPA",
    nome: "Vila Paula",
    tipo: "Regularização",
    status: "REURB em andamento",
    cidade: "Campinas",
    uf: "SP",
    quadras: 6,
    lotes: 318,
    vendidos: 0,
    area: "6,2 ha",
  },
  {
    id: "e4",
    codigo: "AUR",
    nome: "Aurora Park",
    tipo: "Loteamento",
    status: "Encerrado",
    cidade: "Hortolândia",
    uf: "SP",
    quadras: 15,
    lotes: 640,
    vendidos: 640,
    area: "22,0 ha",
  },
];

export const lotesSistema = [
  {
    id: "l1",
    emp: "Horizonte",
    quadra: "C",
    lote: "03",
    area: 250,
    valor: 186000,
    status: "Vendido",
    bloqueiaVenda: true,
    bloqueiaFinanceiro: false,
  },
  {
    id: "l2",
    emp: "Horizonte",
    quadra: "A",
    lote: "01",
    area: 300,
    valor: 224000,
    status: "Disponível",
    bloqueiaVenda: false,
    bloqueiaFinanceiro: false,
  },
  {
    id: "l3",
    emp: "Colinas",
    quadra: "D",
    lote: "01",
    area: 280,
    valor: 198000,
    status: "Reservado",
    bloqueiaVenda: true,
    bloqueiaFinanceiro: false,
  },
  {
    id: "l4",
    emp: "Aurora",
    quadra: "A",
    lote: "02",
    area: 220,
    valor: 0,
    status: "Quitado",
    bloqueiaVenda: true,
    bloqueiaFinanceiro: true,
  },
  {
    id: "l5",
    emp: "Horizonte",
    quadra: "B",
    lote: "07",
    area: 260,
    valor: 191000,
    status: "Jurídico",
    bloqueiaVenda: true,
    bloqueiaFinanceiro: true,
  },
];

export const contratosMock = [
  {
    id: "CTR-2091",
    comprador: "Bruno Lima",
    lote: "Horizonte C/03",
    valor: 186000,
    status: "Ativo",
    parcelas: "48/120",
    saldo: 98000,
    corretor: "Ana Paula",
  },
  {
    id: "CTR-2104",
    comprador: "Maria Souza",
    lote: "Colinas D/01",
    valor: 198000,
    status: "Aguardando assinatura",
    parcelas: "0/96",
    saldo: 198000,
    corretor: "Ana Paula",
  },
  {
    id: "CTR-1880",
    comprador: "Carlos Mendes",
    lote: "Aurora A/02",
    valor: 154000,
    status: "Quitado",
    parcelas: "84/84",
    saldo: 0,
    corretor: "Direto",
  },
  {
    id: "CTR-2012",
    comprador: "Fernanda Dias",
    lote: "Horizonte B/07",
    valor: 191000,
    status: "Renegociado",
    parcelas: "22/140",
    saldo: 142500,
    corretor: "Ana Paula",
  },
];

export const parcelasCarteira = [
  {
    id: "par1",
    contrato: "CTR-2091",
    comprador: "Bruno Lima",
    tipo: "Prestação",
    n: "12/120",
    vencimento: "10/12/2026",
    valor: 1850.4,
    encargos: 0,
    status: "Em aberto",
  },
  {
    id: "par2",
    contrato: "CTR-2091",
    comprador: "Bruno Lima",
    tipo: "Prestação",
    n: "11/120",
    vencimento: "10/11/2026",
    valor: 1850.4,
    encargos: 74.02,
    status: "Vencida",
  },
  {
    id: "par3",
    contrato: "CTR-2012",
    comprador: "Fernanda Dias",
    tipo: "Prestação",
    n: "22/140",
    vencimento: "05/12/2026",
    valor: 1420.0,
    encargos: 0,
    status: "Em aberto",
  },
  {
    id: "par4",
    contrato: "CTR-1880",
    comprador: "Carlos Mendes",
    tipo: "Prestação",
    n: "84/84",
    vencimento: "15/10/2026",
    valor: 2100.0,
    encargos: 0,
    status: "Paga",
  },
];

export const boletosMock = [
  {
    id: "bol1",
    nossoNumero: "00014821",
    contrato: "CTR-2091",
    vencimento: "10/12/2026",
    valor: 1850.4,
    banco: "Sicredi 748",
    status: "Emitido",
  },
  {
    id: "bol2",
    nossoNumero: "00014790",
    contrato: "CTR-2012",
    vencimento: "05/12/2026",
    valor: 1420.0,
    banco: "Sicredi 748",
    status: "Remessa gerada",
  },
  {
    id: "bol3",
    nossoNumero: "00014610",
    contrato: "CTR-2091",
    vencimento: "10/11/2026",
    valor: 1924.42,
    banco: "Sicredi 748",
    status: "Cancelado",
  },
];

export const reajustesMock = [
  {
    id: "rej1",
    periodo: "2026-11",
    indice: "IGPM",
    fator: "1,82%",
    contratos: 214,
    status: "Aplicado",
  },
  {
    id: "rej2",
    periodo: "2026-05",
    indice: "IPCA",
    fator: "2,10%",
    contratos: 198,
    status: "Aplicado",
  },
];

export const operacoesContrato = [
  {
    id: "op1",
    tipo: "Transferência",
    contrato: "CTR-1755",
    quando: "12/09/2026",
    detalhe: "Comprador A → Comprador B, taxa R$ 1.500",
  },
  {
    id: "op2",
    tipo: "Renegociação",
    contrato: "CTR-2012",
    quando: "03/08/2026",
    detalhe: "Saldo em 140 parcelas mensais",
  },
  {
    id: "op3",
    tipo: "Retomada",
    contrato: "CTR-1602",
    quando: "21/06/2026",
    detalhe: "Lote devolvido, histórico preservado",
  },
];

export const obrasMock = [
  {
    id: "ob1",
    nome: "Horizonte, infraestrutura",
    status: "Em execução",
    fisico: 68,
    orcado: 4200000,
    realizado: 2870000,
    saldo: 1330000,
  },
  {
    id: "ob2",
    nome: "Colinas, terraplenagem",
    status: "Em execução",
    fisico: 41,
    orcado: 1850000,
    realizado: 920000,
    saldo: 930000,
  },
  {
    id: "ob3",
    nome: "Aurora, pavimentação",
    status: "Concluída",
    fisico: 100,
    orcado: 2600000,
    realizado: 2510000,
    saldo: 90000,
  },
];

export const comprasMock = [
  {
    id: "SC-882",
    tipo: "Solicitação",
    centro: "Horizonte",
    status: "Em aprovação",
    urgencia: "Alta",
    itens: 6,
  },
  {
    id: "COT-331",
    tipo: "Cotação",
    centro: "Colinas",
    status: "Em aberto",
    urgencia: "Média",
    itens: 12,
  },
  {
    id: "OC-441",
    tipo: "Ordem de compra",
    centro: "Horizonte",
    status: "Aprovada",
    urgencia: "Normal",
    itens: 8,
  },
  {
    id: "OC-438",
    tipo: "Ordem de compra",
    centro: "Aurora",
    status: "Entrega parcial",
    urgencia: "Normal",
    itens: 4,
  },
];

export const financeiroPagar = [
  {
    id: "ap1",
    favorecido: "Construtora Horizonte Ltda",
    categoria: "Material",
    vencimento: "28/11/2026",
    valor: 48200,
    status: "Em aberto",
    centro: "Horizonte",
  },
  {
    id: "ap2",
    favorecido: "Energia SP",
    categoria: "Utilidades",
    vencimento: "20/11/2026",
    valor: 3120.5,
    status: "Vencido",
    centro: "Empresa",
  },
  {
    id: "ap3",
    favorecido: "Cartório 3º RI",
    categoria: "Regularização",
    vencimento: "05/12/2026",
    valor: 8900,
    status: "Em aberto",
    centro: "Vila Paula",
  },
];

export const financeiroReceber = [
  {
    id: "ar1",
    origem: "Parcela CTR-2091",
    cliente: "Bruno Lima",
    vencimento: "10/12/2026",
    valor: 1850.4,
    status: "Em aberto",
    centro: "Horizonte",
  },
  {
    id: "ar2",
    origem: "Faturamento avulso, consultoria",
    cliente: "Prefeitura de Amparo",
    vencimento: "30/11/2026",
    valor: 15000,
    status: "Em aberto",
    centro: "Serviços",
  },
];

export const contasBancarias = [
  {
    id: "c1",
    nome: "Sicredi empresa",
    banco: "748",
    agencia: "1234",
    tipo: "Corrente",
    saldo: 842210.33,
  },
  {
    id: "c2",
    nome: "Caixa operacional",
    banco: "Caixa interno",
    agencia: "-",
    tipo: "Caixa",
    saldo: 12450.0,
  },
  {
    id: "c3",
    nome: "Sicredi boletos",
    banco: "748",
    agencia: "1234",
    tipo: "Cobrança",
    saldo: 0,
  },
];

export const fiscalMock = [
  {
    id: "nf1",
    tipo: "NFe recebida",
    numero: "4521",
    emitente: "Materiais Campinas",
    valor: 18200,
    status: "Sem lançamento",
  },
  {
    id: "nf2",
    tipo: "NFSe emitida",
    numero: "118",
    emitente: "Meu Lote Fácil",
    valor: 15000,
    status: "Emitida",
  },
  {
    id: "nf3",
    tipo: "NFe recebida",
    numero: "4490",
    emitente: "Terraplenagem Sul",
    valor: 54000,
    status: "Vinculada",
  },
];

export const relatoriosCatalogo = [
  { grupo: "Lotes", nome: "Lotes por status", origem: "LW" },
  { grupo: "Lotes", nome: "Histórico de lotes", origem: "LW" },
  { grupo: "Carteira", nome: "Posição financeira", origem: "LW" },
  { grupo: "Carteira", nome: "Previsão da carteira", origem: "LW" },
  { grupo: "Carteira", nome: "Ficha financeira", origem: "LW" },
  { grupo: "Cobrança", nome: "Inadimplência", origem: "LW" },
  { grupo: "Cobrança", nome: "Boletos emitidos", origem: "LW" },
  { grupo: "Orçamento", nome: "Sintético / analítico", origem: "MC" },
  { grupo: "Gestão de obra", nome: "Orçado x realizado", origem: "MC" },
  { grupo: "Compras", nome: "Extrato de compras", origem: "MC" },
  { grupo: "Financeiro", nome: "Fluxo de caixa", origem: "MC+LW" },
  { grupo: "Financeiro", nome: "Demonstração de resultado", origem: "MC+LW" },
];

export const tarefasMock = [
  {
    id: "t1",
    titulo: "Aprovar OC-441",
    quadro: "Compras",
    responsavel: "Financeiro",
    prazo: "25/11/2026",
    prioridade: "Alta",
    status: "Em andamento",
  },
  {
    id: "t2",
    titulo: "Gerar remessa dezembro",
    quadro: "Carteira",
    responsavel: "Financeiro",
    prazo: "28/11/2026",
    prioridade: "Média",
    status: "A fazer",
  },
  {
    id: "t3",
    titulo: "Atualizar planta Horizonte",
    quadro: "Comercial",
    responsavel: "Comercial",
    prazo: "30/11/2026",
    prioridade: "Baixa",
    status: "A fazer",
  },
  {
    id: "t4",
    titulo: "Conferir docs REURB Vila Paula",
    quadro: "Regularização",
    responsavel: "Admin Sistema",
    prazo: "02/12/2026",
    prioridade: "Alta",
    status: "Em andamento",
  },
];

export const arquivosMock = [
  {
    id: "a1",
    nome: "contrato-CTR-2091.pdf",
    rotina: "Vendas",
    tag: "Contrato",
    tamanho: "1,2 MB",
    quando: "10/11/2026",
  },
  {
    id: "a2",
    nome: "planta-horizonte.png",
    rotina: "Empreendimentos",
    tag: "Planta",
    tamanho: "4,8 MB",
    quando: "02/10/2026",
  },
  {
    id: "a3",
    nome: "nfe-4521.xml",
    rotina: "Fiscal",
    tag: "NFe",
    tamanho: "86 KB",
    quando: "22/11/2026",
  },
  {
    id: "a4",
    nome: "art-colinas.pdf",
    rotina: "Obras",
    tag: "ART",
    tamanho: "540 KB",
    quando: "15/09/2026",
  },
];

export const configGrupos = [
  {
    grupo: "Empresa",
    itens: ["Dados cadastrais", "Logotipo", "Advogado (OAB)", "Responsável"],
  },
  {
    grupo: "Encargos",
    itens: ["Mora 1% após 2 dias", "Multa 2%", "Multa diferenciada", "Por empreendimento"],
  },
  {
    grupo: "Caixa",
    itens: ["Recibo 1/2 vias", "Autenticação", "Estorno só admin", "Regras de recebimento"],
  },
  {
    grupo: "Vendas",
    itens: ["Plano automático", "Geração de parcelas", "Veículo obrigatório", "Comissão"],
  },
  {
    grupo: "Boletos",
    itens: ["Mensagens", "Nosso número", "Travas de emissão", "Despesa bancária"],
  },
  {
    grupo: "Reajuste",
    itens: ["Tipos", "Base anual", "Resíduo", "Desfazer reajuste"],
  },
  {
    grupo: "Financeiro",
    itens: ["Provisionamento", "Documento obrigatório", "Abertura de etapas"],
  },
  {
    grupo: "Compras",
    itens: ["Numeração", "Ordem sem cotação", "Alçada"],
  },
  {
    grupo: "Obras",
    itens: ["Expediente", "BDI", "Arredondamento", "Modelo de proposta"],
  },
  {
    grupo: "Aparência",
    itens: ["Cores da planta", "Máscara do lote", "Pesquisa padrão"],
  },
];

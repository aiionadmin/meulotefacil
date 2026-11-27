import {
  DEFAULT_EMP_REPORT_SECTIONS,
  SITE_LOGO_PATH,
  buildEmpreendimentoReportHtml,
  type EmpReportSections,
} from "./empreendimento-report";
import type {
  Contract,
  Development,
  EmpSocio,
  Lot,
} from "@/lib/domain/carteira-types";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const development: Development = {
  id: "dev-1",
  codigo: "HOR",
  nome: "Residencial Horizonte",
  tipo: "loteamento",
  modalidade: "loteamento",
  status: "em_andamento",
  cidade: "Campinas",
  uf: "SP",
  bairro: "Jardim das Flores",
  cep: "13000-000",
  areaTotal: "120.000 m²",
  qtdQuadras: 12,
  qtdLotes: 240,
  diasMora: 5,
  taxaMoraMes: 1,
  taxaMulta: 2,
  diaMulta: 1,
  matriculaNumero: "45.678",
  matriculaData: "2020-01-15",
  adminRazao: "MLF Admin Ltda",
  adminCnpj: "12.345.678/0001-90",
  cartorioNome: "1º RI Campinas",
  cartorioCidade: "Campinas",
  cartorioUf: "SP",
  cartorioContato: "(19) 3000-0000",
  certidaoTipo: "inteiro teor",
  certidaoNumero: "CT-998",
  certidaoData: "2024-06-01",
  plantaDxf: {
    nome: "planta-horizonte.dxf",
    savedAt: "2026-11-20T12:00:00.000Z",
    labelCount: 240,
    sampleId: "sample-hor",
  },
  observacoes: "Observação de teste",
};

const lots: Lot[] = [
  {
    id: "lot-1",
    developmentId: "dev-1",
    empNome: "Residencial Horizonte",
    quadra: "A",
    lote: "01",
    area: 250,
    custo: 100000,
    valor: 180000,
    valorM2: 720,
    status: "disponivel",
    bloqueiaVenda: false,
    bloqueiaFinanceiro: false,
  },
  {
    id: "lot-2",
    developmentId: "dev-1",
    empNome: "Residencial Horizonte",
    quadra: "A",
    lote: "02",
    area: 260,
    custo: 110000,
    valor: 190000,
    valorM2: 730,
    status: "vendido",
    bloqueiaVenda: false,
    bloqueiaFinanceiro: false,
    compradorNome: "Ana Souza",
  },
];

const contracts: Contract[] = [
  {
    id: "ct-1",
    numero: "CT-001",
    developmentId: "dev-1",
    empNome: "Residencial Horizonte",
    lotId: "lot-2",
    quadra: "A",
    lote: "02",
    compradorId: "p-1",
    compradorNome: "Ana Souza",
    preco: 190000,
    status: "ativo",
    dataContrato: "2026-01-10",
    dataPrimeiraParcela: "2026-02-10",
    multaPct: 2,
    taxaMoraMes: 1,
    diasTolerancia: 5,
    descontoPontualidadePct: 0,
    diaLimiteDesconto: 5,
    emiteBoleto: true,
    tipoReajuste: "IGPM",
    mesBase: 1,
  },
];

const socios: EmpSocio[] = [
  {
    id: "so-1",
    developmentId: "dev-1",
    nome: "Sócio Alpha",
    documento: "111.222.333-44",
    percentual: 60,
  },
];

const allOn: EmpReportSections = Object.fromEntries(
  (Object.keys(DEFAULT_EMP_REPORT_SECTIONS) as (keyof EmpReportSections)[]).map(
    (k) => [k, true]
  )
) as EmpReportSections;

const html = buildEmpreendimentoReportHtml({
  empresa: {
    razaoSocial: "Meu Lote Fácil Ltda",
    nomeFantasia: "Meu Lote Fácil",
    cnpj: "00.000.000/0001-00",
    telefone: "(19) 9999-0000",
    email: "contato@meulotefacil.com.br",
  },
  development,
  lots,
  contracts,
  socios,
  sections: allOn,
  logoUrl: `https://example.com${SITE_LOGO_PATH}`,
  geradoEm: "27/11/2026, 11:00:00",
});

assert(html.includes("Meu Lote Fácil Ltda"), "empresa razao");
assert(html.includes("00.000.000/0001-00"), "cnpj");
assert(html.includes(SITE_LOGO_PATH), "logo path");
assert(html.includes("Residencial Horizonte"), "emp nome");
assert(html.includes("Jardim das Flores"), "bairro");
assert(html.includes("1º RI Campinas"), "cartorio");
assert(html.includes("CT-998"), "certidao");
assert(html.includes("planta-horizonte.dxf"), "planta");
assert(html.includes("disponivel"), "lote status");
assert(html.includes("Ana Souza"), "contrato");
assert(html.includes("Sócio Alpha"), "socio");
assert(html.includes("#ED8600"), "brand color");
assert(html.includes("Montserrat"), "font");
assert(html.includes("Lotes · detalhe"), "detalhe section");
assert(html.includes("Observação de teste"), "obs");

const minimal = buildEmpreendimentoReportHtml({
  empresa: {
    razaoSocial: "X",
    cnpj: "1",
  },
  development,
  lots,
  contracts,
  sections: {
    ...DEFAULT_EMP_REPORT_SECTIONS,
    empresa: false,
    logo: false,
    cartorioCertidao: false,
    lotesResumo: false,
    lotesDetalhe: false,
    contratos: false,
    socios: false,
    planta: false,
    dadosEmp: true,
  },
});
assert(!minimal.includes("Empresa emitente</h2>"), "sem seção empresa");
assert(!minimal.includes("<img"), "sem logo");
// Cabeçalho sempre leva razão/CNPJ mesmo com seção empresa desligada.
assert(minimal.includes(">X</strong>") || minimal.includes("CNPJ 1"), "header empresa");
assert(minimal.includes("Empreendimento</h2>"), "só dados emp");
assert(!minimal.includes("Cartório e certidão"), "sem cartorio");

console.log("ok: empreendimento-report");

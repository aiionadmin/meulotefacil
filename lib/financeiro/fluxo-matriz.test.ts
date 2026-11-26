import {
  buildFluxoMatriz,
  buildResultadosMensais,
  periodKey,
} from "./fluxo-matriz";
import type {
  Categoria,
  Pagamento,
  PlanoConta,
  Recebimento,
} from "@/lib/domain/financeiro-types";

if (periodKey("2026-03-15", "mensal") !== "2026-03") {
  throw new Error("periodKey mensal");
}
if (periodKey("2026-03-15", "diario") !== "2026-03-15") {
  throw new Error("periodKey diario");
}

const planos: PlanoConta[] = [
  {
    id: "p-desp",
    nome: "Despesas Operacionais",
    fluxo: "despesas",
    grupoResultados: "Despesas Operacionais",
    ativo: true,
  },
  {
    id: "p-rec",
    nome: "Receitas",
    fluxo: "receitas",
    grupoResultados: "Receita Operacional Bruta",
    ativo: true,
  },
];

const categorias: Categoria[] = [
  {
    id: "cat1",
    nome: "Materiais",
    planoId: "p-desp",
    classificacaoObra: "Materiais",
    ativo: true,
  },
];

const pagamentos: Pagamento[] = [
  {
    id: "pag1",
    lancamentoId: "l1",
    parcela: "1/1",
    vencimento: "2026-02-10",
    valor: 1000,
    valorPago: 1000,
    status: "pago",
    favorecido: "Fornecedor",
    descricao: "Cimento",
    categoriaId: "cat1",
    contaId: "c1",
    centroLabel: "Obra Alpha",
    forma: "pix",
    condicao: "a_vista",
    pagoEm: "2026-02-10",
    conciliado: true,
    historico: [],
  },
  {
    id: "pag2",
    lancamentoId: "l2",
    parcela: "1/1",
    vencimento: "2026-03-10",
    valor: 500,
    valorPago: 0,
    status: "em_aberto",
    favorecido: "Fornecedor",
    descricao: "Areia",
    categoriaId: "cat1",
    contaId: "c1",
    centroLabel: "Obra Alpha",
    forma: "boleto",
    condicao: "a_vista",
    conciliado: false,
    historico: [],
  },
];

const recebimentos: Recebimento[] = [
  {
    id: "rec1",
    origem: "contrato",
    parcela: "1/12",
    vencimento: "2026-02-05",
    valor: 3000,
    valorRecebido: 3000,
    status: "recebido",
    cliente: "Ana",
    descricao: "Parcela",
    contaId: "c1",
    centroLabel: "Obra Alpha",
    forma: "boleto",
    recebidoEm: "2026-02-05",
    conciliado: true,
  },
];

const matriz = buildFluxoMatriz({
  planos,
  categorias,
  pagamentos,
  recebimentos,
  saldoInicial: 10000,
  visao: "geral",
  granularidade: "mensal",
});

if (!matriz.periodos.includes("2026-02")) throw new Error("faltou 2026-02");
if (matriz.linhas.length < 1) throw new Error("sem linhas");
if (matriz.saldos.length !== matriz.periodos.length) {
  throw new Error("saldos ≠ períodos");
}

const res = buildResultadosMensais({
  planos,
  categorias,
  pagamentos,
  recebimentos,
  visao: "geral",
  regime: "caixa",
});
if (!res.meses.includes("2026-02")) throw new Error("resultados sem mês");
if (!res.linhas.some((l) => l.grupo === "Receita Operacional Bruta")) {
  throw new Error("faltou receita");
}

console.log("fluxo-matriz.test ok", matriz.periodos.length, "períodos");

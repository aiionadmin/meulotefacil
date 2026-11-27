/** Regras editáveis do sistema — Configurações (spec §10). */

export type IndexDef = {
  codigo: string;
  nome: string;
  abreviatura: string;
  /** Usado como índice de correção por atraso quando marcado. */
  correcaoAtraso: boolean;
  ativo: boolean;
};

export type EncargosParams = {
  diasToleranciaMora: number;
  taxaMoraMes: number;
  diaInicioMulta: number;
  taxaMulta: number;
  multaDiferenciada: boolean;
  multaAcumulativa: boolean;
  encargosPorEmpreendimento: boolean;
  calcularSobreDespesaBancaria: boolean;
};

export type VendasParams = {
  /** Dias que um lote pode ficar reservado (validade padrão). */
  validadeReservaDias: number;
  planoAutomatico: boolean;
  gerarParcelasNaVenda: boolean;
  veiculoComunicacaoObrigatorio: boolean;
  dataReajusteObrigatoria: boolean;
  comissaoPadraoPct: number;
  comissaoSobre: "preco_lote" | "entrada_intermediarias";
  validarComissao: boolean;
  transferenciaCobraTaxa: boolean;
  impedirTransferenciaComDebito: boolean;
  mascaraLote: string;
  pesquisaPadrao: "comprador" | "lote" | "segundo_comprador" | "proposta";
  camposLiberados: {
    dataLancamento: boolean;
    area: boolean;
    confrontacoes: boolean;
    juros: boolean;
    preco: boolean;
    valorM2: boolean;
    valorTotal: boolean;
  };
};

export type ReajusteParams = {
  indicePadrao: string;
  baseAnualMes: number;
  gerarResiduo: boolean;
  permitirDesfazer: boolean;
  acrescimoPercentual: number;
  arredondarInteiros: boolean;
  primeiraParcelaProRata: boolean;
};

export type BoletosParams = {
  mensagemPadrao: string;
  nossoNumeroSeq: number;
  travaEmissaoAtraso: boolean;
  despesaBancaria: number;
  bloquearParcelaComBoleto: boolean;
  atualizarBoletoVencido: boolean;
};

export type AparenciaParams = {
  corDisponivel: string;
  corReservado: string;
  corVendido: string;
  mascaraLote: string;
  pesquisaPadrao: string;
};

export type SystemSettingsState = {
  /** Índice padrão a usar em contratos / reajuste / correção. */
  indicePadrao: string;
  indices: IndexDef[];
  encargos: EncargosParams;
  vendas: VendasParams;
  reajuste: ReajusteParams;
  boletos: BoletosParams;
  aparencia: AparenciaParams;
};

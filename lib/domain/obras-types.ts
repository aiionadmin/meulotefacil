/** Parte 2 — Obras, catálogo, orçamento e RDO. */

export type ObraStatus =
  | "em_orcamento"
  | "em_andamento"
  | "paralisada"
  | "finalizada";

export type InsumoGrupo =
  | "material"
  | "mao_de_obra"
  | "equipamento"
  | "outros";

export type BudgetNodeKind = "etapa" | "subetapa" | "item";

export type RdoStatus = "rascunho" | "enviado" | "aprovado" | "devolvido";

export type Insumo = {
  id: string;
  codigo: string;
  descricao: string;
  grupo: InsumoGrupo;
  unidade: string;
  tipo?: string;
  base: string;
  custoUnitario: number;
  favorito: boolean;
  ativo: boolean;
  observacoes?: string;
};

export type ComposicaoItem = {
  id: string;
  insumoId: string;
  coeficiente: number;
};

export type Composicao = {
  id: string;
  codigo: string;
  descricao: string;
  unidade: string;
  tipo?: string;
  base: string;
  descricaoDetalhada?: string;
  favorito: boolean;
  ativo: boolean;
  bdiPct: number;
  itens: ComposicaoItem[];
};

export type Obra = {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  status: ObraStatus;
  clienteNome: string;
  developmentId?: string;
  developmentNome?: string;
  areaTotal?: number;
  unidade: string;
  art?: string;
  ceiCno?: string;
  responsavelTecnico?: string;
  responsavelObra?: string;
  visivelPara: string[];
  fisicoPct: number;
  orcado: number;
  realizado: number;
  bdiPct: number;
  cidade?: string;
  uf?: string;
};

export type OrcamentoNode = {
  id: string;
  obraId: string;
  parentId?: string;
  kind: BudgetNodeKind;
  codigo: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  custoUnit: number;
  orcado: number;
  realizado: number;
  fisicoPct: number;
  bdiPct: number;
  composicaoId?: string;
  insumoId?: string;
  grupo?: InsumoGrupo;
  ordem: number;
};

export type CronogramaItem = {
  id: string;
  obraId: string;
  nodeId?: string;
  label: string;
  duracaoDias: number;
  inicio: string;
  fim: string;
  predecessorId?: string;
};

export type CurvaSPonto = {
  periodo: string;
  planejadoFisico: number;
  realizadoFisico: number;
  planejadoFinanceiro: number;
  realizadoFinanceiro: number;
};

export type RdoClimaTurno = {
  clima: "claro" | "nublado" | "chuvoso";
  condicao: "praticavel" | "impraticavel";
};

export type Rdo = {
  id: string;
  obraId: string;
  numero: number;
  data: string;
  responsavel: string;
  status: RdoStatus;
  motivoDevolucao?: string;
  prazoContratual?: string;
  clima: {
    manha: RdoClimaTurno;
    tarde: RdoClimaTurno;
    noite: RdoClimaTurno;
    chuvaMm?: number;
  };
  efetivo: {
    tipo: "propria" | "terceirizada";
    funcao: string;
    quantidade: number;
    horas: number;
    fornecedor?: string;
  }[];
  equipamentos: {
    nome: string;
    quantidade: number;
    situacao: "em_uso" | "parado" | "manutencao";
    horas: number;
  }[];
  atividades: {
    nodeId?: string;
    descricao: string;
    situacao: "iniciada" | "em_andamento" | "concluida" | "paralisada";
    quantidade: number;
    fisicoAcumulado: number;
  }[];
  materiais: {
    descricao: string;
    quantidade: number;
    fornecedor?: string;
  }[];
  ocorrencias: {
    tipo: string;
    descricao: string;
    horario?: string;
    impactoPrazo: boolean;
  }[];
  observacoes?: string;
  efetivoTotal: number;
  /** Fotos locais (demo: data URL); produção usará storage. */
  fotos?: { id: string; legenda: string; dataUrl: string }[];
};

export type ObrasCatalogState = {
  insumos: Insumo[];
  composicoes: Composicao[];
  obras: Obra[];
  nodes: OrcamentoNode[];
  cronograma: CronogramaItem[];
  curvaS: Record<string, CurvaSPonto[]>;
  rdos: Rdo[];
};

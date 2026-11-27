/** Tipos alinhados ao schema Fase 1 (docs/especificacao.md §12). */

export type PersonTipo = "fisica" | "juridica";
export type PersonPapel =
  | "cliente"
  | "comprador"
  | "fornecedor"
  | "profissional"
  | "corretor"
  | "socio"
  | "pre_cadastro";

export type ProfileCodigo =
  | "administrador"
  | "direcao"
  | "financeiro"
  | "engenharia"
  | "obras"
  | "suprimentos"
  | "comercial"
  | "corretor"
  | "atendimento"
  | "cobranca"
  | "juridico"
  | "regularizacao";

export type Organization = {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  telefone: string;
  email: string;
  advogadoNome: string;
  advogadoOab: string;
};

export type Profile = {
  id: string;
  codigo: ProfileCodigo;
  nome: string;
  descricao: string;
};

export type AppUser = {
  id: string;
  nome: string;
  email: string;
  status: "ativo" | "inativo";
  chave: boolean;
  profileId: string;
  organizationIds: string[];
  /** J02/C01 — se true, vê todas as empresas do seletor. */
  todasEmpresas?: boolean;
  /** J02 — se true, vê todas as obras/empreendimentos. */
  verTodasObras?: boolean;
  /** J02 — empreendimentos visíveis quando verTodasObras=false. */
  developmentIds?: string[];
  /** J02 — obras visíveis quando verTodasObras=false. */
  obraIds?: string[];
};

export type Person = {
  id: string;
  tipo: PersonTipo;
  status: string;
  nome: string;
  nomeFantasia?: string;
  documento: string;
  papeis: PersonPapel[];
  telefone1?: string;
  celular?: string;
  email?: string;
  cidade?: string;
  uf?: string;
  creci?: string;
  qualificacao?: number;
  observacoes?: string;
  createdAt: string;
  /** H08 — cadastro completo do comprador */
  sexo?: string;
  nascimento?: string;
  nacionalidade?: string;
  naturalidade?: string;
  filiacao?: string;
  profissao?: string;
  rg?: string;
  renda?: number;
  estadoCivil?: string;
  regimeBens?: string;
  conjugeNome?: string;
  conjugeDocumento?: string;
  enderecoResidencial?: string;
  enderecoComercial?: string;
  procuradorNome?: string;
  procuradorDocumento?: string;
};

export type LookupList = {
  id: string;
  codigo: string;
  nome: string;
  itens: { codigo: string; nome: string; ordem: number; ativo: boolean; meta?: Record<string, unknown> }[];
};

export type AppFile = {
  id: string;
  nome: string;
  rotina: string;
  tag: string;
  tamanho: string;
  comentario?: string;
  createdAt: string;
};

export type AppTask = {
  id: string;
  titulo: string;
  status: "a_fazer" | "em_andamento" | "concluida";
  prioridade: "baixa" | "media" | "alta";
  prazo?: string;
  responsavelNome?: string;
};

export type AppNotification = {
  id: string;
  titulo: string;
  corpo?: string;
  lida: boolean;
  link?: string;
  createdAt: string;
};

export type AuditEvent = {
  id: string;
  quando: string;
  usuarioNome: string;
  rotina: string;
  acao: string;
  registroTipo?: string;
  registroId?: string;
  antes?: unknown;
  depois?: unknown;
};

export type ProfilePermission = {
  profileId: string;
  rotina: string;
  ver: boolean;
  inserirAlterar: boolean;
  remover: boolean;
};

export type ApprovalRule = {
  id: string;
  tipo: string;
  perfilNome: string;
  valorMinimo?: number;
  /** Faixa superior (inclusive). Sem valor = sem teto. */
  valorMaximo?: number;
  /** Centro de custo da regra (compras). */
  centroTipo?: "obra" | "empresa" | "qualquer";
  ativo: boolean;
};

export type Fase1State = {
  organization: Organization;
  profiles: Profile[];
  users: AppUser[];
  people: Person[];
  lookups: LookupList[];
  files: AppFile[];
  tasks: AppTask[];
  notifications: AppNotification[];
  audit: AuditEvent[];
  approvalRules: ApprovalRule[];
  permissions: ProfilePermission[];
  currentUserId: string;
};

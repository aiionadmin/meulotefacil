import type { Fase1State } from "./fase1-types";
import { defaultPermissionsForProfile } from "@/lib/permissions/routines";

/** @deprecated A01 — persistência via store_snapshots, não localStorage. */
export const FASE1_STORAGE_KEY = "mlf-fase1-store-v1";

export function seedFase1(): Fase1State {
  const orgId = "org-demo";
  const profiles = [
    { id: "pf-admin", codigo: "administrador" as const, nome: "Administrador", descricao: "Tudo, inclusive Configurações e Auditoria" },
    { id: "pf-dir", codigo: "direcao" as const, nome: "Direção", descricao: "Leitura; aprova alçadas; resultados" },
    { id: "pf-fin", codigo: "financeiro" as const, nome: "Financeiro", descricao: "Financeiro, Fiscal, Recebimentos" },
    { id: "pf-eng", codigo: "engenharia" as const, nome: "Engenharia", descricao: "Obras, orçamentos, solicitações" },
    { id: "pf-obr", codigo: "obras" as const, nome: "Obras", descricao: "Campo: SC próprias, pré-lançamentos, tarefas" },
    { id: "pf-sup", codigo: "suprimentos" as const, nome: "Suprimentos", descricao: "Compras, fornecedores, insumos" },
    { id: "pf-com", codigo: "comercial" as const, nome: "Comercial", descricao: "Comercial e Jornada" },
    { id: "pf-cor", codigo: "corretor" as const, nome: "Corretor", descricao: "Próprios leads, propostas e vendas" },
    { id: "pf-ate", codigo: "atendimento" as const, nome: "Atendimento e caixa", descricao: "Caixa, cadastro, conversas" },
    { id: "pf-cob", codigo: "cobranca" as const, nome: "Cobrança", descricao: "Inadimplentes, régua, acordos" },
    { id: "pf-jur", codigo: "juridico" as const, nome: "Jurídico", descricao: "Processos, acordos, retomada" },
    { id: "pf-reu", codigo: "regularizacao" as const, nome: "Regularização", descricao: "Escrituras, cartórios, documentos" },
  ];

  return {
    organization: {
      id: orgId,
      razaoSocial: "Meu Lote Fácil Ltda",
      nomeFantasia: "Meu Lote Fácil",
      cnpj: "12.345.678/0001-90",
      telefone: "(19) 99146-1834",
      email: "contato@meulotefacil.com.br",
      advogadoNome: "Dr. Silva",
      advogadoOab: "OAB/SP 123456",
    },
    profiles,
    users: [
      {
        id: "u-admin",
        nome: "Administrador",
        email: "admin@meulotefacil.com.br",
        status: "ativo",
        chave: true,
        profileId: "pf-admin",
        organizationIds: [orgId],
      },
      {
        id: "u-fin",
        nome: "Financeiro",
        email: "financeiro@meulotefacil.com.br",
        status: "ativo",
        chave: false,
        profileId: "pf-fin",
        organizationIds: [orgId],
      },
      {
        id: "u-com",
        nome: "Comercial",
        email: "vendas@meulotefacil.com.br",
        status: "ativo",
        chave: false,
        profileId: "pf-com",
        organizationIds: [orgId],
      },
    ],
    people: [
      {
        id: "p-ana",
        tipo: "fisica",
        status: "ativo",
        nome: "Ana Souza",
        documento: "321.654.987-00",
        papeis: ["comprador", "cliente"],
        celular: "(19) 99111-2200",
        email: "ana.souza@email.com",
        cidade: "Campinas",
        uf: "SP",
        createdAt: "2026-06-01T12:00:00.000Z",
      },
      {
        id: "p1",
        tipo: "fisica",
        status: "ativo",
        nome: "Bruno Lima",
        documento: "123.456.789-00",
        papeis: ["comprador", "cliente"],
        celular: "(19) 99100-1001",
        email: "bruno@email.com",
        cidade: "Campinas",
        uf: "SP",
        createdAt: "2026-11-25T12:00:00.000Z",
      },
      {
        id: "p2",
        tipo: "juridica",
        status: "ativo",
        nome: "Construtora Horizonte Ltda",
        nomeFantasia: "Horizonte",
        documento: "12.345.678/0001-90",
        papeis: ["fornecedor"],
        telefone1: "(19) 3232-4400",
        cidade: "Campinas",
        uf: "SP",
        qualificacao: 5,
        createdAt: "2026-11-25T12:00:00.000Z",
      },
      {
        id: "p3",
        tipo: "fisica",
        status: "ativo",
        nome: "Ana Paula Corretores",
        documento: "987.654.321-00",
        papeis: ["corretor"],
        celular: "(19) 98888-2200",
        cidade: "Valinhos",
        uf: "SP",
        creci: "SP-123456",
        createdAt: "2026-11-25T12:00:00.000Z",
      },
      {
        id: "p4",
        tipo: "fisica",
        status: "afastado",
        nome: "José Favorecido Silva",
        documento: "111.222.333-44",
        papeis: ["profissional", "fornecedor"],
        celular: "(19) 97777-3300",
        cidade: "Hortolândia",
        uf: "SP",
        createdAt: "2026-11-25T12:00:00.000Z",
      },
      {
        id: "p5",
        tipo: "fisica",
        status: "ativo",
        nome: "Maria Souza",
        documento: "555.666.777-88",
        papeis: ["comprador", "pre_cadastro"],
        celular: "(19) 96666-4400",
        cidade: "Amparo",
        uf: "SP",
        createdAt: "2026-11-25T12:00:00.000Z",
      },
    ],
    lookups: [
      {
        id: "lk-motivos_perda",
        codigo: "motivos_perda",
        nome: "Motivos de perda",
        itens: [
        { codigo: "preco", nome: "Preço", ordem: 1, ativo: true },
        { codigo: "concorrencia", nome: "Concorrência", ordem: 2, ativo: true },
        { codigo: "sem_retorno", nome: "Sem retorno", ordem: 3, ativo: true }
        ],
      },

      {
        id: "lk-tipos_demanda",
        codigo: "tipos_demanda",
        nome: "Tipos de demanda",
        itens: [
        { codigo: "agua", nome: "Ligação de água", ordem: 1, ativo: true },
        { codigo: "energia", nome: "Ligação de energia", ordem: 2, ativo: true },
        { codigo: "marcacao", nome: "Marcação de lote", ordem: 3, ativo: true }
        ],
      },

      {
        id: "lk-tipos_retencao",
        codigo: "tipos_retencao",
        nome: "Tipos de retenção",
        itens: [
        { codigo: "inss", nome: "INSS", ordem: 1, ativo: true },
        { codigo: "iss", nome: "ISS", ordem: 2, ativo: true },
        { codigo: "irrf", nome: "IRRF", ordem: 3, ativo: true }
        ],
      },

      {
        id: "lk-unidades",
        codigo: "unidades",
        nome: "Unidades",
        itens: [
        { codigo: "un", nome: "UN", ordem: 1, ativo: true },
        { codigo: "m2", nome: "m²", ordem: 2, ativo: true },
        { codigo: "m3", nome: "m³", ordem: 3, ativo: true },
        { codigo: "kg", nome: "kg", ordem: 4, ativo: true },
        { codigo: "h", nome: "Hora", ordem: 5, ativo: true }
        ],
      },

      {
        id: "lk-tipos_obra",
        codigo: "tipos_obra",
        nome: "Tipos de obra",
        itens: [
        { codigo: "loteamento", nome: "Loteamento", ordem: 1, ativo: true },
        { codigo: "construcao", nome: "Construção", ordem: 2, ativo: true },
        { codigo: "regularizacao", nome: "Regularização", ordem: 3, ativo: true }
        ],
      },

      {
        id: "l1",
        codigo: "status_lote",
        nome: "Status do lote",
        itens: [
          { codigo: "disponivel", nome: "Disponível", ordem: 1, ativo: true, meta: { bloqueia_venda: false } },
          { codigo: "reservado", nome: "Reservado", ordem: 2, ativo: true, meta: { bloqueia_venda: true } },
          { codigo: "vendido", nome: "Vendido", ordem: 3, ativo: true, meta: { bloqueia_venda: true } },
          { codigo: "quitado", nome: "Quitado", ordem: 4, ativo: true },
          { codigo: "escritura", nome: "Escritura", ordem: 5, ativo: true },
          { codigo: "juridico", nome: "Jurídico", ordem: 6, ativo: true },
        ],
      },
      {
        id: "l2",
        codigo: "tipos_parcela",
        nome: "Tipos de parcela",
        itens: [
          { codigo: "P", nome: "Prestação", ordem: 1, ativo: true, meta: { sofre_reajuste: true } },
          { codigo: "E", nome: "Sinal", ordem: 2, ativo: true },
          { codigo: "@", nome: "Acordo/Renegociação", ordem: 3, ativo: true },
        ],
      },
      {
        id: "l3",
        codigo: "formas_pagamento",
        nome: "Formas de pagamento",
        itens: [
          { codigo: "pix", nome: "Pix", ordem: 1, ativo: true },
          { codigo: "boleto", nome: "Boleto", ordem: 2, ativo: true },
          { codigo: "dinheiro", nome: "Dinheiro", ordem: 3, ativo: true },
        ],
      },
      {
        id: "l4",
        codigo: "tipos_empreendimento",
        nome: "Tipos de empreendimento",
        itens: [
          { codigo: "loteamento", nome: "Loteamento", ordem: 1, ativo: true },
          { codigo: "regularizacao", nome: "Regularização", ordem: 2, ativo: true },
          { codigo: "avcb", nome: "AVCB", ordem: 3, ativo: true },
          { codigo: "construcao", nome: "Construção", ordem: 4, ativo: true },
        ],
      },
      {
        id: "lk-bases_insumo",
        codigo: "bases_insumo",
        nome: "Bases de insumos",
        itens: [
          { codigo: "sinapi", nome: "SINAPI", ordem: 1, ativo: true },
          { codigo: "sicro", nome: "SICRO", ordem: 2, ativo: true },
          { codigo: "propria", nome: "Base própria", ordem: 3, ativo: true },
        ],
      },
      {
        id: "lk-bases_comp",
        codigo: "bases_composicao",
        nome: "Bases de composições",
        itens: [
          { codigo: "tcpo", nome: "TCPO", ordem: 1, ativo: true },
          { codigo: "propria", nome: "Composição própria", ordem: 2, ativo: true },
        ],
      },
      {
        id: "lk-solicitantes",
        codigo: "solicitantes",
        nome: "Solicitantes",
        itens: [
          { codigo: "engenharia", nome: "Engenharia", ordem: 1, ativo: true },
          { codigo: "comercial", nome: "Comercial", ordem: 2, ativo: true },
          { codigo: "financeiro", nome: "Financeiro", ordem: 3, ativo: true },
        ],
      },
      {
        id: "lk-cond_pag",
        codigo: "condicoes_pagamento",
        nome: "Condições de pagamento",
        itens: [
          { codigo: "a_vista", nome: "À vista", ordem: 1, ativo: true },
          { codigo: "7d", nome: "7 dias", ordem: 2, ativo: true },
          { codigo: "14d", nome: "14 dias", ordem: 3, ativo: true },
          { codigo: "30d", nome: "30 dias", ordem: 4, ativo: true },
        ],
      },
      {
        id: "lk-seg_forn",
        codigo: "segmentos_fornecedor",
        nome: "Segmentos de fornecedor",
        itens: [
          { codigo: "materiais", nome: "Materiais", ordem: 1, ativo: true },
          { codigo: "servicos", nome: "Serviços", ordem: 2, ativo: true },
          { codigo: "equipamentos", nome: "Equipamentos", ordem: 3, ativo: true },
        ],
      },
      {
        id: "lk-fontes_cli",
        codigo: "fontes_cliente",
        nome: "Fontes de cliente",
        itens: [
          { codigo: "indicacao", nome: "Indicação", ordem: 1, ativo: true },
          { codigo: "digital", nome: "Digital", ordem: 2, ativo: true },
          { codigo: "placa", nome: "Placa", ordem: 3, ativo: true },
        ],
      },
      {
        id: "lk-setores_cli",
        codigo: "setores_cliente",
        nome: "Setores de cliente",
        itens: [
          { codigo: "pf", nome: "Pessoa física", ordem: 1, ativo: true },
          { codigo: "pj", nome: "Pessoa jurídica", ordem: 2, ativo: true },
          { codigo: "investidor", nome: "Investidor", ordem: 3, ativo: true },
        ],
      },
      {
        id: "lk-tags_arquivo",
        codigo: "tags_arquivo",
        nome: "Tags de arquivo",
        itens: [
          { codigo: "documento", nome: "Documento", ordem: 1, ativo: true },
          { codigo: "planta", nome: "Planta", ordem: 2, ativo: true },
          { codigo: "contrato", nome: "Contrato", ordem: 3, ativo: true },
          { codigo: "fiscal", nome: "Fiscal", ordem: 4, ativo: true },
        ],
      },
    ],
    files: [
      {
        id: "f1",
        nome: "rg-bruno.pdf",
        rotina: "Cadastros",
        tag: "Documento",
        tamanho: "240 KB",
        createdAt: "2026-11-25T12:00:00.000Z",
      },
      {
        id: "f2",
        nome: "contrato-social-horizonte.pdf",
        rotina: "Cadastros",
        tag: "CNPJ",
        tamanho: "1,1 MB",
        createdAt: "2026-11-25T12:00:00.000Z",
      },
    ],
    tasks: [
      {
        id: "t1",
        titulo: "Completar cadastro de Maria Souza",
        status: "a_fazer",
        prioridade: "alta",
        prazo: "28/11/2026",
        responsavelNome: "Comercial",
      },
      {
        id: "t2",
        titulo: "Revisar perfil Corretor",
        status: "em_andamento",
        prioridade: "media",
        prazo: "30/11/2026",
        responsavelNome: "Administrador",
      },
    ],
    notifications: [
      {
        id: "n1",
        titulo: "Bem-vindo ao Meu Lote Fácil",
        corpo: "Acesso, pessoas, arquivos e auditoria estão ativos.",
        lida: false,
        link: "/cadastros/pessoas",
        createdAt: "2026-11-25T12:00:00.000Z",
      },
      {
        id: "n2",
        titulo: "Tarefa atribuída",
        corpo: "Completar cadastro de Maria Souza",
        lida: false,
        link: "/tarefas",
        createdAt: "2026-11-25T12:00:00.000Z",
      },
    ],
    audit: [
      {
        id: "a1",
        quando: "2026-11-25T12:00:00.000Z",
        usuarioNome: "Sistema",
        rotina: "Sistema",
        acao: "Carga inicial do ambiente",
      },
    ],
    approvalRules: [
      {
        id: "ar1",
        tipo: "Ordem de compra",
        perfilNome: "Financeiro",
        valorMinimo: 5000,
        ativo: true,
      },
      {
        id: "ar2",
        tipo: "Estorno de recebimento",
        perfilNome: "Administrador",
        ativo: true,
      },
      {
        id: "ar3",
        tipo: "Desconto acima do limite",
        perfilNome: "Direção",
        valorMinimo: 5,
        ativo: true,
      },
      {
        id: "ar4",
        tipo: "Conciliação bancária",
        perfilNome: "Financeiro",
        ativo: true,
      },
      {
        id: "ar-rdo",
        tipo: "RDO",
        perfilNome: "Engenharia",
        ativo: true,
      },
      {
        id: "ar-rel-ger",
        tipo: "Relatório Gerencial",
        perfilNome: "Direção",
        ativo: true,
      },
      {
        id: "ar-sc",
        tipo: "Solicitação de compra",
        perfilNome: "Suprimentos",
        valorMinimo: 5000,
        ativo: true,
      },
      {
        id: "ar-desconc",
        tipo: "Desconciliar",
        perfilNome: "Financeiro",
        ativo: true,
      },
      {
        id: "ar-card",
        tipo: "Correção de avanço de card",
        perfilNome: "Administrador",
        ativo: true,
      },
    ],
    permissions: profiles.flatMap((p) =>
      defaultPermissionsForProfile(p.codigo).map((row) => ({
        profileId: p.id,
        ...row,
      }))
    ),
    currentUserId: "u-admin",
  };
}

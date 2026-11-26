-- Bloco G — Financeiro Mais Controle
-- Spec: docs/prompt-unico-meu-lote-facil.md Bloco G / Anexo 4

create table if not exists public.planos_conta (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  nome text not null,
  fluxo text not null check (fluxo in ('receitas', 'despesas')),
  grupo_resultados text not null,
  ativo boolean not null default true,
  unique (organization_id, nome)
);

create table if not exists public.categorias_financeiras (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  nome text not null,
  plano_id uuid not null references public.planos_conta (id),
  classificacao_obra text,
  ativo boolean not null default true,
  unique (organization_id, nome)
);

create table if not exists public.naturezas_receita (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  nome text not null,
  ativo boolean not null default true,
  unique (organization_id, nome)
);

create table if not exists public.contas_bancarias (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  nome text not null,
  banco text,
  tipo text not null check (tipo in ('corrente', 'poupanca', 'caixa')),
  proprietario text not null check (proprietario in ('empresa', 'cliente')),
  data_inicial date not null,
  valor_inicial numeric(14,2) not null default 0,
  saldo numeric(14,2) not null default 0,
  ativa boolean not null default true,
  bloqueio_ate date,
  boleto boolean not null default false
);

create table if not exists public.lancamentos (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  descricao text not null,
  favorecido text not null,
  categoria_id uuid references public.categorias_financeiras (id),
  competencia date not null,
  vencimento date not null,
  pagador text,
  conta_id uuid references public.contas_bancarias (id),
  valor numeric(14,2) not null,
  numero_doc text,
  forma text,
  condicao text,
  order_id uuid,
  observacoes text,
  created_at timestamptz not null default now()
);

create table if not exists public.lancamento_centros (
  id uuid primary key default gen_random_uuid(),
  lancamento_id uuid not null references public.lancamentos (id) on delete cascade,
  centro_tipo text not null check (centro_tipo in ('obra', 'empresa')),
  obra_id uuid references public.obras (id),
  label text not null,
  valor numeric(14,2),
  pct numeric(8,4)
);

create table if not exists public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  lancamento_id uuid references public.lancamentos (id),
  parcela text,
  vencimento date not null,
  valor numeric(14,2) not null,
  valor_pago numeric(14,2) not null default 0,
  status text not null default 'em_aberto',
  favorecido text,
  descricao text,
  categoria_id uuid,
  conta_id uuid references public.contas_bancarias (id),
  centro_label text,
  forma text,
  condicao text,
  numero_doc text,
  pago_em date,
  conciliado boolean not null default false
);

create table if not exists public.faturamentos (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  descricao text not null,
  cliente text not null,
  natureza_id uuid references public.naturezas_receita (id),
  competencia date not null,
  vencimento date not null,
  centro_tipo text not null,
  obra_id uuid references public.obras (id),
  centro_label text not null,
  conta_id uuid references public.contas_bancarias (id),
  valor_bruto numeric(14,2) not null,
  impostos_retidos numeric(14,2) not null default 0,
  valor_liquido numeric(14,2) not null,
  forma text,
  vendedor text,
  created_at timestamptz not null default now()
);

create table if not exists public.recebimentos (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  faturamento_id uuid references public.faturamentos (id),
  origem text not null check (origem in ('faturamento', 'contrato')),
  contrato_ref text,
  parcela text,
  vencimento date not null,
  valor numeric(14,2) not null,
  valor_recebido numeric(14,2) not null default 0,
  status text not null default 'em_aberto',
  cliente text,
  descricao text,
  natureza_id uuid,
  conta_id uuid references public.contas_bancarias (id),
  centro_label text,
  forma text,
  recebido_em date,
  conciliado boolean not null default false
);

create table if not exists public.pre_lancamentos (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  descricao text not null,
  valor numeric(14,2) not null,
  centro_tipo text not null,
  obra_id uuid,
  centro_label text not null,
  solicitante text,
  status text not null default 'pendente'
    check (status in ('pendente', 'aprovado', 'recusado')),
  motivo_recusa text,
  lancamento_id uuid references public.lancamentos (id),
  created_at timestamptz not null default now()
);

create table if not exists public.transferencias (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  data date not null,
  descricao text,
  de_conta_id uuid not null references public.contas_bancarias (id),
  para_conta_id uuid not null references public.contas_bancarias (id),
  valor numeric(14,2) not null,
  pago boolean not null default false
);

create table if not exists public.notas_fiscais (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  emissao date not null,
  serie text,
  numero text,
  situacao text,
  emissor text,
  cnpj text,
  valor numeric(14,2) not null,
  lancada boolean not null default false,
  lancamento_id uuid references public.lancamentos (id),
  meu_cnpj text
);

create table if not exists public.financeiro_config (
  organization_id uuid primary key references public.organizations (id),
  meses_provisionamento int not null default 12,
  numero_doc_obrigatorio_lancamento boolean not null default false,
  numero_doc_obrigatorio_pagamento boolean not null default false
);

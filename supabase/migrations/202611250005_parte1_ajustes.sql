-- Parte 1 — multiempresas, modalidade, leads qualificados, planta PDF, kanban só avançar
-- Spec: docs/prompt-cursor-meu-lote-facil.md §2

-- ---------------------------------------------------------------------------
-- Organizations = empresas (status, logo, endereço já parcial)
-- ---------------------------------------------------------------------------
alter table public.organizations
  add column if not exists status text not null default 'ativa',
  add column if not exists logo_url text;

comment on table public.organizations is
  'Empresas do tenant; alias de negócio: empresas. RLS por membership.';

-- Preferência de empresa ativa por usuário (inclui "todas")
create table if not exists public.user_empresa_preference (
  user_id uuid primary key references public.users (id) on delete cascade,
  empresa_id uuid references public.organizations (id),
  todas boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.user_empresa_preference enable row level security;

-- Visibilidade de obras por usuário (Parte 1 base; obras completas na Parte 2)
create table if not exists public.user_obra_visibility (
  user_id uuid not null references public.users (id) on delete cascade,
  obra_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, obra_id)
);

alter table public.user_obra_visibility enable row level security;

-- ---------------------------------------------------------------------------
-- Empreendimento: modalidade + planta PDF
-- ---------------------------------------------------------------------------
alter table public.developments
  add column if not exists modalidade text not null default 'loteamento'
    check (modalidade in ('loteamento', 'regularizacao', 'ambos'));

create table if not exists public.development_plant_pdfs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  development_id uuid not null references public.developments (id) on delete cascade,
  versao int not null default 1,
  folha int not null default 1,
  storage_path text not null,
  preview_path text,
  autor text,
  notas text,
  created_at timestamptz not null default now(),
  created_by uuid,
  unique (development_id, versao, folha)
);

create table if not exists public.lot_plant_polygons (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  development_id uuid not null references public.developments (id) on delete cascade,
  plant_pdf_id uuid not null references public.development_plant_pdfs (id) on delete cascade,
  lot_id uuid not null references public.lots (id) on delete cascade,
  pontos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plant_pdf_id, lot_id)
);

alter table public.development_plant_pdfs enable row level security;
alter table public.lot_plant_polygons enable row level security;

-- ---------------------------------------------------------------------------
-- Leads: qualificação
-- ---------------------------------------------------------------------------
alter table public.leads
  add column if not exists campanha text,
  add column if not exists corretor_id uuid references public.users (id),
  add column if not exists tipo_interesse text
    check (tipo_interesse is null or tipo_interesse in ('comprar_lote', 'regularizar', 'ambos')),
  add column if not exists finalidade text
    check (finalidade is null or finalidade in ('morar', 'investir', 'construir_vender')),
  add column if not exists faixa_valor_min numeric(14,2),
  add column if not exists faixa_valor_max numeric(14,2),
  add column if not exists entrada_disponivel numeric(14,2),
  add column if not exists parcela_cabivel numeric(14,2),
  add column if not exists forma_pagamento text,
  add column if not exists prazo_decidir text,
  add column if not exists cidade text,
  add column if not exists bairro text,
  add column if not exists visitou boolean default false,
  add column if not exists data_visita date,
  add column if not exists melhor_horario text,
  add column if not exists canal_preferido text,
  add column if not exists objecoes text,
  add column if not exists score int default 0,
  add column if not exists temperatura text
    check (temperatura is null or temperatura in ('frio', 'morno', 'quente')),
  add column if not exists motivo_perda text;

-- Proposta exige empreendimento (development_id)
alter table public.proposals
  add column if not exists development_id uuid references public.developments (id),
  add column if not exists servico_regularizacao boolean not null default false;

-- Histórico de avanço de card (tempo na etapa)
create table if not exists public.card_stage_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  board text not null,
  card_id uuid not null,
  de_etapa text,
  para_etapa text not null,
  usuario_id uuid,
  usuario_nome text,
  motivo text,
  forcado boolean not null default false,
  tempo_na_etapa_segundos int,
  created_at timestamptz not null default now()
);

create index if not exists card_stage_history_card_idx
  on public.card_stage_history (board, card_id, created_at desc);

alter table public.card_stage_history enable row level security;

-- Selos no card (atraso etc.) sem mudar coluna
create table if not exists public.card_badges (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  board text not null,
  card_id uuid not null,
  codigo text not null,
  label text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  unique (board, card_id, codigo)
);

alter table public.card_badges enable row level security;

-- Pesos de score de lead (por empresa)
create table if not exists public.lead_score_weights (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  pesos jsonb not null default '{
    "empreendimento": 15,
    "tipoInteresse": 10,
    "finalidade": 5,
    "faixaValor": 15,
    "entrada": 15,
    "parcela": 10,
    "visita": 15,
    "prazo": 10,
    "contato": 5
  }'::jsonb,
  campos_minimos_proposta text[] not null default array[
    'empInteresse',
    'tipoInteresse',
    'telefone'
  ],
  updated_at timestamptz not null default now()
);

alter table public.lead_score_weights enable row level security;

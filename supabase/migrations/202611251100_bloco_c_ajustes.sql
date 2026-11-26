-- Bloco C — multiempresas, modalidade, lead qualificado, histórico de card

-- C01 — alias/compat: empresas espelha organizations (já existente)
create or replace view public.empresas as
select
  id,
  razao_social,
  nome_fantasia,
  cnpj,
  telefone,
  email,
  logotipo_url as logo_url,
  endereco,
  case when deleted_at is null then 'ativo' else 'inativo' end as status,
  created_at,
  updated_at
from public.organizations;

-- C03 — modalidade do empreendimento
alter table public.developments
  add column if not exists modalidade text not null default 'loteamento'
    check (modalidade in ('loteamento', 'regularizacao', 'loteamento_e_regularizacao'));

-- C02 — parâmetros / numeração por empresa
create table if not exists public.empresa_parametros (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  chave text not null,
  valor jsonb not null default '{}'::jsonb,
  unique (organization_id, chave)
);

create table if not exists public.empresa_numeracao (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  documento text not null,
  proximo_numero int not null default 1,
  unique (organization_id, documento)
);

-- C08 — histórico de avanço de card
create table if not exists public.card_stage_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  board_codigo text not null,
  card_ref text not null,
  de_etapa text,
  para_etapa text not null,
  usuario_nome text,
  user_id uuid,
  motivo text,
  tempo_na_etapa_segundos int,
  quando timestamptz not null default now()
);

create index if not exists card_stage_history_card_idx
  on public.card_stage_history (organization_id, board_codigo, card_ref, quando desc);

-- C09/C10 — campos de qualificação no lead (quando a tabela leads existir)
alter table public.leads
  add column if not exists campanha text,
  add column if not exists corretor_id uuid,
  add column if not exists tipo_interesse text,
  add column if not exists finalidade text,
  add column if not exists faixa_valor text,
  add column if not exists entrada_disponivel numeric(14,2),
  add column if not exists parcela_cabe numeric(14,2),
  add column if not exists forma_pagamento text,
  add column if not exists prazo_decidir date,
  add column if not exists cidade text,
  add column if not exists bairro text,
  add column if not exists visitou boolean default false,
  add column if not exists data_visita date,
  add column if not exists melhor_horario text,
  add column if not exists canal_preferido text,
  add column if not exists objecoes text,
  add column if not exists score int default 0,
  add column if not exists classificacao text,
  add column if not exists motivo_perda text;

-- C04 — importações de planilha
create table if not exists public.import_batches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  tipo text not null,
  arquivo_nome text,
  status text not null default 'conferencia',
  resumo jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid
);

create table if not exists public.import_batch_rows (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.import_batches (id) on delete cascade,
  linha int not null,
  payload jsonb not null default '{}'::jsonb,
  erros text[] default '{}',
  acao text,
  unique (batch_id, linha)
);

-- C05 — plantas PDF
create table if not exists public.development_plants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  development_id uuid not null references public.developments (id) on delete cascade,
  versao int not null default 1,
  folha int not null default 1,
  arquivo_url text not null,
  preview_url text,
  autor text,
  created_at timestamptz not null default now(),
  created_by uuid
);

create table if not exists public.lot_plant_areas (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references public.development_plants (id) on delete cascade,
  lot_id uuid not null references public.lots (id) on delete cascade,
  path_json jsonb not null default '[]'::jsonb,
  unique (plant_id, lot_id)
);

alter table public.empresa_parametros enable row level security;
alter table public.empresa_numeracao enable row level security;
alter table public.card_stage_history enable row level security;
alter table public.import_batches enable row level security;
alter table public.import_batch_rows enable row level security;
alter table public.development_plants enable row level security;
alter table public.lot_plant_areas enable row level security;

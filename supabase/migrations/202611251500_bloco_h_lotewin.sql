-- Bloco H — Lotes, vendas e carteira (LoteWin)
-- Spec: docs/prompt-unico-meu-lote-facil.md Bloco H

alter table if exists public.developments
  add column if not exists cep text,
  add column if not exists codigo_municipio text,
  add column if not exists padrao text,
  add column if not exists confrontacao text,
  add column if not exists matricula_numero text,
  add column if not exists matricula_data date,
  add column if not exists admin_razao text,
  add column if not exists admin_cnpj text,
  add column if not exists admin_endereco text,
  add column if not exists conta_corrente_padrao text,
  add column if not exists numeracao_propria boolean default false,
  add column if not exists recado_padrao text;

create table if not exists public.emp_socios (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  development_id uuid not null,
  nome text not null,
  documento text not null,
  percentual numeric(5,2) not null check (percentual > 0 and percentual <= 100)
);

create table if not exists public.payment_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  development_id uuid,
  nome text not null,
  entradas int not null default 1,
  prestacoes int not null,
  moeda_ref text not null,
  moeda_residuo text not null,
  data_base date,
  series text,
  ativo boolean not null default true
);

create table if not exists public.index_quotes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  indice text not null,
  competencia text not null,
  fator numeric(12,6) not null,
  unique (organization_id, indice, competencia)
);

create table if not exists public.cartorios (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  nome text not null,
  cidade text not null,
  uf text not null,
  contato text
);

create table if not exists public.escrituras (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  contract_id uuid not null,
  cartorio_id uuid references public.cartorios (id),
  protocolo text not null,
  status text not null,
  data date
);

alter table if exists public.people
  add column if not exists sexo text,
  add column if not exists nascimento date,
  add column if not exists nacionalidade text,
  add column if not exists naturalidade text,
  add column if not exists filiacao text,
  add column if not exists profissao text,
  add column if not exists rg text,
  add column if not exists renda numeric(14,2),
  add column if not exists estado_civil text,
  add column if not exists regime_bens text,
  add column if not exists conjuge_nome text,
  add column if not exists conjuge_documento text,
  add column if not exists endereco_residencial text,
  add column if not exists endereco_comercial text,
  add column if not exists procurador_nome text,
  add column if not exists procurador_documento text;

alter table public.emp_socios enable row level security;
alter table public.payment_plans enable row level security;
alter table public.index_quotes enable row level security;
alter table public.cartorios enable row level security;
alter table public.escrituras enable row level security;

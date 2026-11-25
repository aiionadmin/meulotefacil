-- Fases 2–4 — empreendimentos, lotes, contratos, parcelas, boletos, reajuste
-- Spec: docs/especificacao.md §6, §7.1, §11, §12, §13.1

-- developments já existe (stub Fase 1); enriquecer colunas
alter table public.developments
  add column if not exists cidade text,
  add column if not exists uf text,
  add column if not exists cep text,
  add column if not exists area_total numeric(14,2),
  add column if not exists qtd_quadras int default 0,
  add column if not exists qtd_lotes int default 0,
  add column if not exists observacoes text,
  add column if not exists dias_mora int default 0,
  add column if not exists taxa_mora_mes numeric(8,6) default 0.01,
  add column if not exists taxa_multa numeric(8,6) default 0.02,
  add column if not exists dia_multa int default 0,
  add column if not exists conta_corrente_padrao text;

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  development_id uuid not null references public.developments (id),
  codigo text not null,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  legacy_system text,
  legacy_id text,
  unique (development_id, codigo)
);

create table if not exists public.lots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  development_id uuid not null references public.developments (id),
  block_id uuid references public.blocks (id),
  quadra text not null,
  lote text not null,
  area numeric(14,2) not null,
  padrao text,
  custo numeric(14,2) default 0,
  valor numeric(14,2) not null,
  valor_m2 numeric(14,4),
  status text not null default 'disponivel',
  bloqueia_venda boolean not null default false,
  bloqueia_financeiro boolean not null default false,
  frente text,
  fundo text,
  direita text,
  esquerda text,
  matricula text,
  observacoes text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  legacy_system text,
  legacy_id text,
  unique (development_id, quadra, lote)
);

create index if not exists lots_status_idx on public.lots (organization_id, status);
create index if not exists lots_dev_idx on public.lots (development_id);

create table if not exists public.lot_status_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  lot_id uuid not null references public.lots (id),
  de_status text,
  para_status text not null,
  motivo text,
  created_at timestamptz not null default now(),
  created_by uuid
);

create table if not exists public.price_tables (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  development_id uuid not null references public.developments (id),
  nome text not null,
  ativa boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists public.price_table_values (
  id uuid primary key default gen_random_uuid(),
  price_table_id uuid not null references public.price_tables (id) on delete cascade,
  padrao text,
  valor_m2 numeric(14,4) not null
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  numero text not null,
  development_id uuid not null references public.developments (id),
  status text not null default 'ativo',
  preco numeric(14,2) not null,
  data_contrato date,
  data_assinatura date,
  data_venda date,
  data_primeira_parcela date,
  tipo_reajuste text,
  mes_base int,
  multa_pct numeric(8,6) default 0.02,
  taxa_mora_mes numeric(8,6) default 0.01,
  dias_tolerancia int default 0,
  desconto_pontualidade_pct numeric(8,6) default 0,
  dia_limite_desconto int default 5,
  emite_boleto boolean not null default true,
  corretor_person_id uuid,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  legacy_system text,
  legacy_id text,
  unique (organization_id, numero)
);

create table if not exists public.contract_buyers (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts (id) on delete cascade,
  person_id uuid not null,
  papel text not null default 'principal',
  unique (contract_id, person_id, papel)
);

create table if not exists public.contract_lots (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts (id) on delete cascade,
  lot_id uuid not null references public.lots (id),
  unique (contract_id, lot_id)
);

create table if not exists public.plan_series (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts (id) on delete cascade,
  tipo_parcela text not null,
  quantidade int not null,
  valor numeric(14,2) not null,
  moeda text default 'BRL',
  primeiro_vencimento date,
  data_reajuste date
);

create table if not exists public.installments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  contract_id uuid not null references public.contracts (id),
  plan_series_id uuid references public.plan_series (id),
  tipo text not null,
  n int not null,
  vencimento date not null,
  valor numeric(14,2) not null,
  valor_moeda numeric(14,2),
  moeda text default 'BRL',
  juros numeric(14,2) default 0,
  multa numeric(14,2) default 0,
  correcao numeric(14,2) default 0,
  despesa_bancaria numeric(14,2) default 0,
  desconto numeric(14,2) default 0,
  status text not null default 'em_aberto',
  nosso_numero text,
  pago_em date,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  legacy_system text,
  legacy_id text
);

create index if not exists installments_contract_idx on public.installments (contract_id);
create index if not exists installments_venc_idx on public.installments (organization_id, vencimento, status);

create table if not exists public.contract_operations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  contract_id uuid not null references public.contracts (id),
  tipo text not null,
  detalhe text,
  snapshot jsonb,
  desfeita boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid
);

create table if not exists public.bank_slips (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  contract_id uuid not null references public.contracts (id),
  nosso_numero text not null,
  banco text not null,
  valor numeric(14,2) not null,
  vencimento date not null,
  status text not null default 'gerado',
  remittance_id uuid,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  legacy_system text,
  legacy_id text
);

create table if not exists public.bank_slip_installments (
  bank_slip_id uuid not null references public.bank_slips (id) on delete cascade,
  installment_id uuid not null references public.installments (id),
  primary key (bank_slip_id, installment_id)
);

create table if not exists public.remittance_files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  nome text not null,
  qtd int not null default 0,
  status text not null default 'gerada',
  created_at timestamptz not null default now(),
  created_by uuid
);

alter table public.bank_slips
  drop constraint if exists bank_slips_remittance_id_fkey;
alter table public.bank_slips
  add constraint bank_slips_remittance_id_fkey
  foreign key (remittance_id) references public.remittance_files (id);

create table if not exists public.return_files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  nome text not null,
  qtd int not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid
);

create table if not exists public.adjustment_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  indice text not null,
  fator numeric(12,8) not null,
  mes_base int,
  ano int,
  qtd_parcelas int default 0,
  desfeito boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid
);

-- Cards nascem na Fase 3 (stub de quadro)
create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  codigo text not null,
  nome text not null,
  unique (organization_id, codigo)
);

create table if not exists public.board_columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  codigo text not null,
  nome text not null,
  ordem int not null default 0,
  unique (board_id, codigo)
);

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  board_id uuid not null references public.boards (id),
  column_id uuid not null references public.board_columns (id),
  lead_id uuid,
  person_id uuid,
  lot_id uuid references public.lots (id),
  contract_id uuid references public.contracts (id),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz
);

-- Fases 5–7 — import legacy, financeiro, obras, compras
-- Spec: docs/especificacao.md §8, §9.1, §12, §13.1–13.2

create table if not exists public.import_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  entidade text not null,
  legacy_system text not null,
  expected_count int,
  imported_count int default 0,
  status text not null default 'pendente',
  started_at timestamptz,
  finished_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid
);

create table if not exists public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  nome text not null,
  banco text,
  tipo text not null default 'corrente',
  saldo_inicial numeric(14,2) default 0,
  data_inicial date,
  boleto boolean not null default false,
  bloqueado boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  legacy_system text,
  legacy_id text
);

create table if not exists public.chart_of_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  codigo text not null,
  nome text not null,
  tipo text not null,
  parent_id uuid references public.chart_of_accounts (id),
  unique (organization_id, codigo)
);

create table if not exists public.payables (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  favorecido text not null,
  descricao text,
  categoria text,
  development_id uuid references public.developments (id),
  bank_account_id uuid references public.bank_accounts (id),
  vencimento date not null,
  valor numeric(14,2) not null,
  status text not null default 'em_aberto',
  pago_em date,
  purchase_order_id uuid,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  legacy_system text,
  legacy_id text
);

create table if not exists public.receivables (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  cliente text not null,
  descricao text,
  origem text not null default 'faturamento',
  installment_id uuid references public.installments (id),
  development_id uuid references public.developments (id),
  bank_account_id uuid references public.bank_accounts (id),
  vencimento date not null,
  valor numeric(14,2) not null,
  status text not null default 'em_aberto',
  recebido_em date,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  legacy_system text,
  legacy_id text
);

create table if not exists public.transfers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  from_account_id uuid not null references public.bank_accounts (id),
  to_account_id uuid not null references public.bank_accounts (id),
  valor numeric(14,2) not null,
  data date not null,
  descricao text,
  created_at timestamptz not null default now(),
  created_by uuid
);

create table if not exists public.pre_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  descricao text not null,
  valor numeric(14,2) not null,
  development_id uuid references public.developments (id),
  solicitante text,
  status text not null default 'pendente',
  created_at timestamptz not null default now(),
  created_by uuid
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  development_id uuid not null references public.developments (id),
  codigo text not null,
  status text not null default 'rascunho',
  orcado numeric(14,2) default 0,
  realizado numeric(14,2) default 0,
  fisico_pct numeric(5,2) default 0,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  legacy_system text,
  legacy_id text
);

create table if not exists public.budget_nodes (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets (id) on delete cascade,
  parent_id uuid references public.budget_nodes (id),
  codigo text not null,
  descricao text not null,
  unidade text,
  quantidade numeric(14,4) default 0,
  custo_unit numeric(14,4) default 0,
  orcado numeric(14,2) default 0,
  realizado numeric(14,2) default 0,
  ordem int default 0
);

create table if not exists public.purchase_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  numero text not null,
  descricao text,
  development_id uuid references public.developments (id),
  solicitante text,
  necessidade date,
  urgente boolean not null default false,
  status text not null default 'rascunho',
  valor_estimado numeric(14,2) default 0,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  legacy_system text,
  legacy_id text,
  unique (organization_id, numero)
);

create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  numero text not null,
  request_id uuid references public.purchase_requests (id),
  fornecedor text not null,
  development_id uuid references public.developments (id),
  valor numeric(14,2) not null,
  status text not null default 'aguardando',
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  legacy_system text,
  legacy_id text,
  unique (organization_id, numero)
);

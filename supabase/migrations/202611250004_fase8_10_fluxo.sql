-- Fases 8–10 — leads, cobrança, jurídico, regularização, fiscal
-- Spec: docs/especificacao.md §4, §5.2, §7.2–7.3, §9.2–9.3, §13.1

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  nome text not null,
  telefone text not null,
  email text,
  development_id uuid references public.developments (id),
  origem text not null,
  responsavel text,
  etapa text not null default 'novo_contato',
  observacoes text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  legacy_system text,
  legacy_id text
);

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  lead_id uuid references public.leads (id),
  lot_id uuid references public.lots (id),
  valor numeric(14,2) not null,
  entrada numeric(14,2) default 0,
  parcelas int default 0,
  validade date,
  status text not null default 'aberta',
  responsavel text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists public.collection_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  contract_id uuid references public.contracts (id),
  faixa text not null,
  dias_atraso int default 0,
  valor_original numeric(14,2) not null,
  valor_atualizado numeric(14,2) not null,
  responsavel text,
  ultimo_contato date,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists public.collection_contacts (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.collection_cases (id) on delete cascade,
  canal text not null,
  resultado text,
  created_at timestamptz not null default now(),
  created_by uuid
);

create table if not exists public.agreements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  case_id uuid references public.collection_cases (id),
  contract_id uuid references public.contracts (id),
  valor_atualizado numeric(14,2) not null,
  desconto numeric(14,2) default 0,
  entrada numeric(14,2) default 0,
  qtd_parcelas int default 0,
  status text not null default 'ativo',
  created_at timestamptz not null default now(),
  created_by uuid
);

create table if not exists public.lawsuits (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  contract_id uuid references public.contracts (id),
  tipo text not null,
  numero text,
  vara text,
  advogado text,
  valor_causa numeric(14,2),
  situacao text not null default 'ativo',
  proximo_prazo date,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists public.regularization_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  lot_id uuid references public.lots (id),
  etapa text not null default 'documentos',
  responsavel text,
  prazo date,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists public.received_invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  numero text not null,
  emissor text,
  valor numeric(14,2) not null,
  emissao date,
  status text not null default 'pendente',
  payable_id uuid references public.payables (id),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  legacy_system text,
  legacy_id text
);

create table if not exists public.issued_service_invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  numero text not null,
  valor numeric(14,2) not null,
  emissao date,
  status text not null default 'autorizada',
  receivable_id uuid references public.receivables (id),
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists public.card_moves (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards (id) on delete cascade,
  de_column text,
  para_column text not null,
  motivo text,
  created_at timestamptz not null default now(),
  created_by uuid
);

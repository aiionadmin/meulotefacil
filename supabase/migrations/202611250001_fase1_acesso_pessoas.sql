-- Fase 1 — acesso, perfis, listas, pessoas, arquivos, tarefas, notificações
-- Spec: docs/especificacao.md §3, §5.3, §10, §12, §13.1
-- Dinheiro em numeric(14,2) nas fases seguintes; aqui só metadados.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Organizations
-- ---------------------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  razao_social text not null,
  nome_fantasia text,
  cnpj text,
  inscricao_estadual text,
  telefone text,
  email text,
  logotipo_url text,
  advogado_nome text,
  advogado_cpf text,
  advogado_oab text,
  responsavel_cpf text,
  endereco jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  legacy_system text,
  legacy_id text
);

-- Stub developments (Fase 2 completa; necessário para visibilidade)
create table if not exists public.developments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  codigo text not null,
  nome text not null,
  tipo text not null default 'loteamento',
  status text not null default 'em_andamento',
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  legacy_system text,
  legacy_id text,
  unique (organization_id, codigo)
);

-- ---------------------------------------------------------------------------
-- Access
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id),
  codigo text not null unique,
  nome text not null,
  descricao text,
  sistema boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists public.profile_permissions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  rotina text not null,
  ver boolean not null default false,
  inserir_alterar boolean not null default false,
  remover boolean not null default false,
  especial jsonb default '{}'::jsonb,
  unique (profile_id, rotina)
);

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  auth_user_id uuid unique,
  profile_id uuid references public.profiles (id),
  nome text not null,
  email text not null,
  status text not null default 'ativo',
  chave boolean not null default false,
  corretor_person_id uuid,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  legacy_system text,
  legacy_id text,
  unique (organization_id, email)
);

create table if not exists public.user_organizations (
  user_id uuid not null references public.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  primary key (user_id, organization_id)
);

create table if not exists public.user_developments (
  user_id uuid not null references public.users (id) on delete cascade,
  development_id uuid not null references public.developments (id) on delete cascade,
  primary key (user_id, development_id)
);

create table if not exists public.approval_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  tipo text not null,
  profile_id uuid references public.profiles (id),
  user_id uuid references public.users (id),
  valor_minimo numeric(14, 2),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  quando timestamptz not null default now(),
  user_id uuid,
  usuario_nome text,
  rotina text not null,
  registro_tipo text,
  registro_id text,
  acao text not null,
  antes jsonb,
  depois jsonb
);

create index if not exists audit_log_org_quando_idx
  on public.audit_log (organization_id, quando desc);

-- ---------------------------------------------------------------------------
-- Lookups & settings
-- ---------------------------------------------------------------------------
create table if not exists public.lookup_lists (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  codigo text not null,
  nome text not null,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  unique (organization_id, codigo)
);

create table if not exists public.lookup_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lookup_lists (id) on delete cascade,
  codigo text not null,
  nome text not null,
  ordem int not null default 0,
  ativo boolean not null default true,
  meta jsonb default '{}'::jsonb,
  unique (list_id, codigo)
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  chave text not null,
  valor jsonb not null default '{}'::jsonb,
  unique (organization_id, chave)
);

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------
create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  tipo text not null check (tipo in ('fisica', 'juridica')),
  status text not null default 'ativo',
  nome text not null,
  nome_fantasia text,
  documento text,
  inscricao_estadual text,
  inscricao_municipal text,
  telefone1 text,
  telefone2 text,
  celular text,
  email text,
  endereco_correspondencia text default 'residencial',
  sexo text,
  nascimento date,
  nacionalidade text,
  naturalidade text,
  filiacao text,
  profissao text,
  rg text,
  rg_orgao text,
  rg_expedicao date,
  renda_familiar numeric(14, 2),
  estado_civil text,
  data_casamento date,
  regime_casamento text,
  fonte text,
  setor text,
  segmento text,
  qualificacao int check (qualificacao is null or qualificacao between 1 and 5),
  creci text,
  comissao_padrao numeric(8, 4),
  usuario_vinculado_id uuid references public.users (id),
  observacoes text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  legacy_system text,
  legacy_id text
);

create index if not exists people_org_nome_idx
  on public.people (organization_id, nome)
  where deleted_at is null;

create index if not exists people_org_documento_idx
  on public.people (organization_id, documento)
  where deleted_at is null;

alter table public.users
  drop constraint if exists users_corretor_person_id_fkey;
alter table public.users
  add constraint users_corretor_person_id_fkey
  foreign key (corretor_person_id) references public.people (id);

create table if not exists public.person_roles (
  person_id uuid not null references public.people (id) on delete cascade,
  papel text not null,
  primary key (person_id, papel)
);

create table if not exists public.person_addresses (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people (id) on delete cascade,
  tipo text not null,
  cep text,
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  uf text
);

create table if not exists public.person_contacts (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people (id) on delete cascade,
  nome text not null,
  cargo text,
  email text,
  telefone text,
  aniversario date
);

create table if not exists public.person_spouses (
  person_id uuid primary key references public.people (id) on delete cascade,
  nome text,
  nascimento date,
  nacionalidade text,
  naturalidade text,
  filiacao text,
  profissao text,
  cpf text,
  rg text,
  rg_orgao text
);

create table if not exists public.person_attorneys (
  person_id uuid primary key references public.people (id) on delete cascade,
  nome text,
  cpf text
);

create table if not exists public.employees (
  person_id uuid primary key references public.people (id) on delete cascade,
  status text not null default 'ativo',
  funcao text,
  nivel text,
  regime text,
  remuneracao numeric(14, 2),
  admissao date,
  demissao date
);

create table if not exists public.brokers (
  person_id uuid primary key references public.people (id) on delete cascade,
  creci text,
  comissao_padrao numeric(8, 4),
  user_id uuid references public.users (id)
);

-- ---------------------------------------------------------------------------
-- Files, tasks, notifications
-- ---------------------------------------------------------------------------
create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  nome text not null,
  mime text,
  tamanho_bytes bigint,
  storage_path text,
  rotina text,
  registro_tipo text,
  registro_id text,
  comentario text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists public.file_tags (
  file_id uuid not null references public.files (id) on delete cascade,
  tag text not null,
  primary key (file_id, tag)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  registro_tipo text not null,
  registro_id text not null,
  corpo text not null,
  created_at timestamptz not null default now(),
  created_by uuid,
  deleted_at timestamptz
);

create table if not exists public.task_boards (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  nome text not null,
  pasta text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  board_id uuid references public.task_boards (id),
  titulo text not null,
  descricao text,
  responsavel_user_id uuid references public.users (id),
  prazo date,
  prioridade text not null default 'media',
  status text not null default 'a_fazer',
  vinculo_tipo text,
  vinculo_id text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  user_id uuid not null references public.users (id) on delete cascade,
  titulo text not null,
  corpo text,
  lida boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_lida_idx
  on public.notifications (user_id, lida, created_at desc);

-- ---------------------------------------------------------------------------
-- Kanban stubs (populados nas Fases 3/8)
-- ---------------------------------------------------------------------------
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
  limite_dias int,
  unique (board_id, codigo)
);

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  board_id uuid not null references public.boards (id),
  column_id uuid not null references public.board_columns (id),
  lead_id uuid,
  person_id uuid references public.people (id),
  lot_id uuid,
  contract_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- RLS: enable; policies refined when Auth is wired
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.users enable row level security;
alter table public.people enable row level security;
alter table public.files enable row level security;
alter table public.tasks enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_log enable row level security;

-- Bloco D — Obras independentes, catálogo, orçamento, RDO
-- Spec: docs/prompt-unico-meu-lote-facil.md Bloco D / Anexo 2

-- Obra própria (vínculo com empreendimento opcional)
create table if not exists public.obras (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  codigo text not null,
  nome text not null check (char_length(nome) <= 200),
  tipo text not null default 'loteamento',
  status text not null default 'em_orcamento'
    check (status in ('em_orcamento', 'em_andamento', 'paralisada', 'finalizada')),
  cliente_nome text,
  cliente_id uuid references public.people (id),
  development_id uuid references public.developments (id),
  area_total numeric(14,2),
  unidade text default 'm²',
  art text,
  cei_cno text check (cei_cno is null or char_length(cei_cno) <= 20),
  responsavel_tecnico text,
  responsavel_obra text,
  endereco jsonb default '{}'::jsonb,
  faturamento jsonb default '{}'::jsonb,
  exibir_lancamentos boolean not null default true,
  exibir_faturamentos boolean not null default true,
  exibir_compras boolean not null default true,
  fisico_pct numeric(5,2) default 0,
  orcado numeric(14,2) default 0,
  realizado numeric(14,2) default 0,
  bdi_pct numeric(8,4) default 0.25,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  unique (organization_id, codigo)
);

create table if not exists public.obra_visibilidade (
  obra_id uuid not null references public.obras (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  primary key (obra_id, user_id)
);

-- Catálogo
create table if not exists public.insumos (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  codigo text not null,
  descricao text not null,
  grupo text not null check (grupo in ('material', 'mao_de_obra', 'equipamento', 'outros')),
  unidade text not null,
  tipo text,
  base text not null default 'SINAPI',
  custo_unitario numeric(14,4) default 0,
  favorito boolean not null default false,
  ativo boolean not null default true,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (organization_id, codigo)
);

create table if not exists public.insumo_preco_historico (
  id uuid primary key default gen_random_uuid(),
  insumo_id uuid not null references public.insumos (id) on delete cascade,
  custo numeric(14,4) not null,
  origem text,
  created_at timestamptz not null default now()
);

create table if not exists public.composicoes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  codigo text not null,
  descricao text not null,
  unidade text not null,
  tipo text,
  base text not null default 'SINAPI',
  descricao_detalhada text,
  favorito boolean not null default false,
  ativo boolean not null default true,
  bdi_pct numeric(8,4) default 0.25,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (organization_id, codigo)
);

create table if not exists public.composicao_itens (
  id uuid primary key default gen_random_uuid(),
  composicao_id uuid not null references public.composicoes (id) on delete cascade,
  insumo_id uuid not null references public.insumos (id),
  coeficiente numeric(14,6) not null default 1,
  ordem int default 0
);

-- Orçamento vinculado à obra (não só ao empreendimento)
alter table public.budgets
  add column if not exists obra_id uuid references public.obras (id),
  add column if not exists proposta_status text default 'em_elaboracao',
  add column if not exists bdi_pct numeric(8,4) default 0.25,
  add column if not exists bdi_modo text default 'fixo',
  add column if not exists preco numeric(14,2) default 0;

alter table public.budget_nodes
  add column if not exists kind text default 'item'
    check (kind in ('etapa', 'subetapa', 'item')),
  add column if not exists composicao_id uuid references public.composicoes (id),
  add column if not exists insumo_id uuid references public.insumos (id),
  add column if not exists grupo text,
  add column if not exists fisico_pct numeric(5,2) default 0,
  add column if not exists bdi_pct numeric(8,4);

-- Cronograma
create table if not exists public.obra_cronograma (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references public.obras (id) on delete cascade,
  budget_node_id uuid references public.budget_nodes (id) on delete set null,
  duracao_dias int not null default 1,
  inicio date,
  fim date,
  predecessor_id uuid references public.obra_cronograma (id),
  created_at timestamptz not null default now()
);

create table if not exists public.obra_curva_s (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references public.obras (id) on delete cascade,
  periodo date not null,
  planejado_fisico numeric(8,4) default 0,
  realizado_fisico numeric(8,4) default 0,
  planejado_financeiro numeric(14,2) default 0,
  realizado_financeiro numeric(14,2) default 0,
  unique (obra_id, periodo)
);

-- RDO
create table if not exists public.rdos (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  obra_id uuid not null references public.obras (id) on delete cascade,
  numero int not null,
  data date not null,
  responsavel text not null,
  status text not null default 'rascunho'
    check (status in ('rascunho', 'enviado', 'aprovado', 'devolvido')),
  motivo_devolucao text,
  prazo_contratual date,
  clima jsonb default '{}'::jsonb,
  efetivo jsonb default '[]'::jsonb,
  equipamentos jsonb default '[]'::jsonb,
  atividades jsonb default '[]'::jsonb,
  materiais jsonb default '[]'::jsonb,
  ocorrencias jsonb default '[]'::jsonb,
  fotos jsonb default '[]'::jsonb,
  observacoes text,
  assinaturas jsonb default '[]'::jsonb,
  efetivo_total int default 0,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  approved_at timestamptz,
  approved_by uuid,
  unique (obra_id, data),
  unique (obra_id, numero)
);

alter table public.obras enable row level security;
alter table public.insumos enable row level security;
alter table public.composicoes enable row level security;
alter table public.rdos enable row level security;
alter table public.obra_cronograma enable row level security;
alter table public.obra_curva_s enable row level security;

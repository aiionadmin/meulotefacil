-- Parte 5 — Demandas, portais e RLS de isolamento
-- Spec: docs/prompt-cursor-meu-lote-facil.md §6

create table if not exists public.demanda_tipos (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  nome text not null,
  prazo_dias int not null default 10,
  responsavel_padrao text,
  checklist jsonb not null default '[]'::jsonb,
  ativo boolean not null default true,
  unique (organization_id, nome)
);

create table if not exists public.demandas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  numero text not null,
  tipo_id uuid not null references public.demanda_tipos (id),
  empresa text,
  empreendimento_id uuid,
  empreendimento_nome text,
  quadra text,
  lote text,
  cliente_id uuid,
  cliente_nome text,
  descricao text not null,
  prioridade text not null default 'normal',
  responsavel text,
  prazo date,
  origem text not null check (origem in ('interno', 'portal_cliente', 'corretor')),
  corretor_id uuid,
  custo_previsto numeric(14,2),
  status text not null default 'aberta'
    check (status in (
      'aberta', 'em_analise', 'agendada', 'em_execucao', 'concluida', 'cancelada'
    )),
  purchase_request_id uuid,
  faturamento_id uuid,
  created_at timestamptz not null default now(),
  unique (organization_id, numero)
);

create index if not exists demandas_cliente_idx on public.demandas (cliente_id);
create index if not exists demandas_corretor_idx on public.demandas (corretor_id);
create index if not exists demandas_status_idx on public.demandas (status);

-- Sessões de portal (demo / futuro auth externo)
create table if not exists public.portal_corretor_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  user_id uuid,
  corretor_pessoa_id uuid,
  ativo boolean not null default true
);

create table if not exists public.portal_cliente_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  user_id uuid,
  cliente_pessoa_id uuid,
  cpf text,
  ativo boolean not null default true
);

alter table public.demandas enable row level security;
alter table public.portal_corretor_profiles enable row level security;
alter table public.portal_cliente_profiles enable row level security;

-- Staff interno (membro da organização) vê tudo da org
drop policy if exists demandas_staff_select on public.demandas;
create policy demandas_staff_select on public.demandas
  for select
  using (
    exists (
      select 1 from public.user_organizations uo
      where uo.user_id = auth.uid()
        and uo.organization_id = demandas.organization_id
    )
  );

-- Corretor portal: só demandas com o próprio corretor_id
drop policy if exists demandas_corretor_select on public.demandas;
create policy demandas_corretor_select on public.demandas
  for select
  using (
    corretor_id in (
      select corretor_pessoa_id from public.portal_corretor_profiles
      where user_id = auth.uid() and ativo
    )
  );

-- Cliente portal: só demandas do próprio cliente_id
drop policy if exists demandas_cliente_select on public.demandas;
create policy demandas_cliente_select on public.demandas
  for select
  using (
    cliente_id in (
      select cliente_pessoa_id from public.portal_cliente_profiles
      where user_id = auth.uid() and ativo
    )
  );

-- Rotinas novas na matriz (seed tipado via app; tabela se existir)
create table if not exists public.permission_routines (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  externo boolean not null default false
);

insert into public.permission_routines (codigo, nome, externo) values
  ('rdo', 'RDO', false),
  ('aprovar_rdo', 'Aprovar RDO', false),
  ('demandas', 'Demandas', false),
  ('dashboard_gerencial', 'Dashboard gerencial', false),
  ('importacao_lote', 'Importação em lote', false),
  ('edicao_lote', 'Edição em lote', false),
  ('corrigir_avanco_card', 'Corrigir avanço de card', false),
  ('portal_corretor', 'Portal Corretor', true),
  ('portal_cliente', 'Portal Cliente', true)
on conflict (codigo) do nothing;

-- Bloco A — sair do modo demonstração
-- A01 store_snapshots (substitui localStorage)
-- A04 profile_permissions seed + RLS helpers
-- A05 audit_log policies e trigger helper

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- A01 — snapshots dos stores no Supabase (não mais localStorage)
-- ---------------------------------------------------------------------------
create table if not exists public.store_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  store_key text not null,
  payload jsonb not null default '{}'::jsonb,
  schema_version int not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  unique (organization_id, store_key)
);

create index if not exists store_snapshots_org_idx
  on public.store_snapshots (organization_id);

alter table public.store_snapshots enable row level security;

-- ---------------------------------------------------------------------------
-- Helpers de sessão (Auth → public.users)
-- ---------------------------------------------------------------------------
create or replace function public.current_app_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select u.id
  from public.users u
  where u.auth_user_id = auth.uid()
    and u.deleted_at is null
    and u.status = 'ativo'
  limit 1;
$$;

create or replace function public.current_organization_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select uo.organization_id
  from public.user_organizations uo
  where uo.user_id = public.current_app_user_id()
  union
  select u.organization_id
  from public.users u
  where u.id = public.current_app_user_id();
$$;

create or replace function public.has_org_access(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.current_organization_ids() o where o = p_org
  );
$$;

create or replace function public.has_permission(
  p_rotina text,
  p_acao text
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := public.current_app_user_id();
  v_profile uuid;
  v_chave boolean;
  v_row public.profile_permissions%rowtype;
begin
  if v_user is null then
    return false;
  end if;

  select profile_id, chave into v_profile, v_chave
  from public.users
  where id = v_user;

  if v_chave then
    return true;
  end if;

  if v_profile is null then
    return false;
  end if;

  select * into v_row
  from public.profile_permissions
  where profile_id = v_profile and rotina = p_rotina;

  if not found then
    return false;
  end if;

  if p_acao = 'ver' then
    return v_row.ver;
  elsif p_acao in ('inserir_alterar', 'inserir', 'alterar') then
    return v_row.inserir_alterar;
  elsif p_acao = 'remover' then
    return v_row.remover;
  end if;

  return false;
end;
$$;

-- ---------------------------------------------------------------------------
-- A05 — gravar auditoria com antes/depois
-- ---------------------------------------------------------------------------
create or replace function public.write_audit(
  p_organization_id uuid,
  p_rotina text,
  p_acao text,
  p_registro_tipo text default null,
  p_registro_id text default null,
  p_antes jsonb default null,
  p_depois jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_user uuid := public.current_app_user_id();
  v_nome text;
begin
  select nome into v_nome from public.users where id = v_user;

  insert into public.audit_log (
    organization_id, user_id, usuario_nome, rotina, acao,
    registro_tipo, registro_id, antes, depois
  ) values (
    p_organization_id, v_user, coalesce(v_nome, 'Sistema'), p_rotina, p_acao,
    p_registro_tipo, p_registro_id, p_antes, p_depois
  )
  returning id into v_id;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS policies (org-scoped)
-- ---------------------------------------------------------------------------
drop policy if exists store_snapshots_select on public.store_snapshots;
create policy store_snapshots_select on public.store_snapshots
  for select using (public.has_org_access(organization_id));

drop policy if exists store_snapshots_write on public.store_snapshots;
create policy store_snapshots_write on public.store_snapshots
  for all using (public.has_org_access(organization_id))
  with check (public.has_org_access(organization_id));

drop policy if exists audit_log_select on public.audit_log;
create policy audit_log_select on public.audit_log
  for select using (
    public.has_org_access(organization_id)
    and public.has_permission('auditoria', 'ver')
  );

drop policy if exists audit_log_insert on public.audit_log;
create policy audit_log_insert on public.audit_log
  for insert with check (public.has_org_access(organization_id));

drop policy if exists profile_permissions_select on public.profile_permissions;
alter table public.profile_permissions enable row level security;
create policy profile_permissions_select on public.profile_permissions
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and (
          p.organization_id is null
          or public.has_org_access(p.organization_id)
        )
    )
  );

drop policy if exists profile_permissions_write on public.profile_permissions;
create policy profile_permissions_write on public.profile_permissions
  for all using (public.has_permission('usuarios', 'inserir_alterar'))
  with check (public.has_permission('usuarios', 'inserir_alterar'));

-- ---------------------------------------------------------------------------
-- A04 — matriz inicial de permissões para os 12 perfis
-- Nota: em instalação limpa rode supabase/seed/fase1.sql depois desta migration
-- (os perfis nascem no seed). O insert abaixo é no-op se ainda não houver perfis.
-- ---------------------------------------------------------------------------
insert into public.profile_permissions (profile_id, rotina, ver, inserir_alterar, remover)
select p.id, r.rotina, r.ver, r.inserir_alterar, r.remover
from public.profiles p
cross join lateral (
  values
    -- administrador: tudo
    ('administrador', 'dashboard', true, true, true),
    ('administrador', 'cadastros.pessoas', true, true, true),
    ('administrador', 'cadastros.listas', true, true, true),
    ('administrador', 'empreendimentos', true, true, true),
    ('administrador', 'carteira', true, true, true),
    ('administrador', 'boletos', true, true, true),
    ('administrador', 'vendas', true, true, true),
    ('administrador', 'leads', true, true, true),
    ('administrador', 'cobranca', true, true, true),
    ('administrador', 'juridico', true, true, true),
    ('administrador', 'financeiro', true, true, true),
    ('administrador', 'compras', true, true, true),
    ('administrador', 'obras', true, true, true),
    ('administrador', 'fiscal', true, true, true),
    ('administrador', 'relatorios', true, true, true),
    ('administrador', 'tarefas', true, true, true),
    ('administrador', 'arquivos', true, true, true),
    ('administrador', 'configuracoes', true, true, true),
    ('administrador', 'auditoria', true, true, true),
    ('administrador', 'usuarios', true, true, true),
    -- direção: leitura ampla
    ('direcao', 'dashboard', true, true, false),
    ('direcao', 'cadastros.pessoas', true, false, false),
    ('direcao', 'empreendimentos', true, false, false),
    ('direcao', 'carteira', true, false, false),
    ('direcao', 'financeiro', true, false, false),
    ('direcao', 'obras', true, false, false),
    ('direcao', 'compras', true, false, false),
    ('direcao', 'relatorios', true, true, false),
    ('direcao', 'auditoria', true, false, false),
    ('direcao', 'configuracoes', true, false, false),
    -- financeiro
    ('financeiro', 'dashboard', true, true, false),
    ('financeiro', 'financeiro', true, true, false),
    ('financeiro', 'boletos', true, true, false),
    ('financeiro', 'carteira', true, true, false),
    ('financeiro', 'fiscal', true, true, false),
    ('financeiro', 'relatorios', true, true, false),
    ('financeiro', 'cadastros.pessoas', true, true, false),
    -- comercial
    ('comercial', 'dashboard', true, true, false),
    ('comercial', 'leads', true, true, false),
    ('comercial', 'vendas', true, true, false),
    ('comercial', 'empreendimentos', true, true, false),
    ('comercial', 'carteira', true, true, false),
    ('comercial', 'cadastros.pessoas', true, true, false),
    ('comercial', 'tarefas', true, true, false),
    -- corretor
    ('corretor', 'dashboard', true, true, false),
    ('corretor', 'leads', true, true, false),
    ('corretor', 'vendas', true, true, false),
    ('corretor', 'empreendimentos', true, false, false),
    -- cobrança
    ('cobranca', 'dashboard', true, true, false),
    ('cobranca', 'cobranca', true, true, false),
    ('cobranca', 'carteira', true, true, false),
    ('cobranca', 'boletos', true, true, false),
    ('cobranca', 'cadastros.pessoas', true, true, false),
    ('cobranca', 'relatorios', true, true, false),
    -- jurídico
    ('juridico', 'dashboard', true, true, false),
    ('juridico', 'juridico', true, true, false),
    ('juridico', 'cobranca', true, true, false),
    ('juridico', 'carteira', true, true, false),
    ('juridico', 'arquivos', true, true, false),
    ('juridico', 'relatorios', true, true, false),
    -- obras / engenharia / suprimentos / atendimento / regularização
    ('engenharia', 'dashboard', true, true, false),
    ('engenharia', 'obras', true, true, false),
    ('engenharia', 'compras', true, true, false),
    ('engenharia', 'tarefas', true, true, false),
    ('engenharia', 'arquivos', true, true, false),
    ('obras', 'dashboard', true, true, false),
    ('obras', 'obras', true, true, false),
    ('obras', 'compras', true, true, false),
    ('obras', 'tarefas', true, true, false),
    ('obras', 'arquivos', true, true, false),
    ('suprimentos', 'dashboard', true, true, false),
    ('suprimentos', 'compras', true, true, false),
    ('suprimentos', 'cadastros.pessoas', true, true, false),
    ('suprimentos', 'tarefas', true, true, false),
    ('suprimentos', 'arquivos', true, true, false),
    ('atendimento', 'dashboard', true, true, false),
    ('atendimento', 'cadastros.pessoas', true, true, false),
    ('atendimento', 'carteira', true, true, false),
    ('atendimento', 'boletos', true, true, false),
    ('atendimento', 'tarefas', true, true, false),
    ('regularizacao', 'dashboard', true, true, false),
    ('regularizacao', 'empreendimentos', true, true, false),
    ('regularizacao', 'arquivos', true, true, false),
    ('regularizacao', 'cadastros.pessoas', true, true, false),
    ('regularizacao', 'tarefas', true, true, false),
    ('regularizacao', 'relatorios', true, true, false)
) as r(perfil, rotina, ver, inserir_alterar, remover)
where p.codigo = r.perfil
on conflict (profile_id, rotina) do update
  set ver = excluded.ver,
      inserir_alterar = excluded.inserir_alterar,
      remover = excluded.remover;

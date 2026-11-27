-- RLS fino: Visível para / obra_visibilidade (§8 aceite).
-- Sem deploy automático.

alter table public.obras
  add column if not exists visivel_para text[] not null default '{}';

create or replace function public.can_see_obra(p_obra uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with me as (
    select u.id, u.chave, u.nome, p.nome as perfil
    from public.users u
    left join public.profiles p on p.id = u.profile_id
    where u.id = public.current_app_user_id()
  ),
  obra as (
    select o.id, o.organization_id, o.visivel_para
    from public.obras o
    where o.id = p_obra and o.deleted_at is null
  )
  select
    exists (select 1 from obra)
    and exists (
      select 1 from obra o where public.has_org_access(o.organization_id)
    )
    and (
      exists (select 1 from me m where m.chave)
      or exists (
        select 1 from me m where lower(coalesce(m.perfil, '')) = 'administrador'
      )
      or exists (
        select 1
        from public.obra_visibilidade v
        join me m on m.id = v.user_id
        where v.obra_id = p_obra
      )
      or (
        not exists (select 1 from public.obra_visibilidade v where v.obra_id = p_obra)
        and (
          coalesce((select cardinality(visivel_para) from obra), 0) = 0
          or exists (
            select 1
            from obra o
            cross join me m
            cross join lateral unnest(o.visivel_para) as v(label)
            where lower(v.label) in (lower(m.perfil), lower(m.nome))
          )
        )
      )
    );
$$;

comment on function public.can_see_obra(uuid) is
  'Usuário vê a obra: chave/admin, obra_visibilidade, ou match em visivel_para.';

-- Obras: SELECT filtrado; INSERT/UPDATE/DELETE mantém org
drop policy if exists obras_org_all on public.obras;
drop policy if exists obras_select_visib on public.obras;
drop policy if exists obras_write_org on public.obras;

create policy obras_select_visib on public.obras
  for select using (public.can_see_obra(id));

create policy obras_write_org on public.obras
  for all using (public.has_org_access(organization_id))
  with check (public.has_org_access(organization_id));

-- Registros com obra_id: só se a obra for visível (ou centro empresa)
drop policy if exists purchase_requests_org_all on public.purchase_requests;
create policy purchase_requests_org_all on public.purchase_requests
  for all
  using (
    public.has_org_access(organization_id)
    and (
      obra_id is null
      or centro_tipo = 'empresa'
      or public.can_see_obra(obra_id)
    )
  )
  with check (
    public.has_org_access(organization_id)
    and (
      obra_id is null
      or centro_tipo = 'empresa'
      or public.can_see_obra(obra_id)
    )
  );

drop policy if exists quotations_org_all on public.quotations;
create policy quotations_org_all on public.quotations
  for all
  using (
    public.has_org_access(organization_id)
    and (
      obra_id is null
      or centro_tipo = 'empresa'
      or public.can_see_obra(obra_id)
    )
  )
  with check (
    public.has_org_access(organization_id)
    and (
      obra_id is null
      or centro_tipo = 'empresa'
      or public.can_see_obra(obra_id)
    )
  );

drop policy if exists purchase_orders_org_all on public.purchase_orders;
create policy purchase_orders_org_all on public.purchase_orders
  for all
  using (
    public.has_org_access(organization_id)
    and (
      obra_id is null
      or public.can_see_obra(obra_id)
    )
  )
  with check (
    public.has_org_access(organization_id)
    and (
      obra_id is null
      or public.can_see_obra(obra_id)
    )
  );

comment on schema public is
  'RLS org + can_see_obra em Obras/Compras. Dual-write gradual.';

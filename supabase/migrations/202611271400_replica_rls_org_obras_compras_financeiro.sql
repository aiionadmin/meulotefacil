-- Réplica Mais Controle — RLS por organização (Obras / Compras / Financeiro).
-- Centro de custo fino e obra_visibilidade ficam para PR posterior.
-- Sem deploy nesta etapa: migration versionada no repo.

-- ---------------------------------------------------------------------------
-- Financeiro: habilitar RLS
-- ---------------------------------------------------------------------------
alter table public.planos_conta enable row level security;
alter table public.categorias_financeiras enable row level security;
alter table public.naturezas_receita enable row level security;
alter table public.contas_bancarias enable row level security;
alter table public.lancamentos enable row level security;
alter table public.lancamento_centros enable row level security;
alter table public.pagamentos enable row level security;
alter table public.faturamentos enable row level security;
alter table public.recebimentos enable row level security;
alter table public.pre_lancamentos enable row level security;
alter table public.transferencias enable row level security;
alter table public.notas_fiscais enable row level security;
alter table public.financeiro_config enable row level security;

-- Filhos de obras/compras ainda sem RLS
alter table public.obra_visibilidade enable row level security;
alter table public.insumo_preco_historico enable row level security;
alter table public.composicao_itens enable row level security;

-- ---------------------------------------------------------------------------
-- Helper: política org padrão (all)
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'obras',
    'insumos',
    'composicoes',
    'rdos',
    'obra_cronograma',
    'obra_curva_s',
    'quotations',
    'compras_config',
    'planos_conta',
    'categorias_financeiras',
    'naturezas_receita',
    'contas_bancarias',
    'lancamentos',
    'pagamentos',
    'faturamentos',
    'recebimentos',
    'pre_lancamentos',
    'transferencias',
    'notas_fiscais',
    'financeiro_config'
  ]
  loop
    execute format('drop policy if exists %I_org_all on public.%I', t, t);
    execute format(
      'create policy %I_org_all on public.%I for all using (public.has_org_access(organization_id)) with check (public.has_org_access(organization_id))',
      t, t
    );
  end loop;
end $$;

-- purchase_requests / purchase_orders (fase anterior)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'purchase_requests'
      and column_name = 'organization_id'
  ) then
    alter table public.purchase_requests enable row level security;
    drop policy if exists purchase_requests_org_all on public.purchase_requests;
    create policy purchase_requests_org_all on public.purchase_requests
      for all using (public.has_org_access(organization_id))
      with check (public.has_org_access(organization_id));
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'purchase_orders'
      and column_name = 'organization_id'
  ) then
    alter table public.purchase_orders enable row level security;
    drop policy if exists purchase_orders_org_all on public.purchase_orders;
    create policy purchase_orders_org_all on public.purchase_orders
      for all using (public.has_org_access(organization_id))
      with check (public.has_org_access(organization_id));
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Filhos: via parent.organization_id
-- ---------------------------------------------------------------------------
drop policy if exists obra_visibilidade_org on public.obra_visibilidade;
create policy obra_visibilidade_org on public.obra_visibilidade
  for all using (
    exists (
      select 1 from public.obras o
      where o.id = obra_id and public.has_org_access(o.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.obras o
      where o.id = obra_id and public.has_org_access(o.organization_id)
    )
  );

drop policy if exists insumo_preco_historico_org on public.insumo_preco_historico;
create policy insumo_preco_historico_org on public.insumo_preco_historico
  for all using (
    exists (
      select 1 from public.insumos i
      where i.id = insumo_id and public.has_org_access(i.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.insumos i
      where i.id = insumo_id and public.has_org_access(i.organization_id)
    )
  );

drop policy if exists composicao_itens_org on public.composicao_itens;
create policy composicao_itens_org on public.composicao_itens
  for all using (
    exists (
      select 1 from public.composicoes c
      where c.id = composicao_id and public.has_org_access(c.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.composicoes c
      where c.id = composicao_id and public.has_org_access(c.organization_id)
    )
  );

drop policy if exists purchase_request_items_org on public.purchase_request_items;
create policy purchase_request_items_org on public.purchase_request_items
  for all using (
    exists (
      select 1 from public.purchase_requests r
      where r.id = request_id and public.has_org_access(r.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.purchase_requests r
      where r.id = request_id and public.has_org_access(r.organization_id)
    )
  );

drop policy if exists quotation_items_org on public.quotation_items;
create policy quotation_items_org on public.quotation_items
  for all using (
    exists (
      select 1 from public.quotations q
      where q.id = quotation_id and public.has_org_access(q.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.quotations q
      where q.id = quotation_id and public.has_org_access(q.organization_id)
    )
  );

drop policy if exists quotation_suppliers_org on public.quotation_suppliers;
create policy quotation_suppliers_org on public.quotation_suppliers
  for all using (
    exists (
      select 1 from public.quotations q
      where q.id = quotation_id and public.has_org_access(q.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.quotations q
      where q.id = quotation_id and public.has_org_access(q.organization_id)
    )
  );

drop policy if exists quotation_prices_org on public.quotation_prices;
create policy quotation_prices_org on public.quotation_prices
  for all using (
    exists (
      select 1 from public.quotations q
      where q.id = quotation_id and public.has_org_access(q.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.quotations q
      where q.id = quotation_id and public.has_org_access(q.organization_id)
    )
  );

drop policy if exists purchase_order_items_org on public.purchase_order_items;
create policy purchase_order_items_org on public.purchase_order_items
  for all using (
    exists (
      select 1 from public.purchase_orders o
      where o.id = order_id and public.has_org_access(o.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.purchase_orders o
      where o.id = order_id and public.has_org_access(o.organization_id)
    )
  );

drop policy if exists lancamento_centros_org on public.lancamento_centros;
create policy lancamento_centros_org on public.lancamento_centros
  for all using (
    exists (
      select 1 from public.lancamentos l
      where l.id = lancamento_id and public.has_org_access(l.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.lancamentos l
      where l.id = lancamento_id and public.has_org_access(l.organization_id)
    )
  );

comment on schema public is 'RLS org: Obras/Compras/Financeiro. CC/obra_visibilidade fino pendente.';

-- Portal corretor: comissões isoladas + reservas de lote com prazo

create table if not exists public.corretor_comissoes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  corretor_id uuid not null,
  corretor_nome text not null,
  venda_ref text not null,
  empreendimento_nome text,
  valor_previsto numeric(14,2) not null default 0,
  valor_liberado numeric(14,2) not null default 0,
  valor_pago numeric(14,2) not null default 0,
  status text not null default 'prevista'
    check (status in ('prevista', 'liberada', 'paga')),
  created_at timestamptz not null default now()
);

create index if not exists corretor_comissoes_corretor_idx
  on public.corretor_comissoes (organization_id, corretor_id);

create table if not exists public.lote_reservas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  lot_id uuid not null references public.lots (id),
  corretor_id uuid not null,
  corretor_nome text not null,
  cliente_nome text,
  reservado_em date not null,
  expira_em date not null,
  status text not null default 'ativa'
    check (status in ('ativa', 'expirada', 'convertida', 'cancelada')),
  created_at timestamptz not null default now()
);

create index if not exists lote_reservas_ativas_idx
  on public.lote_reservas (organization_id, lot_id)
  where status = 'ativa';

comment on table public.corretor_comissoes is 'Comissões do portal do corretor (isolamento por corretor_id)';
comment on table public.lote_reservas is 'Reserva de lote com prazo de expiração (portal corretor)';

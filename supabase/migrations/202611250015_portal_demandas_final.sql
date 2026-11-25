-- Fechamento: comentários de demanda, pedidos cadastrais, gate gerencial

alter table public.demandas
  add column if not exists comentarios jsonb not null default '[]'::jsonb;

create table if not exists public.demanda_comentarios (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  demanda_id uuid not null references public.demandas (id) on delete cascade,
  autor text not null,
  texto text not null,
  created_at timestamptz not null default now()
);

create index if not exists demanda_comentarios_demanda_idx
  on public.demanda_comentarios (demanda_id);

create table if not exists public.pedidos_atualizacao_cadastral (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  cliente_id uuid,
  cliente_nome text not null,
  campo text not null,
  valor_atual text,
  valor_novo text not null,
  demanda_id uuid references public.demandas (id),
  status text not null default 'pendente'
    check (status in ('pendente', 'aprovado', 'recusado')),
  created_at timestamptz not null default now()
);

comment on table public.demanda_comentarios is 'Comentários em demandas (interno e portais)';
comment on table public.pedidos_atualizacao_cadastral is 'Pedido de atualização cadastral do portal do cliente';

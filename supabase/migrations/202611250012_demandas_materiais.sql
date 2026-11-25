-- Materiais de venda do portal corretor (metadados; arquivos em storage/static)

create table if not exists public.materiais_venda (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  titulo text not null,
  tipo text not null check (tipo in ('tabela', 'folheto', 'planta')),
  empreendimento_nome text,
  url text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- demandas.purchase_request_id / faturamento_id já previstos em 009

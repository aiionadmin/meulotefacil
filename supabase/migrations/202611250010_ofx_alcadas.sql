-- OFX imports + extensão de alçadas (pós-Parte 5 polish)

create table if not exists public.ofx_imports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  conta_id uuid not null references public.contas_bancarias (id),
  arquivo text not null,
  importado_em date not null default current_date,
  qtd int not null default 0,
  conciliados int not null default 0,
  fit_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.pagamentos
  add column if not exists ofx_fit_id text;

-- Tipos de alçada adicionais documentados na app (seed Fase 1):
-- Solicitação de compra, Desconciliação bancária, faixas OC.

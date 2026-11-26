-- Bloco K — Migração dos dados reais
-- Spec: docs/prompt-unico-meu-lote-facil.md Bloco K

create table if not exists public.import_origins (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  entity text not null,
  legacy_system text not null,
  legacy_id text not null,
  target_id uuid,
  payload jsonb not null default '{}'::jsonb,
  imported_at timestamptz not null default now(),
  unique (organization_id, entity, legacy_system, legacy_id)
);

create table if not exists public.import_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  source text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_count int not null default 0,
  updated_count int not null default 0,
  skipped_count int not null default 0,
  notes text
);

alter table public.import_origins enable row level security;
alter table public.import_runs enable row level security;

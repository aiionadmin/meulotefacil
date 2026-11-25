-- Bloco J — Configurações e parâmetros
-- Spec: docs/prompt-unico-meu-lote-facil.md Bloco J

create table if not exists public.app_parametros (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  grupo text not null,
  chave text not null,
  valor jsonb not null default '{}'::jsonb,
  unique (organization_id, grupo, chave)
);

alter table public.app_parametros enable row level security;

do $$ begin
  create policy app_parametros_org on public.app_parametros
    using (organization_id::text = coalesce(auth.jwt() ->> 'org_id', ''));
exception when duplicate_object then null; end $$;

-- Portal cliente: timeline de regularização + bloqueio de lead duplicado (CPF)

alter table public.leads
  add column if not exists cpf text;

create unique index if not exists leads_org_telefone_digits_uidx
  on public.leads (organization_id, (regexp_replace(telefone, '\D', '', 'g')))
  where deleted_at is null and telefone is not null;

create unique index if not exists leads_org_cpf_digits_uidx
  on public.leads (organization_id, (regexp_replace(cpf, '\D', '', 'g')))
  where deleted_at is null and cpf is not null and length(regexp_replace(cpf, '\D', '', 'g')) = 11;

alter table public.regularization_cases
  add column if not exists cliente_nome text,
  add column if not exists cliente_cpf text,
  add column if not exists docs_pendentes text[] not null default '{}',
  add column if not exists exigencias text[] not null default '{}',
  add column if not exists previsao_escritura date;

create table if not exists public.portal_doc_uploads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  regularization_case_id uuid not null references public.regularization_cases (id),
  cliente_cpf text not null,
  nome_arquivo text not null,
  url text not null,
  status text not null default 'recebido'
    check (status in ('recebido', 'em_analise', 'aceito', 'recusado')),
  created_at timestamptz not null default now()
);

comment on column public.leads.cpf is 'Opcional na captação; índice único por org para bloqueio de duplicidade';
comment on table public.portal_doc_uploads is 'Envio de documentos pendentes pelo portal do cliente';

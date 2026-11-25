-- Meus CNPJs / NFSe-Sefaz (desligados) + bloqueio em contas

create table if not exists public.meus_cnpjs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  cnpj text not null,
  razao_social text not null,
  certificado_validade date,
  emissao_nfse boolean not null default false,
  captura_sefaz boolean not null default false,
  ativo boolean not null default true,
  unique (organization_id, cnpj)
);

alter table public.contas_bancarias
  add column if not exists bloqueio_ate date;

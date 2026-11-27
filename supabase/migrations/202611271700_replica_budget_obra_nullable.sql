-- Orçamento por obra sem empreendimento obrigatório + flag G20 em financeiro_config.
-- Sem deploy automático.

alter table public.budgets
  alter column development_id drop not null;

alter table public.financeiro_config
  add column if not exists abrir_etapas_itens_automatico boolean not null default true;

comment on column public.budgets.development_id is
  'Opcional quando obra_id está preenchido (orçamento independente).';

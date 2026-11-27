-- Colunas extras para dual-write (naturezas / compras_config tipagem completa).
-- Sem deploy automático; aplicar na VPS à parte.

alter table public.naturezas_receita
  add column if not exists linha_resultados text;

comment on column public.naturezas_receita.linha_resultados is
  'Linha canônica nos Resultados (§5.9)';

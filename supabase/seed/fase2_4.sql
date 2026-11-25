-- Seed mínimo Fases 2–4 (espelha lib/domain/carteira-seed.ts)
-- Requer seed Fase 1 (organizations).

insert into public.developments (id, organization_id, codigo, nome, tipo, status, cidade, uf, qtd_quadras, qtd_lotes)
select
  'a0000000-0000-4000-8000-000000000001'::uuid,
  o.id,
  'HOR',
  'Residencial Horizonte',
  'loteamento',
  'em_andamento',
  'Campinas',
  'SP',
  4,
  80
from public.organizations o
where o.cnpj = '12.345.678/0001-90'
on conflict do nothing;

insert into public.lots (
  id, organization_id, development_id, quadra, lote, area, valor, valor_m2, status, bloqueia_venda
)
select
  'b0000000-0000-4000-8000-000000000001'::uuid,
  o.id,
  'a0000000-0000-4000-8000-000000000001'::uuid,
  'A', '01', 250, 185000, 740, 'vendido', true
from public.organizations o
where o.cnpj = '12.345.678/0001-90'
on conflict do nothing;

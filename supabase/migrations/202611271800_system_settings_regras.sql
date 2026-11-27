-- Regras do sistema editáveis (índice padrão, validade da reserva, etc.)
-- UI: /configuracoes + /configuracoes/indices + parâmetros.
-- Snapshot demo também persiste via storeKey "systemSettings".

insert into public.app_parametros (organization_id, grupo, chave, valor)
select
  o.id,
  g.grupo,
  g.chave,
  g.valor::jsonb
from public.organizations o
cross join (
  values
    ('sistema', 'indice_padrao', '"IGPM"'),
    ('vendas', 'validade_reserva_dias', '7'),
    ('reajuste', 'indice_padrao', '"IGPM"'),
    ('reajuste', 'base_anual_mes', '1'),
    ('encargos', 'dias_tolerancia_mora', '2'),
    ('encargos', 'taxa_mora_mes', '0.01'),
    ('encargos', 'taxa_multa', '0.02')
) as g(grupo, chave, valor)
on conflict (organization_id, grupo, chave) do nothing;

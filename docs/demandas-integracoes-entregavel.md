# Demandas · integrações + materiais corretor — entregável

Base: tip de `cursor/relatorios-pdf-nfse-fec9` (#35).

## Pronto neste PR

- Demanda → **Gerar SC** (compras) e **Gerar cobrança** (faturamento) com vínculo.
- Relatório: por tipo, tempo médio, atrasadas por responsável.
- Portal corretor: materiais de venda (tabela, folheto, planta stub) em `/public/materiais/`.

## Como testar

1. `/demandas` → lista → abrir DEM-100 → Gerar SC → ver em `/compras`.
2. Mesma demanda → Gerar cobrança → `/financeiro/recebimentos`.
3. Relatório no rodapé da tela de demandas.
4. `/portal/corretor` → Materiais → Baixar.

## Ainda aberto

- Auth SMS/e-mail, PDF binário, provedor NFSe, sync Supabase.

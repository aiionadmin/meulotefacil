# Parte 4 — entregável (Financeiro)

Prompt: `docs/prompt-cursor-meu-lote-facil.md` §5.

## Pronto neste PR

- Migration `202611250008_parte4_financeiro.sql` (planos, categorias, naturezas, contas, lançamentos/centros, pagamentos, faturamentos, recebimentos, pré-lançamentos, transferências, NF, config).
- Store demo `lib/store/financeiro-store.tsx` + seed com plano/categorias Mais Controle.
- Telas: Pagamentos, Recebimentos/Faturamentos, Pré-lançamentos, Contas, Transferências, Fluxo (3 visões), Resultados, Notas, Plano/Categorias.
- Lançamento parcelado com rateio obra+empresa; baixa parcial e estorno; transferência move saldos; recebimento origem `contrato` somente leitura.
- Teste: `npx tsx lib/domain/financeiro-flow.test.ts`.

## Como testar

1. `/financeiro` → Novo lançamento (rateio 60/40 + parcelado) → ver 2+ pagamentos.
2. Pagar / Baixa 50% / Estornar.
3. `/financeiro/recebimentos` → Novo faturamento; parcela contrato não baixa manualmente.
4. `/financeiro/transferencias` → transferir entre contas e ver saldos em Contas.
5. `/financeiro/fluxo` e `/resultados` nas visões Geral / Empresa / Obras.
6. `/financeiro/plano-contas` → conferir carga de categorias.

## Pendente

- Extrato dia a dia, OFX, PDF relatórios, alçadas de conciliação, Sefaz/NFSe ativos, sync Supabase.
- Parte 5 (dashboards, portais, demandas).

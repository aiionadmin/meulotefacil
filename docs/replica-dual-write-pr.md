# PR Dual-write scaffolding (planos / obras / compras_config)

Base: `cursor/replica-visib-alcada-fec9` (PR #103).

## Pronto

- `lib/persist/dual-write.ts` — upsert best-effort em `planos_conta`, `categorias_financeiras`, `naturezas_receita`, `compras_config`, `obras`
- `stableUuid` para mapear ids de seed (`pla-…`) → UUID
- Hooks nos stores Financeiro / Compras / Obras (falha só loga; UI segue no snapshot)
- Migration `202611271500_replica_dual_write_cols.sql` (`linha_resultados` em naturezas)
- Tipos D/E/G atualizados

## Pendente

- Dual-write de lançamentos / pagamentos / SC / OC / cotação
- Sync de `obra_visibilidade` com `users` reais
- Leitura preferindo tabelas (ainda carrega snapshot)
- Aplicar migrations na VPS (sem deploy neste PR)

## Como testar

1. Sem Supabase: CRUD de plano / obra / params Compras continua ok (mode skipped)
2. Com Supabase: criar plano e conferir linha em `planos_conta` (id estável)
3. Revisar SQL — não rodar deploy

Sem deploy.

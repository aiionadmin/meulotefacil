# PR Leitura preferindo tabelas D/E/G

Base: `cursor/replica-cotacao-visib-rls-fec9` (PR #107).

## Pronto

- `loadObrasFromTables` / `loadFinanceiroFromTables` / `loadComprasFromTables`
- `useStorePersist` aplica overlay de tabelas por cima do snapshot quando há linhas
- Sem Supabase ou tabelas vazias → comportamento anterior (snapshot/seed)
- Snapshot continua sendo salvo (dual-write + snapshot em paralelo)

## Pendente

- Catálogo/nós de orçamento ainda só no snapshot
- Preferir tabelas 100% (desligar seed em produção com dados)
- Aplicar migrations / dados na VPS (sem deploy)

## Como testar

1. Sem Supabase: app carrega seed/snapshot normalmente
2. Com linhas em `obras` / `planos_conta` / `purchase_requests`: UI mostra esses registros no boot
3. `npx tsx lib/persist/load-from-tables.test.ts`

Sem deploy.

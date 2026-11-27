# PR Dual-write/read orçamento-catálogo / transferências / pré / anexos

Base: `cursor/replica-leitura-tabelas-fec9` (PR #108).

## Pronto

- Dual-write: insumos, composições (+ itens), nós de orçamento (`budgets`/`budget_nodes`), transferências, pré-lançamentos, anexos (`files`)
- Leitura: overlay de catálogo/nós, transferências, pré e anexos SC/cotação
- Migration: `budgets.development_id` nullable + flag G20 em `financeiro_config`

## Pendente

- Upload de blob real (só metadados em `files`)
- UX aceite (DnD / unsaved amplo / auto-etapas) — ver `docs/replica-ux-aceite-pr.md`
- Sem deploy

## Como testar

1. Sem Supabase: criar insumo/nó/transferência/pré/anexo — UI ok
2. Com Supabase: conferir linhas nas tabelas D/G/`files`
3. Boot com linhas → overlay no store

Sem deploy.

# PR Dual-write lançamentos / pagamentos / contas

Base: `cursor/replica-dual-write-fec9` (PR #104).

## Pronto

- Dual-write de `contas_bancarias`, `lancamentos` (+ `lancamento_centros`), `pagamentos`
- Hooks em `addConta`, `addLancamento`, baixa / estorno / conciliar / desconciliar
- Tipos gerados amplificados

## Pendente

- Dual-write SC / cotação / OC / faturamentos / recebimentos
- Leitura preferindo tabelas
- Aplicar migrations na VPS (sem deploy)

## Como testar

1. Criar lançamento parcelado → UI ok sem Supabase
2. Com Supabase: conferir linhas em `lancamentos` / `pagamentos` / `lancamento_centros`
3. Baixar e conciliar → upsert de status

Sem deploy.

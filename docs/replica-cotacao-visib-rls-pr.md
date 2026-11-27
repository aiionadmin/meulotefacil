# PR Cotação linha a linha + RLS Visível para

Base: `cursor/replica-dual-write-sc-fec9` (PR #106).

## Pronto

### Dual-write cotação
- Itens, fornecedores e preços gravados junto com o cabeçalho
- `setVencedor` / `setPrecoCotacao` sincronizam

### Visibilidade no banco
- Coluna `obras.visivel_para text[]`
- Sync `obra_visibilidade` por match de perfil/nome
- Função `can_see_obra` + policies em `obras`, SC, cotação e OC

## Pendente

- Leitura preferindo tabelas (ainda snapshot)
- Aplicar migrations na VPS (sem deploy)

## Como testar

1. Criar cotação → alterar preço/vencedor (UI ok sem Supabase)
2. Revisar SQL `202611271600_replica_obra_visib_rls.sql`
3. Com Supabase: obra fora do Visível para some nas queries

Sem deploy.

# PR Dual-write SC / Cotação / OC / Faturamento

Base: `cursor/replica-dual-write-lan-fec9` (PR #105).

## Pronto

- Dual-write `purchase_requests` (+ itens), `quotations`, `purchase_orders` (+ itens)
- Dual-write `faturamentos` e `recebimentos` (criar / baixar / estornar)
- Hooks nos fluxos SC→cotação→OC e faturamento

## Pendente

- Itens/preços/fornecedores de cotação linha a linha
- Leitura preferindo tabelas
- Aplicar migrations na VPS (sem deploy)

## Como testar

1. Criar SC → aprovar → cotar → gerar OC → aprovar (UI ok sem Supabase)
2. Faturar e baixar recebimento
3. Com Supabase: conferir linhas nas tabelas E/G

Sem deploy.

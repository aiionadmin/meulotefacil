# PR Obras — réplica Mais Controle

Base: `cursor/replica-base-comum-fec9` (PR #95).

## Pronto

- Títulos e filtros alinhados ao prompt: **Minhas Obras**, **Nova Obra**, **Orçamento** (Lista / Funil de Vendas)
- Rotas já canônicas: `/obras`, `/orcamentos`, `/gestao`, `/rdo`, `/medicoes/*`, `/catalogo/*`
- Critérios de aceite já cobertos pelo store existente: criar obra, orçamento com nós, RDO, Curva S, apropriação de despesa (telas `/obras/[id]`, `/rdo`, `/gestao`)

## Pendente / a validar com o cliente

- Painel lateral Nova Obra com seções recolhíveis completas (endereço, faturamento PJ/PF)
- Abas internas do orçamento (Proposta PDF, Contrato modelos, Cronograma Físico-Financeiro export)
- Medição de Obras/Contratos e RDO — não contratados no Mais Controle do cliente

## Como testar

1. `/obras` → Nova Obra (nome + visível para)
2. `/orcamentos` → alternar Lista de Orçamentos / Funil de Vendas
3. `/obras/[id]` → montar etapa/item; `/gestao` → ver orçado x realizado
4. `/rdo` → criar e aprovar

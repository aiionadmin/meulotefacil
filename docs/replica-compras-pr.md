# PR Compras — réplica Mais Controle

## Pronto

- Títulos **Solicitação**, **Cotação**, **Ordem de Compra**
- Centro de custo obrigatório na SC (já no store)
- OC exige cotação por padrão (`permitirOcSemCotacao: false`)
- Fluxo SC → Cotação → OC → lançamento

## Pendente

- Timeline 4 passos visual completa; upload PDF fornecedor (hook preparado)
- Alçada por faixa de valor × centro de custo na UI de Ajustes

## Como testar

1. Nova Solicitação com centro Obra → aprovar
2. Cotação a partir da SC → mapa → gerar OC
3. Aprovar OC → verificar lançamento em Pagamentos

# PR Financeiro — réplica Mais Controle

## Pronto

- Títulos canônicos: Pagamentos, Recebimentos, Pré-lançamentos, Notas Fiscais, Cobrança Fácil, Contas Bancárias, Transferências, Fluxo de Caixa, Resultados
- Formulário **Criar lançamento**; Cobrança Fácil reutiliza motor de boletos
- OFX / conciliação já na tela de Contas; Fluxo e Resultados com visões Empresa/Obra/Geral no store

## Pendente

- Painel Criar lançamento 1:1 (rateio multi-obra, retenções UI completa)
- Conciliação em 3 abas na ficha da conta
- Emissão NFSe / captura Sefaz (preparado, desligado)

## Como testar

1. `/financeiro/pagamentos` → Criar lançamento parcelado
2. `/financeiro/recebimentos` → Novo faturamento
3. `/financeiro/contas` → importar OFX / Transferências
4. `/financeiro/fluxo-de-caixa` e `/financeiro/resultados`
5. `/financeiro/cobranca-facil` → Ativar conta → `/boletos`

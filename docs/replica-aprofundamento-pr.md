# PR Aprofundamento — réplica Mais Controle

Base: `cursor/replica-financeiro-fec9` (PR #98).

## Pronto

### Obras
- **Nova Obra** em painel lateral (`FormSheet`) com Nome / Tipo / Status* / Visível para* no topo
- Seções recolhíveis em **Dados opcionais**: Dados gerais, Cliente, Endereço, Contatos, Conta bancária padrão, Faturamento (PJ/PF), Exibir obra para
- Botão **Salvar dados da obra**

### Compras
- Timeline da Solicitação com os 4 passos canônicos: **Criada → Aprovada → Atendida → Itens recebidos**
- Autor e data em cada passo (quando gravados no fluxo)
- Store grava `aprovadoEm/Por`, `atendidoEm/Por`, `recebidoEm/Por`

### Financeiro
- **Criar lançamento** em painel lateral 1:1: rateio multi-obra por % ou valor, retenções (tipos da lista), observações, marcar como pago
- **Conciliação** na ficha da conta com 3 abas: Pendentes / Conciliados / Arquivados (contadores, busca, filtro entrada/saída, sugestão automática, arquivar/desconciliar)
- `FormSheet` reutilizável em `ModuleToolkit`

## Pendente / a validar com o cliente

- Alçada de compras por faixa × centro de custo na UI de Ajustes
- Upload PDF do fornecedor na cotação (hook ainda preparado)
- Abas internas do orçamento (Proposta PDF, modelos de contrato, export físico-financeiro)
- Emissão NFSe / captura Sefaz (desligada)
- RLS plena por empresa/centro de custo no Supabase

## Como testar

1. `/obras` → Nova Obra → preencher opcionais recolhíveis → Salvar dados da obra
2. `/compras/solicitacoes` → abrir detalhe → ver timeline com autor/data após aprovar → cotar → receber
3. `/financeiro/pagamentos` → Criar lançamento → rateio em 2 obras + retenção
4. `/financeiro/contas` → clicar na conta → enviar OFX → Conciliar / Arquivar nas 3 abas

Sem deploy (conforme prompt).

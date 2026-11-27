# PR Alçada + Cotação PDF + Abas Orçamento

Base: `cursor/replica-aprofundamento-fec9` (PR #99).

## Pronto

### Alçadas (Ajustes)
- Modelo com **faixa** (`valorMinimo`–`valorMaximo`) e **centro de custo** (Obra / Empresa / Qualquer)
- CRUD em painel lateral; seed com faixas SC/OC por obra e empresa
- `canApprove` considera faixa + centro; SC e OC passam `centroTipo`

### Cotação
- Aba **Arquivos**: upload PDF do fornecedor + stub `parseCotacaoPdf` (IA preparada, desligada)
- Preços editáveis no mapa; `setPrecoCotacao` no store

### Orçamento (`/obras/[id]`)
- Abas: Orçamento, Proposta, Contrato, Cronograma, Físico-Financeiro, Arquivos, Relatórios
- **Gerar proposta (PDF)** via HTML imprimível
- Modelos de contrato e relatórios (stubs funcionais de impressão/export)

## Pendente

- Parser/IA real de PDF de cotação
- Modelos de contrato persistidos + storage de arquivos
- RLS Supabase por empresa/centro
- NFSe / Sefaz

## Como testar

1. `/configuracoes/alcadas` → Nova alçada com faixa e centro Obra
2. Aprovar SC/OC acima da faixa com perfil errado → bloqueio
3. `/compras/cotacoes` → Arquivos → PDF; editar preço no mapa
4. `/obras/[id]` → Proposta → Gerar proposta; Físico-Financeiro → Excel

Sem deploy.

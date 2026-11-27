# PR Painel §7 + Notas/NFSe + Exportar financeiro

Base: `cursor/replica-alcada-orcamento-fec9` (PR #100).

## Pronto

### §5.5 Notas Fiscais
- Upload XML/PDF **persiste** nota no store
- Vincular / desvincular lançamento
- Meus CNPJs com toggles **Emissão NFSe** e **Captura automática** (flags locais; provedor desligado)
- Colunas CNPJ emissor e Meu CNPJ

### §5.9 Plano / naturezas
- Plano receita renomeado para **Receita Operacional Bruta**
- 15 naturezas canônicas com `linhaResultados`
- Categoria **Despesas Financeiras (JUROS e MULTAS)**

### §6 Central de relatórios
- Exportação CSV+PDF: Pagamentos, Recebimentos, Lançamentos (filtro centro)
- Catálogo ampliado (Orçamento / Financeiro / Compras)
- Redirect `/exportar` → `/relatorios`

### §7 Painel operacional
- Gestão de obras (abas Em andamento / Paralisada / Finalizada)
- Aging por conta (90d / hoje / 7d / 30d) para pagamentos e recebimentos
- Pré-lançamentos pendentes/recusados e NFs sem vínculo
- Resumo de fluxo com filtro de centro

## Pendente

- Provedor real NFSe / Sefaz
- RLS Supabase por empresa/centro
- Layout pixel-perfect dos PDFs (a validar)

## Como testar

1. `/financeiro/notas-fiscais` → upload XML → Vincular a um lançamento
2. Meus CNPJs → ligar NFSe/Captura (só flag)
3. `/relatorios` → Pagamentos / Recebimentos / Lançamentos
4. `/dashboard/operacional` → blocos de obras, aging e fluxo

Sem deploy.

# PR Visibilidade de obras + alçada na conciliação

Base: `cursor/replica-plano-rls-fec9` (PR #102).

## Pronto

### Visível para (§3.3 / §8)
- Helper `canSeeObra` / `filterObrasVisiveis` (chave, verTodasObras, obraIds, perfil/nome)
- Lista Minhas Obras, Orçamento, Gestão, seletores de centro (SC e Pagamentos)
- Detalhe `/obras/[id]` bloqueado se sem visibilidade

### Alçada na conciliação (ficha da conta)
- Conciliar / Desconciliar na ficha da conta passam por `canApprove` (como em Pagamentos)

### FormSheet
- Prop `dirty` com confirmação ao sair com alterações não salvas (Nova Obra)

### G20 config
- Flag **Abrir etapas e itens ao selecionar a obra** em parâmetros Financeiro

## Pendente

- Dual-write store → tabelas D/E/G
- RLS fino SQL por `obra_visibilidade` (UI já filtra)
- Auto-expand real de etapas/itens no formulário de lançamento (flag persistida)

## Como testar

1. Trocar perfil sem “Comercial” → obra só Visível para Comercial some de `/obras`
2. Contas → OFX → Conciliar com perfil sem alçada Financeiro → bloqueia
3. Nova Obra → editar → Cancelar → confirma saída
4. `/configuracoes/parametros/financeiro` → toggle abrir etapas → Salvar

Sem deploy.

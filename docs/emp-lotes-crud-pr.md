# CRUD empreendimentos e lotes

## O que mudou
- Store: `removeDevelopment` / `removeLot` (bloqueia se contrato ativo / lote vendido).
- Empreendimentos: clique na linha ou **Editar** abre formulário; **Excluir empreendimento** no rodapé.
- Lotes: ficha → **Editar lote** (quadra, área, valor, status, confrontações, matrícula) e **Excluir lote**.

## Como testar
1. `/empreendimentos` → clique num empreendimento → altere nome → Salvar.
2. Editar → Excluir (só se sem contratos ativos).
3. Abra um lote disponível no quadro → Editar lote → salve → Excluir lote.

Empilhado sobre #115.

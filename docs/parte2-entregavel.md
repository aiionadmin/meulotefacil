# Parte 2 — entregável (Obras + RDO)

Prompt: `docs/prompt-cursor-meu-lote-facil.md` §3.

## Pronto neste PR

- Migration `202611250006_parte2_obras_rdo.sql` (obras independentes, insumos, composições, RDO, curva S, cronograma).
- Store demo `lib/store/obras-store.tsx` + seed.
- Menu Obras: Minhas obras, Orçamentos (lista/funil), Gestão, RDO, Insumos, Composições.
- Detalhe da obra: árvore etapa/subetapa/item, BDI/preço, apropriar despesa, gerar Curva S.
- RDO: criar (bloqueia data duplicada), enviar, aprovar (atualiza % físico), devolver com motivo.
- Teste: `npx tsx lib/money/orcamento.test.ts`.

## Como testar

1. `/obras` → Nova obra (sem empreendimento).
2. Abrir obra → + Item com composição → ver custo/preço.
3. Apropriar despesa → Gestão mostra realizado.
4. Gerar Curva S.
5. `/obras/rdo` → Novo RDO → Enviar → Aprovar → físico sobe na obra.

## Pendente

- Gantt com caminho crítico/export, calendário de expediente, sync Supabase real.
- *(Parcial no polish pós-#32: Gantt básico, PDF RDO stub, fotos no RDO.)*

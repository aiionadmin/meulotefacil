# Polish gaps — entregável (pós-Parte 5)

Base: tip de `cursor/prompt-parte5-portais-fec9` (#32). Não é “Parte 6”.

## Pronto neste PR

- **Dashboard → listas**: KPIs clicáveis em `/dashboard/operacional` e `/gerencial`; filtros por query em `/compras`, `/financeiro`, `/financeiro/recebimentos`, `/obras`, `/demandas`.
- **Matriz de permissões**: `/configuracoes/perfis` com rotinas RDO, Aprovar RDO, Demandas, Dashboard gerencial, import/edição em lote, corrigir avanço, portais; perfil **Cliente** externo.
- **Gantt básico**: seção no detalhe da obra a partir do cronograma seed.
- **RDO**: botão PDF/imprimir (stub HTML), painel Abrir com upload de fotos (câmera/arquivo).
- **Cotação pública**: `/cotacao/[token]` (ex.: `/cotacao/tok-sul`) para o fornecedor responder preços.
- **Portais**: gate de login CPF/e-mail + código `demo` em `/portal/cliente` e `/portal/corretor`.

## Como testar

1. `/dashboard/operacional` → clique em “SC em aprovação” → `/compras?status=em_aprovacao`.
2. `/obras/obr-1` (ou primeira obra) → Cronograma · Gantt.
3. `/obras/rdo` → Abrir → anexar foto → PDF.
4. `/cotacao/tok-sul` → enviar preços.
5. `/portal/cliente` → CPF `123.456.789-00` / código `demo`.
6. `/configuracoes/perfis` → trocar perfil e marcar checkboxes.
7. `npx tsx lib/domain/polish-gaps.test.ts`

## Ainda aberto

- Auth real (SMS/e-mail), PDF nativo (não print), Gantt com caminho crítico/export, sync Supabase/RLS produção, alçadas e OFX (Partes 3–4).

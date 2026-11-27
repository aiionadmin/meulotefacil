# PR Base comum — réplica Obras/Compras/Financeiro

Prompt: `docs/prompt-replica-obras-compras-financeiro.md`

## Pronto neste PR

- Menus e rotas canônicas (§2): Minhas Obras, Orçamento, Medições, Gestão, RDO, Catálogo, Solicitação/Cotação/OC, Pagamentos… Cobrança Fácil, Fluxo de Caixa
- Redirects das rotas antigas (`/obras/orcamentos` → `/orcamentos`, `/compras` → `/compras/solicitacoes`, etc.)
- `NOVO_ATALHOS` com Lançamento, Faturamento, Transferência, Solicitação, Cotação, OC
- Helper `lib/centro-custo.ts`
- Matriz de permissões expandida (rotinas Obras/Compras/Financeiro/Catálogo)
- Telas novas: Medição de Obras, Medição de Contratos, Cobrança Fácil
- Páginas movidas para as rotas do prompt (conteúdo existente preservado)

## Pendente (PRs seguintes)

- **Obras:** formulário Nova Obra completo, abas do orçamento, Curva S/Gantt aprofundados, RDO mobile
- **Compras:** timeline SC, mapa de cotação completo, alçada por faixa
- **Financeiro:** painel Criar lançamento fiel ao Mais Controle, conciliação OFX na conta, Resultados/Fluxo nas 3 visões refinados
- Migrations/RLS “nada em localStorage” — dual-write Supabase ainda gradual (store atual)

## Como testar

1. Abrir o menu lateral: itens Obras / Catálogo / Compras / Financeiro na ordem do prompt
2. Navegar `/orcamentos`, `/gestao`, `/rdo`, `/catalogo/insumos`, `/compras/solicitacoes`, `/financeiro/pagamentos`, `/financeiro/cobranca-facil`
3. Confirmar que `/obras/orcamentos` redireciona para `/orcamentos`
4. Criar medição em `/medicoes/obras` e `/medicoes/contratos`
5. Ativar Cobrança Fácil em uma conta e abrir `/boletos`

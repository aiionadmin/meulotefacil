# PR Plano CRUD + Compras params + RLS org

Base: `cursor/replica-painel-nfse-fec9` (PR #101).

## Pronto

### Plano de contas (§5.9)
- CRUD de Planos, Categorias e Naturezas (FormSheet)
- Inativar; exclusão lógica bloqueada se houver lançamento/pagamento/faturamento

### Compras (Ajustes)
- Parâmetros editáveis: números iniciais, permitir OC sem cotação, documento obrigatório
- `updateConfig` no store (persiste via snapshot)

### RLS (migrations)
- `202611271400_replica_rls_org_obras_compras_financeiro.sql`
- Policies `has_org_access(organization_id)` em Obras/Compras/Financeiro + filhos
- Tipos D/E/G cores em `database.types.ts`

## Pendente

- Dual-write store → tabelas D/E/G
- RLS fino por centro de custo / `obra_visibilidade`
- Aplicar migration na VPS (sem deploy neste PR)

## Como testar

1. `/financeiro/plano-contas` → Novo plano / categoria / natureza; tentar inativar Materiais (bloqueia)
2. `/configuracoes/parametros/compras` → alterar switches → Salvar → criar OC sem cotação conforme flag
3. Revisar SQL da migration (não rodar deploy)

Sem deploy.

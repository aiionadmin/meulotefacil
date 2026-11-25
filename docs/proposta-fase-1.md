# Proposta — Fase 1 (schema + pastas)

Com base em `docs/especificacao.md` §1, §12 e §13.1.  
**Aguardando aprovação antes de migrations, seeds e telas da Fase 1.**

## Stack (proposta)

Manter o que já está no repo:

| Camada | Escolha |
| --- | --- |
| App | Next.js 15 App Router + TypeScript + Tailwind + componentes shadcn |
| Dados | PostgreSQL via Supabase (RLS + Auth); demo store local até a Fase 1 plugar |
| Validação | Zod |
| Listas | TanStack Table (já na dependência) |
| Kanban | dnd-kit (já na dependência); entra de verdade na Fase 8 |
| Anexos | Supabase Storage, máx. 10 MB |

Se a stack for outra, diga antes da Fase 1.

## Estrutura de pastas (proposta)

```text
app/
  (site)/                 # site público (já existe)
  (app)/                  # sistema autenticado
    layout.tsx
    dashboard/
    notificacoes/
    tarefas/
    quadros/              # Fase 8; stub de rotas na Fase 1
      jornada/
      cobranca/
      regularizacao/
      compras/
      obras/
      tarefas/
    comercial/            # Fase 8
    empreendimentos/      # Fase 2
    contratos/            # Fase 3
    recebimentos/         # Fase 4
    cobranca/             # Fase 9
    regularizacao/        # Fase 9 (substitui rotas REURB atuais aos poucos)
    obras/                # Fase 7
    compras/              # Fase 7
    financeiro/           # Fase 6
    fiscal/               # Fase 10
    cadastros/
      pessoas/            # Fase 1
      clientes/
      fornecedores/
      profissionais/
      corretores/
    relatorios/           # Fase 10
    arquivos/             # Fase 1
    configuracoes/        # Fase 1 (empresa, usuários, perfis, alçadas, listas, auditoria)
  auth/
  api/                    # rotas server-only para regras financeiras (nunca no front)

components/
  app/                    # shell, ModulePage, ModuleToolkit (já)
  domain/                 # formulários e listas por módulo (novo)
  kanban/                 # Fase 8

lib/
  auth/                   # sessão, perfil, visibilidade
  domain/                 # serviços por módulo (única fonte de regra menu+kanban)
  money/                  # helpers BRL / numeric — cálculos só no server
  masks/                  # CPF, CNPJ, CEP, telefone
  store/                  # demo store (transição até Supabase)
  supabase/

supabase/
  migrations/             # SQL versionado
  seed/                   # seeds pt-BR
  schema.sql              # consolidado (legado → migrar)

scripts/
  import/                 # Fase 5 / 7 — um script por entidade

tests/
  rules/                  # §11 (atraso, reajuste, operações) — a partir da Fase 3
```

## Schema Fase 1 (tabelas)

Todas as tabelas: `id uuid PK`, `organization_id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, opcional `legacy_system`, `legacy_id`.

### Acesso

- `organizations` — empresa (CNPJ, razão, logo, advogado OAB…)
- `profiles` — 12 perfis iniciais (§3.1)
- `profile_permissions` — rotina × ver / inserir_alterar / remover + permissões especiais (§3.2)
- `users` — vínculo Auth; perfil; status; chave; corretor vinculado
- `user_organizations` — multiempresa
- `user_developments` — visibilidade por empreendimento (Fase 2 usa; cria stub)
- `approval_rules` — alçadas (OC, conciliação, desconto, estorno…)
- `audit_log` — quem, quando, rotina, registro, before/after (sem CPF/renda em log)

### Apoio (mínimo Fase 1)

- `lookup_lists` / `lookup_items` — status de lote, tipos de parcela, formas de pagamento, etc. (§10.5)
- `settings` — chave/valor por organização (padrões de cobrança/venda entram depois)

### Pessoas

- `people` — PF/PJ, status, docs, contatos
- `person_roles` — cliente, comprador, fornecedor, profissional, corretor, sócio…
- `person_addresses`, `person_contacts`, `person_spouses`, `person_attorneys`
- `employees`, `brokers` — extensões de papel

### Geral

- `files`, `file_tags`, `comments`
- `tasks`, `task_boards` (Minhas tarefas no Início)
- `notifications`

### Stub para fases seguintes (só FK vazia / tabela mínima)

- `developments` (id + nome + organization_id) — para `user_developments` e centro de custo
- `cards` / `boards` / `board_columns` — nascem vazios; populados na Fase 3/8

**Fora da Fase 1:** contratos, parcelas, boletos, financeiro, obras, compras, fiscal, leads.

## Menu lateral Fase 1 (navegável)

Alinhar `lib/app-nav.ts` aos **15 menus** da §2, liberando só o que a Fase 1 entrega:

1. Início → Painel, Notificações, Minhas tarefas  
2. Quadros → links stub “em breve”  
3–12. Demais menus → stub ou rotas já demo, marcadas como provisórias  
13. Cadastros → Pessoas (+ filtros Clientes / Fornecedores / Profissionais / Corretores)  
14. Relatórios e arquivos → Arquivos (lista + upload demo/Storage)  
15. Configurações → Empresa, Usuários, Perfis, Alçadas, Listas de apoio, Auditoria  

Topbar: busca global (pessoa/CPF), seletor de empresa, notificações, botão Novo (atalhos: pessoa, tarefa).

## Critérios de pronto da Fase 1

- [ ] Migrations + seed dos 12 perfis e listas de apoio padrão  
- [ ] Login (Auth ou demo) carrega perfil e filtra menu  
- [ ] CRUD Pessoas com papéis, busca, paginação 10/25/50/100, export CSV  
- [ ] Upload de arquivo com tag (Storage ou demo)  
- [ ] Auditoria em create/update/delete lógico  
- [ ] Sem regra financeira no front  

## O que **não** farei sem aprovação

- Inventar campos/regras marcados “(confirmar)” na especificação  
- Migrar Access/LoteWin ou Mais Controle (Fase 5/7)  
- Implementar cálculos de juros/reajuste (Fase 3+, com testes §11)  
- Trocar a stack sem decisão explícita  

## Pedido de aprovação

Confirme ou ajuste:

1. Stack acima (ok / outra)?  
2. Estrutura de pastas (ok / mudanças)?  
3. Escopo das tabelas da Fase 1 (ok / cortar ou acrescentar)?  
4. Posso seguir com migrations + seed + telas da Fase 1 após o “sim”?

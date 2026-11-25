# Inventário completo — Meu Lote Fácil

Documento gerado a partir do código e docs do repositório `aiionadmin/meulotefacil` (tip com site institucional + sistema unificado em demo).  
**Escopo:** o que já existe hoje — site público, área autenticada, dados mock, design system, APIs, docs e ativos.  
**Não inventa** funcionalidades ausentes no código.

---

## 1. Visão do produto

A **Meu Lote Fácil** (L & A) é empresa de **regularização fundiária** (REURB-S / REURB-E) em Campinas e região desde **2005**. **Não vende lotes** — regulariza núcleos, loteamentos e condomínios.

O repositório concentra **dois produtos na mesma app Next.js**:

| Camada | Público | Função |
| --- | --- | --- |
| **Site institucional** | Aberto | Marketing, portfólio de núcleos, serviços, contato |
| **Sistema unificado** | Autenticado (`/dashboard`…) | Substitui **LoteWin** (lotes, contratos, carteira, boletos) + **Mais Controle** (obras, compras, financeiro) |

Modo atual de dados: **demo / stores locais** (+ mocks estáticos). Supabase Auth está preparado; sem `.env` o login demo continua.

---

## 2. Stack técnica

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js **15.5** (App Router) + React **19** + TypeScript |
| Estilo | Tailwind CSS **v4** + componentes estilo shadcn/Radix |
| Motion | GSAP 3, Lenis, Motion |
| Auth | Supabase (`@supabase/ssr`) + cookie demo `mlf_demo_session` |
| Forms / validação | react-hook-form, Zod |
| Tabelas | TanStack Table |
| Kanban | dnd-kit |
| Charts | Recharts |
| Temas | next-themes (site/app forçam tema claro onde aplicável) |
| Deploy helper | `ecosystem.config.cjs` (PM2), pasta `deploy/` |

Scripts: `dev`, `build`, `start`, `lint`.

---

## 3. Design system e marca

### Tokens (`app/globals.css`)

| Token | Uso |
| --- | --- |
| `--ink` / `--ink-deep` | Texto e faixas escuras |
| `--paper` / `--paper-muted` | Fundos claros |
| `--accent` / latossolo `#ED8600` | Laranja do logo MLF |
| `--mata` | Verde institucional |
| `--linha` | Bordas |
| Aliases | `brand-navy`, `brand-cream`, `grafite`, `papel` |

Tipografia: **Montserrat** (site inteiro). Raio padrão sóbrio (`--radius: 0.25rem`).

### Marca (`components/brand/Logo.tsx`, `public/brand/`)

- Logos MLF (full ink/orange, mark) e LA
- Favicon / PWA icons (`icon-192`, `icon-512`, `icon.svg`)
- Dados institucionais: `lib/institutional.ts` (sede, WhatsApp, Instagram, unidades, missão, stats)

### Componentes UI (`components/ui/`)

Primitives: accordion, avatar, badge, button, card, checkbox, command, dialog, dropdown, input, label, map, separator, sheet, skeleton, switch, tabs.  
Blocos 21st adaptados: `faq-05.tsx`, `editorial-testimonial.tsx`, `ridgeline-dither-footer.tsx`.

---

## 4. Site institucional (`app/(site)/`)

Layout (`app/(site)/layout.tsx`): Lenis, Preloader, PageTransition, `Header` fixo, `SiteBackLink`, `Footer` (Ridgeline).

### Rotas

| Rota | Página | Conteúdo |
| --- | --- | --- |
| `/` | Home | ScrollHero + seções (ver §4.1). **Não** monta mapa/simulador/marquee na home atual |
| `/quem-somos` | Institucional | Quem somos + timeline |
| `/sobre` | Legado | `redirect` → `/quem-somos` (também 301 em `next.config`) |
| `/regularizacao` | REURB hub | Intro, modalidades, processo, showcase CRF, grid, mapa, FAQ, CTA |
| `/regularizacoes` | Legado | **301** → `/regularizacao` (`next.config`; página ainda no repo) |
| `/regularizacoes/[slug]` | Ficha do núcleo | Detalhe + PDF CRF se existir em `public/docs/crf/` |
| `/consulta` | Legado | Redirect → `/regularizacao` (temporário em `next.config`) |
| `/servicos` | Serviços | `ServicosCards` |
| `/servicos/consultoria` | Consultoria municipal | Artigo + WhatsApp |
| `/servicos/planos-e-projetos` | Planos e projetos | Artigo + WhatsApp |
| `/noticias` | Notícias | Stub “em breve” |
| `/contato` | Contato | Unidades + formulário RHF/Zod (envio mock) + WhatsApp |

Navegação pública (`lib/site-nav.ts`): Home, Quem somos, Regularização, Serviços, Notícias, Contato. CTA: **Falar com a equipe** (WhatsApp). Links `/auth` **não** aparecem no menu público.

SEO: `app/sitemap.ts` (rotas estáticas + slugs de núcleos), `app/robots.ts` (permite `/`; bloqueia caminhos de app/auth).

### 4.1 Home — seções e ritmo de cor

Ordem em `app/(site)/page.tsx`:

| # | Seção | Componente | Superfície |
| --- | --- | --- | --- |
| 00 | Hero scroll | `ScrollHero` | Escuro (vídeo/frames) |
| 01 | Atuação | `ServicosCards` | `paper` |
| 02 | Método | `HowItWorks` | `ink` |
| 03 | Portfólio destaque | `RegularizacoesGrid` (limit 6) | `paper-muted` |
| 04 | Três pilares | `WhyUs` | `ink-deep` |
| 05 | Depoimentos | `Testimonials` + `editorial-testimonial` | `paper` |
| 06 | FAQ | `FAQ` + `faq-05` | mata-soft (`bg-accent`) |
| 07 | CTA final | `FinalCTA` | `ink-deep` |

### 4.2 Componentes de site (`components/site/`)

Header, Footer, SiteBackLink, SectionHeading, ServicosCards, HowItWorks, RegularizacoesGrid, RegularizacaoIntro/Showcase/FAQ, WhyUs, Testimonials, FAQ, FinalCTA, NucleosMap, LoteMap, SimuladorWidget, Marquee, Preloader, Hero (legado), ArcDivider, EmpreendimentosGrid.

### 4.3 Hero scroll (`components/hero/`)

- `ScrollHero.tsx` — scrub por scroll (não autoplay)
- `heroSteps.ts` — etapas / CTAs
- Frames: `public/hero-frames/` — **240** desktop + **144** mobile
- Extração: `HERO_FRAMES=240 HERO_MOBILE_FRAMES=144 ./scripts/extract-frames.sh …`
- Specs: `docs/prompt-video-hero.md`, `docs/video-hero-da-terra-ao-lar.md`
- A11y: `prefers-reduced-motion` / `saveData` amostram frames

### 4.4 Portfólio de núcleos (`lib/data/nucleos.ts`)

| Status | Qtde |
| --- | --- |
| `concluido` | 8 |
| `em_registro` | 2 |
| `em_andamento` | 17 |
| **Total** | **27** |

Cidades de atuação (institucional): Campinas, Hortolândia, Valinhos, Amparo.

### 4.5 PDFs CRF (`public/docs/crf/`)

- `CRF-PORTAL-DA-MATA.pdf`
- `CRF-VILA-DIVA-1a-Fase.pdf`
- `CRF-VILA-DIVA-2a-Fase.pdf`
- `CRF-VILA-PAULA.pdf`
- Helper: `lib/public-file.ts` (`publicFileExists`)

### 4.6 Copy REURB compartilhada

`lib/data/regularizacao-content.ts`: intro, modalidades REURB-S/E, etapas do processo, **FAQ pt-BR** (fonte única de `Faq05` na home e em `/regularizacao`).

Depoimentos: papéis anônimos (`Morador`, `Moradora`, `Representante`) com flag `published`; sem nomes fictícios em produção.

---

## 5. Autenticação (`app/auth/`)

| Rota | Função |
| --- | --- |
| `/auth` | Entrada |
| `/auth/login` | Login (Supabase ou demo) |
| `/auth/cadastro` | Cadastro |
| `/auth/recuperar-senha` | Recuperação |
| `/auth/redefinir-senha` | Redefinição |
| `/auth/callback` | OAuth callback (route handler) |

Middleware (`middleware.ts` → `lib/supabase/middleware.ts`) protege prefixos do app; sem Supabase configurado usa fluxo demo.

---

## 6. Sistema autenticado (`app/(app)/`)

Shell: `AppShell` + `AppSidebar` + `AppTopbar` (⌘K, breadcrumbs, logout).  
Navegação: **15 grupos** em `lib/app-nav.ts` (espelha `docs/especificacao.md`).

### 6.1 Menus e rotas

#### 1. Início
| Rota | Label |
| --- | --- |
| `/dashboard` | Painel |
| `/notificacoes` | Notificações |
| `/tarefas` | Minhas tarefas |

#### 2. Quadros (Kanban)
| Rota | Label |
| --- | --- |
| `/quadros/jornada` | Jornada do cliente |
| `/quadros/cobranca` | Cobrança |
| `/quadros/regularizacao` | Regularização e escritura |
| `/quadros/compras` | Compras |
| `/quadros/obras` | Obras |
| `/quadros/tarefas` | Tarefas |

Componentes: `components/kanban/KanbanBoard.tsx`, `BoardViews.tsx` (dnd-kit).

#### 3. Comercial
| Rota | Label |
| --- | --- |
| `/leads` | Leads |
| `/vendas` | Propostas e reservas |
| `/contratos` | Efetuar venda / contratos |

#### 4. Empreendimentos
| Rota | Label |
| --- | --- |
| `/empreendimentos` | Empreendimentos e lotes |
| `/empreendimentos/planta` | Planta do loteamento |

#### 5–6. Contratos e recebimentos
| Rota | Label |
| --- | --- |
| `/contratos` | Contratos |
| `/carteira` | Ficha financeira / caixa |
| `/reajustes` | Reajuste e operações |
| `/boletos` | Boletos, remessa e retorno |

#### 7. Cobrança e jurídico
| Rota | Label |
| --- | --- |
| `/cobranca` | Inadimplentes e acordos |
| `/juridico` | Processos judiciais |

#### 8. Regularização (REURB no app)
| Rota | Label |
| --- | --- |
| `/quadros/regularizacao` | Quadro |
| `/processos` | Processos REURB |
| `/nucleos` | Núcleos (+ mapa) |
| `/documentos` | Checklist / upload demo |
| `/protocolo` | Consulta por número |

#### 9–12. Obras, compras, financeiro, fiscal
| Rota | Label |
| --- | --- |
| `/obras` | Obras e orçamento |
| `/compras` | Solicitações e OC |
| `/financeiro` | Pagar, receber e contas |
| `/importacao` | Importação / conferência (LoteWin / Mais Controle) |
| `/fiscal` | NFe / NFSe / exportações |

#### 13. Cadastros
| Rota | Label |
| --- | --- |
| `/cadastros/pessoas` | Pessoas (cadastro único) |
| `/cadastros/clientes` | Clientes |
| `/cadastros/fornecedores` | Fornecedores |
| `/cadastros/profissionais` | Profissionais |
| `/cadastros/corretores` | Corretores |
| `/pessoas` | Atalho legado |

#### 14. Relatórios e arquivos
| Rota | Label |
| --- | --- |
| `/relatorios` | Central de relatórios |
| `/arquivos` | Repositório com tags |

#### 15. Configurações
| Rota | Label |
| --- | --- |
| `/configuracoes/empresa` | Empresa |
| `/configuracoes/usuarios` | Usuários |
| `/configuracoes/perfis` | Perfis de acesso |
| `/configuracoes/alcadas` | Alçadas |
| `/configuracoes/listas` | Listas de apoio |
| `/configuracoes/auditoria` | Auditoria |
| `/configuracoes` | Parâmetros (legado demo) |
| `/usuarios` | Atalho legado |

Atalhos “Novo”: Lead, Proposta, Pessoa, Venda, Tarefa, Boleto, SC, Lançamento a pagar (`NOVO_ATALHOS`).

### 6.2 Maturidade (estado atual)

Providers no `AppShell`: Fase1, Carteira, Operacoes, Fluxo, DemoStore (muitos usam **seed + `localStorage`** quando Supabase não está configurado).

Demos mais interativas já ligadas a store:

- Cadastros `/cadastros/*` → `fase1-store` (`PeopleModule`)
- Leads / vendas / cobrança / jurídico / jornadas → `fluxo-store`
- Empreendimentos, contratos, carteira, boletos, reajustes → `carteira-store`
- Obras / compras / financeiro / importação → `operacoes-store`
- Quadros Kanban → `BoardViews` + stores acima (dnd-kit)
- `/documentos`, `/protocolo`, `/nucleos` (mapa + sheet)
- Cálculo de atraso: `/api/carteira/atraso` (+ teste `lib/money/atraso.test.ts`)

Redirects de atalho: `/pessoas` → `/cadastros/pessoas`, `/usuarios` → `/configuracoes/usuarios`.

Nível alvo (spec): CRUD + RLS Supabase + regras financeiras **no servidor**. Produção ainda em fases (ver §9).

### 6.3 Shell de módulo (`components/app/`)

AppShell, AppSidebar, AppTopbar, ModulePage (header, KPI grid, DataTable, StatusPill), ModuleToolkit, PhaseStub, EmptyState, LoteMapLazy, SalesChart(+Lazy).

---

## 7. Dados e domínio (`lib/`)

### 7.1 Dados estáticos / mocks

| Arquivo | Conteúdo |
| --- | --- |
| `lib/data/nucleos.ts` | Portfólio REURB do site/app |
| `lib/data/regularizacao-content.ts` | Copy editorial REURB + FAQ |
| `lib/data/processos.ts` | Processos / protocolo mocks |
| `lib/data/sistema.ts` | Mock principal dos módulos unificados |
| `lib/data/clientes.ts` | Clientes / demo user |
| `lib/data/empreendimentos.ts` / `lotes.ts` | Inventário site/mapa |
| `lib/data/types.ts` | Tipos legados CRM |

### 7.2 Domínio tipado + seeds

| Pasta | Temas |
| --- | --- |
| `lib/domain/*-types.ts` / `*-seed.ts` | fase1, carteira, fluxo, operações |

### 7.3 Stores (providers)

| Store | Papel |
| --- | --- |
| `demo-store.tsx` | Demo geral + auditoria local |
| `fase1-store.tsx` | Pessoas / acesso (Fase 1) |
| `carteira-store.tsx` | Parcelas / caixa |
| `fluxo-store.tsx` | Fluxos comerciais/financeiros |
| `operacoes-store.tsx` | Operações de contrato |

### 7.4 Outros

- `lib/money/atraso.ts` + `app/api/carteira/atraso` — juros/multa de referência
- `lib/simulador.ts` — simulador público
- `lib/masks/*` — CPF/CNPJ/CEP/telefone
- `lib/auth-demo.ts` — sessão demo
- `lib/gsap.ts` — helpers GSAP + reduced motion

---

## 8. APIs

| Rota | Função |
| --- | --- |
| `/api/health` | Health check |
| `/api/carteira/atraso` | Cálculo de encargos de atraso |

---

## 9. Fases do sistema unificado (docs)

Fonte: `docs/proposta-fase-*.md`, `docs/especificacao.md`, `docs/relatorio-sistema-unificado.md`.

| Fase | Escopo (proposta) |
| --- | --- |
| **1** | Schema + pastas + pessoas/acesso (aprovada; em implementação com store) |
| **2–4** | Empreendimentos, vendas/contratos, carteira |
| **5–7** | Importação, financeiro, obras/compras |
| **8–10** | Jornada/kanban, cobrança/REURB quadro, fiscal/relatórios |

**14 módulos unificados** (visão do relatório): Pessoas; Usuários/perfis; Empreendimentos e lotes; Vendas e contratos; Carteira; Boletos; Reajuste/operações; Obras; Compras; Financeiro; Fiscal; Painéis/relatórios; Tarefas/arquivos; Configurações.  
REURB (processos/núcleos/docs/protocolo) entra como capacidade adicional alinhada ao negócio.

Dados legados a migrar (relatório): ~41 empreendimentos, ~13k lotes, ~3,5k compradores, ~3,7k contratos, carteira ~R$ 39M (LoteWin); usuários Mais Controle.

---

## 10. Supabase

| Item | Caminho |
| --- | --- |
| Schema | `supabase/schema.sql` |
| Migrations | `supabase/migrations/` |
| Seed | `supabase/seed/` |
| Clients | `lib/supabase/*` |

Migrations presentes:

1. `202611250001_fase1_acesso_pessoas.sql`
2. `202611250002_fase2_4_estoque_carteira.sql`
3. `202611250003_fase5_7_import_financeiro_obras.sql`
4. `202611250004_fase8_10_fluxo.sql`

Sem `NEXT_PUBLIC_SUPABASE_URL` / anon key em `.env.local` → modo demo. Anexos previstos: Storage até 10 MB (spec).

---

## 11. Testes e qualidade

- `lib/money/atraso.test.ts` — encargos de referência
- `tests/rules/` — regras adicionais
- ESLint (`eslint.config.mjs`); sem script `test` no `package.json` ainda
- TypeScript via `tsconfig.json`

---

## 12. Documentação no repositório (`docs/`)

| Arquivo | Assunto |
| --- | --- |
| `especificacao.md` | Spec completa do sistema unificado (prompt mestre) |
| `relatorio-sistema-unificado.md` (+ PDF) | O que o sistema precisa ter (MC + LW) |
| `proposta-fase-1.md` … `proposta-fase-8-10.md` | Cortes por fase |
| `componentes-21st.md` | Notas de componentes 21st |
| `prompt-video-hero.md` / `video-hero-da-terra-ao-lar.md` | Hero |
| `brand/` | Materiais de marca |

README raiz: overview de site + sistema + hero frames.

---

## 13. Preferências operacionais deste projeto

- Preferência do cliente: **GitHub / PRs**; **sem deploy VPS** salvo pedido explícito
- Site: contraste claro, header fixo, seções com ritmos de cor distintos, setas forward removidas (mantém seta de **Voltar** no `SiteBackLink`)
- Conteúdo FAQ/depoimentos em **pt-BR**; depoimentos sem nomes pessoais inventados

---

## 14. Mapa rápido de pastas

```
app/
  (site)/          # site institucional
  (app)/           # sistema autenticado
  auth/            # login / cadastro / senha
  api/             # health, carteira/atraso
components/
  site/ hero/ brand/ app/ kanban/ ui/ …
lib/
  data/ domain/ store/ supabase/ money/ …
public/
  brand/ hero-frames/ docs/crf/ …
docs/              # especificação e propostas de fase
supabase/          # schema, migrations, seed
scripts/           # extract-frames, import
tests/rules/
```

---

## 15. O que ainda não é “completo” (honesto)

- Persistência real multiempresa + RLS em todos os módulos
- CRUD e drawers de detalhe em todas as rotas do app (muitas ainda são mock de leitura)
- Regras financeiras 100% no servidor com cobertura de testes ampla
- Importação produtiva LoteWin / Mais Controle
- Depoimentos com pessoas reais autorizadas (hoje: papéis anônimos publicados)
- Conteúdo institucional pontual (e-mail/CNPJ, etc. — lacunas listadas no conteúdo do site)

---

*Inventário alinhado ao tip do stack do site + sistema. Detalhe tela a tela da especificação: `docs/especificacao.md` e `docs/relatorio-sistema-unificado.md`. Inventário técnico complementar (explore): store `internal/codebase-full-inventory.md`.*

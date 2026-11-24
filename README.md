# Meu Lote Fácil — Regularização Fundiária

Site institucional animado + sistema de acompanhamento de processos (REURB-S / REURB-E) para Campinas e região, desde 2005.

> **Importante:** a Meu Lote Fácil **não vende lotes** — regulariza loteamentos, núcleos residenciais e condomínios.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 + UI no estilo shadcn (tokens da marca)
- GSAP 3 + Lenis
- Supabase Auth (`@supabase/ssr`) com **modo demo** se `.env` estiver vazio

## Como rodar

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

WhatsApp principal: **(19) 99146-1834**  
Acompanhar processo: `/auth/login` → **Entrar em modo demo**.

## Conteúdo

Fonte: `conteudo-novo-site.md` (store do projeto).

| Conteúdo | Arquivo |
|---|---|
| Dados institucionais / WhatsApp | `lib/institutional.ts` |
| Núcleos (portfólio) | `lib/data/nucleos.ts` |
| Processos / protocolo mocks | `lib/data/processos.ts` |
| Copy das seções | `components/site/*` |

## Estrutura do site

- `/` — Home (hero, serviços, etapas, portfólio, mapa, consulta de bairro, FAQ)
- `/regularizacoes` — Portfólio de núcleos
- `/consulta` — “Meu bairro está sendo regularizado?”
- `/servicos` — Consultoria municipal + planos/projetos
- `/sobre` · `/contato` (unidades + WhatsApp)

## Sistema (`/auth` → área logada)

Painel, processos (núcleo/fase/docs), núcleos, documentos do morador, consulta de protocolo, configurações.

## Ligar o Supabase

1. Rode `supabase/schema.sql` (ajuste tabelas para processos/núcleos conforme evoluir).
2. Preencha `.env.local` com URL e anon key.
3. Sem vars = modo demo continua funcionando.

## Lacunas (conteúdo)

Ver lista no final de `conteudo-novo-site.md` (e-mail/CNPJ, números divergentes FAQ vs home, depoimentos reais, LGPD, etc.).

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

## Hero scroll (Terreno → Pronto)

O topo da home usa `components/hero/ScrollHero.tsx`: o scroll scruba uma sequência WebP (não autoplay).

| Trocar… | Onde |
|---|---|
| Textos / etapas / CTAs | `components/hero/heroSteps.ts` |
| Prompt do vídeo | `docs/prompt-video-hero.md` |
| Frames | `public/hero-frames/` (+ `mobile/`) — 150 desktop / 90 mobile |
| Extração | `./scripts/extract-frames.sh video.mp4` |

```bash
chmod +x scripts/extract-frames.sh
./scripts/extract-frames.sh caminho/para/hero.mp4
```

A11y: `prefers-reduced-motion` mostra o último frame + textos empilhados. Conexões lentas / `saveData` usam 30 frames amostrados.

## Lacunas (conteúdo)

Ver lista no final de `conteudo-novo-site.md` (e-mail/CNPJ, números divergentes FAQ vs home, depoimentos reais, LGPD, etc.).

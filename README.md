# Meu Lote Fácil

Site institucional animado + casca do sistema (área logada) para venda de lotes/terrenos.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 + componentes no estilo shadcn (tokens da marca)
- GSAP 3 (`ScrollTrigger`, `SplitText`, `DrawSVGPlugin`, `MorphSVGPlugin`, `Flip`) + Lenis
- Supabase Auth (`@supabase/ssr`) com **modo demo** se `.env` estiver vazio
- react-hook-form + zod, Recharts, TanStack Table, dnd-kit

## Como rodar

```bash
npm install
cp .env.example .env.local   # opcional — sem vars = modo demo
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Área logada: [http://localhost:3000/auth/login](http://localhost:3000/auth/login) → **Entrar em modo demo**.

```bash
npm run build
npm start
```

## Marca

- Logos raster em `public/brand/` (`logo-laranja.png`, `logo-azul.jpg`)
- Logo SVG animável: `components/brand/Logo.tsx` (variantes `full` | `symbol` | `mono`)
- Tokens CSS em `app/globals.css` (`--brand-navy`, `--brand-orange`, etc.)
- Tipografia: **Jost** via `next/font`

## Onde trocar textos e imagens

| Conteúdo | Arquivo |
|---|---|
| Empreendimentos | `lib/data/empreendimentos.ts` |
| Lotes / mapa | `lib/data/lotes.ts` |
| Clientes, propostas, financeiro | `lib/data/clientes.ts` |
| Placeholders visuais | `public/placeholders/` |
| Copy das seções da landing | `components/site/*` |
| Depoimentos | `components/site/Testimonials.tsx` (`// TODO: substituir por depoimentos reais`) |
| Fórmula do simulador | `lib/simulador.ts` |

## Ligar o Supabase

1. Crie um projeto no [Supabase](https://supabase.com).
2. Rode `supabase/schema.sql` no SQL Editor.
3. Preencha `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

4. (Opcional) Ative Google OAuth no painel Auth → Providers.
5. Reinicie o `npm run dev`. Com as vars presentes, o login real e o botão Google aparecem; sem elas, o app continua em modo demo.

Os módulos da área logada ainda usam mocks tipados — procure `// TODO: plugar Supabase` nos arquivos de página.

## Estrutura

```
app/(site)/     → landing + páginas institucionais
app/auth/       → login, cadastro, recuperação
app/(app)/      → shell do sistema (dashboard, lotes, …)
components/     → brand, site, auth, app, ui, motion
lib/            → gsap, supabase, data, simulador
supabase/       → schema.sql
```

## Animações

- Plugins registrados em `lib/gsap.ts`
- `prefers-reduced-motion`: desliga Lenis, scrub e parallax
- Mobile: `gsap.matchMedia()` com versões mais leves (ex.: “Como funciona” sem pin)

## Licença

Privado — Meu Lote Fácil.

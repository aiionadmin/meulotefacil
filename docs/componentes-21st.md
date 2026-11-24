# Componentes 21st.dev / shadcn — registro de usos

Última atualização: etapa 1 (tokens + layout global).

## Política

Instalar via CLI (sem MCP):

```bash
npx shadcn@latest add "https://21st.dev/r/<autor>/<slug>"
```

Adaptar 100% aos tokens `ink` / `paper` / `accent` (+ `mata`, `linha`).  
Se o registry falhar (auth), usar shadcn/ui base + composição própria no mesmo visual.

## Etapa 1

| Bloco | Tentativa | Resultado | Implementação |
|-------|-----------|-----------|----------------|
| Navbar | `https://21st.dev/r/aceternity/floating-navbar` | **403 auth** (`authentication_required`) | `components/site/Header.tsx` — floating strip própria |
| Footer | `https://21st.dev/r/aceternity/footer` | **404** no registry | `components/site/Footer.tsx` — footer técnico próprio |
| Accordion / Tabs | shadcn local | Já presentes | `components/ui/*` |

`components.json` adicionado para próximos `shadcn add`.

## Próximas etapas (candidatos do plano)

| Bloco | URL | Status |
|-------|-----|--------|
| Hero shell | `https://21st.dev/r/aceternity/hero-section` | Pendente (Home) |
| Number ticker | `https://21st.dev/r/magicui/number-ticker` | Pendente |
| Timeline | `https://21st.dev/r/aceternity/timeline` | Pendente |
| Features | `https://21st.dev/r/aceternity/feature-sections` | Pendente |
| Cards notícias | `https://21st.dev/r/aceternity/card-hover-effect` | Pendente |

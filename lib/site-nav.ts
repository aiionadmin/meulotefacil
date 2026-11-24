/** Navegação institucional — 6 páginas (plano corporativo). */

export const SITE_NAV = [
  { href: "/", label: "Home" },
  { href: "/quem-somos", label: "Quem somos" },
  { href: "/regularizacao", label: "Regularização" },
  { href: "/servicos", label: "Serviços" },
  { href: "/noticias", label: "Notícias" },
  { href: "/contato", label: "Contato" },
] as const;

/** CTA público — sem links para /auth. */
export const SITE_NAV_CTA = {
  talk: { label: "Falar com a equipe" },
} as const;

export const FOOTER_COLS = [
  {
    title: "Site",
    links: SITE_NAV.map(({ href, label }) => ({ href, label })),
  },
  {
    title: "Serviços",
    links: [
      { href: "/servicos/consultoria", label: "Consultoria municipal" },
      { href: "/servicos/planos-e-projetos", label: "Planos e projetos" },
      { href: "/regularizacao", label: "Regularização" },
      { href: "/contato", label: "Contato" },
    ],
  },
] as const;

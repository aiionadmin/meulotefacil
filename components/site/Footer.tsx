"use client";

import RidgelineDitherFooter from "@/components/ui/ridgeline-dither-footer";
import { Logo } from "@/components/brand/Logo";
import { INSTITUTIONAL } from "@/lib/institutional";
import { FOOTER_COLS, SITE_NAV } from "@/lib/site-nav";

/**
 * Site footer — Ridgeline Dither Footer (21st) adaptado a ink/paper/Montserrat.
 * Sem links /auth.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <RidgelineDitherFooter
      name={INSTITUTIONAL.name}
      brandHref="/"
      logo={<Logo variant="mono" className="text-ink scale-90" />}
      tagline={`${INSTITUTIONAL.missao} Atuação em ${INSTITUTIONAL.atuacao.join(", ")} (SP), desde ${INSTITUTIONAL.founded}.`}
      columns={[
        {
          title: "Site",
          links: SITE_NAV.map(({ href, label }) => ({ href, label })),
        },
        {
          title: FOOTER_COLS[1].title,
          links: FOOTER_COLS[1].links.map(({ href, label }) => ({ href, label })),
        },
        {
          title: "Contato",
          links: [
            { href: "/contato", label: "Fale conosco" },
            {
              href: `https://wa.me/${INSTITUTIONAL.whatsappPrimary.digits}`,
              label: `WhatsApp ${INSTITUTIONAL.whatsappPrimary.display}`,
            },
            { href: INSTITUTIONAL.instagramUrl, label: "Instagram" },
          ],
        },
      ]}
      socials={[
        {
          icon: "instagram",
          href: INSTITUTIONAL.instagramUrl,
          label: "Instagram",
        },
      ]}
      copyright={`© ${year} ${INSTITUTIONAL.fullName}. Todos os direitos reservados.`}
      credit={null}
      preset="evergreen"
      palette={{
        paper: "#f3f1ec",
        ink: "#111614",
        muted: "#5a605c",
        line: "#d6d1c7",
        heart: "#a8502a",
        tones: [
          "#f3f1ec",
          "#e0e8e3",
          "#b7c9be",
          "#7a9886",
          "#3e5a4b",
          "#24362d",
          "#111614",
        ],
      }}
      seed={26}
      ridges={6}
      mist={0.75}
      maxWidth="82.5rem"
      fontFamily='var(--font-montserrat), ui-sans-serif, system-ui, sans-serif'
      monoFamily='var(--font-montserrat), ui-sans-serif, system-ui, sans-serif'
      height="640px"
      sceneMinHeight="240px"
    />
  );
}

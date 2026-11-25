"use client";

import { useRef } from "react";
import { Target, HeartHandshake, Building2, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";

type Pilar = {
  icon: LucideIcon;
  title: string;
  text: string;
};

const pilares: Pilar[] = [
  {
    icon: Target,
    title: "Missão",
    text: "Mudar a realidade fundiária do Brasil, usando a regularização para valorizar o patrimônio e fortalecer a economia local.",
  },
  {
    icon: HeartHandshake,
    title: "Projetos",
    text: "Segurança jurídica, dignidade e transformação social para cada comunidade atendida.",
  },
  {
    icon: Building2,
    title: "Cidades",
    text: "Áreas regularizadas destravam investimento e tornam a cidade mais justa, organizada e inclusiva.",
  },
];

/**
 * Institucional — bento escuro (ink-deep) para contrastar com o portfólio
 * paper-muted acima e os depoimentos paper abaixo. Padrão 21st sóbrio.
 */
export function WhyUs() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>(".pilar-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: i * 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%" },
          }
        );
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden border-b border-ink/30 bg-ink-deep text-paper"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_10%,rgba(237,134,0,0.14),transparent_42%),radial-gradient(ellipse_at_100%_60%,rgba(62,90,75,0.4),transparent_48%)]"
      />

      <div className="site-container relative py-20 lg:py-28">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            number="04"
            eyebrow="Institucional"
            title="Três pilares da Meu Lote Fácil"
            subtitle="Missão, projetos e cidades — o que sustenta cada regularização que entregamos."
            dark
          />
          <p className="max-w-xs text-sm leading-relaxed text-paper/75 lg:pb-1">
            Ética, respeito e profissionalismo em cada núcleo, do diagnóstico à
            matrícula.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {pilares.map((p, i) => {
            const Icon = p.icon;
            const wide = i === 0;
            return (
              <article
                key={p.title}
                className={cn(
                  "pilar-card group relative overflow-hidden rounded-sm border border-paper/12 bg-paper/[0.04] p-6 transition-colors duration-300 hover:border-paper/25 hover:bg-paper/[0.07] sm:p-8",
                  wide ? "md:col-span-2" : "md:col-span-1",
                  i === 2 && "md:col-span-3 lg:col-span-3"
                )}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-gradient-to-br from-latossolo/20 to-mata/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex size-11 items-center justify-center rounded-sm border border-paper/15 bg-ink text-latossolo transition-colors group-hover:border-latossolo/50 group-hover:bg-latossolo/15">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-mono-label text-[11px] tabular-nums text-paper/55">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3
                    className={cn(
                      "font-display mt-6 text-paper",
                      wide ? "text-3xl sm:text-4xl" : "text-2xl"
                    )}
                  >
                    {p.title}
                  </h3>
                  <p
                    className={cn(
                      "mt-3 leading-relaxed text-paper/80",
                      wide ? "max-w-xl text-base sm:text-lg" : "text-sm sm:text-[0.95rem]"
                    )}
                  >
                    {p.text}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

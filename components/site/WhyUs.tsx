"use client";

import { useRef } from "react";
import { Target, HeartHandshake, Building } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

const pilares = [
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
    icon: Building,
    title: "Cidades",
    text: "Áreas regularizadas destravam investimento e tornam a cidade mais justa, organizada e inclusiva.",
  },
];

export function WhyUs() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>(".pilar-card").forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
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
      className="border-b border-brand-cream/10 bg-brand-navy py-20 text-brand-cream lg:py-28"
    >
      <div className="site-container">
        <SectionHeading
          number="05"
          eyebrow="Institucional"
          title="Três pilares da Meu Lote Fácil"
          dark
        />

        <div className="mt-12 grid gap-0 border border-brand-cream/15 md:grid-cols-3">
          {pilares.map((p, i) => (
            <article
              key={p.title}
              className="pilar-card border-b border-brand-cream/15 p-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
            >
              <p className="font-mono-label text-xs text-brand-cream/80">
                {String(i + 1).padStart(2, "0")}
              </p>
              <p.icon className="mt-4 mb-3 h-5 w-5 text-orange-300" />
              <h3 className="font-display text-xl">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-cream/90">
                {p.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

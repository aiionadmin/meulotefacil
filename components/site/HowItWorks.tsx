"use client";

import { useRef } from "react";
import { Search, Map, DraftingCompass, BadgeCheck, Landmark } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

const steps = [
  {
    icon: Search,
    title: "Diagnóstico",
    text: "Diagnóstico da área e dos moradores para entender o núcleo e definir o plano.",
  },
  {
    icon: Map,
    title: "Planta de perímetro",
    text: "Planta aprovada e publicada no Diário Oficial, delimitando a área.",
  },
  {
    icon: DraftingCompass,
    title: "Projetos e estudos",
    text: "Projetos e estudos técnicos exigidos para a regularização.",
  },
  {
    icon: BadgeCheck,
    title: "Aprovação e CRF",
    text: "Aprovação pela prefeitura com emissão da Certidão de Regularização Fundiária.",
  },
  {
    icon: Landmark,
    title: "Registro em cartório",
    text: "Registro no Cartório de Registro de Imóveis e matrícula individual de cada lote.",
  },
];

export function HowItWorks() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || prefersReducedMotion()) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const path = root.querySelector(".how-path") as SVGPathElement | null;
        const cards = gsap.utils.toArray<HTMLElement>(".how-card");

        if (path) {
          gsap.set(path, { drawSVG: "0%" });
          gsap.to(path, {
            drawSVG: "100%",
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "+=160%",
              scrub: 0.6,
              pin: true,
            },
          });
        }

        cards.forEach((card, i) => {
          gsap.fromTo(
            card,
            { opacity: 0.25, y: 40 },
            {
              opacity: 1,
              y: 0,
              ease: "power2.out",
              scrollTrigger: {
                trigger: root,
                start: `top+=${i * 16}% top`,
                end: `top+=${(i + 1) * 20}% top`,
                scrub: true,
              },
            }
          );
        });
      });

      mm.add("(max-width: 1023px)", () => {
        gsap.utils.toArray<HTMLElement>(".how-card").forEach((card) => {
          gsap.fromTo(
            card,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: { trigger: card, start: "top 85%" },
            }
          );
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <section ref={rootRef} className="relative border-b border-linha bg-brand-cream py-20 lg:py-28">
      <div className="site-container">
        <SectionHeading
          number="02"
          eyebrow="Método"
          title="Do diagnóstico ao registro"
          subtitle="Sequência sugerida a partir dos projetos publicados, validação final com a equipe."
        />

        <div className="relative mt-14">
          <svg
            className="pointer-events-none absolute left-0 top-16 hidden h-24 w-full text-mata/40 lg:block"
            viewBox="0 0 1200 100"
            fill="none"
            aria-hidden
          >
            <path
              className="how-path"
              d="M40 60 C160 10, 240 90, 360 50 S560 10, 700 55 900 90, 1160 40"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>

          <ol className="grid gap-0 border border-linha sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="how-card border-b border-linha bg-card p-5 last:border-b-0 sm:border-b lg:border-b-0 lg:border-r lg:last:border-r-0"
              >
                <p className="font-mono-label text-xs text-mata">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <div className="mt-4 mb-3 text-mata">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl text-brand-navy">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

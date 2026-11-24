"use client";

import { useRef } from "react";
import { Search, Map, DraftingCompass, BadgeCheck, Landmark } from "lucide-react";
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
    <section ref={rootRef} className="relative bg-brand-cream py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange">
            Como funciona
          </p>
          <h2 className="font-display mt-3 text-3xl text-brand-navy sm:text-5xl">
            Do diagnóstico ao registro
          </h2>
          <p className="mt-4 text-muted-foreground">
            Sequência sugerida a partir dos projetos publicados — validação final com a equipe.
          </p>
        </div>

        <div className="relative mt-14">
          <svg
            className="pointer-events-none absolute left-0 top-16 hidden h-24 w-full text-brand-orange lg:block"
            viewBox="0 0 1200 100"
            fill="none"
            aria-hidden
          >
            <path
              className="how-path"
              d="M40 60 C160 10, 240 90, 360 50 S560 10, 700 55 900 90, 1160 40"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>

          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="how-card rounded-2xl border border-brand-navy/8 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy text-brand-orange">
                  <step.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-orange">
                  Etapa {i + 1}
                </p>
                <h3 className="mt-2 text-lg font-bold text-brand-navy">{step.title}</h3>
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

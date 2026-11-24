"use client";

import { useRef } from "react";
import { MapPin, Calculator, Bookmark, PenLine } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

const steps = [
  {
    icon: MapPin,
    title: "Escolha o lote",
    text: "Explore empreendimentos e encontre o terreno ideal no mapa.",
  },
  {
    icon: Calculator,
    title: "Simule",
    text: "Ajuste entrada e parcelas e veja valores claros, sem surpresa.",
  },
  {
    icon: Bookmark,
    title: "Reserve online",
    text: "Garanta seu lote com poucos cliques e acompanhamento humano.",
  },
  {
    icon: PenLine,
    title: "Assine e construa",
    text: "Documentação em dia para você começar a construir do seu jeito.",
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
              end: "+=180%",
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
                start: `top+=${i * 20}% top`,
                end: `top+=${(i + 1) * 25}% top`,
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
            Do sonho ao lote em 4 passos
          </h2>
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
              d="M40 60 C200 10, 300 90, 440 50 S700 10, 840 55 1080 90, 1160 40"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>

          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="how-card rounded-2xl border border-brand-navy/8 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy text-brand-orange">
                  <step.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-orange">
                  Passo {i + 1}
                </p>
                <h3 className="mt-2 text-xl font-bold text-brand-navy">{step.title}</h3>
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

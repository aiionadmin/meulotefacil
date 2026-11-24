"use client";

import { useRef } from "react";
import { Target, HeartHandshake, Building } from "lucide-react";
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
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%" },
          }
        );
        const onMove = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
          card.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
        };
        card.addEventListener("mousemove", onMove);
      });
    },
    { scope: rootRef }
  );

  return (
    <section ref={rootRef} className="bg-brand-navy py-20 text-brand-cream lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange">
            Como trabalhamos
          </p>
          <h2 className="font-display mt-3 text-3xl sm:text-5xl">
            Três pilares da Meu Lote Fácil
          </h2>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {pilares.map((p) => (
            <article
              key={p.title}
              className="pilar-card relative overflow-hidden rounded-2xl border border-brand-cream/10 bg-brand-navy-deep p-6"
              style={{
                backgroundImage:
                  "radial-gradient(400px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(247,130,30,0.15), transparent 50%)",
              }}
            >
              <p.icon className="mb-4 h-6 w-6 text-brand-orange" />
              <h3 className="text-lg font-bold">{p.title}</h3>
              <p className="mt-2 text-sm text-brand-cream/65">{p.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

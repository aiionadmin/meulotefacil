"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

// TODO: substituir por depoimentos reais / vídeos Vila Paula (prefeito Dário Saadi e vice Wanderley de Almeida)
const testimonials = [
  {
    quote:
      "A regularização trouxe segurança jurídica para as famílias e valorização do imóvel. (Depoimento placeholder — aguardando conteúdo real.)",
    author: "Morador — placeholder",
  },
  {
    quote:
      "Vila Paula: vídeos do prefeito Dário Saadi e do vice Wanderley de Almeida são bons para esta seção. (TODO: incorporar mídia real.)",
    author: "Campinas — placeholder institucional",
  },
  {
    quote:
      "Processo acompanhado até o registro em cartório. (Placeholder — substituir por depoimento real.)",
    author: "Associação — placeholder",
  },
];

export function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track || prefersReducedMotion()) return;
      gsap.to(track, {
        xPercent: -50,
        duration: 40,
        ease: "none",
        repeat: -1,
      });
    },
    { scope: trackRef }
  );

  const loop = [...testimonials, ...testimonials];

  return (
    <section className="overflow-hidden bg-brand-cream py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange">
            Depoimentos
          </p>
          <h2 className="font-display mt-3 text-3xl text-brand-navy sm:text-5xl">
            Histórias de quem já tem escritura
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Conteúdo placeholder — aguardando depoimentos e vídeos reais.
          </p>
        </div>
      </div>

      <div className="mt-10" data-cursor="Arrastar">
        <div ref={trackRef} className="flex w-max gap-6 px-4">
          {loop.map((t, i) => (
            <blockquote
              key={`${t.author}-${i}`}
              className="w-[min(85vw,360px)] shrink-0 rounded-2xl border border-brand-navy/8 bg-white p-6 shadow-sm"
            >
              <p className="text-brand-ink/80">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-4 text-sm font-semibold text-brand-orange">
                — {t.author}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

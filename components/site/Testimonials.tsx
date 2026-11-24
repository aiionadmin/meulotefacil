"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

// TODO: substituir por depoimentos reais
const testimonials = [
  {
    quote:
      "O processo foi bem mais simples do que eu imaginava. Consegui simular e reservar sem burocracia.",
    author: "Cliente placeholder A",
  },
  {
    quote:
      "Gostei da clareza nas parcelas e do acompanhamento do consultor em cada etapa.",
    author: "Cliente placeholder B",
  },
  {
    quote:
      "Escolhi o lote pelo mapa online e em poucos dias já estávamos com a documentação encaminhada.",
    author: "Cliente placeholder C",
  },
  {
    quote:
      "Atendimento humano e transparente — exatamente o que eu precisava para decidir com segurança.",
    author: "Cliente placeholder D",
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
            Histórias de quem já deu o passo
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            {/* TODO: substituir por depoimentos reais */}
            Conteúdo placeholder — aguardando depoimentos reais.
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

"use client";

import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useMagnetic } from "@/components/motion/useMagnetic";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

export function FinalCTA() {
  const rootRef = useRef<HTMLElement>(null);
  const btnWrap = useMagnetic<HTMLDivElement>(0.3);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const paths = rootRef.current?.querySelectorAll(".cta-logo-path");
      if (!paths?.length) return;
      gsap.fromTo(
        paths,
        { drawSVG: "0%" },
        {
          drawSVG: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 70%",
            end: "bottom 40%",
            scrub: 0.8,
          },
        }
      );
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden bg-brand-orange py-24 text-brand-navy"
    >
      <svg
        className="pointer-events-none absolute -right-10 top-1/2 h-[140%] w-auto -translate-y-1/2 text-brand-navy/15"
        viewBox="0 0 120 120"
        aria-hidden
      >
        <path
          className="cta-logo-path"
          d="M22 58 L60 22 L98 58 L98 98 L22 98 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <path
          className="cta-logo-path"
          d="M42 98 L42 68 L60 52 L78 68 L78 98"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          className="cta-logo-path"
          d="M18 108 Q60 88 102 108"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="cta-logo-path"
          d="M10 114 Q60 96 110 114"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />
      </svg>

      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl">
          Pronto para conquistar seu lote?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-brand-navy/80">
          Escolha o empreendimento, simule as parcelas e fale com um consultor.
          Do jeito fácil.
        </p>
        <div ref={btnWrap} className="mt-10 inline-flex">
          <Button asChild size="lg" variant="secondary">
            <Link href="/empreendimentos">Quero meu lote</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

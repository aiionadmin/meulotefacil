"use client";

import { useRef } from "react";
import { Logo } from "@/components/brand/Logo";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

export function AuthPanel() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.to(".auth-arc", {
        y: -8,
        duration: 2.2,
        yoyo: true,
        repeat: -1,
        stagger: 0.15,
        ease: "sine.inOut",
      });
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      className="relative hidden h-full flex-col justify-between overflow-hidden bg-ink p-10 text-paper lg:flex"
    >
      {/* Decoração atrás do texto */}
      <svg
        className="pointer-events-none absolute inset-0 z-0 h-full w-full text-orange-300/15"
        viewBox="0 0 400 400"
        preserveAspectRatio="xMaxYMax slice"
        aria-hidden
      >
        <g className="auth-arc">
          <path
            d="M40 280 Q200 160 360 280"
            fill="none"
            stroke="currentColor"
            strokeWidth="28"
          />
        </g>
        <g className="auth-arc">
          <path
            d="M20 320 Q200 200 380 320"
            fill="none"
            stroke="currentColor"
            strokeWidth="22"
          />
        </g>
        <g className="auth-arc">
          <path
            d="M0 360 Q200 240 400 360"
            fill="none"
            stroke="currentColor"
            strokeWidth="16"
          />
        </g>
        <g fill="none" stroke="#f3f1ec" strokeWidth="1.5" opacity="0.12">
          <rect x="260" y="40" width="50" height="40" rx="2" />
          <rect x="320" y="40" width="50" height="40" rx="2" />
          <rect x="260" y="90" width="50" height="40" rx="2" />
          <rect x="320" y="90" width="50" height="40" rx="2" />
        </g>
      </svg>

      <div className="relative z-10">
        <Logo variant="full" tone="paper" />
      </div>

      <div className="relative z-10 max-w-md rounded-sm bg-ink/55 p-1 backdrop-blur-[2px]">
        <h1 className="font-display text-4xl leading-tight text-paper">
          Transformando vidas.{" "}
          <span className="text-orange-300">Realizando sonhos.</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-paper/95">
          Sistema unificado: pessoas, empreendimentos, vendas, carteira,
          boletos, obras, compras, financeiro, fiscal, REURB e relatórios.
        </p>
      </div>
    </div>
  );
}

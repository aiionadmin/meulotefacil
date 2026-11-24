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
      className="relative hidden h-full flex-col justify-between overflow-hidden bg-brand-navy p-10 text-brand-cream lg:flex"
    >
      <Logo variant="full" />
      <div className="relative z-10 max-w-md">
        <h1 className="font-display text-4xl leading-tight">
          Seu lote. Seu lugar.{" "}
          <span className="text-brand-orange">Do jeito fácil.</span>
        </h1>
        <p className="mt-4 text-brand-cream/70">
          Acesse a área do cliente para acompanhar propostas, contratos e
          parcelas em um só lugar.
        </p>
      </div>

      <svg
        className="pointer-events-none absolute -bottom-10 -right-10 h-[70%] w-[90%] text-brand-orange/25"
        viewBox="0 0 400 400"
        aria-hidden
      >
        <g className="auth-arc">
          <path d="M40 280 Q200 160 360 280" fill="none" stroke="currentColor" strokeWidth="28" />
        </g>
        <g className="auth-arc">
          <path d="M20 320 Q200 200 380 320" fill="none" stroke="currentColor" strokeWidth="22" />
        </g>
        <g className="auth-arc">
          <path d="M0 360 Q200 240 400 360" fill="none" stroke="currentColor" strokeWidth="16" />
        </g>
        {/* lotes geométricos */}
        <g fill="none" stroke="#FFF6EC" strokeWidth="2" opacity="0.35">
          <rect x="80" y="80" width="50" height="40" rx="2" />
          <rect x="140" y="80" width="50" height="40" rx="2" />
          <rect x="200" y="80" width="50" height="40" rx="2" />
          <rect x="80" y="130" width="50" height="40" rx="2" />
          <rect x="140" y="130" width="50" height="40" rx="2" />
          <rect x="200" y="130" width="50" height="40" rx="2" />
        </g>
      </svg>

      <p className="relative z-10 text-xs text-brand-cream/40">
        Modo demo disponível sem configurar Supabase.
      </p>
    </div>
  );
}

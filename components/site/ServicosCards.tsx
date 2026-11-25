"use client";

import { useRef } from "react";
import Link from "next/link";
import { Building2, Home, ArrowUpRight, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";

type Servico = {
  href: string;
  icon: LucideIcon;
  audience: string;
  title: string;
  text: string;
  tone: "mata" | "accent";
};

const servicos: Servico[] = [
  {
    href: "/servicos/consultoria",
    icon: Building2,
    audience: "Para prefeituras",
    title: "Consultoria técnica para municípios",
    text: "Procedimentos, métodos de análise e fluxos de aprovação de REURB sob medida para cada cidade.",
    tone: "mata",
  },
  {
    href: "/servicos/planos-e-projetos",
    icon: Home,
    audience: "Para moradores, associações e loteadores",
    title: "Planos e projetos de regularização",
    text: "Diagnóstico, projetos técnicos e acompanhamento até a aprovação e o registro em cartório.",
    tone: "accent",
  },
];

/**
 * Atuação — feature cards no padrão 21st (hover reveal + asymmetry),
 * tokens MLF. Faixa paper distinta do Método (ink) abaixo.
 */
export function ServicosCards() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>(".atuacao-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            delay: i * 0.1,
            ease: "power3.out",
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
      className="relative overflow-hidden border-b border-linha bg-paper"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_10%_0%,rgba(62,90,75,0.07),transparent_42%),radial-gradient(ellipse_at_90%_10%,rgba(237,134,0,0.07),transparent_40%)]"
      />

      <div className="site-container relative py-20 lg:py-28">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            number="01"
            eyebrow="Atuação"
            title="Dois públicos, uma especialidade"
            subtitle="Consultoria para municípios e planos completos de regularização para quem vive e empreende no território."
          />
          <Link
            href="/servicos"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/70 transition-colors hover:text-ink lg:pb-1"
          >
            Ver todos os serviços
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-2 lg:gap-5">
          {servicos.map((s) => {
            const Icon = s.icon;
            const isMata = s.tone === "mata";
            return (
              <Link
                key={s.href}
                href={s.href}
                className="atuacao-card group relative block overflow-hidden rounded-sm border border-linha bg-card transition-colors duration-300 hover:border-ink/25"
              >
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                    isMata
                      ? "bg-gradient-to-br from-mata/10 via-transparent to-transparent"
                      : "bg-gradient-to-br from-latossolo/12 via-transparent to-transparent"
                  )}
                />
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute -right-16 -top-16 size-56 rounded-full blur-2xl transition-opacity duration-500",
                    isMata ? "bg-mata/15" : "bg-latossolo/20",
                    "opacity-40 group-hover:opacity-70"
                  )}
                />

                <div className="relative flex h-full min-h-[280px] flex-col p-7 sm:p-9 lg:min-h-[320px] lg:p-10">
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={cn(
                        "inline-flex size-12 items-center justify-center rounded-sm border transition-colors duration-300",
                        isMata
                          ? "border-mata/25 bg-mata/10 text-mata group-hover:border-mata/40"
                          : "border-latossolo/30 bg-latossolo/10 text-latossolo group-hover:border-latossolo/50"
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span
                      className={cn(
                        "inline-flex size-9 items-center justify-center rounded-full border border-linha text-ink/40 transition-all duration-300 group-hover:border-ink/30 group-hover:bg-ink group-hover:text-paper"
                      )}
                    >
                      <ArrowUpRight className="size-4" aria-hidden />
                    </span>
                  </div>

                  <p className="font-mono-label mt-8 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {s.audience}
                  </p>
                  <h3 className="font-display mt-2 text-2xl text-ink sm:text-[1.75rem] sm:leading-snug">
                    {s.title}
                  </h3>
                  <p className="mt-3 max-w-md flex-1 text-sm leading-relaxed text-ink/70 sm:text-[0.95rem]">
                    {s.text}
                  </p>

                  <span
                    className={cn(
                      "mt-8 inline-flex w-fit items-center gap-2 border-b pb-0.5 text-sm font-medium transition-colors",
                      isMata
                        ? "border-mata/40 text-mata group-hover:border-mata"
                        : "border-latossolo/50 text-latossolo group-hover:border-latossolo"
                    )}
                  >
                    Saiba mais
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

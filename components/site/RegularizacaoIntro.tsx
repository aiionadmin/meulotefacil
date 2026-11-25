"use client";

import { useRef } from "react";
import {
  Search,
  Map,
  DraftingCompass,
  BadgeCheck,
  Landmark,
  Users,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import FeatureSpotlightGrid from "@/components/ui/feature-spotlight-grid";
import {
  REGULARIZACAO_INTRO,
  REURB_MODALIDADES,
  PROCESSO_ETAPAS,
} from "@/lib/data/regularizacao-content";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";

const stepIcons: LucideIcon[] = [
  Search,
  Map,
  DraftingCompass,
  BadgeCheck,
  Landmark,
];

const modalidadeMeta: Record<
  string,
  { icon: LucideIcon; tone: "mata" | "accent" }
> = {
  "reurb-s": { icon: Users, tone: "mata" },
  "reurb-e": { icon: Building2, tone: "accent" },
};

/**
 * Intro + modalidades + método — padrões 21st (feature cards + spotlight grid).
 */
export function RegularizacaoIntro() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>(".reurb-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: i * 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%" },
          }
        );
      });
    },
    { scope: rootRef }
  );

  const processFeatures = PROCESSO_ETAPAS.map((step, i) => ({
    icon: stepIcons[i] ?? Search,
    title: step.title,
    description: step.text,
    index: String(i + 1).padStart(2, "0"),
  }));

  return (
    <>
      <section
        ref={rootRef}
        className="relative overflow-hidden border-b border-ink/10 bg-paper pt-28 pb-16 sm:pt-32 sm:pb-20"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(237,134,0,0.12),transparent_45%),radial-gradient(ellipse_at_90%_30%,rgba(62,90,75,0.1),transparent_48%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="site-container relative">
          <SectionHeading
            number="01"
            eyebrow={REGULARIZACAO_INTRO.eyebrow}
            title={REGULARIZACAO_INTRO.title}
            subtitle={REGULARIZACAO_INTRO.subtitle}
          />

          <div className="mt-12 grid gap-4 lg:grid-cols-2 lg:gap-5">
            {REURB_MODALIDADES.map((m) => {
              const meta = modalidadeMeta[m.id] ?? {
                icon: Building2,
                tone: "accent" as const,
              };
              const Icon = meta.icon;
              const isMata = meta.tone === "mata";
              return (
                <article
                  key={m.id}
                  className="reurb-card group relative overflow-hidden rounded-sm border border-ink/10 bg-card transition-colors duration-300 hover:border-ink/22"
                >
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                      isMata
                        ? "bg-gradient-to-br from-mata/12 via-transparent to-transparent"
                        : "bg-gradient-to-br from-latossolo/14 via-transparent to-transparent"
                    )}
                  />
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute -right-16 -top-16 size-56 rounded-full blur-2xl transition-opacity duration-500",
                      isMata ? "bg-mata/18" : "bg-latossolo/22",
                      "opacity-45 group-hover:opacity-75"
                    )}
                  />
                  <div className="relative flex min-h-[240px] flex-col p-7 sm:p-9">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex size-10 items-center justify-center rounded-sm border",
                          isMata
                            ? "border-mata/25 bg-mata/10 text-mata"
                            : "border-latossolo/30 bg-latossolo/10 text-latossolo"
                        )}
                      >
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <p className="font-mono-label text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        {m.label}
                      </p>
                    </div>
                    <h3 className="font-display mt-5 text-3xl text-ink sm:text-[2rem]">
                      {m.title}
                    </h3>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
                      {m.text}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-ink/10 bg-paper-muted py-20 lg:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(62,90,75,0.08),transparent_42%),radial-gradient(ellipse_at_10%_60%,rgba(237,134,0,0.07),transparent_40%)]"
        />
        <div className="site-container relative">
          <SectionHeading
            number="02"
            eyebrow="Método"
            title="Do diagnóstico ao registro"
            subtitle="Cinco etapas até a matrícula individual — do levantamento da área ao cartório."
          />
          <FeatureSpotlightGrid
            features={processFeatures}
            className="mt-12 md:mt-14"
            columns={3}
          />
        </div>
      </section>
    </>
  );
}

"use client";

import { useRef, useState } from "react";
import {
  Search,
  Map,
  DraftingCompass,
  BadgeCheck,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";

type Step = {
  icon: LucideIcon;
  title: string;
  text: string;
  accent: string;
};

const steps: Step[] = [
  {
    icon: Search,
    title: "Diagnóstico",
    text: "Diagnóstico da área e dos moradores para entender o núcleo e definir o plano.",
    accent: "from-mata/20 to-transparent",
  },
  {
    icon: Map,
    title: "Planta de perímetro",
    text: "Planta aprovada e publicada no Diário Oficial, delimitando a área.",
    accent: "from-latossolo/15 to-transparent",
  },
  {
    icon: DraftingCompass,
    title: "Projetos e estudos",
    text: "Projetos e estudos técnicos exigidos para a regularização.",
    accent: "from-mata/20 to-transparent",
  },
  {
    icon: BadgeCheck,
    title: "Aprovação e CRF",
    text: "Aprovação pela prefeitura com emissão da Certidão de Regularização Fundiária.",
    accent: "from-latossolo/20 to-transparent",
  },
  {
    icon: Landmark,
    title: "Registro em cartório",
    text: "Registro no Cartório de Registro de Imóveis e matrícula individual de cada lote.",
    accent: "from-mata/25 to-transparent",
  },
];

/**
 * Método — timeline estilo 21st/Aceternity (sticky + progress), tokens da marca.
 */
export function HowItWorks() {
  const rootRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const items = gsap.utils.toArray<HTMLElement>(".how-step");
      const progress = progressRef.current;

      if (!prefersReducedMotion()) {
        items.forEach((el) => {
          gsap.fromTo(
            el.querySelector(".how-step-inner"),
            { opacity: 0, y: 36 },
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 82%" },
            }
          );
        });
      }

      items.forEach((el, i) => {
        gsap.to(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 55%",
            end: "bottom 45%",
            onEnter: () => setActive(i),
            onEnterBack: () => setActive(i),
          },
        });
      });

      if (progress) {
        gsap.set(progress, { transformOrigin: "top center", scaleY: 0 });
        gsap.to(progress, {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root.querySelector(".how-timeline"),
            start: "top 60%",
            end: "bottom 40%",
            scrub: 0.4,
          },
        });
      }
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden border-b border-ink/10 bg-ink text-paper"
    >
      {/* Atmosphere — not flat */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(237,134,0,0.14),transparent_50%),radial-gradient(ellipse_at_90%_40%,rgba(62,90,75,0.35),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="site-container relative py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-16 xl:gap-24">
          {/* Sticky intro — Aceternity timeline pattern */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              number="02"
              eyebrow="Método"
              title="Do diagnóstico ao registro"
              subtitle="Cinco etapas claras até a matrícula individual — do levantamento da área ao cartório."
              dark
            />
            <ol className="mt-10 hidden gap-2 lg:flex lg:flex-col">
              {steps.map((step, i) => (
                <li key={step.title}>
                  <button
                    type="button"
                    onClick={() => {
                      const el = rootRef.current?.querySelector(
                        `#how-step-${i}`
                      );
                      el?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left transition-colors",
                      active === i
                        ? "bg-paper/10 text-paper"
                        : "text-paper/50 hover:text-paper/80"
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono-label text-[11px] tabular-nums",
                        active === i ? "text-latossolo" : "text-paper/40"
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium tracking-tight">
                      {step.title}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* Timeline */}
          <div className="how-timeline relative">
            <div
              aria-hidden
              className="absolute bottom-4 left-[1.15rem] top-4 w-px bg-paper/15 sm:left-[1.35rem]"
            />
            <div
              ref={progressRef}
              aria-hidden
              className="absolute left-[1.15rem] top-4 h-[calc(100%-2rem)] w-px origin-top bg-gradient-to-b from-latossolo via-mata-muted to-mata sm:left-[1.35rem]"
              style={{ transform: "scaleY(0)" }}
            />

            <ol className="relative space-y-6 sm:space-y-8">
              {steps.map((step, i) => {
                const Icon = step.icon;
                const isActive = active === i;
                return (
                  <li
                    key={step.title}
                    id={`how-step-${i}`}
                    className="how-step relative pl-12 sm:pl-16"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "absolute left-0 top-6 flex size-9 items-center justify-center rounded-full border transition-all duration-500 sm:size-11",
                        isActive
                          ? "border-latossolo bg-latossolo text-ink shadow-[0_0_0_6px_rgba(237,134,0,0.18)]"
                          : "border-paper/25 bg-ink text-paper/70"
                      )}
                    >
                      <Icon className="size-4 sm:size-[1.15rem]" />
                    </span>

                    <div
                      className={cn(
                        "how-step-inner relative overflow-hidden rounded-sm border p-5 transition-colors duration-500 sm:p-7",
                        isActive
                          ? "border-paper/25 bg-paper/[0.07]"
                          : "border-paper/10 bg-paper/[0.03]"
                      )}
                    >
                      <div
                        aria-hidden
                        className={cn(
                          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
                          step.accent
                        )}
                      />
                      <div className="relative">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="font-mono-label text-[11px] uppercase tracking-[0.14em] text-paper/45">
                            Etapa {String(i + 1).padStart(2, "0")}
                          </p>
                          <span
                            aria-hidden
                            className="font-display text-4xl leading-none text-paper/[0.07] sm:text-5xl"
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <h3 className="font-display mt-2 text-2xl text-paper sm:text-[1.75rem]">
                          {step.title}
                        </h3>
                        <p className="mt-3 max-w-md text-sm leading-relaxed text-paper/75 sm:text-[0.95rem]">
                          {step.text}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

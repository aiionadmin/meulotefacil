"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { whatsappUrl } from "@/lib/institutional";
import { prefersReducedMotion, cn } from "@/lib/utils";
import {
  HERO_FRAME_CONFIG,
  HERO_MARKERS,
  HERO_STATS_DISPLAY,
  HERO_STEPS,
  stepForProgress,
  type HeroStep,
} from "./heroSteps";
import { useFrameSequence } from "./useFrameSequence";

/**
 * Hero imersivo controlado pelo scroll.
 * Progresso 0→1 scruba a sequência de frames (não autoplay).
 */
export function ScrollHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const nextClipRef = useRef<HTMLDivElement>(null);
  const progressObj = useRef({ p: 0 });
  const [activeStep, setActiveStep] = useState<HeroStep>(HERO_STEPS[0]);
  const [reduced, setReduced] = useState(false);
  const [framesReady, setFramesReady] = useState(false);
  const wa = whatsappUrl();

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  const { setProgress, setExitEffects } = useFrameSequence(canvasRef, {
    reducedMotion: reduced,
    enabled: true,
    onReady: () => setFramesReady(true),
  });

  // Se o browser restaura o scroll no meio do hero, alinha o progresso já no mount
  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    const scrolled = Math.min(total, Math.max(0, -rect.top));
    const p = scrolled / total;
    progressObj.current.p = p;
    setProgress(p);
    document.documentElement.dataset.heroScroll =
      p < 0.98 ? "inside" : "done";
  }, [reduced, setProgress]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || reduced) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 0px)", () => {
        const tween = gsap.to(progressObj.current, {
          p: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            onUpdate: (self) => {
              const p = self.progress;
              setProgress(p);
              const step = stepForProgress(p);
              if (step) {
                setActiveStep((prev) => (prev.id === step.id ? prev : step));
              }
              if (hintRef.current) {
                hintRef.current.style.opacity = p > 0.05 ? "0" : "1";
                hintRef.current.style.pointerEvents = p > 0.05 ? "none" : "auto";
              }
              // Exit: 90–100% zoom + dim
              if (p >= 0.9) {
                const t = (p - 0.9) / 0.1;
                setExitEffects(1 + 0.08 * t, 0.45 * t);
                if (nextClipRef.current) {
                  nextClipRef.current.style.setProperty(
                    "--hero-next-radius",
                    `${32 * t}px`
                  );
                  nextClipRef.current.style.setProperty(
                    "--hero-next-lift",
                    `${(1 - t) * 40}px`
                  );
                }
              } else {
                setExitEffects(1, 0);
                if (nextClipRef.current) {
                  nextClipRef.current.style.setProperty("--hero-next-radius", "0px");
                  nextClipRef.current.style.setProperty("--hero-next-lift", "40px");
                }
              }
              // Notify header: still inside hero sticky viewport
              document.documentElement.dataset.heroScroll =
                p < 0.98 ? "inside" : "done";
              // Bridge CSS vars to next section
              const after = document.querySelector(
                ".after-scroll-hero"
              ) as HTMLElement | null;
              if (after) {
                if (p >= 0.9) {
                  const t = (p - 0.9) / 0.1;
                  after.style.setProperty("--hero-next-radius", `${32 * t}px`);
                  after.style.setProperty(
                    "--hero-next-lift",
                    `${Math.max(0, (1 - t) * 24)}px`
                  );
                } else {
                  after.style.setProperty("--hero-next-radius", "0px");
                  after.style.setProperty("--hero-next-lift", "0px");
                }
              }
            },
          },
        });

        // Mark inside on mount
        document.documentElement.dataset.heroScroll = "inside";

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          delete document.documentElement.dataset.heroScroll;
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [reduced, setProgress, setExitEffects] }
  );

  // Sync ScrollTrigger after Lenis mounts
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, []);

  if (reduced) {
    return <ReducedHero wa={wa} />;
  }

  return (
    <>
      <section
        id="hero-scroll"
        ref={sectionRef}
        className="relative h-[400vh] bg-ink md:h-[550vh]"
        aria-label="Hero imersivo, regularização fundiária"
      >
        <div
          ref={stickyRef}
          className="sticky top-0 h-[100svh] w-full overflow-hidden bg-ink"
        >
          {/* LCP poster, visível até o canvas ter frames (parent relative p/ next/image fill) */}
          <div className="absolute inset-0">
            <Image
              src={HERO_FRAME_CONFIG.desktop.poster}
              alt=""
              fill
              priority
              sizes="100vw"
              className={cn(
                "pointer-events-none object-cover transition-opacity duration-500",
                framesReady ? "opacity-0" : "opacity-100"
              )}
              aria-hidden
            />
          </div>

          <canvas
            ref={canvasRef}
            className={cn(
              "absolute inset-0 h-full w-full transition-opacity duration-500",
              framesReady ? "opacity-100" : "opacity-0"
            )}
            aria-hidden
          />

          {/* Gradient + vignette — scrim forte sob o texto para contraste */}
          <div
            ref={overlayRef}
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(17,22,20,0.45)_55%,rgba(17,22,20,0.82)_100%)]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/40" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-ink/95 via-ink/50 to-transparent" />

          {/* Text layer — pt cobre o header; overflow evita colidir com a logo no mobile */}
          <div className="absolute inset-0 z-10 flex flex-col justify-end overflow-hidden px-4 pb-[4.75rem] pt-[4.25rem] sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
            <div className="mx-auto max-h-full w-full max-w-7xl overflow-y-auto overscroll-contain">
              <StepCopy step={activeStep} wa={wa} />
            </div>
          </div>

          {/* Progress markers */}
          <ol className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-8 sm:gap-3">
            {HERO_MARKERS.map((m) => {
              const active = activeStep.id === m.id;
              return (
                <li key={m.id} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition-all sm:h-2 sm:w-2",
                      active ? "scale-125 bg-orange-300" : "bg-brand-cream/45"
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "hidden text-[10px] font-semibold uppercase tracking-wider sm:inline",
                      // Ativo em cream claro (nunca ink/laranja escuro sobre o vídeo)
                      active
                        ? "text-brand-cream"
                        : "text-brand-cream/75"
                    )}
                  >
                    {m.label}
                  </span>
                </li>
              );
            })}
          </ol>

          {!activeStep.showCtas ? (
            <div
              ref={hintRef}
              className="absolute bottom-12 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-brand-cream/90 transition-opacity duration-300 sm:bottom-16"
            >
              <span className="text-[10px] uppercase tracking-widest drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)] sm:text-xs">
                Role para descobrir
              </span>
              <ChevronDown className="h-4 w-4 animate-bounce" />
            </div>
          ) : null}
        </div>
      </section>

      {/* Bridge for next section radius / lift, consumed via CSS vars on sibling */}
      <div
        ref={nextClipRef}
        id="hero-scroll-exit"
        aria-hidden
        className="pointer-events-none absolute h-0 w-0 overflow-hidden"
        style={
          {
            ["--hero-next-radius" as string]: "0px",
            ["--hero-next-lift" as string]: "40px",
          } as React.CSSProperties
        }
      />
    </>
  );
}

function StepCopy({ step, wa }: { step: HeroStep; wa: string }) {
  const dense = Boolean(step.showStats && step.showCtas);

  return (
    <div
      key={step.id}
      className="max-w-2xl text-brand-cream transition-all duration-500 [text-shadow:0_1px_18px_rgba(0,0,0,0.45)]"
      style={{
        animation: "heroStepIn 0.55s ease forwards",
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-300 sm:text-sm sm:tracking-widest">
        {step.eyebrow}
      </p>
      <h1
        className={cn(
          "font-display leading-[1.08]",
          dense
            ? "mt-2 text-[1.65rem] sm:mt-3 sm:text-5xl lg:text-6xl"
            : "mt-2 text-[1.85rem] sm:mt-3 sm:text-5xl lg:text-6xl"
        )}
      >
        {step.title}
      </h1>
      <p
        className={cn(
          "max-w-xl text-brand-cream/95",
          dense
            ? "mt-2 text-sm leading-snug sm:mt-4 sm:text-lg sm:leading-normal"
            : "mt-3 text-sm sm:mt-4 sm:text-lg"
        )}
      >
        {step.body}
      </p>

      {step.showStats && (
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:mt-8 sm:grid-cols-4 sm:gap-4">
          {HERO_STATS_DISPLAY.map((s) => (
            <div key={s.label} className="min-w-0">
              <dt className="text-[9px] uppercase tracking-wider text-brand-cream/85 sm:text-[10px]">
                {s.label}
              </dt>
              <dd className="font-display text-lg text-orange-300 sm:text-2xl">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {step.showCtas && (
        <div className="mt-5 flex w-full flex-col gap-2.5 [text-shadow:none] sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
          <Button
            asChild
            size="default"
            variant="cream"
            className="w-full sm:h-11 sm:w-auto sm:px-8 sm:text-base"
          >
            <a href={wa} target="_blank" rel="noopener noreferrer">
              Falar no WhatsApp
            </a>
          </Button>
          <Button
            asChild
            size="default"
            variant="ghostDark"
            className="w-full sm:h-11 sm:w-auto sm:px-8 sm:text-base"
          >
            <Link href="/regularizacao">Ver regularizações</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function ReducedHero({ wa }: { wa: string }) {
  return (
    <section
      id="hero-scroll"
      className="relative min-h-[100svh] bg-ink pt-[4.5rem] text-paper sm:pt-24"
      aria-label="Hero, regularização fundiária"
    >
      <div className="absolute inset-0">
        <Image
          src={HERO_FRAME_CONFIG.desktop.poster}
          alt=""
          fill
          priority
          className="object-cover opacity-40"
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40" />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:gap-12 sm:px-6 sm:py-16 lg:px-8">
        {HERO_STEPS.map((step) => (
          <div key={step.id} className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-300 sm:text-sm sm:tracking-widest">
              {step.marker}, {step.eyebrow}
            </p>
            <h2 className="font-display mt-2 text-[1.65rem] sm:text-4xl">
              {step.title}
            </h2>
            <p className="mt-2 text-sm text-paper/95 sm:mt-3 sm:text-base">
              {step.body}
            </p>
            {step.showCtas && (
              <div className="mt-5 flex w-full flex-col gap-2.5 sm:mt-6 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
                <Button
                  asChild
                  size="default"
                  variant="cream"
                  className="w-full sm:h-11 sm:w-auto sm:px-8 sm:text-base"
                >
                  <a href={wa} target="_blank" rel="noopener noreferrer">
                    Falar no WhatsApp
                  </a>
                </Button>
                <Button
                  asChild
                  size="default"
                  variant="ghostDark"
                  className="w-full sm:h-11 sm:w-auto sm:px-8 sm:text-base"
                >
                  <Link href="/regularizacao">Ver regularizações</Link>
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

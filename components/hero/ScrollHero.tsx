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
  const wa = whatsappUrl();

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  const { setProgress, setExitEffects } = useFrameSequence(canvasRef, {
    reducedMotion: reduced,
    enabled: true,
  });

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
        className="relative h-[300vh] bg-brand-navy md:h-[400vh]"
        aria-label="Hero imersivo — regularização fundiária"
      >
        <div
          ref={stickyRef}
          className="sticky top-0 h-[100svh] w-full overflow-hidden"
        >
          {/* LCP poster */}
          <Image
            src={HERO_FRAME_CONFIG.desktop.poster}
            alt=""
            fill
            priority
            sizes="100vw"
            className="pointer-events-none object-cover opacity-0"
            aria-hidden
          />

          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            aria-hidden
          />

          {/* Gradient + vignette */}
          <div
            ref={overlayRef}
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(20,18,71,0.35)_70%,rgba(20,18,71,0.75)_100%)]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/20 to-brand-navy/50" />

          {/* Text layer */}
          <div className="absolute inset-0 z-10 flex flex-col justify-end px-4 pb-28 pt-28 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
              <StepCopy step={activeStep} wa={wa} />
            </div>
          </div>

          {/* Progress markers */}
          <ol className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:gap-3">
            {HERO_MARKERS.map((m) => {
              const active = activeStep.id === m.id;
              return (
                <li key={m.id} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition-all sm:h-2 sm:w-2",
                      active ? "scale-125 bg-brand-orange" : "bg-brand-cream/40"
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "hidden text-[10px] font-semibold uppercase tracking-wider sm:inline",
                      active ? "text-brand-orange" : "text-brand-cream/50"
                    )}
                  >
                    {m.label}
                  </span>
                </li>
              );
            })}
          </ol>

          <div
            ref={hintRef}
            className="absolute bottom-16 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-brand-cream/70 transition-opacity duration-300"
          >
            <span className="text-xs uppercase tracking-widest">Role para descobrir</span>
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Bridge for next section radius / lift — consumed via CSS vars on sibling */}
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
  return (
    <div
      key={step.id}
      className="max-w-2xl text-brand-cream transition-all duration-500"
      style={{
        animation: "heroStepIn 0.55s ease forwards",
      }}
    >
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange">
        {step.eyebrow}
      </p>
      <h1 className="font-display mt-3 text-3xl leading-[1.08] sm:text-5xl lg:text-6xl">
        {step.title}
      </h1>
      <p className="mt-4 max-w-xl text-base text-brand-cream/80 sm:text-lg">{step.body}</p>

      {step.showStats && (
        <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {HERO_STATS_DISPLAY.map((s) => (
            <div key={s.label}>
              <dt className="text-[10px] uppercase tracking-wider text-brand-cream/50">
                {s.label}
              </dt>
              <dd className="font-display text-xl text-brand-orange sm:text-2xl">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {step.showCtas && (
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <a href={wa} target="_blank" rel="noopener noreferrer">
              Falar no WhatsApp
            </a>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="/regularizacoes">Ver regularizações</Link>
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
      className="relative min-h-[100svh] bg-brand-navy pt-24 text-brand-cream"
      aria-label="Hero — regularização fundiária"
    >
      <Image
        src={HERO_FRAME_CONFIG.desktop.poster}
        alt=""
        fill
        priority
        className="object-cover opacity-40"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/70 to-brand-navy/40" />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-12 px-4 py-16 sm:px-6 lg:px-8">
        {HERO_STEPS.map((step) => (
          <div key={step.id} className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange">
              {step.marker} · {step.eyebrow}
            </p>
            <h2 className="font-display mt-2 text-2xl sm:text-4xl">{step.title}</h2>
            <p className="mt-3 text-brand-cream/75">{step.body}</p>
            {step.showCtas && (
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href={wa} target="_blank" rel="noopener noreferrer">
                    Falar no WhatsApp
                  </a>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <Link href="/regularizacoes">Ver regularizações</Link>
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

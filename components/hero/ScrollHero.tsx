"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGSAP, ScrollTrigger } from "@/lib/gsap";
import { whatsappUrl } from "@/lib/institutional";
import { prefersReducedMotion } from "@/lib/utils";
import { HERO_CONFIG } from "./heroConfig";
import {
  HERO_FINAL_STATS,
  HERO_STAGES,
  stageForProgress,
  stageIndexForProgress,
  type HeroStage,
} from "./heroStages";
import { StageProgress } from "./StageProgress";
import { useFrameSequence } from "./useFrameSequence";

/**
 * Hero "Da terra ao lar" — 12 etapas, scrub por scroll (sem autoplay).
 */
export function ScrollHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [stage, setStage] = useState<HeroStage>(HERO_STAGES[0]);
  const [stageIndex, setStageIndex] = useState(0);
  const wa = whatsappUrl("Olá! Vim do site e gostaria de falar com um consultor.");

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  const { setProgress, setExitEffects } = useFrameSequence(canvasRef, {
    reducedMotion: reduced,
    enabled: true,
  });

  const scrollToStage = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const s = HERO_STAGES[index];
    if (!s) return;
    const mid = (s.start + s.end) / 2;
    const rect = section.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    const scrollable = section.offsetHeight - window.innerHeight;
    const target = absoluteTop + mid * scrollable;
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  const skipHero = () => {
    const section = sectionRef.current;
    if (!section) return;
    const next = section.nextElementSibling as HTMLElement | null;
    const top =
      (next?.getBoundingClientRect().top ??
        section.getBoundingClientRect().bottom) + window.scrollY;
    window.scrollTo({ top, behavior: "smooth" });
  };

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || reduced) return;

      document.documentElement.dataset.heroScroll = "inside";

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: HERO_CONFIG.scrub,
        onUpdate: (self) => {
          const p = self.progress;
          setProgress(p);

          const next = stageForProgress(p);
          const idx = stageIndexForProgress(p);
          setStage((prev) => (prev.id === next.id ? prev : next));
          setStageIndex((prev) => (prev === idx ? prev : idx));

          if (liveRef.current) {
            liveRef.current.textContent = `${String(next.id).padStart(2, "0")} — ${next.kicker}: ${next.title}`;
          }

          if (hintRef.current) {
            const hide = p > 0.03;
            hintRef.current.style.opacity = hide ? "0" : "1";
            hintRef.current.style.pointerEvents = hide ? "none" : "auto";
          }

          document.documentElement.dataset.heroScroll =
            p < 0.98 ? "inside" : "done";

          const after = document.querySelector(
            ".after-scroll-hero"
          ) as HTMLElement | null;

          if (p >= HERO_CONFIG.exit.start) {
            const t =
              (p - HERO_CONFIG.exit.start) / (1 - HERO_CONFIG.exit.start);
            setExitEffects(
              1 + (HERO_CONFIG.exit.zoomTo - 1) * t,
              HERO_CONFIG.exit.dimTo * t
            );
            if (after) {
              after.style.setProperty("--hero-next-radius", `${32 * t}px`);
              after.style.setProperty(
                "--hero-next-lift",
                `${Math.max(0, (1 - t) * 24)}px`
              );
            }
          } else {
            setExitEffects(1, 0);
            if (after) {
              after.style.setProperty("--hero-next-radius", "0px");
              after.style.setProperty("--hero-next-lift", "0px");
            }
          }
        },
      });

      return () => {
        st.kill();
        delete document.documentElement.dataset.heroScroll;
      };
    },
    { scope: sectionRef, dependencies: [reduced, setProgress, setExitEffects] }
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, []);

  if (reduced) {
    return <ReducedTimeline wa={wa} />;
  }

  return (
    <section
      id="hero-scroll"
      ref={sectionRef}
      className="relative h-[800vh] bg-brand-navy md:h-[1200vh]"
      aria-label="Da terra ao lar — hero imersivo"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* LCP poster — first frame; canvas paints over once ready */}
        <picture className="pointer-events-none absolute inset-0 z-0">
          <source
            media="(max-width: 768px)"
            srcSet={HERO_CONFIG.mobile.poster}
          />
          <Image
            src={HERO_CONFIG.desktop.poster}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            aria-hidden
          />
        </picture>

        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-0 h-full w-full"
          aria-hidden
        />

        <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(17,22,20,0.35)_65%,rgba(17,22,20,0.78)_100%)]" />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-brand-navy via-brand-navy/30 to-brand-navy/50" />

        <div className="absolute inset-0 z-[2] flex flex-col justify-end px-4 pb-28 pt-24 sm:px-6 lg:justify-center lg:px-10 lg:pb-16">
          <div className="mx-auto w-full max-w-7xl lg:pr-40">
            <StageCopy key={stage.id} stage={stage} wa={wa} />
          </div>
        </div>

        <StageProgress activeIndex={stageIndex} onSelect={scrollToStage} />

        <p className="pointer-events-none absolute bottom-8 left-4 z-30 font-mono-label text-sm text-brand-cream/80 sm:left-6 lg:bottom-10 lg:left-10">
          {String(stage.id).padStart(2, "0")}
          <span className="text-brand-cream/40"> / 12</span>
        </p>

        <p
          ref={hintRef}
          className="absolute bottom-20 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1 text-brand-cream/70 transition-opacity duration-300 lg:bottom-24"
        >
          <span className="font-mono-label text-xs">
            Role para construir
          </span>
          <ChevronDown className="h-4 w-4" />
        </p>

        <button
          type="button"
          onClick={skipHero}
          className="absolute bottom-8 right-4 z-30 font-mono-label text-xs text-brand-cream/70 underline-offset-4 hover:text-brand-cream hover:underline sm:right-6 lg:bottom-10 lg:right-10"
        >
          Pular animação ↓
        </button>

        <div ref={liveRef} className="sr-only" aria-live="polite" />
      </div>
    </section>
  );
}

function StageCopy({ stage, wa }: { stage: HeroStage; wa: string }) {
  return (
    <div
      className="max-w-2xl text-brand-cream"
      style={{ animation: "heroStepIn 0.55s ease forwards" }}
    >
      <p className="font-mono-label text-xs text-latossolo sm:text-sm">
        {stage.kicker}
      </p>
      {stage.id === 1 ? (
        <h1 className="font-display mt-3 text-3xl leading-[1.08] sm:text-5xl lg:text-6xl">
          {stage.title}
        </h1>
      ) : (
        <p className="font-display mt-3 text-3xl leading-[1.08] sm:text-5xl lg:text-6xl">
          {stage.title}
        </p>
      )}
      <p className="mt-4 max-w-xl text-base text-brand-cream/80 sm:text-lg">
        {stage.subtitle}
      </p>

      {stage.showStats && (
        <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {HERO_FINAL_STATS.map((s) => (
            <div key={s.label}>
              <dt className="font-mono-label text-[10px] text-brand-cream/50">
                {s.label}
              </dt>
              <dd className="font-display text-xl text-latossolo sm:text-2xl">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {stage.showCtas && (
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <a href={wa} target="_blank" rel="noopener noreferrer">
              Falar com um consultor
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

function ReducedTimeline({ wa }: { wa: string }) {
  return (
    <section
      id="hero-scroll"
      className="relative min-h-[100svh] bg-brand-navy pt-24 text-brand-cream"
      aria-label="Da terra ao lar"
    >
      <Image
        src={HERO_CONFIG.desktop.poster}
        alt=""
        fill
        priority
        className="object-cover opacity-35"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/75 to-brand-navy/40" />
      <ol className="relative z-10 mx-auto flex max-w-3xl list-none flex-col gap-10 px-4 py-16 sm:px-6">
        {HERO_STAGES.map((s) => (
          <li key={s.id}>
            <p className="font-mono-label text-xs text-latossolo">
              {String(s.id).padStart(2, "0")} · {s.kicker}
            </p>
            {s.id === 1 ? (
              <h1 className="font-display mt-2 text-2xl sm:text-4xl">{s.title}</h1>
            ) : (
              <h2 className="font-display mt-2 text-2xl sm:text-4xl">{s.title}</h2>
            )}
            <p className="mt-2 text-brand-cream/75">{s.subtitle}</p>
            {s.showCtas && (
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href={wa} target="_blank" rel="noopener noreferrer">
                    Falar com um consultor
                  </a>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <Link href="/regularizacoes">Ver regularizações</Link>
                </Button>
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

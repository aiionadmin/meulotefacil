"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMagnetic } from "@/components/motion/useMagnetic";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { whatsappUrl } from "@/lib/institutional";
import { prefersReducedMotion } from "@/lib/utils";
import { useCounter } from "@/components/motion/useCounter";

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const arcsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useMagnetic<HTMLDivElement>(0.25);
  const wa = whatsappUrl();

  useGSAP(
    () => {
      const root = rootRef.current;
      const title = titleRef.current;
      if (!root || !title) return;

      if (prefersReducedMotion()) {
        gsap.set([title, ".hero-sub", ".hero-cta", ".hero-stats", ".hero-scroll"], {
          opacity: 1,
          y: 0,
        });
        return;
      }

      const split = new SplitText(title, { type: "lines", linesClass: "overflow-hidden" });
      const tl = gsap.timeline({ delay: 0.15 });
      tl.fromTo(
        split.lines,
        { yPercent: 110 },
        { yPercent: 0, duration: 1, stagger: 0.1, ease: "expo.out" }
      )
        .fromTo(
          ".hero-sub",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
          "-=0.4"
        )
        .fromTo(
          ".hero-cta",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
          "-=0.35"
        )
        .fromTo(
          ".hero-stats",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
          "-=0.3"
        );

      gsap.to(".hero-scroll", {
        y: 8,
        repeat: -1,
        yoyo: true,
        duration: 0.9,
        ease: "power1.inOut",
      });

      const mm = gsap.matchMedia();
      mm.add("(pointer: fine)", () => {
        const arcs = arcsRef.current;
        if (!arcs) return;
        const onMove = (e: MouseEvent) => {
          const x = (e.clientX / window.innerWidth - 0.5) * 30;
          const y = (e.clientY / window.innerHeight - 0.5) * 20;
          gsap.to(arcs, { x, y, duration: 0.8, ease: "power2.out" });
        };
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
      });

      mm.add("(min-width: 768px)", () => {
        gsap.to(arcsRef.current, {
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      return () => {
        split.revert();
        mm.revert();
      };
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-brand-navy pt-24 text-brand-cream"
    >
      <div
        ref={arcsRef}
        className="pointer-events-none absolute inset-0 flex items-end justify-center opacity-40"
        aria-hidden
      >
        <svg viewBox="0 0 800 600" className="h-[90%] w-[140%] text-brand-orange">
          <path d="M-100 420 Q400 120 900 420" fill="none" stroke="currentColor" strokeWidth="48" opacity="0.35" />
          <path d="M-100 480 Q400 200 900 480" fill="none" stroke="currentColor" strokeWidth="36" opacity="0.3" />
          <path d="M-100 540 Q400 280 900 540" fill="none" stroke="currentColor" strokeWidth="28" opacity="0.25" />
          <path d="M-100 590 Q400 350 900 590" fill="none" stroke="currentColor" strokeWidth="20" opacity="0.2" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <p className="mb-6 text-sm font-semibold uppercase tracking-widest text-brand-orange">
          Regularização fundiária, desde 2005
        </p>

        <h1
          ref={titleRef}
          className="font-display max-w-4xl text-4xl leading-[1.05] sm:text-6xl lg:text-7xl"
        >
          Transformando vidas.{" "}
          <span className="text-brand-orange">Realizando sonhos.</span>
        </h1>

        <p className="hero-sub mt-6 max-w-2xl text-base text-brand-cream/90 opacity-0 sm:text-lg">
          Regularização fundiária de ponta a ponta, do diagnóstico ao registro
          em cartório, para que cada família tenha a escritura do próprio lote.
        </p>

        <div ref={ctaRef} className="hero-cta mt-10 flex flex-wrap gap-4 opacity-0">
          <Button asChild size="lg">
            <a href={wa} target="_blank" rel="noopener noreferrer">
              Falar no WhatsApp
            </a>
          </Button>
          <Button asChild size="lg" variant="ghostDark">
            <Link href="/regularizacoes">Ver regularizações</Link>
          </Button>
        </div>

        <HeroStats />
      </div>

      <div className="hero-scroll absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-brand-cream/80">
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <ChevronDown className="h-4 w-4" />
      </div>
    </section>
  );
}

function HeroStats() {
  const concluidas = useCounter<HTMLSpanElement>(7, { prefix: "+", suffix: " mil" });
  const andamento = useCounter<HTMLSpanElement>(15, { prefix: "+", suffix: " mil" });
  const valorizacao = useCounter<HTMLSpanElement>(150, { prefix: "+", suffix: "%" });
  const desde = useCounter<HTMLSpanElement>(2005);

  return (
    <dl className="hero-stats mt-14 grid max-w-3xl grid-cols-2 gap-6 opacity-0 sm:grid-cols-4">
      <div>
        <dt className="text-xs uppercase tracking-wider text-brand-cream/80">Concluídas</dt>
        <dd className="mt-1 font-display text-2xl text-brand-orange sm:text-3xl">
          <span ref={concluidas}>0</span>
        </dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wider text-brand-cream/80">Em andamento</dt>
        <dd className="mt-1 font-display text-2xl text-brand-orange sm:text-3xl">
          <span ref={andamento}>0</span>
        </dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wider text-brand-cream/80">Valorização</dt>
        <dd className="mt-1 font-display text-2xl text-brand-orange sm:text-3xl">
          <span ref={valorizacao}>0</span>
        </dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wider text-brand-cream/80">Desde</dt>
        <dd className="mt-1 font-display text-2xl text-brand-orange sm:text-3xl">
          <span ref={desde}>0</span>
        </dd>
      </div>
    </dl>
  );
}

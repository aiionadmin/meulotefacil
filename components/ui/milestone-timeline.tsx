"use client";

import { useRef, useState } from "react";
import { motion, type Variants } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";

export type Milestone = {
  year: string;
  title: string;
  description: string;
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.14 },
  },
};

const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 22 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 110, damping: 16 },
  },
};

type MilestoneTimelineProps = {
  items: readonly Milestone[];
  className?: string;
};

/**
 * Linha do tempo institucional — Milestone Timeline Feature (21st/uiable)
 * adaptado a ink/paper/latossolo + trilho de progresso GSAP (padrão Método).
 */
export default function MilestoneTimeline({
  items,
  className,
}: MilestoneTimelineProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduceMotion = prefersReducedMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const nodes = gsap.utils.toArray<HTMLElement>(".mlf-milestone");
      const progress = progressRef.current;
      const rail = root.querySelector(".mlf-timeline-rail");

      nodes.forEach((el, i) => {
        gsap.to(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 60%",
            end: "bottom 40%",
            onEnter: () => setActive(i),
            onEnterBack: () => setActive(i),
          },
        });
      });

      if (progress && rail && !reduceMotion) {
        gsap.set(progress, { transformOrigin: "top center", scaleY: 0 });
        gsap.to(progress, {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: rail,
            start: "top 70%",
            end: "bottom 35%",
            scrub: 0.35,
          },
        });
      } else if (progress) {
        gsap.set(progress, { scaleY: 1 });
      }
    },
    { scope: rootRef, dependencies: [reduceMotion] }
  );

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <motion.div
        initial={reduceMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={reduceMotion ? undefined : staggerContainer}
        className="mlf-timeline-rail relative mx-auto max-w-3xl"
      >
        <div
          aria-hidden
          className="absolute top-2 bottom-2 left-[15px] w-px bg-ink/12 sm:left-1/2 sm:-translate-x-px"
        />
        <div
          ref={progressRef}
          aria-hidden
          className="absolute top-2 left-[15px] h-[calc(100%-1rem)] w-px origin-top bg-gradient-to-b from-latossolo via-[var(--mata-muted)] to-mata sm:left-1/2 sm:-translate-x-px"
          style={{ transform: "scaleY(0)" }}
        />

        <ol className="relative">
          {items.map((mil, idx) => {
            const isLeft = idx % 2 === 0;
            const isActive = active === idx;

            return (
              <motion.li
                key={`${mil.year}-${mil.title}`}
                variants={reduceMotion ? undefined : popIn}
                className="mlf-milestone group relative mb-10 flex flex-col items-start last:mb-0 sm:mb-14 sm:flex-row sm:items-center sm:justify-between"
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-[15px] z-10 size-3.5 -translate-x-1/2 rounded-full border-[3px] border-paper transition-all duration-500 sm:left-1/2",
                    isActive
                      ? "scale-125 bg-latossolo shadow-[0_0_0_6px_rgba(237,134,0,0.16)]"
                      : "bg-ink/35 group-hover:bg-latossolo"
                  )}
                />

                {/* Lado esquerdo (desktop) / conteúdo mobile nos pares */}
                <div
                  className={cn(
                    "w-full pl-10 sm:w-[45%] sm:pl-0 sm:pr-6 sm:text-right",
                    !isLeft && "pointer-events-none hidden sm:block sm:opacity-0"
                  )}
                >
                  <MilestoneCard
                    mil={mil}
                    active={isActive}
                    align="right"
                    showOnMobile={isLeft}
                  />
                </div>

                {/* Lado direito (desktop) / conteúdo mobile nos ímpares */}
                <div
                  className={cn(
                    "w-full pl-10 sm:w-[45%] sm:pl-6 sm:text-left",
                    isLeft && "pointer-events-none hidden sm:block sm:opacity-0"
                  )}
                >
                  <MilestoneCard
                    mil={mil}
                    active={isActive}
                    align="left"
                    showOnMobile={!isLeft}
                  />
                </div>
              </motion.li>
            );
          })}
        </ol>
      </motion.div>
    </div>
  );
}

function MilestoneCard({
  mil,
  active,
  align,
  showOnMobile,
}: {
  mil: Milestone;
  active: boolean;
  align: "left" | "right";
  showOnMobile: boolean;
}) {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-sm border p-5 transition-colors duration-500 sm:p-6",
        active
          ? "border-ink/20 bg-paper-muted/80"
          : "border-ink/10 bg-paper/60 hover:border-ink/18",
        !showOnMobile && "max-sm:hidden"
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70",
          align === "right"
            ? "from-latossolo/10 to-transparent"
            : "from-mata/10 to-transparent"
        )}
      />
      <div className="relative">
        <span className="font-mono-label text-sm tabular-nums text-latossolo">
          {mil.year}
        </span>
        <h3 className="font-display mt-1.5 text-xl text-ink sm:text-[1.35rem]">
          {mil.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {mil.description}
        </p>
      </div>
    </article>
  );
}

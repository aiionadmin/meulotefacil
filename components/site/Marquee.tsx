"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

const items = [
  "REURB-S",
  "REURB-E",
  "Loteamentos",
  "Condomínios de lotes",
  "Conjuntos habitacionais",
  "Áreas urbanas e rurais",
];

export function Marquee() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track || prefersReducedMotion()) return;

      const tween = gsap.to(track, {
        xPercent: -50,
        duration: 28,
        ease: "none",
        repeat: -1,
      });

      const onWheel = (e: WheelEvent) => {
        const boost = Math.min(2.5, 1 + Math.abs(e.deltaY) / 400);
        tween.timeScale(boost);
        gsap.delayedCall(0.4, () => tween.timeScale(1));
      };
      window.addEventListener("wheel", onWheel, { passive: true });

      return () => {
        window.removeEventListener("wheel", onWheel);
        tween.kill();
      };
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      className="overflow-hidden border-y border-brand-orange/20 bg-brand-orange py-4 text-white"
    >
      <div ref={trackRef} className="flex w-max gap-8 whitespace-nowrap">
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-8 font-display text-sm sm:text-base">
            {item}
            <span className="text-brand-navy/40" aria-hidden>
              •
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

const items = [
  "Parcelas que cabem no bolso",
  "Documentação em dia",
  "Lotes prontos para construir",
  "Atendimento humano",
  "Processo 100% transparente",
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

      ScrollTriggerLike(tween);

      return () => tween.kill();
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

function ScrollTriggerLike(tween: gsap.core.Tween) {
  // React to scroll velocity lightly without hard dependency if ST unavailable
  const onWheel = (e: WheelEvent) => {
    const boost = Math.min(2.5, 1 + Math.abs(e.deltaY) / 400);
    tween.timeScale(boost);
    gsap.delayedCall(0.4, () => tween.timeScale(1));
  };
  window.addEventListener("wheel", onWheel, { passive: true });
  tween.eventCallback("onComplete", () => {
    window.removeEventListener("wheel", onWheel);
  });
  const originalKill = tween.kill.bind(tween);
  tween.kill = (...args: Parameters<typeof tween.kill>) => {
    window.removeEventListener("wheel", onWheel);
    return originalKill(...args);
  };
}

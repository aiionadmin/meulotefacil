"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

export function PageTransition() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const overlay = overlayRef.current;
    if (!overlay || prefersReducedMotion()) return;

    const tl = gsap.timeline();
    tl.set(overlay, { yPercent: 100, display: "block" })
      .to(overlay, { yPercent: 0, duration: 0.45, ease: "power3.inOut" })
      .to(overlay, { yPercent: -100, duration: 0.55, ease: "power3.inOut", delay: 0.05 })
      .set(overlay, { display: "none" });

    return () => {
      tl.kill();
    };
  }, [pathname]);

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none fixed inset-0 z-[9998] hidden overflow-hidden bg-brand-navy"
      aria-hidden
    >
      <svg
        className="absolute inset-x-0 bottom-0 h-40 w-full text-brand-orange/30"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
      >
        <path
          d="M0 120 Q300 40 600 120 T1200 120 V200 H0 Z"
          fill="currentColor"
        />
        <path
          d="M0 150 Q300 80 600 150 T1200 150"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}

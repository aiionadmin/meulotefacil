"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

export function useReveal<T extends HTMLElement>(opts?: {
  y?: number;
  delay?: number;
  duration?: number;
}) {
  const ref = useRef<T>(null);
  const { y = 40, delay = 0, duration = 0.9 } = opts ?? {};

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        gsap.set(el, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        }
      );
    },
    { scope: ref, dependencies: [y, delay, duration], revertOnUpdate: true }
  );

  return ref;
}

export { ScrollTrigger };

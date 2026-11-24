"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

export function useDrawSVG<T extends SVGSVGElement>(opts?: {
  selector?: string;
  duration?: number;
  stagger?: number;
  scrub?: boolean | number;
}) {
  const ref = useRef<T>(null);
  const {
    selector = "path",
    duration = 1.2,
    stagger = 0.12,
    scrub = false,
  } = opts ?? {};

  useGSAP(
    () => {
      const svg = ref.current;
      if (!svg) return;
      const paths = svg.querySelectorAll(selector);
      if (!paths.length) return;

      if (prefersReducedMotion()) {
        gsap.set(paths, { drawSVG: "100%" });
        return;
      }

      gsap.fromTo(
        paths,
        { drawSVG: "0%" },
        {
          drawSVG: "100%",
          duration,
          stagger,
          ease: "power2.inOut",
          scrollTrigger: scrub
            ? {
                trigger: svg,
                start: "top 80%",
                end: "bottom 40%",
                scrub: typeof scrub === "number" ? scrub : 0.6,
              }
            : {
                trigger: svg,
                start: "top 80%",
              },
        }
      );
    },
    { scope: ref, dependencies: [selector, duration, stagger, scrub] }
  );

  return ref;
}

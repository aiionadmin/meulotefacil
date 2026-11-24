"use client";

import { useRef } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

export function useSplitReveal<T extends HTMLElement>(opts?: {
  type?: "chars" | "words" | "lines";
  stagger?: number;
}) {
  const ref = useRef<T>(null);
  const { type = "lines", stagger = 0.08 } = opts ?? {};

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        gsap.set(el, { opacity: 1 });
        return;
      }

      const split = new SplitText(el, {
        type: type === "lines" ? "lines,words" : type,
        linesClass: "split-line overflow-hidden",
      });

      const targets =
        type === "chars"
          ? split.chars
          : type === "words"
            ? split.words
            : split.lines;

      gsap.fromTo(
        targets,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          stagger,
          ease: "expo.out",
          delay: 0.1,
        }
      );

      return () => split.revert();
    },
    { scope: ref, dependencies: [type, stagger] }
  );

  return ref;
}

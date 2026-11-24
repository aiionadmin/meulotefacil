"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

export function useCounter<T extends HTMLElement>(
  value: number,
  opts?: { duration?: number; prefix?: string; suffix?: string }
) {
  const ref = useRef<T>(null);
  const { duration = 1.4, prefix = "", suffix = "" } = opts ?? {};

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        el.textContent = `${prefix}${Math.round(value).toLocaleString("pt-BR")}${suffix}`;
        return;
      }

      const obj = { n: 0 };
      gsap.to(obj, {
        n: value,
        duration,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
        },
        onUpdate: () => {
          el.textContent = `${prefix}${Math.round(obj.n).toLocaleString("pt-BR")}${suffix}`;
        },
      });
    },
    { scope: ref, dependencies: [value, duration, prefix, suffix] }
  );

  return ref;
}

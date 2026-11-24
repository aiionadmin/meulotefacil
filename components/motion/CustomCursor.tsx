"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);

    const cursor = cursorRef.current;
    if (!cursor) return;

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.25, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.25, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.(
        "[data-cursor]"
      ) as HTMLElement | null;
      const label = target?.dataset.cursor;
      if (label && labelRef.current) {
        labelRef.current.textContent = label;
        gsap.to(cursor, { scale: 2.4, duration: 0.3, ease: "power3.out" });
        gsap.to(labelRef.current, { opacity: 1, duration: 0.2 });
      } else if ((e.target as HTMLElement)?.closest?.("a, button")) {
        gsap.to(cursor, { scale: 1.8, duration: 0.3, ease: "power3.out" });
        if (labelRef.current) gsap.set(labelRef.current, { opacity: 0 });
      }
    };

    const onOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (related?.closest?.("[data-cursor], a, button")) return;
      gsap.to(cursor, { scale: 1, duration: 0.3, ease: "power3.out" });
      if (labelRef.current) gsap.to(labelRef.current, { opacity: 0, duration: 0.15 });
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.documentElement.classList.add("has-custom-cursor");

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-latossolo mix-blend-difference md:flex"
      aria-hidden
    >
      <span
        ref={labelRef}
        className="absolute text-[8px] font-bold uppercase tracking-wider text-white opacity-0"
      />
    </div>
  );
}

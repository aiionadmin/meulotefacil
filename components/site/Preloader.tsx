"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { gsap, SplitText } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

const SESSION_KEY = "mlf_preloader_done";

export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    setShow(true);
  }, []);

  useEffect(() => {
    if (!show) return;
    const root = rootRef.current;
    if (!root) return;

    const finish = () => {
      sessionStorage.setItem(SESSION_KEY, "1");
      setShow(false);
    };

    if (prefersReducedMotion()) {
      finish();
      return;
    }

    const wordmark = root.querySelector(".logo-wordmark");
    const paths = root.querySelectorAll(
      ".logo-house-outer, .logo-house-inner, .logo-arc"
    );
    const windowEls = root.querySelectorAll(".logo-window");

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(root, {
          yPercent: -100,
          duration: 0.7,
          ease: "power3.inOut",
          onComplete: finish,
        });
      },
    });

    tl.set(paths, { drawSVG: "0%" })
      .to(".logo-house-outer", { drawSVG: "100%", duration: 0.45, ease: "power2.out" })
      .to(".logo-house-inner", { drawSVG: "100%", duration: 0.35, ease: "power2.out" }, "-=0.1")
      .to(
        ".logo-arc",
        { drawSVG: "100%", duration: 0.3, stagger: 0.08, ease: "power2.out" },
        "-=0.1"
      )
      .fromTo(
        windowEls,
        { scale: 0, opacity: 0, transformOrigin: "center" },
        { scale: 1, opacity: 1, duration: 0.25, ease: "back.out(2)" },
        "-=0.05"
      );

    let split: SplitText | null = null;
    if (wordmark) {
      split = new SplitText(wordmark, { type: "chars" });
      tl.fromTo(
        split.chars,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.02, duration: 0.35, ease: "power3.out" },
        "-=0.15"
      );
    }

    tl.to({}, { duration: 0.25 });

    const maxTimer = window.setTimeout(() => {
      tl.progress(1);
    }, 2200);

    return () => {
      window.clearTimeout(maxTimer);
      tl.kill();
      split?.revert();
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-brand-navy"
      style={{ clipPath: "inset(0 0 0 0)" }}
      aria-hidden
    >
      <Logo variant="full" animated className="scale-125 text-latossolo" />
    </div>
  );
}

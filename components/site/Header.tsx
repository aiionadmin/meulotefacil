"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { gsap } from "@/lib/gsap";
import { cn, prefersReducedMotion } from "@/lib/utils";

const links = [
  { href: "/empreendimentos", label: "Empreendimentos" },
  { href: "/simulador", label: "Simulador" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      const header = headerRef.current;
      if (!header || prefersReducedMotion()) return;
      if (y > lastY.current && y > 120) {
        gsap.to(header, { yPercent: -100, duration: 0.35, ease: "power2.out" });
      } else {
        gsap.to(header, { yPercent: 0, duration: 0.35, ease: "power2.out" });
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || prefersReducedMotion()) return;
    gsap.fromTo(
      ".mobile-nav-link",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.06, duration: 0.5, ease: "power3.out" }
    );
  }, [open]);

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
          scrolled
            ? "bg-brand-navy/90 text-brand-cream shadow-lg backdrop-blur-md"
            : "bg-transparent text-brand-cream"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
          <Link href="/" className="relative z-10">
            <Logo variant="full" className="scale-90 sm:scale-100" />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-brand-cream/85 transition-colors hover:text-brand-orange"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-brand-cream/85 hover:text-brand-orange"
            >
              Área do cliente
            </Link>
            <Button asChild size="sm">
              <Link href="/empreendimentos">Quero meu lote</Link>
            </Button>
          </div>

          <button
            type="button"
            className="relative z-10 rounded-lg p-2 text-brand-cream lg:hidden"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 bg-brand-navy lg:hidden">
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full text-brand-orange/15"
            viewBox="0 0 400 800"
            aria-hidden
          >
            <path d="M-40 500 Q200 350 440 500" fill="none" stroke="currentColor" strokeWidth="40" />
            <path d="M-40 580 Q200 420 440 580" fill="none" stroke="currentColor" strokeWidth="32" />
            <path d="M-40 660 Q200 490 440 660" fill="none" stroke="currentColor" strokeWidth="24" />
          </svg>
          <nav className="relative flex h-full flex-col items-center justify-center gap-6 px-6 pt-16">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="mobile-nav-link font-display text-3xl text-brand-cream"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/auth/login"
              className="mobile-nav-link mt-4 text-lg text-brand-cream/80"
              onClick={() => setOpen(false)}
            >
              Área do cliente
            </Link>
            <Button asChild size="lg" className="mobile-nav-link mt-2">
              <Link href="/empreendimentos" onClick={() => setOpen(false)}>
                Quero meu lote
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </>
  );
}

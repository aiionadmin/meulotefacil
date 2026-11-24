"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { SITE_NAV, SITE_NAV_CTA } from "@/lib/site-nav";
import { whatsappUrl } from "@/lib/institutional";
import { cn } from "@/lib/utils";

/**
 * Floating navbar shell (estilo aceternity floating-navbar).
 * Registry 21st exigiu auth — composição própria adaptada a ink/paper/accent.
 */
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const wa = whatsappUrl();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const insideHero =
        document.documentElement.dataset.heroScroll === "inside";
      setScrolled(!insideHero && y > 24);
    };
    onScroll();
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
    setOpen(false);
  }, [pathname]);

  const solid = scrolled || open;

  return (
    <>
      <header className="site-header pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
        <div
          className={cn(
            "pointer-events-auto site-container transition-[max-width,padding,background-color,border-color,box-shadow] duration-300",
            solid
              ? "rounded-sm border border-linha/80 bg-paper/95 text-ink shadow-[0_8px_28px_-18px_rgba(17,22,20,0.45)] backdrop-blur-md"
              : "rounded-sm border border-transparent bg-transparent text-paper"
          )}
        >
          <div className="flex h-14 items-center justify-between gap-4 sm:h-16">
            <Link href="/" className="relative z-10 shrink-0" aria-label="Meu Lote Fácil — Home">
              <Logo
                variant="full"
                className={cn(
                  "scale-90 transition-opacity sm:scale-100",
                  solid ? "opacity-100" : "opacity-95"
                )}
              />
            </Link>

            <nav
              className="hidden items-center gap-1 xl:flex"
              aria-label="Principal"
            >
              {SITE_NAV.map((l) => {
                const active =
                  l.href === "/"
                    ? pathname === "/"
                    : pathname === l.href || pathname.startsWith(`${l.href}/`);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={cn(
                      "rounded-sm px-2.5 py-1.5 text-sm font-medium transition-colors",
                      solid
                        ? active
                          ? "text-ink"
                          : "text-ink/65 hover:text-ink"
                        : active
                          ? "text-paper"
                          : "text-paper/75 hover:text-paper"
                    )}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden items-center gap-2 lg:flex">
              <Button
                asChild
                size="sm"
                variant={solid ? "default" : "cream"}
              >
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  {SITE_NAV_CTA.talk.label}
                </a>
              </Button>
            </div>

            <button
              type="button"
              className={cn(
                "relative z-10 rounded-sm p-2 lg:hidden",
                solid ? "text-ink" : "text-paper"
              )}
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 bg-ink text-paper lg:hidden">
          <nav
            className="site-container flex h-full flex-col justify-center gap-5 pt-16"
            aria-label="Mobile"
          >
            {SITE_NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-display text-3xl text-paper"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Button asChild size="lg" variant="cream" className="mt-6 w-fit">
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
              >
                {SITE_NAV_CTA.talk.label}
              </a>
            </Button>
          </nav>
        </div>
      )}
    </>
  );
}

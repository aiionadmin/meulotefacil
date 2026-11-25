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
 * Navbar flutuante.
 * Texto claro (paper) só sobre o hero escuro da home.
 * Em qualquer outra página / após sair do hero: barra sólida com texto ink.
 */
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [overDarkHero, setOverDarkHero] = useState(false);
  const wa = whatsappUrl();
  const isHome = pathname === "/";

  useEffect(() => {
    const sync = () => {
      if (!isHome) {
        setOverDarkHero(false);
        return;
      }
      setOverDarkHero(
        document.documentElement.dataset.heroScroll === "inside"
      );
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    // ScrollHero atualiza data-hero-scroll sem necessariamente disparar scroll
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-hero-scroll"],
    });
    return () => {
      window.removeEventListener("scroll", sync);
      obs.disconnect();
    };
  }, [isHome]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Sólida = legível em fundo claro. Transparente só no hero escuro da home.
  const solid = open || !overDarkHero;

  return (
    <>
      <header className="site-header pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
        <div
          className={cn(
            "pointer-events-auto site-container transition-[max-width,padding,background-color,border-color,box-shadow,color] duration-300",
            solid
              ? "rounded-sm border border-linha/80 bg-paper/95 text-ink shadow-[0_8px_28px_-18px_rgba(17,22,20,0.45)] backdrop-blur-md"
              : "rounded-sm border border-transparent bg-transparent text-paper"
          )}
        >
          <div className="flex h-14 items-center justify-between gap-3 sm:h-16 sm:gap-4">
            <Link
              href="/"
              className="relative z-10 min-w-0 shrink-0"
              aria-label="Meu Lote Fácil, Home"
            >
              <Logo
                variant="full"
                tone={solid ? "ink" : "paper"}
                className="max-w-[min(100%,11rem)] scale-90 sm:max-w-none sm:scale-100"
              />
            </Link>

            <nav
              className="hidden items-center gap-0.5 lg:flex"
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
                      "inline-flex items-center gap-1 rounded-sm px-2 py-1.5 text-sm font-medium transition-colors xl:px-2.5",
                      solid
                        ? active
                          ? "bg-paper-muted/80 text-ink"
                          : "text-ink/80 hover:bg-paper-muted/60 hover:text-ink"
                        : active
                          ? "bg-paper/15 text-paper drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]"
                          : "text-paper/95 hover:bg-paper/10 hover:text-paper drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]"
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
                "relative z-10 shrink-0 rounded-sm p-2 lg:hidden",
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
                className="inline-flex items-center gap-3 font-display text-3xl text-paper sm:text-4xl"
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

"use client";

import { useRef } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { INSTITUTIONAL, whatsappUrl } from "@/lib/institutional";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/utils";

/**
 * CTA final — painel escuro com atmosfera e hierarquia clara (padrão 21st).
 */
export function FinalCTA({
  secondaryHref = "/regularizacao",
  secondaryLabel = "Ver regularizações",
}: {
  secondaryHref?: string;
  secondaryLabel?: string;
} = {}) {
  const rootRef = useRef<HTMLElement>(null);
  const wa = whatsappUrl();

  useGSAP(
    () => {
      if (prefersReducedMotion() || !rootRef.current) return;
      gsap.fromTo(
        rootRef.current.querySelector(".cta-panel"),
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 80%",
          },
        }
      );
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden border-t border-ink/20 bg-ink-deep py-20 text-paper lg:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_20%,rgba(237,134,0,0.18),transparent_45%),radial-gradient(ellipse_at_90%_80%,rgba(62,90,75,0.35),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-latossolo/50 to-transparent"
      />

      <div className="site-container relative">
        <div className="cta-panel relative overflow-hidden rounded-sm border border-paper/15 bg-paper/[0.03] p-8 backdrop-blur-sm sm:p-12 lg:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-latossolo/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-16 size-80 rounded-full bg-mata/25 blur-3xl"
          />

          <div className="relative grid gap-10 lg:grid-cols-[1.35fr_auto] lg:items-end lg:gap-16">
            <div>
              <SectionHeading
                number="07"
                eyebrow="Contato"
                title="Seu imóvel está sem escritura?"
                subtitle="Fale com quem já regularizou milhares de lotes em Campinas e região."
                dark
              />
              <p className="mt-6 text-sm text-paper/55">
                WhatsApp{" "}
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-paper/80 underline-offset-4 transition-colors hover:text-latossolo hover:underline"
                >
                  {INSTITUTIONAL.whatsappPrimary.display}
                </a>
                <span className="mx-2 text-paper/25">·</span>
                {INSTITUTIONAL.sede.address}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-paper px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-latossolo"
              >
                <MessageCircle className="size-4 shrink-0" aria-hidden />
                Falar no WhatsApp
              </a>
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-paper/35 bg-transparent px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:border-paper hover:bg-paper/10"
              >
                {secondaryLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

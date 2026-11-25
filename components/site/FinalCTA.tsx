"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";
import { whatsappUrl } from "@/lib/institutional";

export function FinalCTA() {
  const rootRef = useRef<HTMLElement>(null);
  const wa = whatsappUrl();

  return (
    <section
      ref={rootRef}
      className="relative border-t border-linha bg-brand-navy py-24 text-brand-cream"
    >
      <div className="site-container">
        <div className="grid gap-10 border border-brand-cream/15 p-8 sm:p-12 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <SectionHeading
            number="07"
            eyebrow="Contato"
            title="Seu imóvel está sem escritura?"
            subtitle="Fale com quem já regularizou milhares de lotes em Campinas e região."
            dark
          />
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Button asChild size="lg" variant="cream">
              <a href={wa} target="_blank" rel="noopener noreferrer">
                Falar no WhatsApp
              </a>
            </Button>
            <Button asChild size="lg" variant="ghostDark">
              <a href="/regularizacao">Ver regularizações</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

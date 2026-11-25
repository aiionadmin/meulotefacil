"use client";

import Faq05 from "@/components/ui/faq-05";
import { whatsappUrl } from "@/lib/institutional";

/**
 * FAQ — faixa mata-soft (surface accent) entre Depoimentos (paper) e CTA (ink-deep).
 */
export function FAQ() {
  const wa = whatsappUrl();

  return (
    <div className="border-b border-linha">
      <Faq05
        className="bg-accent"
        description={
          <>
            Ainda com dúvida?{" "}
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-latossolo underline-offset-4 hover:underline"
            >
              Fale conosco pelo WhatsApp
            </a>
            .
          </>
        }
      />
    </div>
  );
}

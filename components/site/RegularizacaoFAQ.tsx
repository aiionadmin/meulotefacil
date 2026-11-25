"use client";

import Faq05 from "@/components/ui/faq-05";
import { whatsappUrl } from "@/lib/institutional";

/** FAQ da página /regularizacao — mesmo Faq05 + copy REURB pt-BR. */
export function RegularizacaoFAQ() {
  const wa = whatsappUrl();

  return (
    <Faq05
      className="border-b border-linha bg-paper-muted"
      eyebrow="05 FAQ"
      title="Dúvidas frequentes"
      description={
        <>
          Sobre REURB, municípios e a atuação da Meu Lote Fácil.{" "}
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
  );
}

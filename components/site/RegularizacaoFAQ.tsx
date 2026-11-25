"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/site/SectionHeading";
import { REGULARIZACAO_FAQ } from "@/lib/data/regularizacao-content";

export function RegularizacaoFAQ() {
  return (
    <section className="border-b border-linha bg-paper-muted py-20 lg:py-28">
      <div className="site-container grid gap-10 lg:grid-cols-2">
        <SectionHeading
          number="05"
          eyebrow="FAQ"
          title="Dúvidas frequentes"
          subtitle="Sobre REURB, municípios e a atuação da Meu Lote Fácil."
        />
        <Accordion type="single" collapsible className="w-full border-t border-linha">
          {REGULARIZACAO_FAQ.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

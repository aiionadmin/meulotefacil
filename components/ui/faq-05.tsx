// FAQ 5 from Hirael <https://hirael.com/blocks/faqs/faq-05>
// MIT · Mohammad Shehadeh · https://github.com/MohammadShehadeh/hirael
// Adapted to Meu Lote Fácil brand tokens + REURB pt-BR copy (layout compacto).

"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { REGULARIZACAO_FAQ } from "@/lib/data/regularizacao-content";
import { cn } from "@/lib/utils";

export type FaqItem = { id: string; q: string; a: string };

/** Defaults = FAQ institucional REURB (sem sample em inglês). */
const DEFAULT_FAQS: readonly FaqItem[] = REGULARIZACAO_FAQ;

type Faq05Props = {
  faqs?: readonly FaqItem[];
  eyebrow?: string;
  title?: string;
  description?: React.ReactNode;
  className?: string;
  defaultOpen?: string;
};

const Faq05 = ({
  faqs = DEFAULT_FAQS,
  eyebrow = "06 FAQ",
  title = "Perguntas frequentes",
  description = "Ainda com dúvida? Fale conosco pelo WhatsApp.",
  className,
  defaultOpen,
}: Faq05Props) => {
  return (
    <section
      data-slot="faq"
      className={cn("bg-paper py-10 md:py-14", className)}
    >
      <div className="site-container">
        <div className="grid w-full grid-cols-1 gap-6 border border-border md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)] md:gap-0">
          <div
            data-slot="faq-intro"
            className="flex flex-col justify-start gap-2 border-b border-border px-5 py-6 md:border-b-0 md:border-e md:px-7 md:py-7"
          >
            <span className="font-mono-label text-[10px] uppercase tracking-[0.16em] text-foreground/80">
              {eyebrow}
            </span>
            <h2 className="font-display text-2xl font-medium leading-tight tracking-tight text-ink md:text-3xl">
              {title}
            </h2>
            <p className="max-w-xs text-sm leading-snug text-muted-foreground">
              {description}
            </p>
          </div>

          <div
            data-slot="faq-list"
            className="flex flex-col justify-center px-5 py-2 md:px-6 md:py-3"
          >
            <Accordion
              type="single"
              collapsible
              defaultValue={defaultOpen}
              className="w-full"
            >
              {faqs.map((item) => (
                <AccordionItem key={item.id} value={item.id} className="border-linha/70">
                  <AccordionTrigger className="py-3 text-sm font-medium text-ink data-[state=open]:text-latossolo hover:text-latossolo hover:no-underline md:text-[0.9375rem]">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 pt-0 text-sm leading-snug text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faq05;

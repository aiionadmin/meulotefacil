// FAQ 5 from Hirael <https://hirael.com/blocks/faqs/faq-05>
// MIT · Mohammad Shehadeh · https://github.com/MohammadShehadeh/hirael
// Adapted to Meu Lote Fácil brand tokens + REURB pt-BR copy.

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
      className={cn("bg-paper py-16 md:py-24", className)}
    >
      <div className="site-container">
        <div className="grid w-full grid-cols-1 border border-border md:grid-cols-2">
          <div
            data-slot="faq-intro"
            className="flex flex-col gap-4 border-b border-border px-6 pb-8 pt-10 md:border-b-0 md:border-e md:px-10 md:py-16"
          >
            <span className="font-mono-label text-[10px] uppercase tracking-[0.16em] text-foreground/80">
              {eyebrow}
            </span>
            <h2 className="font-display text-4xl font-medium leading-[1.04] tracking-tight text-ink md:text-5xl">
              {title}
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <div
            data-slot="faq-list"
            className="flex flex-col justify-center px-6 py-4 md:px-8 md:py-6"
          >
            <Accordion
              type="single"
              collapsible
              defaultValue={defaultOpen}
              className="w-full"
            >
              {faqs.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="text-ink data-[state=open]:text-latossolo hover:text-latossolo hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
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

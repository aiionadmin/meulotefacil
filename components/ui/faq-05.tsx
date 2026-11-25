// FAQ 5 from Hirael <https://hirael.com/blocks/faqs/faq-05>
// MIT · Mohammad Shehadeh · https://github.com/MohammadShehadeh/hirael
// Adapted to Meu Lote Fácil brand tokens + PT copy.

"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export type FaqItem = { id: string; q: string; a: string };

const DEFAULT_FAQS: readonly FaqItem[] = [
  {
    id: "item-1",
    q: "Como vocês atuam com as prefeituras?",
    a: "Com consultoria técnica para definir procedimentos, métodos de análise e fluxos de aprovação, alinhados à lei e às boas práticas.",
  },
  {
    id: "item-2",
    q: "O que o município ganha com isso?",
    a: "Processos mais rápidos, eficientes e eficazes, com segurança jurídica para todos os envolvidos.",
  },
  {
    id: "item-3",
    q: "Vocês atendem só o setor público?",
    a: "Não. Atendemos também empresas, comunidades, cooperativas e associações, em áreas urbanas e rurais.",
  },
  {
    id: "item-4",
    q: "Vocês fazem o projeto completo?",
    a: "Sim: do diagnóstico da área ao acompanhamento da aprovação e do registro em cartório.",
  },
  {
    id: "item-5",
    q: "Só trabalham com áreas de interesse social?",
    a: "Não. Atuamos em REURB-S (interesse social) e REURB-E (interesse específico), incluindo loteamentos e condomínios de médio e alto padrão.",
  },
  {
    id: "item-6",
    q: "Qual é o diferencial da Meu Lote Fácil?",
    a: "Somos a maior empresa de regularização fundiária de Campinas e região, com mais de 7 mil regularizações concluídas desde 2005.",
  },
  {
    id: "item-7",
    q: "Qual a diferença entre REURB-S e REURB-E?",
    a: "REURB-S atende interesse social; REURB-E, interesse específico. Em ambos os casos conduzimos o processo técnico até a aprovação e o registro.",
  },
  {
    id: "item-8",
    q: "Quanto tempo leva e quanto custa?",
    a: "Depende do núcleo, da documentação e da fase do processo. Fale conosco no WhatsApp para uma orientação sob medida.",
  },
  {
    id: "item-9",
    q: "Quais documentos o morador precisa levar?",
    a: "A lista varia por fase e núcleo. No atendimento das unidades e na área de acompanhamento orientamos o checklist completo.",
  },
] as const;

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

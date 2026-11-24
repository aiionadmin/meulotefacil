"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Como vocês atuam com as prefeituras?",
    a: "Com consultoria técnica para definir procedimentos, métodos de análise e fluxos de aprovação, alinhados à lei e às boas práticas.",
  },
  {
    q: "O que o município ganha com isso?",
    a: "Processos mais rápidos, eficientes e eficazes, com segurança jurídica para todos os envolvidos.",
  },
  {
    q: "Vocês atendem só o setor público?",
    a: "Não. Atendemos também empresas, comunidades, cooperativas e associações, em áreas urbanas e rurais.",
  },
  {
    q: "Vocês fazem o projeto completo?",
    a: "Sim: do diagnóstico da área ao acompanhamento da aprovação e do registro em cartório.",
  },
  {
    q: "Só trabalham com áreas de interesse social?",
    a: "Não. Atuamos em REURB-S (interesse social) e REURB-E (interesse específico), incluindo loteamentos e condomínios de médio e alto padrão.",
  },
  {
    q: "Qual é o diferencial da Meu Lote Fácil?",
    a: "Somos a maior empresa de regularização fundiária de Campinas e região, com mais de 7 mil regularizações concluídas desde 2005.",
  },
  // Novas — a confirmar com o cliente
  {
    q: "Qual a diferença entre REURB-S e REURB-E?",
    a: "Resposta a confirmar com o cliente. Em linhas gerais, REURB-S atende interesse social e REURB-E interesse específico.",
  },
  {
    q: "Quanto tempo leva e quanto custa?",
    a: "Depende do núcleo, da documentação e da fase do processo. Fale conosco no WhatsApp para uma orientação sob medida. (A confirmar com o cliente.)",
  },
  {
    q: "Quais documentos o morador precisa levar?",
    a: "A lista varia por fase e núcleo. Na área de acompanhamento e no atendimento das unidades orientamos o checklist. (A confirmar com o cliente.)",
  },
];

export function FAQ() {
  return (
    <section className="bg-brand-cream py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange">
            FAQ
          </p>
          <h2 className="font-display mt-3 text-3xl text-brand-navy sm:text-5xl">
            Perguntas frequentes
          </h2>
          <p className="mt-4 text-muted-foreground">
            Ainda com dúvida? Fale conosco pelo WhatsApp.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
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

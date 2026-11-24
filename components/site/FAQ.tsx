"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Preciso dar uma entrada alta?",
    a: "Não necessariamente. Trabalhamos com condições de entrada facilitada e parcelas acessíveis. Use o simulador e fale com um consultor para o cenário ideal.",
  },
  {
    q: "Os lotes já têm infraestrutura?",
    a: "Depende do empreendimento. Na ficha de cada lançamento você encontra o que já está entregue — vias, água, energia, drenagem e áreas comuns.",
  },
  {
    q: "Posso reservar online?",
    a: "Sim. Após escolher o lote, você inicia a reserva pelo site ou com um consultor. Em modo demo, o fluxo completo de pagamento ainda é simulado.",
  },
  {
    q: "A documentação está regularizada?",
    a: "Trabalhamos apenas com empreendimentos com documentação em dia. Os detalhes de matrícula e registro ficam disponíveis na área do cliente.",
  },
  {
    q: "Consigo construir logo após a compra?",
    a: "Em geral, sim — conforme regras do loteamento e aprovação municipal. Orientamos você em cada etapa até a construção.",
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
            Ainda com dúvida? Fale com a gente pelo WhatsApp ou pelo formulário
            de contato.
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

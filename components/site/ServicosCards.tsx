import Link from "next/link";
import { Building2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";

const servicos = [
  {
    href: "/servicos/consultoria",
    icon: Building2,
    audience: "Para prefeituras",
    title: "Consultoria técnica para municípios",
    text: "Procedimentos, métodos de análise e fluxos de aprovação de REURB sob medida para cada cidade.",
  },
  {
    href: "/servicos/planos-e-projetos",
    icon: Home,
    audience: "Para moradores, associações e loteadores",
    title: "Planos e projetos de regularização",
    text: "Diagnóstico, projetos técnicos e acompanhamento até a aprovação e o registro em cartório.",
  },
];

export function ServicosCards() {
  return (
    <section className="border-b border-linha bg-brand-cream py-20 lg:py-28">
      <div className="site-container">
        <SectionHeading
          number="01"
          eyebrow="Atuação"
          title="Dois públicos, uma especialidade"
        />

        <div className="mt-12 grid gap-0 border border-linha lg:grid-cols-2">
          {servicos.map((s, i) => (
            <article
              key={s.href}
              className={`flex flex-col bg-card p-8 lg:p-10 ${
                i === 0 ? "border-b border-linha lg:border-b-0 lg:border-r" : ""
              }`}
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center border border-linha text-ink/80">
                <s.icon className="h-5 w-5" />
              </div>
              <p className="font-mono-label text-xs text-ink/70">{s.audience}</p>
              <h3 className="font-display mt-2 text-2xl text-brand-navy">
                {s.title}
              </h3>
              <p className="mt-3 flex-1 text-muted-foreground">{s.text}</p>
              <Button asChild variant="outline" className="mt-6 w-fit">
                <Link href={s.href}>Saiba mais</Link>
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

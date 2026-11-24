import Link from "next/link";
import { Building2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <section className="bg-brand-cream py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange">
            Serviços
          </p>
          <h2 className="font-display mt-3 text-3xl text-brand-navy sm:text-5xl">
            Dois públicos, uma especialidade
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {servicos.map((s) => (
            <article
              key={s.href}
              className="flex flex-col rounded-2xl border border-brand-navy/8 bg-white p-8 shadow-sm"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy text-brand-orange">
                <s.icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-orange">
                {s.audience}
              </p>
              <h3 className="mt-2 text-2xl font-bold text-brand-navy">{s.title}</h3>
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

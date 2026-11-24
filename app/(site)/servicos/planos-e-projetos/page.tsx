import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/institutional";

export const metadata: Metadata = {
  title: "Planos e projetos de regularização",
  description:
    "Do diagnóstico aos projetos técnicos e acompanhamento até o registro, REURB-S e REURB-E.",
};

export default function PlanosProjetosPage() {
  const wa = whatsappUrl(
    "Olá! Vim do site e gostaria de falar sobre planos e projetos de regularização."
  );

  return (
    <div className="bg-brand-cream pt-20">
      <section className="bg-brand-navy px-4 py-16 text-brand-cream sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange">
            Para moradores, associações e loteadores
          </p>
          <h1 className="font-display mt-3 text-3xl sm:text-5xl">
            Planos e projetos de regularização fundiária
          </h1>
        </div>
      </section>

      <article className="mx-auto max-w-3xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-lg leading-relaxed text-muted-foreground">
          Cada núcleo informal tem características próprias e precisa de um plano
          próprio. Entregamos a solução completa: do diagnóstico da área a todos os
          projetos, estudos e documentos exigidos, com acompanhamento até a
          aprovação e o registro.
        </p>

        <section>
          <h2 className="font-display text-2xl text-brand-navy">O que inclui</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Diagnóstico e plano estratégico</li>
            <li>Projetos e estudos técnicos</li>
            <li>REURB-S e REURB-E</li>
            <li>
              Loteamentos, condomínios e conjuntos habitacionais de baixo, médio e
              alto padrão
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-navy">Benefícios</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Celeridade e assertividade</li>
            <li>Processo alinhado à lei e às boas práticas técnicas</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-navy">Para quem</h2>
          <p className="mt-3 text-muted-foreground">
            Moradores, associações, cooperativas, loteadores e administradoras de
            áreas irregulares.
          </p>
        </section>

        <div className="flex flex-wrap gap-3 pt-4">
          <Button asChild>
            <a href={wa} target="_blank" rel="noopener noreferrer">
              Falar no WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/consulta">Consultar meu bairro</Link>
          </Button>
        </div>
      </article>
    </div>
  );
}

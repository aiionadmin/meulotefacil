import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/institutional";

export const metadata: Metadata = {
  title: "Consultoria técnica para municípios",
  description:
    "Procedimentos, métodos de análise e fluxos de aprovação de REURB para prefeituras.",
};

export default function ConsultoriaPage() {
  const wa = whatsappUrl(
    "Olá! Vim do site e gostaria de falar sobre consultoria técnica para municípios."
  );

  return (
    <div className="bg-paper pt-24">
      <section className="bg-brand-navy px-4 py-16 text-brand-cream sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange">
            Para prefeituras
          </p>
          <h1 className="font-display mt-3 text-3xl sm:text-5xl">
            Consultoria técnica para municípios
          </h1>
        </div>
      </section>

      <article className="mx-auto max-w-3xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-lg leading-relaxed text-muted-foreground">
          A legislação de regularização fundiária mudou e ficou mais moderna, mas
          muitos municípios ainda não têm normas locais claras para aplicá-la. Isso
          atrasa processos e gera insegurança jurídica. A Meu Lote Fácil ajuda a
          prefeitura a estruturar procedimentos, métodos de análise e fluxos de
          aprovação sob medida para a realidade de cada cidade.
        </p>

        <section>
          <h2 className="font-display text-2xl text-brand-navy">O que inclui</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Consultoria especializada</li>
            <li>Procedimentos, fluxos de análise e métodos de aprovação</li>
            <li>Padronização e normatização municipal</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-navy">Benefícios</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Segurança jurídica</li>
            <li>Celeridade e eficiência</li>
            <li>Programas padronizados</li>
            <li>Processos mais eficazes</li>
            <li>Respeito à impessoalidade, moralidade, publicidade e eficiência</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-navy">Para quem</h2>
          <p className="mt-3 text-muted-foreground">
            Prefeituras e gestores públicos; também empresas, advogados, arquitetos
            e engenheiros envolvidos nos processos.
          </p>
        </section>

        <div className="flex flex-wrap gap-3 pt-4">
          <Button asChild>
            <a href={wa} target="_blank" rel="noopener noreferrer">
              Falar no WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/servicos/planos-e-projetos">Ver planos e projetos</Link>
          </Button>
        </div>
      </article>
    </div>
  );
}

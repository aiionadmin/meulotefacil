import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";
import { LinhaDoTempo } from "@/components/site/LinhaDoTempo";
import { INSTITUTIONAL } from "@/lib/institutional";

export const metadata: Metadata = {
  title: "Quem somos",
  description:
    "Desde 2005, a Meu Lote Fácil transforma lotes irregulares em patrimônio com escritura.",
};

/** Conteúdo legado de /sobre, redesign editorial na etapa Quem somos. */
export default function QuemSomosPage() {
  return (
    <div className="bg-paper pt-6">
      <section className="bg-ink px-4 py-20 text-paper sm:px-6 lg:px-8">
        <div className="site-container max-w-3xl text-center">
          <Logo variant="full" tone="orange" className="mx-auto justify-center" />
          <h1 className="font-display mt-8 text-3xl sm:text-5xl">
            {INSTITUTIONAL.slogan}
          </h1>
          <p className="mt-2 text-brand-accent">{INSTITUTIONAL.sloganSecondary}</p>
        </div>
      </section>

      <section className="site-container max-w-3xl space-y-6 py-16">
        <p className="text-lg leading-relaxed text-muted-foreground">
          Desde 2005, a Meu Lote Fácil transforma lotes irregulares em patrimônio
          com escritura. Somos especialistas em regularização fundiária e serviços
          imobiliários, com sede em Campinas-SP.
        </p>
        <p className="leading-relaxed text-muted-foreground">
          Nosso trabalho é simplificar um processo que costuma ser longo e confuso:
          cada caso recebe uma solução técnica sob medida, conduzida por uma equipe
          multidisciplinar.
        </p>
        <p className="leading-relaxed text-muted-foreground">
          O resultado vai além do papel: segurança jurídica para as famílias,
          valorização do imóvel e bairros mais organizados.
        </p>

        <div className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="panel p-6">
            <h2 className="font-display text-xl text-ink">Missão</h2>
            <p className="mt-2 text-sm text-muted-foreground">{INSTITUTIONAL.missao}</p>
          </div>
          <div className="panel p-6">
            <h2 className="font-display text-xl text-ink">Valores</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ética, respeito e alto padrão profissional.
            </p>
          </div>
        </div>
      </section>

      <LinhaDoTempo />
    </div>
  );
}

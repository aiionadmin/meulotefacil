import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";
import { INSTITUTIONAL } from "@/lib/institutional";

export const metadata: Metadata = {
  title: "Quem somos",
  description:
    "Desde 2005, a Meu Lote Fácil transforma lotes irregulares em patrimônio com escritura.",
};

const timeline = [
  { year: "2005", text: "Fundação em Campinas-SP" },
  { year: "—", text: "Primeiros núcleos em Hortolândia" },
  { year: "2023", text: "Jardim Uruguai — 1.148 lotes" },
  { year: "2025", text: "Vila Paula" },
  { year: "2026", text: "Atuação em Amparo" },
];

export default function SobrePage() {
  return (
    <div className="bg-brand-cream pt-20">
      <section className="bg-brand-navy px-4 py-20 text-brand-cream sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Logo variant="full" className="mx-auto justify-center" />
          <h1 className="font-display mt-8 text-3xl sm:text-5xl">
            {INSTITUTIONAL.slogan}
          </h1>
          <p className="mt-2 text-brand-orange">{INSTITUTIONAL.sloganSecondary}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-6 px-4 py-16 sm:px-6 lg:px-8">
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
          <div className="rounded-2xl border border-brand-navy/8 bg-white p-6">
            <h2 className="font-display text-xl text-brand-navy">Missão</h2>
            <p className="mt-2 text-sm text-muted-foreground">{INSTITUTIONAL.missao}</p>
          </div>
          <div className="rounded-2xl border border-brand-navy/8 bg-white p-6">
            <h2 className="font-display text-xl text-brand-navy">Valores</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ética, respeito e alto padrão profissional.
            </p>
          </div>
        </div>

        <div className="pt-8">
          <h2 className="font-display text-2xl text-brand-navy">Linha do tempo</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Sugestão — confirmar datas e marcos com o cliente.
          </p>
          <ol className="mt-6 space-y-4 border-l-2 border-brand-orange/40 pl-6">
            {timeline.map((t) => (
              <li key={`${t.year}-${t.text}`}>
                <span className="font-display text-brand-orange">{t.year}</span>
                <p className="text-sm text-muted-foreground">{t.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <p className="pt-4 text-sm text-muted-foreground">
          Atuação: {INSTITUTIONAL.atuacao.join(", ")} (SP) — áreas urbanas e rurais.
        </p>
      </section>
    </div>
  );
}

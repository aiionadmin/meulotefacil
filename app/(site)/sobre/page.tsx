import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Conheça a Meu Lote Fácil — facilitar a compra do lote próprio com transparência e acolhimento.",
};

export default function SobrePage() {
  return (
    <div className="bg-brand-cream pt-20">
      <section className="bg-brand-navy px-4 py-20 text-brand-cream sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Logo variant="full" className="mx-auto justify-center" />
          <h1 className="font-display mt-8 text-3xl sm:text-5xl">
            Facilitar a conquista do seu lugar
          </h1>
          <p className="mt-4 text-brand-cream/75">
            A Meu Lote Fácil nasceu para tornar a compra de terrenos simples,
            transparente e acessível — com parcelamento justo e gente de verdade
            do outro lado.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-6 px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl text-brand-navy">Nossa missão</h2>
        <p className="leading-relaxed text-muted-foreground">
          Acreditamos que todo mundo merece um pedaço de chão para chamar de
          seu. Por isso unimos loteamentos bem planejados, condições claras e um
          processo digital que não deixa ninguém para trás.
        </p>
        <h2 className="font-display pt-4 text-2xl text-brand-navy">Como trabalhamos</h2>
        <p className="leading-relaxed text-muted-foreground">
          Do mapa de lotes à assinatura, acompanhamos cada etapa. Documentação
          em dia, simulação honesta e atendimento humano — do jeito fácil.
        </p>
      </section>
    </div>
  );
}

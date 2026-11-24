import type { Metadata } from "next";
import { ConsultaBairro } from "@/components/site/ConsultaBairro";

export const metadata: Metadata = {
  title: "Meu bairro está sendo regularizado?",
  description:
    "Consulte se o seu bairro ou núcleo está no portfólio de regularizações da Meu Lote Fácil.",
};

export default function ConsultaPage() {
  return (
    <div className="bg-brand-cream pt-16 sm:pt-20">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl text-brand-navy sm:text-5xl">
          Meu bairro está sendo regularizado?
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Busque pelo nome do núcleo ou cidade. Se não encontrar, fale conosco no
          WhatsApp.
        </p>
      </div>
      <div className="mx-auto max-w-2xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-brand-navy/8 bg-white p-6 shadow-sm sm:p-8">
          <ConsultaBairro embedded />
        </div>
      </div>
    </div>
  );
}

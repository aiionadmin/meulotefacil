import type { Metadata } from "next";
import { SimuladorWidget } from "@/components/site/SimuladorWidget";

export const metadata: Metadata = {
  title: "Simulador de parcelas",
  description:
    "Simule entrada e parcelas do seu lote. Ferramenta ilustrativa da Meu Lote Fácil.",
};

export default function SimuladorPage() {
  return (
    <div className="bg-brand-cream pt-16 sm:pt-20">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl text-brand-navy sm:text-5xl">
          Simulador de parcelas
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Ajuste valor, entrada e prazo. Os resultados são uma simulação
          educativa — sem valor de proposta.
        </p>
      </div>
      <div className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-brand-navy/8 bg-white p-6 shadow-sm sm:p-8">
          <SimuladorWidget embedded />
        </div>
      </div>
    </div>
  );
}

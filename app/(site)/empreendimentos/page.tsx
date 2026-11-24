import type { Metadata } from "next";
import { EmpreendimentosGrid } from "@/components/site/EmpreendimentosGrid";

export const metadata: Metadata = {
  title: "Empreendimentos",
  description:
    "Conheça os loteamentos da Meu Lote Fácil — lotes disponíveis com parcelas acessíveis.",
};

export default function EmpreendimentosPage() {
  return (
    <div className="pt-16 sm:pt-20">
      <EmpreendimentosGrid
        title="Todos os empreendimentos"
        subtitle="Filtre pelo lugar ideal e veja metragem, parcelas e disponibilidade."
      />
    </div>
  );
}

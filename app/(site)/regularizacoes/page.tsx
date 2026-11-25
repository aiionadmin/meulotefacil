import type { Metadata } from "next";
import { RegularizacoesGrid } from "@/components/site/RegularizacoesGrid";

export const metadata: Metadata = {
  title: "Regularizações",
  description:
    "Portfólio de núcleos regularizados e em andamento, Campinas, Hortolândia, Valinhos e Amparo.",
};

/**
 * Mantida por compatibilidade; next.config redireciona /regularizacoes → /regularizacao.
 */
export default function RegularizacoesPage() {
  return (
    <div className="pt-24">
      <RegularizacoesGrid
        title="Todas as regularizações"
        subtitle="10 núcleos concluídos ou em registro e 17 em andamento, em 4 cidades."
      />
    </div>
  );
}

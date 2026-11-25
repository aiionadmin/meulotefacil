import {
  nucleosConcluidosOuRegistro,
  type Nucleo,
} from "@/lib/data/nucleos";
import { publicFileExists } from "@/lib/public-file";
import { RegularizacaoShowcaseClient } from "@/components/site/RegularizacaoShowcaseClient";

/** Portfólio editorial — resolve CRF no server e anima no client (padrão 21st). */
export function RegularizacaoShowcase() {
  const list = nucleosConcluidosOuRegistro();
  const crfAvailable = Object.fromEntries(
    list.map((n) => [n.id, Boolean(n.crfPdf && publicFileExists(n.crfPdf))])
  ) as Record<string, boolean>;

  const byCity = new Map<string, Nucleo[]>();
  for (const n of list) {
    const arr = byCity.get(n.cidade) ?? [];
    arr.push(n);
    byCity.set(n.cidade, arr);
  }

  return (
    <RegularizacaoShowcaseClient
      byCity={[...byCity.entries()]}
      crfAvailable={crfAvailable}
    />
  );
}

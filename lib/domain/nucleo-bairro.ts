import { nucleos, type Nucleo } from "@/lib/data/nucleos";
import type { Development } from "@/lib/domain/carteira-types";

/** Nome canônico do bairro/núcleo. */
export function nucleoBairroNome(n: Nucleo): string {
  return (n.bairro || n.nome).trim();
}

export function findNucleoById(id: string | undefined | null): Nucleo | undefined {
  if (!id) return undefined;
  return nucleos.find((n) => n.id === id);
}

export function findNucleoByBairro(
  bairro: string | undefined | null,
  cidade?: string
): Nucleo | undefined {
  if (!bairro) return undefined;
  const t = bairro.trim().toLowerCase();
  return nucleos.find((n) => {
    const nome = nucleoBairroNome(n).toLowerCase();
    if (nome !== t && !nome.includes(t) && !t.includes(nome)) return false;
    if (cidade && n.cidade.toLowerCase() !== cidade.trim().toLowerCase()) {
      return false;
    }
    return true;
  });
}

/** Empreendimentos ligados a um núcleo (por id ou nome de bairro). */
export function developmentsForNucleo(
  developments: Development[],
  nucleo: Nucleo
): Development[] {
  const bairro = nucleoBairroNome(nucleo).toLowerCase();
  return developments.filter((d) => {
    if (d.nucleoId && d.nucleoId === nucleo.id) return true;
    if (d.bairro && d.bairro.trim().toLowerCase() === bairro) return true;
    // fallback: nome do emp contém o bairro (dados legados)
    if (d.nome.toLowerCase().includes(bairro)) return true;
    return false;
  });
}

export function labelNucleoEmp(d: Development): string {
  if (d.bairro) return d.bairro;
  const n = findNucleoById(d.nucleoId);
  if (n) return nucleoBairroNome(n);
  return "—";
}

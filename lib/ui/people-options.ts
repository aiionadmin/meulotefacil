import type { Person, PersonPapel } from "@/lib/domain/fase1-types";

/** Options for SearchSelect from cadastro de pessoas (por papel). */
export function peopleOptions(
  people: Person[],
  papeis: PersonPapel | PersonPapel[]
): { value: string; label: string; meta?: string }[] {
  const wanted = Array.isArray(papeis) ? papeis : [papeis];
  return people
    .filter(
      (p) =>
        p.status === "ativo" &&
        wanted.some((papel) => p.papeis.includes(papel))
    )
    .map((p) => ({
      value: p.nome,
      label: p.nome,
      meta: p.papeis.filter((x) => wanted.includes(x)).join(", "),
    }));
}

/** Options keyed by person id (label = nome). */
export function peopleIdOptions(
  people: Person[],
  papeis: PersonPapel | PersonPapel[]
): { value: string; label: string; meta?: string }[] {
  const wanted = Array.isArray(papeis) ? papeis : [papeis];
  return people
    .filter(
      (p) =>
        p.status === "ativo" &&
        wanted.some((papel) => p.papeis.includes(papel))
    )
    .map((p) => ({
      value: p.id,
      label: p.nome,
      meta: p.documento || p.papeis.join(", "),
    }));
}

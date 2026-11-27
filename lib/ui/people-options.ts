import type {
  AppUser,
  Person,
  PersonPapel,
} from "@/lib/domain/fase1-types";

export type SelectOption = { value: string; label: string; meta?: string };

/** Options for SearchSelect from cadastro de pessoas (por papel). */
export function peopleOptions(
  people: Person[],
  papeis: PersonPapel | PersonPapel[]
): SelectOption[] {
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
): SelectOption[] {
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

/** Usuários ativos (nome como value). */
export function userOptions(users: AppUser[]): SelectOption[] {
  return users
    .filter((u) => u.status === "ativo")
    .map((u) => ({ value: u.nome, label: u.nome, meta: u.email }));
}

/** Responsáveis: profissionais + usuários, sem duplicar nome. */
export function responsavelOptions(
  people: Person[],
  users: AppUser[]
): SelectOption[] {
  const seen = new Set<string>();
  const out: SelectOption[] = [];
  for (const o of [
    ...peopleOptions(people, "profissional"),
    ...userOptions(users),
  ]) {
    if (seen.has(o.value)) continue;
    seen.add(o.value);
    out.push(o);
  }
  return out;
}

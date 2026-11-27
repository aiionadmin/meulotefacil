"use client";

import { fieldControlClass } from "@/components/app/ModuleToolkit";
import type { Development } from "@/lib/domain/carteira-types";

export type GeoEmpFilterValues = {
  cidade: string;
  bairro: string;
  developmentId: string;
};

export const EMPTY_GEO_EMP: GeoEmpFilterValues = {
  cidade: "todas",
  bairro: "todos",
  developmentId: "todos",
};

export function collectCidades(developments: Development[]): string[] {
  return [
    ...new Set(
      developments.map((d) => d.cidade.trim()).filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function collectBairros(
  developments: Development[],
  cidade: string
): string[] {
  const list =
    cidade === "todas"
      ? developments
      : developments.filter((d) => d.cidade === cidade);
  return [
    ...new Set(
      list
        .map((d) => (d.bairro || "").trim())
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function filterDevelopmentsByGeo(
  developments: Development[],
  f: GeoEmpFilterValues
): Development[] {
  return developments.filter((d) => {
    if (f.cidade !== "todas" && d.cidade !== f.cidade) return false;
    if (f.bairro !== "todos" && (d.bairro || "") !== f.bairro) return false;
    if (f.developmentId !== "todos" && d.id !== f.developmentId) return false;
    return true;
  });
}

export function developmentIdsMatching(
  developments: Development[],
  f: GeoEmpFilterValues
): Set<string> | null {
  if (
    f.cidade === "todas" &&
    f.bairro === "todos" &&
    f.developmentId === "todos"
  ) {
    return null;
  }
  return new Set(filterDevelopmentsByGeo(developments, f).map((d) => d.id));
}

/** Filtros padrão: cidade · bairro/núcleo · empreendimento. */
export function GeoEmpFilters({
  developments,
  value,
  onChange,
  className,
}: {
  developments: Development[];
  value: GeoEmpFilterValues;
  onChange: (next: GeoEmpFilterValues) => void;
  className?: string;
}) {
  const cidades = collectCidades(developments);
  const bairros = collectBairros(developments, value.cidade);
  const emps =
    value.cidade === "todas" && value.bairro === "todos"
      ? developments
      : filterDevelopmentsByGeo(developments, {
          ...value,
          developmentId: "todos",
        });

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      <select
        className={fieldControlClass + " max-w-[160px]"}
        value={value.cidade}
        aria-label="Filtrar cidade"
        onChange={(e) =>
          onChange({
            ...value,
            cidade: e.target.value,
            bairro: "todos",
            developmentId: "todos",
          })
        }
      >
        <option value="todas">Todas cidades</option>
        {cidades.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        className={fieldControlClass + " max-w-[180px]"}
        value={value.bairro}
        aria-label="Filtrar bairro/núcleo"
        onChange={(e) =>
          onChange({
            ...value,
            bairro: e.target.value,
            developmentId: "todos",
          })
        }
      >
        <option value="todos">Todos bairros/núcleos</option>
        {bairros.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
      <select
        className={fieldControlClass + " max-w-[220px]"}
        value={value.developmentId}
        aria-label="Filtrar empreendimento"
        onChange={(e) =>
          onChange({ ...value, developmentId: e.target.value })
        }
      >
        <option value="todos">Todos empreendimentos</option>
        {emps.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nome}
          </option>
        ))}
      </select>
    </div>
  );
}

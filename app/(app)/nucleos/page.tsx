"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { nucleos, statusNucleoLabel, lotesLabel } from "@/lib/data/nucleos";
import {
  developmentsForNucleo,
  nucleoBairroNome,
} from "@/lib/domain/nucleo-bairro";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NucleosMap } from "@/components/site/NucleosMap";
import { ModuleHeader, ModuleSection } from "@/components/app/ModulePage";
import { fieldControlClass } from "@/components/app/ModuleToolkit";
import { useCarteira } from "@/lib/store/carteira-store";

export default function NucleosPage() {
  const { state } = useCarteira();
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState(nucleos[0]?.id ?? "");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return nucleos;
    return nucleos.filter((n) =>
      [nucleoBairroNome(n), n.cidade, n.modalidade, n.nome]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [q]);

  const selected = nucleos.find((n) => n.id === selectedId) ?? filtered[0];
  const emps = selected
    ? developmentsForNucleo(state.developments, selected)
    : [];

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Núcleos (bairros)"
        description="No sistema, núcleo = bairro. Empreendimentos (loteamento) e REURB (bairro + morador) se vinculam ao mesmo cadastro."
      />

      <NucleosMap />

      <div className="flex flex-wrap items-center gap-2">
        <input
          className={fieldControlClass + " max-w-sm"}
          placeholder="Filtrar bairro / núcleo…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <ButtonLinkEmps />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os núcleos / bairros</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-3 py-2">Bairro (núcleo)</th>
                <th className="px-3 py-2">Cidade</th>
                <th className="px-3 py-2">Modalidade</th>
                <th className="px-3 py-2">Tamanho</th>
                <th className="px-3 py-2">Emps</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => {
                const count = developmentsForNucleo(state.developments, n)
                  .length;
                return (
                  <tr
                    key={n.id}
                    className={`border-b border-border/60 ${
                      selectedId === n.id ? "bg-brand-orange/5" : ""
                    }`}
                  >
                    <td className="px-3 py-3 font-medium">
                      <button
                        type="button"
                        className="text-left hover:text-brand-orange"
                        onClick={() => setSelectedId(n.id)}
                      >
                        {nucleoBairroNome(n)}
                      </button>
                      <div className="text-xs text-muted-foreground">
                        <Link
                          href={`/regularizacoes/${n.slug}`}
                          className="underline"
                        >
                          REURB / site
                        </Link>
                      </div>
                    </td>
                    <td className="px-3 py-3">{n.cidade}</td>
                    <td className="px-3 py-3">{n.modalidade}</td>
                    <td className="px-3 py-3">{lotesLabel(n)}</td>
                    <td className="px-3 py-3">{count}</td>
                    <td className="px-3 py-3">
                      <Badge
                        variant={
                          n.status === "concluido"
                            ? "success"
                            : n.status === "em_registro"
                              ? "warning"
                              : "default"
                        }
                      >
                        {statusNucleoLabel[n.status]}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {selected ? (
        <ModuleSection
          title={`Empreendimentos · ${nucleoBairroNome(selected)}`}
        >
          <p className="mb-3 text-sm text-muted-foreground">
            Loteamento: empreendimentos neste bairro. REURB: mesmo bairro +
            morador nos processos/leads.
          </p>
          {emps.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum empreendimento vinculado. Cadastre em{" "}
              <Link className="underline" href="/empreendimentos">
                Empreendimentos
              </Link>{" "}
              informando o bairro/núcleo.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {emps.map((d) => (
                <li
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-linha px-3 py-2"
                >
                  <span>
                    <span className="font-medium">{d.nome}</span>
                    <span className="ml-2 text-muted-foreground">
                      {d.codigo} · {d.modalidade.replace(/_/g, " ")} ·{" "}
                      {d.cidade}/{d.uf}
                    </span>
                  </span>
                  <Link
                    className="underline"
                    href={`/empreendimentos?emp=${encodeURIComponent(d.id)}`}
                  >
                    Abrir cadastro
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Processos REURB:{" "}
            <Link className="underline" href="/processos">
              /processos
            </Link>{" "}
            · Leads/moradores:{" "}
            <Link className="underline" href="/leads">
              /leads
            </Link>
          </p>
        </ModuleSection>
      ) : null}
    </div>
  );
}

function ButtonLinkEmps() {
  return (
    <Link
      href="/empreendimentos"
      className="text-sm underline text-muted-foreground hover:text-ink"
    >
      Ir para empreendimentos
    </Link>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  searchNucleos,
  statusNucleoLabel,
  lotesLabel,
} from "@/lib/data/nucleos";
import { SectionHeading } from "@/components/site/SectionHeading";
import { whatsappUrl } from "@/lib/institutional";

export function ConsultaBairro({ embedded = false }: { embedded?: boolean }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => searchNucleos(q), [q]);
  const wa = whatsappUrl(
    q
      ? `Olá! Vim do site e gostaria de saber se o bairro "${q}" está sendo regularizado.`
      : undefined
  );

  const body = (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/55" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Digite o nome do bairro, núcleo ou cidade…"
          className="h-12 pl-10"
          aria-label="Buscar bairro ou núcleo"
        />
      </div>

      {q.trim() && results.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center">
          <p className="font-medium text-brand-navy dark:text-brand-cream">
            Não encontramos esse bairro na lista pública.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Fale conosco, podemos verificar se há processo em curso ou orientar o início.
          </p>
          <Button asChild className="mt-4">
            <a href={wa} target="_blank" rel="noopener noreferrer">
              Consultar no WhatsApp
            </a>
          </Button>
        </div>
      )}

      {results.length > 0 && (
        <ul className="space-y-3">
          {results.map((n) => (
            <li
              key={n.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-4 dark:bg-brand-navy"
            >
              <div>
                <p className="font-semibold text-brand-navy dark:text-brand-cream">
                  {n.nome}
                </p>
                <p className="text-sm text-muted-foreground">
                  {n.cidade}, {n.modalidade}, {lotesLabel(n)}
                </p>
                {n.faseLabel && (
                  <p className="mt-1 text-xs text-muted-foreground">{n.faseLabel}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
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
                <Button asChild size="sm" variant="outline">
                  <Link href={`/regularizacoes/${n.slug}`}>Detalhes</Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  if (embedded) return body;

  return (
    <section className="border-b border-linha bg-brand-cream py-20 lg:py-28">
      <div className="site-container">
        <SectionHeading
          number="05"
          eyebrow="Consulta"
          title="Meu bairro está sendo regularizado?"
          subtitle="Busque pelo nome do núcleo ou cidade e veja o status do processo."
        />
        <div className="mx-auto mt-12 max-w-2xl border border-linha bg-card p-6 sm:p-8">
          {body}
        </div>
      </div>
    </section>
  );
}

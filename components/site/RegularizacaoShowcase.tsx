import Link from "next/link";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";
import {
  nucleosConcluidosOuRegistro,
  statusNucleoLabel,
  nucleoExtensaoLabel,
  type Nucleo,
  type StatusNucleo,
} from "@/lib/data/nucleos";
import { publicFileExists } from "@/lib/public-file";

const badgeVariant: Record<StatusNucleo, "default" | "warning" | "success"> = {
  concluido: "success",
  em_registro: "warning",
  em_andamento: "default",
};

function NucleoFicha({ n }: { n: Nucleo }) {
  return (
    <article
      id={n.slug}
      className="scroll-mt-24 border-b border-linha py-10 last:border-b-0"
    >
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={badgeVariant[n.status]}>
          {statusNucleoLabel[n.status]}
        </Badge>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {n.cidade} — {n.estado}
        </span>
      </div>
      <h3 className="font-display mt-3 text-2xl text-brand-navy sm:text-3xl">
        <Link
          href={`/regularizacoes/${n.slug}`}
          className="hover:text-latossolo"
        >
          Núcleo Residencial {n.nome}
        </Link>
      </h3>
      <dl className="mt-4 grid gap-2 text-sm text-ink/80 sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Classificação</dt>
          <dd className="font-medium text-ink">{n.modalidade}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Modalidade</dt>
          <dd className="font-medium text-ink">{n.tipo}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Extensão</dt>
          <dd className="font-medium text-ink">{nucleoExtensaoLabel(n)}</dd>
        </div>
      </dl>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink/80">
        {n.resumo ??
          `${n.modalidade} · ${n.tipo} · ${nucleoExtensaoLabel(n)}${
            n.faseLabel ? `. ${n.faseLabel}.` : "."
          }`}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={`/regularizacoes/${n.slug}`}>Ver detalhes</Link>
        </Button>
        {n.crfPdf && publicFileExists(n.crfPdf) ? (
          <Button asChild size="sm" variant="ghost">
            <a href={n.crfPdf} target="_blank" rel="noopener noreferrer">
              <FileText className="h-4 w-4" />
              Baixar CRF
            </a>
          </Button>
        ) : null}
      </div>
    </article>
  );
}

/** Fichas detalhadas no estilo do portfólio de referência (Campinas e demais). */
export function RegularizacaoShowcase() {
  const list = nucleosConcluidosOuRegistro();
  const byCity = new Map<string, Nucleo[]>();
  for (const n of list) {
    const arr = byCity.get(n.cidade) ?? [];
    arr.push(n);
    byCity.set(n.cidade, arr);
  }

  return (
    <section id="nucleos" className="scroll-mt-24 border-b border-linha bg-paper py-20 lg:py-28">
      <div className="site-container">
        <SectionHeading
          number="03"
          eyebrow="Portfólio"
          title="Regularizações concluídas e em registro"
          subtitle="Informações oficiais de CRF, Diário Oficial e matrícula — o mesmo nível de detalhe do portfólio institucional."
        />
        <div className="mt-12 space-y-14">
          {[...byCity.entries()].map(([cidade, items]) => (
            <div key={cidade}>
              <h3 className="font-display text-lg text-brand-navy">
                ({cidade} — SP)
              </h3>
              <div className="mt-2 border-t border-linha">
                {items.map((n) => (
                  <NucleoFicha key={n.id} n={n} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

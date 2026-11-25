import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  nucleos,
  getNucleoBySlug,
  statusNucleoLabel,
  lotesLabel,
  faseLabel,
} from "@/lib/data/nucleos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/institutional";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return nucleos.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const n = getNucleoBySlug(slug);
  if (!n) return { title: "Núcleo" };
  return {
    title: n.nome,
    description: `${n.nome}, ${n.cidade}, ${n.modalidade}, ${lotesLabel(n)}`,
  };
}

export default async function NucleoPage({ params }: Props) {
  const { slug } = await params;
  const n = getNucleoBySlug(slug);
  if (!n) notFound();

  const wa = whatsappUrl(
    `Olá! Vim do site e gostaria de mais informações sobre ${n.nome} (${n.cidade}).`
  );

  return (
    <div className="bg-paper pt-24">
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-brand-navy">
          <Image
            src={n.imagem}
            alt={n.nome}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 sm:p-10">
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
            <h1 className="font-display mt-3 text-3xl text-brand-cream sm:text-5xl">
              {n.nome}
            </h1>
            <p className="mt-2 text-brand-cream/75">
              {n.cidade}/{n.estado}, {n.modalidade}, {n.tipo}, {lotesLabel(n)}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-6 lg:col-span-2">
          <h2 className="font-display text-2xl text-brand-navy">Sobre o núcleo</h2>
          <p className="leading-relaxed text-muted-foreground">
            Regularização fundiária {n.modalidade} em {n.cidade}, tipo {n.tipo.toLowerCase()},
            com {lotesLabel(n)}.
            {n.faseLabel ? ` Situação: ${n.faseLabel}.` : ""}
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Status" value={statusNucleoLabel[n.status]} />
            <Stat label="Modalidade" value={n.modalidade} />
            <Stat
              label="Fase"
              value={n.fase ? faseLabel[n.fase] : "n/d"}
            />
          </div>
          {n.aprovacao && (
            <p className="text-sm text-muted-foreground">
              <strong className="text-brand-navy">Aprovação:</strong> {n.aprovacao}
            </p>
          )}
        </div>
        <aside className="h-fit rounded-2xl border border-brand-navy/10 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-brand-navy">Quer saber mais?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Fale com a equipe ou veja o portfólio completo de regularizações.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button asChild>
              <a href={wa} target="_blank" rel="noopener noreferrer">
                Falar no WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/regularizacao">Ver regularizações</Link>
            </Button>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-brand-navy/8 bg-white p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold text-brand-navy">{value}</p>
    </div>
  );
}

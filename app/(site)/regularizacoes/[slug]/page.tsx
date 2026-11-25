import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import {
  nucleos,
  getNucleoBySlug,
  statusNucleoLabel,
  lotesLabel,
  faseLabel,
  nucleoExtensaoLabel,
} from "@/lib/data/nucleos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/institutional";
import { publicFileExists } from "@/lib/public-file";

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
      <section className="site-container">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/regularizacao" className="hover:text-brand-navy">
            Regularização
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{n.nome}</span>
        </nav>

        <div className="relative aspect-[21/9] overflow-hidden rounded-sm bg-brand-navy">
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
              Núcleo Residencial {n.nome}
            </h1>
            <p className="mt-2 text-brand-cream/80">
              {n.cidade}/{n.estado} · {n.modalidade} · {n.tipo} ·{" "}
              {nucleoExtensaoLabel(n)}
            </p>
          </div>
        </div>
      </section>

      <section className="site-container grid gap-10 py-16 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div>
            <h2 className="font-display text-2xl text-brand-navy">
              Sobre o núcleo
            </h2>
            <p className="mt-4 leading-relaxed text-ink/80">
              {n.resumo ??
                `Regularização fundiária ${n.modalidade} em ${n.cidade}, tipo ${n.tipo.toLowerCase()}, com ${lotesLabel(n)}.${
                  n.faseLabel ? ` Situação: ${n.faseLabel}.` : ""
                }`}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Stat label="Status" value={statusNucleoLabel[n.status]} />
            <Stat label="Classificação" value={n.modalidade} />
            <Stat label="Modalidade" value={n.tipo} />
            <Stat label="Extensão" value={nucleoExtensaoLabel(n)} />
            {n.fase ? <Stat label="Fase" value={faseLabel[n.fase]} /> : null}
            {n.aprovacao ? <Stat label="CRF" value={n.aprovacao} /> : null}
            {n.diarioOficial ? (
              <Stat label="Diário Oficial" value={n.diarioOficial} />
            ) : null}
            {n.matricula ? (
              <Stat label="Matrícula" value={n.matricula} />
            ) : null}
          </div>

          {n.videos && n.videos.length > 0 ? (
            <div>
              <h3 className="font-display text-lg text-brand-navy">Vídeos</h3>
              <ul className="mt-3 space-y-2">
                {n.videos.map((v) => (
                  <li key={v.href}>
                    <a
                      href={v.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-latossolo hover:underline"
                    >
                      {v.label} →
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <aside className="h-fit space-y-4 border border-linha bg-card p-6">
          <h3 className="font-bold text-brand-navy">Documentos e contato</h3>
          <p className="text-sm text-muted-foreground">
            Baixe a CRF quando disponível ou fale com a equipe sobre este núcleo.
          </p>
          <div className="flex flex-col gap-3">
            {n.crfPdf && publicFileExists(n.crfPdf) ? (
              <Button asChild>
                <a href={n.crfPdf} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4" />
                  Baixar CRF (PDF)
                </a>
              </Button>
            ) : null}
            <Button
              asChild
              variant={
                n.crfPdf && publicFileExists(n.crfPdf) ? "outline" : "default"
              }
            >
              <a href={wa} target="_blank" rel="noopener noreferrer">
                Falar no WhatsApp
              </a>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/regularizacao#nucleos">Voltar ao portfólio</Link>
            </Button>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-linha bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-brand-navy">{value}</p>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  empreendimentos,
  getEmpreendimentoBySlug,
} from "@/lib/data/empreendimentos";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoteMap } from "@/components/site/LoteMap";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return empreendimentos.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const emp = getEmpreendimentoBySlug(slug);
  if (!emp) return { title: "Empreendimento" };
  return {
    title: emp.nome,
    description: emp.descricao,
    openGraph: { images: [emp.imagem] },
  };
}

export default async function EmpreendimentoPage({ params }: Props) {
  const { slug } = await params;
  const emp = getEmpreendimentoBySlug(slug);
  if (!emp) notFound();

  const statusLabel = {
    lancamento: "Lançamento",
    ultimas_unidades: "Últimas unidades",
    esgotado: "Esgotado",
  } as const;

  return (
    <div className="bg-brand-cream pt-20">
      <section className="relative">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-brand-navy">
            <Image
              src={emp.imagem}
              alt={emp.nome}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 sm:p-10">
              <Badge>{statusLabel[emp.status]}</Badge>
              <h1 className="font-display mt-3 text-3xl text-brand-cream sm:text-5xl">
                {emp.nome}
              </h1>
              <p className="mt-2 text-brand-cream/75">
                {emp.cidade}/{emp.estado} · a partir de {emp.metragemDesde} m² ·
                parcelas desde {formatCurrency(emp.parcelaDesde)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-display text-2xl text-brand-navy">Sobre o loteamento</h2>
          <p className="leading-relaxed text-muted-foreground">{emp.descricao}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Total de lotes" value={String(emp.totalLotes)} />
            <Stat label="Disponíveis" value={String(emp.lotesDisponiveis)} />
            <Stat label="Parcela desde" value={formatCurrency(emp.parcelaDesde)} />
          </div>
          <div className="pt-6">
            <h3 className="mb-4 text-lg font-bold text-brand-navy">Mapa de lotes</h3>
            <LoteMap mode="site" />
          </div>
        </div>
        <aside className="h-fit rounded-2xl border border-brand-navy/10 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-brand-navy">Interessado?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Simule as parcelas ou fale com um consultor agora.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button asChild>
              <Link href="/simulador">Simular parcelas</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contato">Falar com consultor</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/auth/cadastro">Criar conta</Link>
            </Button>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 border border-brand-navy/8">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold text-brand-navy tabular-nums">{value}</p>
    </div>
  );
}

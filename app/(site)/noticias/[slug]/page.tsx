import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  noticias,
  getNoticiaBySlug,
  formatNoticiaDate,
  noticiaCategoriaLabel,
  noticiasOrdenadas,
} from "@/lib/data/noticias";
import { whatsappUrl } from "@/lib/institutional";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return noticias.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const n = getNoticiaBySlug(slug);
  if (!n) return { title: "Notícia" };
  return {
    title: n.title,
    description: n.excerpt,
  };
}

export default async function NoticiaPage({ params }: Props) {
  const { slug } = await params;
  const n = getNoticiaBySlug(slug);
  if (!n) notFound();

  const related = noticiasOrdenadas()
    .filter((x) => x.id !== n.id && x.categoria === n.categoria)
    .slice(0, 3);

  const wa = whatsappUrl(
    `Olá! Li a notícia "${n.title}" no site e gostaria de mais informações.`
  );

  return (
    <div className="bg-paper pt-24">
      <article className="site-container max-w-3xl pb-16 lg:pb-24">
        <nav className="mb-8 text-sm text-muted-foreground">
          <Link href="/noticias" className="hover:text-ink">
            Notícias
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{noticiaCategoriaLabel[n.categoria]}</span>
        </nav>

        <header>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono-label rounded-sm border border-ink/12 bg-paper-muted/60 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-ink/70">
              {noticiaCategoriaLabel[n.categoria]}
            </span>
            <time
              dateTime={n.date}
              className="font-mono-label text-[11px] tabular-nums text-muted-foreground"
            >
              {formatNoticiaDate(n.date)}
            </time>
          </div>
          <h1 className="font-display mt-4 text-3xl leading-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            {n.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {n.excerpt}
          </p>
        </header>

        <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-sm border border-ink/10 bg-paper-muted">
          <Image
            src={n.imagem}
            alt={n.title}
            fill
            priority
            unoptimized={n.imagem.startsWith("http")}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
        {n.imageCredit ? (
          <p className="mt-2 font-mono-label text-[11px] text-muted-foreground">
            Foto: {n.imageCredit}
          </p>
        ) : null}

        <div className="mt-10 space-y-5 text-base leading-relaxed text-ink/85 sm:text-[1.05rem]">
          {n.body.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
        </div>

        <aside className="mt-10 rounded-sm border border-ink/10 bg-paper-muted/60 p-5 text-sm leading-relaxed text-muted-foreground">
          <p>
            Fonte:{" "}
            <a
              href={n.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-latossolo underline-offset-4 hover:underline"
            >
              {n.sourceName}
            </a>
            . Resumo editorial com base na matéria original — leia o texto
            completo no link.
          </p>
        </aside>

        <div className="mt-12 flex flex-wrap gap-3 border-t border-ink/10 pt-8">
          <a
            href={n.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-sm bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-latossolo hover:text-ink"
          >
            Ler na fonte original
          </a>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-sm border border-ink/20 px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-ink/40"
          >
            Falar com a equipe
          </a>
          <Link
            href="/noticias"
            className="inline-flex items-center justify-center rounded-sm border border-ink/20 px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-ink/40"
          >
            Voltar às notícias
          </Link>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="border-t border-ink/10 bg-paper-muted py-16 lg:py-20">
          <div className="site-container">
            <h2 className="font-display text-2xl text-ink">
              Mais em {noticiaCategoriaLabel[n.categoria]}
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/noticias/${r.slug}`}
                    className="group block rounded-sm border border-ink/10 bg-card p-5 transition-colors hover:border-ink/22"
                  >
                    <time
                      dateTime={r.date}
                      className="font-mono-label text-[11px] text-muted-foreground"
                    >
                      {formatNoticiaDate(r.date)}
                    </time>
                    <p className="font-display mt-2 text-lg text-ink transition-colors group-hover:text-latossolo">
                      {r.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}

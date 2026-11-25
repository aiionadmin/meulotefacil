"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  noticiasOrdenadas,
  noticiaCategoriaLabel,
  formatNoticiaDate,
  type Noticia,
  type NoticiaCategoria,
} from "@/lib/data/noticias";
import { cn } from "@/lib/utils";

type Filter = NoticiaCategoria | "todas";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "ramo", label: "Ramo" },
  { id: "campinas", label: "Campinas" },
  { id: "geral", label: "Geral" },
];

function NoticiaCard({
  n,
  featured = false,
}: {
  n: Noticia;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/noticias/${n.slug}`}
      className={cn(
        "group relative flex overflow-hidden rounded-sm border border-ink/10 bg-card transition-colors duration-300 hover:border-ink/22",
        featured
          ? "flex-col md:col-span-2 md:grid md:grid-cols-[1.15fr_1fr]"
          : "flex-col"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          featured ? "aspect-[16/10] md:aspect-auto md:min-h-[320px]" : "aspect-[16/10]"
        )}
      >
        <Image
          src={n.imagem}
          alt=""
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          sizes={
            featured
              ? "(max-width: 768px) 100vw, 60vw"
              : "(max-width: 768px) 100vw, 33vw"
          }
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 font-mono-label rounded-sm bg-paper/95 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-ink">
          {noticiaCategoriaLabel[n.categoria]}
        </span>
      </div>
      <div
        className={cn(
          "flex flex-1 flex-col p-5 sm:p-6",
          featured && "md:justify-center md:p-8 lg:p-10"
        )}
      >
        <time
          dateTime={n.date}
          className="font-mono-label text-[11px] tabular-nums text-muted-foreground"
        >
          {formatNoticiaDate(n.date)}
        </time>
        <h2
          className={cn(
            "font-display mt-2 text-ink transition-colors group-hover:text-latossolo",
            featured ? "text-2xl sm:text-3xl lg:text-[2rem]" : "text-xl sm:text-2xl"
          )}
        >
          {n.title}
        </h2>
        <p
          className={cn(
            "mt-3 text-sm leading-relaxed text-muted-foreground",
            featured ? "max-w-md sm:text-[0.95rem]" : "line-clamp-3"
          )}
        >
          {n.excerpt}
        </p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-ink/70 transition-colors group-hover:text-ink">
          Ler notícia
          <ArrowUpRight className="size-4 opacity-60" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export function NoticiasList() {
  const [filter, setFilter] = useState<Filter>("todas");
  const list = useMemo(() => noticiasOrdenadas(filter), [filter]);
  const [featured, ...rest] = list;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Filtrar notícias por categoria"
        className="flex flex-wrap gap-2"
      >
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-sm border px-3.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/15 bg-paper text-ink/70 hover:border-ink/30 hover:text-ink"
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 font-mono-label text-[11px] text-muted-foreground">
        {list.length} {list.length === 1 ? "publicação" : "publicações"}
      </p>

      {featured ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          <NoticiaCard n={featured} featured />
          {rest.map((n) => (
            <NoticiaCard key={n.id} n={n} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-sm text-muted-foreground">
          Nenhuma notícia nesta categoria.
        </p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildMapsQuery,
  googleMapsEmbedUrl,
  googleMapsSearchUrl,
  type MapsLocationInput,
  resolveGoogleMapsApiKey,
} from "@/lib/maps/google-maps";
import { cn } from "@/lib/utils";

type Props = {
  location: MapsLocationInput;
  className?: string;
  /** Altura do quadro do mapa. */
  heightClassName?: string;
  title?: string;
};

/**
 * Mapa do empreendimento: iframe Embed se houver chave; senão placeholder + link.
 */
export function EmpreendimentoMap({
  location,
  className,
  heightClassName = "h-56",
  title = "Localização no Google Maps",
}: Props) {
  const query = useMemo(() => buildMapsQuery(location), [location]);
  const searchUrl = useMemo(() => googleMapsSearchUrl(query), [query]);
  const clientKey = useMemo(() => resolveGoogleMapsApiKey(), []);

  const [embedUrl, setEmbedUrl] = useState<string | null>(() => {
    if (clientKey && query) return googleMapsEmbedUrl(query, clientKey);
    return null;
  });
  const [loading, setLoading] = useState(!clientKey && Boolean(query));

  useEffect(() => {
    if (!query) {
      setEmbedUrl(null);
      setLoading(false);
      return;
    }
    if (clientKey) {
      setEmbedUrl(googleMapsEmbedUrl(query, clientKey));
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ q: query });
    fetch(`/api/maps/embed-url?${params.toString()}`)
      .then((r) => r.json())
      .then((data: { embedUrl?: string | null }) => {
        if (!cancelled) setEmbedUrl(data.embedUrl ?? null);
      })
      .catch(() => {
        if (!cancelled) setEmbedUrl(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clientKey, query]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <Button size="sm" variant="outline" asChild disabled={!query}>
          <a href={searchUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            Abrir no Google Maps
          </a>
        </Button>
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-lg border border-linha bg-muted/40",
          heightClassName
        )}
      >
        {embedUrl ? (
          <iframe
            title={title}
            src={embedUrl}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(ellipse_at_30%_20%,#e8efe6,transparent_55%),radial-gradient(ellipse_at_70%_80%,#f3e6d4,transparent_50%),linear-gradient(160deg,#f7f5f0,#eef2ee)] p-4 text-center">
            <MapPin className="h-8 w-8 text-brand-orange" aria-hidden />
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando mapa…</p>
            ) : query ? (
              <>
                <p className="max-w-sm text-sm text-ink/80">{query}</p>
                <p className="text-xs text-muted-foreground">
                  Mapa embutido disponível quando a chave da API estiver no
                  ambiente. Use o link para abrir no Google Maps.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Informe bairro, cidade ou endereço para ver no mapa.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

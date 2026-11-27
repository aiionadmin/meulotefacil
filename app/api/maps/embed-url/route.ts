import { NextResponse } from "next/server";
import {
  buildMapsQuery,
  resolveGoogleMapsApiKey,
  resolveMapsEmbedUrl,
} from "@/lib/maps/google-maps";

/**
 * Devolve URL de embed do Google Maps para a query.
 * Com `GOOGLE_MAPS_API_KEY` / `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Embed API.
 * Sem chave: embed clássico dinâmico (ainda mostra o mapa).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query =
    searchParams.get("q")?.trim() ||
    buildMapsQuery({
      nome: searchParams.get("nome") ?? undefined,
      endereco: searchParams.get("endereco") ?? undefined,
      bairro: searchParams.get("bairro") ?? undefined,
      cidade: searchParams.get("cidade") ?? undefined,
      uf: searchParams.get("uf") ?? undefined,
      cep: searchParams.get("cep") ?? undefined,
      latitude: searchParams.get("lat") ?? undefined,
      longitude: searchParams.get("lng") ?? undefined,
    });

  const apiKey = resolveGoogleMapsApiKey();
  const embedUrl = resolveMapsEmbedUrl(query, apiKey);

  return NextResponse.json({
    embedUrl,
    hasKey: Boolean(apiKey),
    query: query || null,
  });
}

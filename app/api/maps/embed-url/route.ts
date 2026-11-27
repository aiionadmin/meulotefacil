import { NextResponse } from "next/server";
import {
  buildMapsQuery,
  googleMapsEmbedUrl,
  resolveGoogleMapsApiKey,
} from "@/lib/maps/google-maps";

/**
 * Devolve URL de embed do Google Maps quando há chave no env
 * (`GOOGLE_MAPS_API_KEY` ou `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`).
 * Sem chave: `{ embedUrl: null }` — a UI usa placeholder + link.
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
  if (!apiKey || !query) {
    return NextResponse.json({
      embedUrl: null as string | null,
      hasKey: Boolean(apiKey),
      query: query || null,
    });
  }

  return NextResponse.json({
    embedUrl: googleMapsEmbedUrl(query, apiKey),
    hasKey: true,
    query,
  });
}

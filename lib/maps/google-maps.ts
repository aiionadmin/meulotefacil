/** Helpers Google Maps — Embed API (com chave) + link de busca (sempre). */

export type MapsLocationInput = {
  nome?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  latitude?: number | string;
  longitude?: number | string;
};

/** Chave client (NEXT_PUBLIC_*) ou server (GOOGLE_MAPS_API_KEY). */
export function resolveGoogleMapsApiKey(
  env: NodeJS.ProcessEnv = process.env
): string | undefined {
  const key =
    env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    env.GOOGLE_MAPS_API_KEY?.trim();
  return key || undefined;
}

export function buildMapsQuery(loc: MapsLocationInput): string {
  const lat = Number(loc.latitude);
  const lng = Number(loc.longitude);
  if (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  ) {
    return `${lat},${lng}`;
  }

  const parts = [
    loc.endereco?.trim(),
    loc.bairro?.trim(),
    loc.cidade?.trim(),
    loc.uf?.trim(),
    loc.cep?.trim(),
  ].filter(Boolean) as string[];

  if (parts.length > 0) return parts.join(", ");
  return loc.nome?.trim() || "";
}

/** Link externo — funciona sem API key. */
export function googleMapsSearchUrl(query: string): string {
  const q = query.trim();
  if (!q) return "https://www.google.com/maps";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/** Embed Place — exige chave Embed API. */
export function googleMapsEmbedUrl(query: string, apiKey: string): string {
  const q = query.trim() || "Brasil";
  const params = new URLSearchParams({
    key: apiKey,
    q,
    zoom: "15",
    language: "pt-BR",
  });
  return `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
}

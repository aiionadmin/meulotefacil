import type { NextRequest } from "next/server";

const FALLBACK_ORIGIN = "https://meulotefacil.com.br";

function isLoopbackHost(host: string) {
  const h = host.split(":")[0]?.toLowerCase() ?? "";
  return h === "localhost" || h === "127.0.0.1" || h === "::1" || h === "0.0.0.0";
}

/**
 * Origem pública atrás do nginx (evita redirect para https://localhost:3000).
 */
export function publicOrigin(request: NextRequest): string {
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  const rawHost =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host") ||
    "";

  if (!rawHost || isLoopbackHost(rawHost)) {
    return FALLBACK_ORIGIN;
  }

  return `${proto}://${rawHost}`;
}

export function publicUrl(request: NextRequest, pathname: string, search = "") {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(`${path}${search}`, publicOrigin(request));
}

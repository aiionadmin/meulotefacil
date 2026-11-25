/**
 * Controles de modo demonstração (Bloco A — A02/A03/A06).
 * Em produção o login demo e a restauração de seeds ficam desligados.
 */

export function isProductionRuntime() {
  return process.env.NODE_ENV === "production";
}

/** Login cookie / botão demo só fora de produção. */
export function isDemoLoginAllowed() {
  if (isProductionRuntime()) return false;
  return process.env.NEXT_PUBLIC_ALLOW_DEMO_LOGIN !== "0";
}

/** Botão "Restaurar demo" e seeds locais só fora de produção. */
export function isDemoToolsAllowed() {
  if (isProductionRuntime()) return false;
  return process.env.NEXT_PUBLIC_ALLOW_DEMO_TOOLS !== "0";
}

/**
 * Conjunto unificado de exemplo (A06) só fora de produção
 * (ou quando ALLOW_DEV_SEED=1 em preview).
 */
export function isDevSeedAllowed() {
  if (process.env.ALLOW_DEV_SEED === "1") return true;
  if (process.env.ALLOW_DEV_SEED === "0") return false;
  return !isProductionRuntime();
}

import type {
  IndexDef,
  SystemSettingsState,
  VendasParams,
} from "./system-settings-types";
import { seedSystemSettings } from "./system-settings-seed";

/** Dias padrão de reserva se o valor for inválido. */
export const DEFAULT_RESERVA_DIAS = 7;

export function normalizeValidadeReservaDias(dias: unknown): number {
  const n = typeof dias === "number" ? dias : Number(dias);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_RESERVA_DIAS;
  return Math.min(365, Math.floor(n));
}

/**
 * Calcula a data ISO (YYYY-MM-DD) de expiração da reserva
 * a partir de uma data base e dos dias configurados.
 */
export function calcReservaExpiraEm(
  dias: number,
  desdeIso: string = new Date().toISOString().slice(0, 10)
): string {
  const diasOk = normalizeValidadeReservaDias(dias);
  const base = desdeIso.slice(0, 10);
  const d = new Date(`${base}T12:00:00`);
  if (Number.isNaN(d.getTime())) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + diasOk);
    return fallback.toISOString().slice(0, 10);
  }
  d.setDate(d.getDate() + diasOk);
  return d.toISOString().slice(0, 10);
}

export function isReservaVencida(
  expiraEm: string | undefined | null,
  hojeIso: string = new Date().toISOString().slice(0, 10)
): boolean {
  if (!expiraEm) return false;
  return expiraEm.slice(0, 10) < hojeIso.slice(0, 10);
}

export function resolveIndicePadrao(
  state: Pick<SystemSettingsState, "indicePadrao" | "indices" | "reajuste">
): string {
  const candidatos = [
    state.indicePadrao,
    state.reajuste?.indicePadrao,
    "IGPM",
  ].filter(Boolean) as string[];
  const ativos = new Set(
    (state.indices ?? []).filter((i) => i.ativo).map((i) => i.codigo)
  );
  for (const c of candidatos) {
    if (!ativos.size || ativos.has(c)) return c;
  }
  const primeiro = (state.indices ?? []).find((i) => i.ativo);
  return primeiro?.codigo ?? "IGPM";
}

export function indicesAtivos(indices: IndexDef[]): IndexDef[] {
  return indices.filter((i) => i.ativo);
}

export function mergeSystemSettings(
  seed: SystemSettingsState,
  saved: Partial<SystemSettingsState> | null | undefined
): SystemSettingsState {
  if (!saved) return seed;
  const vendas: VendasParams = {
    ...seed.vendas,
    ...(saved.vendas ?? {}),
    validadeReservaDias: normalizeValidadeReservaDias(
      saved.vendas?.validadeReservaDias ?? seed.vendas.validadeReservaDias
    ),
    camposLiberados: {
      ...seed.vendas.camposLiberados,
      ...(saved.vendas?.camposLiberados ?? {}),
    },
  };
  const indices =
    Array.isArray(saved.indices) && saved.indices.length > 0
      ? saved.indices
      : seed.indices;
  const indicePadrao = resolveIndicePadrao({
    indicePadrao: saved.indicePadrao ?? seed.indicePadrao,
    indices,
    reajuste: { ...seed.reajuste, ...(saved.reajuste ?? {}) },
  });
  return {
    ...seed,
    ...saved,
    indicePadrao,
    indices,
    encargos: { ...seed.encargos, ...(saved.encargos ?? {}) },
    vendas,
    reajuste: {
      ...seed.reajuste,
      ...(saved.reajuste ?? {}),
      indicePadrao:
        saved.reajuste?.indicePadrao ?? saved.indicePadrao ?? seed.reajuste.indicePadrao,
    },
    boletos: { ...seed.boletos, ...(saved.boletos ?? {}) },
    aparencia: { ...seed.aparencia, ...(saved.aparencia ?? {}) },
  };
}

export function validateSystemSettingsPatch(
  patch: Partial<SystemSettingsState>
): string | null {
  if (patch.vendas?.validadeReservaDias !== undefined) {
    const d = Number(patch.vendas.validadeReservaDias);
    if (!Number.isFinite(d) || d < 1 || d > 365) {
      return "Validade da reserva deve ser entre 1 e 365 dias";
    }
  }
  if (patch.indicePadrao !== undefined) {
    const codigo = String(patch.indicePadrao).trim();
    if (!codigo) return "Índice padrão obrigatório";
  }
  if (patch.encargos?.taxaMoraMes !== undefined) {
    const t = Number(patch.encargos.taxaMoraMes);
    if (!Number.isFinite(t) || t < 0 || t > 1) {
      return "Taxa de mora ao mês deve ser entre 0 e 1 (ex.: 0,01 = 1%)";
    }
  }
  if (patch.encargos?.taxaMulta !== undefined) {
    const t = Number(patch.encargos.taxaMulta);
    if (!Number.isFinite(t) || t < 0 || t > 1) {
      return "Taxa de multa deve ser entre 0 e 1 (ex.: 0,02 = 2%)";
    }
  }
  return null;
}

export function defaultSystemSettings(): SystemSettingsState {
  return seedSystemSettings();
}

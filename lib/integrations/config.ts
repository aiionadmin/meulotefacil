import {
  DEFAULT_INTEGRATIONS,
  type ChannelConfig,
  type IntegrationKind,
  type IntegrationsConfig,
} from "./types";

let config: IntegrationsConfig = structuredClone(DEFAULT_INTEGRATIONS);
const listeners = new Set<() => void>();

export function getIntegrationsConfig(): IntegrationsConfig {
  return config;
}

export function subscribeIntegrations(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  for (const l of listeners) l();
}

export function updateIntegrationsConfig(
  patch: Partial<{
    [K in IntegrationKind]: Partial<ChannelConfig>;
  }>
): IntegrationsConfig {
  const next = { ...config };
  for (const key of Object.keys(patch) as IntegrationKind[]) {
    const p = patch[key];
    if (!p) continue;
    next[key] = { ...next[key], ...p };
  }
  config = next;
  emit();
  return config;
}

export function resetIntegrationsConfig(): IntegrationsConfig {
  config = structuredClone(DEFAULT_INTEGRATIONS);
  emit();
  return config;
}

/** Avalia se o canal pode tentar envio (ainda assim só stub). */
export function channelGate(
  kind: IntegrationKind
): { ready: false; reason: "disabled" | "no_provider" | "provider_pending" } {
  const ch = config[kind];
  if (!ch.enabled) return { ready: false, reason: "disabled" };
  if (ch.provider === "none") return { ready: false, reason: "no_provider" };
  // Provedor escolhido: API ainda não ligada neste PR.
  return { ready: false, reason: "provider_pending" };
}

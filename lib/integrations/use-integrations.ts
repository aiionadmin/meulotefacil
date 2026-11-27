"use client";

import { useSyncExternalStore } from "react";
import {
  getIntegrationsConfig,
  subscribeIntegrations,
  updateIntegrationsConfig,
} from "./config";
import type { ChannelConfig, IntegrationKind, IntegrationsConfig } from "./types";

export function useIntegrations(): {
  config: IntegrationsConfig;
  update: (
    patch: Partial<{ [K in IntegrationKind]: Partial<ChannelConfig> }>
  ) => void;
} {
  const config = useSyncExternalStore(
    subscribeIntegrations,
    getIntegrationsConfig,
    getIntegrationsConfig
  );
  return { config, update: updateIntegrationsConfig };
}

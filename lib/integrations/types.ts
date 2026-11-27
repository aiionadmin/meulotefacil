/** Integrações externas preparadas — desligadas até escolha/homologação do provedor. */

export type IntegrationKind = "nfse" | "sefaz" | "email" | "whatsapp" | "banco";

export type ProviderChoice =
  | "none"
  | "pending"
  /** Placeholders — sem SDK/credencial neste PR. */
  | "focusnfe"
  | "enotas"
  | "sefaz_nfe"
  | "smtp"
  | "resend"
  | "meta_cloud"
  | "zapi"
  | "pluggy"
  | "ofx_only";

export type ChannelConfig = {
  /** Intenção do cliente (toggle na UI). Não dispara chamada real. */
  enabled: boolean;
  provider: ProviderChoice;
};

export type IntegrationsConfig = {
  nfse: ChannelConfig;
  sefaz: ChannelConfig;
  email: ChannelConfig;
  whatsapp: ChannelConfig;
  banco: ChannelConfig;
};

export type StubResult = {
  ok: false;
  stub: true;
  kind: IntegrationKind;
  /** disabled = flag off; no_provider = flag on sem provedor; provider_pending = provedor marcado, API não ligada */
  reason: "disabled" | "no_provider" | "provider_pending";
  message: string;
};

export const DEFAULT_INTEGRATIONS: IntegrationsConfig = {
  nfse: { enabled: false, provider: "none" },
  sefaz: { enabled: false, provider: "none" },
  email: { enabled: false, provider: "none" },
  whatsapp: { enabled: false, provider: "none" },
  banco: { enabled: false, provider: "ofx_only" },
};

export const PROVIDER_OPTIONS: Record<
  IntegrationKind,
  { value: ProviderChoice; label: string }[]
> = {
  nfse: [
    { value: "none", label: "Nenhum" },
    { value: "pending", label: "A definir" },
    { value: "focusnfe", label: "Focus NFe (placeholder)" },
    { value: "enotas", label: "eNotas (placeholder)" },
  ],
  sefaz: [
    { value: "none", label: "Nenhum" },
    { value: "pending", label: "A definir" },
    { value: "sefaz_nfe", label: "Sefaz NFe (placeholder)" },
  ],
  email: [
    { value: "none", label: "Nenhum" },
    { value: "pending", label: "A definir" },
    { value: "smtp", label: "SMTP (placeholder)" },
    { value: "resend", label: "Resend (placeholder)" },
  ],
  whatsapp: [
    { value: "none", label: "Nenhum" },
    { value: "pending", label: "A definir" },
    { value: "meta_cloud", label: "Meta Cloud API (placeholder)" },
    { value: "zapi", label: "Z-API (placeholder)" },
  ],
  banco: [
    { value: "ofx_only", label: "Somente OFX (atual)" },
    { value: "none", label: "Nenhum" },
    { value: "pending", label: "A definir" },
    { value: "pluggy", label: "Open Finance (placeholder)" },
  ],
};

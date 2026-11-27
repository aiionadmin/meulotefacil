import { channelGate, getIntegrationsConfig } from "./config";
import type { IntegrationKind, StubResult } from "./types";

const MESSAGES: Record<StubResult["reason"], string> = {
  disabled: "Integração desligada. Ative em Configurações > Integrações.",
  no_provider: "Escolha um provedor em Configurações > Integrações.",
  provider_pending:
    "Provedor marcado; chamada real desligada até homologação/credenciais.",
};

function refuse(kind: IntegrationKind): StubResult {
  const gate = channelGate(kind);
  return {
    ok: false,
    stub: true,
    kind,
    reason: gate.reason,
    message: MESSAGES[gate.reason],
  };
}

/** Emissão NFSe — nunca chama API neste PR. */
export function emitNfseStub(input: {
  meuCnpjId: string;
  valor: number;
  descricao?: string;
}): StubResult {
  void input;
  void getIntegrationsConfig();
  return refuse("nfse");
}

/** Captura automática Sefaz — nunca chama API neste PR. */
export function captureSefazStub(input: {
  meuCnpjId: string;
}): StubResult {
  void input;
  return refuse("sefaz");
}

export function sendCotacaoEmailStub(input: {
  cotacaoId: string;
  fornecedor: string;
  email?: string;
}): StubResult {
  void input;
  return refuse("email");
}

export function sendOcEmailStub(input: {
  ordemId: string;
  numero: string;
  email?: string;
}): StubResult {
  void input;
  return refuse("email");
}

export function sendCotacaoWhatsAppStub(input: {
  cotacaoId: string;
  fornecedor: string;
  telefone?: string;
}): StubResult {
  void input;
  return refuse("whatsapp");
}

export function sendOcWhatsAppStub(input: {
  ordemId: string;
  numero: string;
  telefone?: string;
}): StubResult {
  void input;
  return refuse("whatsapp");
}

/** Pré-lançamento via WhatsApp (entrada) — canal desligado. */
export function configurePreLancamentoWhatsAppStub(): StubResult {
  return refuse("whatsapp");
}

export function openBankingStub(input: { contaId: string }): StubResult {
  void input;
  return refuse("banco");
}

export function notifyStub(result: StubResult, title: string): {
  title: string;
  description: string;
} {
  return {
    title: `${title} (stub)`,
    description: result.message,
  };
}

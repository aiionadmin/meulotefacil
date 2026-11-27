import {
  captureSefazStub,
  emitNfseStub,
  resetIntegrationsConfig,
  sendCotacaoEmailStub,
  sendOcWhatsAppStub,
  updateIntegrationsConfig,
} from "./index";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

resetIntegrationsConfig();

const off = emitNfseStub({ meuCnpjId: "c1", valor: 10 });
assert(off.stub && off.reason === "disabled", "nfse disabled");

updateIntegrationsConfig({ nfse: { enabled: true, provider: "none" } });
const noProv = emitNfseStub({ meuCnpjId: "c1", valor: 10 });
assert(noProv.reason === "no_provider", "nfse no provider");

updateIntegrationsConfig({ nfse: { enabled: true, provider: "focusnfe" } });
const pending = emitNfseStub({ meuCnpjId: "c1", valor: 10 });
assert(pending.reason === "provider_pending", "nfse still stub");
assert(pending.ok === false, "never ok");

assert(
  captureSefazStub({ meuCnpjId: "c1" }).reason === "disabled",
  "sefaz off"
);
assert(
  sendCotacaoEmailStub({ cotacaoId: "x", fornecedor: "A" }).reason ===
    "disabled",
  "email off"
);
assert(
  sendOcWhatsAppStub({ ordemId: "o", numero: "OC-1" }).reason === "disabled",
  "wa off"
);

updateIntegrationsConfig({
  email: { enabled: true, provider: "resend" },
  whatsapp: { enabled: true, provider: "zapi" },
  sefaz: { enabled: true, provider: "sefaz_nfe" },
});
assert(
  sendCotacaoEmailStub({ cotacaoId: "x", fornecedor: "A" }).reason ===
    "provider_pending",
  "email pending"
);
assert(
  sendOcWhatsAppStub({ ordemId: "o", numero: "OC-1" }).reason ===
    "provider_pending",
  "wa pending"
);
assert(
  captureSefazStub({ meuCnpjId: "c1" }).reason === "provider_pending",
  "sefaz pending"
);

resetIntegrationsConfig();
console.log("ok: integrations stubs");

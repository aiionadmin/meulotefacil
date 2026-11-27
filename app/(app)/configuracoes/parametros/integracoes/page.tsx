"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  ModuleHeader,
  ModuleSection,
  StatusPill,
} from "@/components/app/ModulePage";
import {
  Field,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import {
  PROVIDER_OPTIONS,
  useIntegrations,
  type IntegrationKind,
} from "@/lib/integrations";

const CANAIS: {
  kind: IntegrationKind;
  title: string;
  desc: string;
}[] = [
  {
    kind: "nfse",
    title: "Emissão NFSe",
    desc: "Flag + provedor. Chamada real desligada até homologação.",
  },
  {
    kind: "sefaz",
    title: "Captura Sefaz (NFe)",
    desc: "Captura automática preparada; upload XML/PDF segue ativo.",
  },
  {
    kind: "email",
    title: "E-mail (cotação / OC)",
    desc: "Pedido de cotação e envio de ordem por e-mail.",
  },
  {
    kind: "whatsapp",
    title: "WhatsApp (cotação / OC / pré)",
    desc: "Envio e entrada de pré-lançamento via WhatsApp.",
  },
  {
    kind: "banco",
    title: "Integração bancária",
    desc: "Open Finance preparado; conciliação atual é OFX.",
  },
];

export default function ParametrosIntegracoesPage() {
  const { config, update } = useIntegrations();

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Integrações"
        description="Stubs preparados e desligados. Toggles e provedores são só flag — sem deploy de API."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/financeiro/notas-fiscais">Notas / CNPJs</Link>
          </Button>
        }
      />

      <div className="grid gap-4">
        {CANAIS.map((c) => {
          const ch = config[c.kind];
          const status =
            !ch.enabled
              ? "Desligada"
              : ch.provider === "none"
                ? "Sem provedor"
                : "Provedor marcado (stub)";
          return (
            <ModuleSection key={c.kind} title={c.title}>
              <p className="mb-3 text-sm text-muted-foreground">{c.desc}</p>
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill
                  tone={
                    !ch.enabled
                      ? "neutral"
                      : ch.provider === "none"
                        ? "warn"
                        : "info"
                  }
                >
                  {status}
                </StatusPill>
                <label className="flex items-center gap-2 text-sm">
                  <span>Ativar intenção</span>
                  <Switch
                    checked={ch.enabled}
                    onCheckedChange={(enabled) => {
                      update({ [c.kind]: { enabled } });
                      notify(
                        enabled
                          ? `${c.title}: intenção ligada`
                          : `${c.title}: desligada`,
                        "Sem chamada externa"
                      );
                    }}
                  />
                </label>
              </div>
              <div className="mt-3 max-w-sm">
                <Field label="Provedor">
                  <select
                    className={fieldControlClass}
                    value={ch.provider}
                    onChange={(e) => {
                      update({
                        [c.kind]: {
                          provider: e.target.value as typeof ch.provider,
                        },
                      });
                      notify("Provedor atualizado", "Placeholder — sem SDK");
                    }}
                  >
                    {PROVIDER_OPTIONS[c.kind].map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </ModuleSection>
          );
        })}
      </div>
    </div>
  );
}

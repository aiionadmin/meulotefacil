"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import { notify } from "@/components/app/ModuleToolkit";
import { ProcessList } from "@/components/app/ProcessList";
import { notifyStub, openBankingStub } from "@/lib/integrations";
import { formatBRL } from "@/lib/masks/br";
import { useFinanceiro } from "@/lib/store/financeiro-store";

/**
 * Cobrança Fácil — emissão de boletos por conta bancária.
 * Usa o mesmo motor de boletos da carteira (/boletos); integração automática
 * fica preparada e desligada até homologação bancária.
 */
export default function CobrancaFacilPage() {
  const { state } = useFinanceiro();
  const [override, setOverride] = useState<Record<string, boolean>>({});

  const rows = state.contas.map((c) => ({
    ...c,
    cobrancaAtiva: override[c.id] ?? c.boleto,
  }));

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Cobrança Fácil"
        description="Emissão de boletos por conta bancária e regras padrão (juros, multa, protesto). Motor compartilhado com a carteira."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href="/boletos">Abrir boletos / CNAB</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/financeiro/contas">Contas bancárias</Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const contaId = state.contas[0]?.id ?? "";
                const r = openBankingStub({ contaId });
                const n = notifyStub(r, "Integração bancária");
                notify(n.title, n.description);
              }}
            >
              Open Finance (stub)
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/configuracoes/parametros/integracoes">
                Integrações
              </Link>
            </Button>
          </div>
        }
      />

      <ModuleSection title="Regras padrão">
        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-ink/60">Juros ao mês</dt>
            <dd className="font-medium">1%</dd>
          </div>
          <div>
            <dt className="text-ink/60">Multa</dt>
            <dd className="font-medium">2%</dd>
          </div>
          <div>
            <dt className="text-ink/60">Dias para protesto</dt>
            <dd className="font-medium">5</dd>
          </div>
          <div>
            <dt className="text-ink/60">Instruções</dt>
            <dd className="font-medium">Não receber após o vencimento</dd>
          </div>
        </dl>
      </ModuleSection>

      <ProcessList
        storageKey="cobranca-facil-contas"
        exportName="cobranca-facil-contas"
        rows={rows}
        empty="Nenhuma conta bancária cadastrada."
        columns={[
          {
            key: "nome",
            label: "Conta",
            filter: { type: "text" },
            getValue: (c) => c.nome,
            render: (c) => <span className="font-medium">{c.nome}</span>,
          },
          {
            key: "banco",
            label: "Banco",
            filter: { type: "text" },
            getValue: (c) => c.banco ?? "—",
          },
          {
            key: "tipo",
            label: "Tipo",
            filter: { type: "text" },
            getValue: (c) => c.tipo,
          },
          {
            key: "saldo",
            label: "Saldo",
            filter: { type: "range" },
            getValue: (c) => c.saldo,
            render: (c) => formatBRL(c.saldo),
          },
          {
            key: "status",
            label: "Cobrança Fácil",
            filter: {
              type: "status",
              options: [
                { value: "ativa", label: "Ativa" },
                { value: "desativada", label: "Desativada" },
              ],
            },
            getValue: (c) => (c.cobrancaAtiva ? "ativa" : "desativada"),
            render: (c) => (
              <StatusPill tone={c.cobrancaAtiva ? "ok" : "warn"}>
                {c.cobrancaAtiva ? "Ativa" : "Desativada"}
              </StatusPill>
            ),
          },
          {
            key: "acao",
            label: "",
            getValue: () => "",
            render: (c) => (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  const next = !c.cobrancaAtiva;
                  setOverride((o) => ({ ...o, [c.id]: next }));
                  notify(
                    next
                      ? "Cobrança Fácil ativada"
                      : "Cobrança Fácil desativada",
                    c.nome
                  );
                }}
              >
                {c.cobrancaAtiva ? "Desativar" : "Ativar"}
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}

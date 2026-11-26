"use client";

import { ModuleHeader, DataTable, StatusPill } from "@/components/app/ModulePage";
import { useCarteira } from "@/lib/store/carteira-store";
import { statusLabel } from "@/lib/status/labels";

export default function CartoriosPage() {
  const { state } = useCarteira();
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Cartórios e escrituras"
        description="Cadastro de cartórios e controle de escrituras por contrato."
      />
      <DataTable
        columns={[
          { key: "nome", label: "Cartório" },
          { key: "cidade", label: "Cidade" },
          { key: "contato", label: "Contato" },
        ]}
        rows={state.cartorios.map((c) => ({
          nome: c.nome,
          cidade: `${c.cidade}/${c.uf}`,
          contato: c.contato ?? "—",
        }))}
        empty="Sem cartórios."
      />
      <DataTable
        columns={[
          { key: "protocolo", label: "Protocolo" },
          { key: "contrato", label: "Contrato" },
          { key: "status", label: "Status" },
        ]}
        rows={state.escrituras.map((e) => ({
          protocolo: e.protocolo,
          contrato: e.contractId,
          status: (
            <StatusPill tone="info">{statusLabel(e.status)}</StatusPill>
          ),
        }))}
        empty="Sem escrituras em andamento."
      />
    </div>
  );
}

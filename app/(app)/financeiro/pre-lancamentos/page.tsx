"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  ModuleSection,
  StatusPill,
} from "@/components/app/ModulePage";
import { PaginatedTable } from "@/components/app/PaginatedTable";
import {
  Field,
  FormDialog,
  notify,
} from "@/components/app/ModuleToolkit";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useFinanceiro } from "@/lib/store/financeiro-store";

export default function PreLancamentosPage() {
  const { state, addPreLancamento, aprovarPre, recusarPre } = useFinanceiro();
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    descricao: "",
    valor: 100,
    solicitante: "Admin Demo",
    centroLabel: "Meu Lote Fácil",
  });

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Pré-lançamentos"
        description="Despesa com comprovante aguarda revisão do financeiro."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/financeiro">Pagamentos</Link>
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Novo
            </Button>
          </>
        }
      />
      <ModuleSection title="Lista">
        <PaginatedTable
          columns={[
            { key: "data", label: "Data" },
            { key: "desc", label: "Descrição" },
            { key: "valor", label: "Valor" },
            { key: "centro", label: "Centro" },
            { key: "sol", label: "Solicitante" },
            { key: "status", label: "Status" },
            { key: "acoes", label: "Ações" },
          ]}
          rows={state.preLancamentos.map((p) => ({
            data: formatDateBR(p.criadoEm),
            desc: p.descricao,
            valor: formatBRL(p.valor),
            centro: p.centro.label,
            sol: p.solicitante,
            status: (
              <StatusPill
                tone={
                  p.status === "aprovado"
                    ? "ok"
                    : p.status === "recusado"
                      ? "danger"
                      : "info"
                }
              >
                {p.status}
              </StatusPill>
            ),
            acoes:
              p.status === "pendente" ? (
                <div className="flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    className="h-7"
                    onClick={() => {
                      if (!aprovarPre(p.id)) {
                        notify("Falha ao aprovar");
                        return;
                      }
                      notify("Aprovado → lançamento");
                    }}
                  >
                    Aprovar
                  </Button>
                  <Input
                    className="h-7 w-28"
                    placeholder="Motivo"
                    value={motivo[p.id] ?? ""}
                    onChange={(e) =>
                      setMotivo({ ...motivo, [p.id]: e.target.value })
                    }
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7"
                    onClick={() => {
                      if (!recusarPre(p.id, motivo[p.id] ?? "")) {
                        notify("Informe o motivo");
                        return;
                      }
                      notify("Recusado");
                    }}
                  >
                    Recusar
                  </Button>
                </div>
              ) : (
                p.motivoRecusa ?? "—"
              ),
          }))}
        />
      </ModuleSection>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Novo pré-lançamento"
        onSubmit={() => {
          if (!form.descricao.trim()) {
            notify("Descrição obrigatória");
            return;
          }
          addPreLancamento({
            descricao: form.descricao,
            valor: form.valor,
            solicitante: form.solicitante,
            centro: { tipo: "empresa", label: form.centroLabel },
          });
          notify("Enviado para revisão");
          setOpen(false);
        }}
      >
        <Field label="Descrição *">
          <Input
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </Field>
        <Field label="Valor">
          <Input
            type="number"
            value={form.valor}
            onChange={(e) =>
              setForm({ ...form, valor: Number(e.target.value) || 0 })
            }
          />
        </Field>
      </FormDialog>
    </div>
  );
}

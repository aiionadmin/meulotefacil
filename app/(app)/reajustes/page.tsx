"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import {
  Field,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { useCarteira } from "@/lib/store/carteira-store";

export default function ReajustesPage() {
  const {
    state,
    aplicarReajuste,
    desfazerUltimoReajuste,
    registrarOperacao,
  } = useCarteira();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ indice: "IGPM", fator: 1.045 });
  const [opOpen, setOpOpen] = useState(false);
  const [opForm, setOpForm] = useState({
    contractId: state.contracts[0]?.id ?? "",
    tipo: "antecipacao" as const,
    detalhe: "",
  });

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Reajuste e operações"
        description="Fase 4 — reajuste anual por índice e operações sobre o contrato."
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => setOpOpen(true)}>
              Nova operação
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const ok = desfazerUltimoReajuste();
                notify(ok ? "Último reajuste desfeito" : "Nada a desfazer");
              }}
            >
              Desfazer reajuste
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Aplicar reajuste
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Rodadas", value: state.adjustments.length },
          {
            label: "Ativas",
            value: state.adjustments.filter((a) => !a.desfeito).length,
          },
          { label: "Operações", value: state.operations.length },
        ]}
      />

      <ModuleSection title="Histórico de reajustes">
        <DataTable
          columns={[
            { key: "indice", label: "Índice" },
            { key: "fator", label: "Fator" },
            { key: "qtd", label: "Parcelas" },
            { key: "quando", label: "Quando" },
            { key: "status", label: "Status" },
          ]}
          rows={state.adjustments.map((a) => ({
            indice: a.indice,
            fator: a.fator.toFixed(4),
            qtd: a.qtdParcelas,
            quando: a.criadoEm,
            status: (
              <StatusPill tone={a.desfeito ? "neutral" : "ok"}>
                {a.desfeito ? "Desfeito" : "Aplicado"}
              </StatusPill>
            ),
          }))}
        />
      </ModuleSection>

      <ModuleSection title="Operações do contrato">
        <DataTable
          columns={[
            { key: "tipo", label: "Tipo" },
            { key: "contrato", label: "Contrato" },
            { key: "detalhe", label: "Detalhe" },
            { key: "quando", label: "Quando" },
          ]}
          rows={state.operations.map((o) => ({
            tipo: o.tipo,
            contrato:
              state.contracts.find((c) => c.id === o.contractId)?.numero ?? o.contractId,
            detalhe: o.detalhe,
            quando: o.quando,
          }))}
        />
      </ModuleSection>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Aplicar reajuste anual"
        onSubmit={() => {
          const n = aplicarReajuste(form.fator, form.indice);
          notify(`${n} parcelas reajustadas`, `fator ${form.fator}`);
          setOpen(false);
        }}
      >
        <Field label="Índice">
          <select
            className={fieldControlClass}
            value={form.indice}
            onChange={(e) => setForm({ ...form, indice: e.target.value })}
          >
            <option value="IGPM">IGPM</option>
            <option value="IPCA">IPCA</option>
            <option value="INCC">INCC</option>
          </select>
        </Field>
        <Field label="Fator (ex.: 1.045 = +4,5%)">
          <Input
            type="number"
            step="0.0001"
            value={form.fator}
            onChange={(e) =>
              setForm({ ...form, fator: Number(e.target.value) || 1 })
            }
          />
        </Field>
      </FormDialog>

      <FormDialog
        open={opOpen}
        onOpenChange={setOpOpen}
        title="Registrar operação"
        onSubmit={() => {
          if (!opForm.contractId) {
            notify("Selecione o contrato");
            return;
          }
          registrarOperacao(
            opForm.contractId,
            opForm.tipo,
            opForm.detalhe || opForm.tipo
          );
          notify("Operação registrada", opForm.tipo);
          setOpOpen(false);
        }}
      >
        <Field label="Contrato">
          <select
            className={fieldControlClass}
            value={opForm.contractId}
            onChange={(e) =>
              setOpForm({ ...opForm, contractId: e.target.value })
            }
          >
            {state.contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.numero} · {c.compradorNome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tipo">
          <select
            className={fieldControlClass}
            value={opForm.tipo}
            onChange={(e) =>
              setOpForm({
                ...opForm,
                tipo: e.target.value as typeof opForm.tipo,
              })
            }
          >
            <option value="antecipacao">Antecipação</option>
            <option value="transferencia">Transferência</option>
            <option value="renegociacao">Renegociação</option>
            <option value="troca">Troca de lote</option>
            <option value="retomada">Retomada</option>
            <option value="acordo">Acordo</option>
          </select>
        </Field>
        <Field label="Detalhe">
          <Input
            value={opForm.detalhe}
            onChange={(e) =>
              setOpForm({ ...opForm, detalhe: e.target.value })
            }
          />
        </Field>
      </FormDialog>
    </div>
  );
}

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
import { useDemoStore } from "@/lib/store/demo-store";

export default function ReajustesPage() {
  const { state, aplicarReajuste, addOperacao, updateContrato } =
    useDemoStore();
  const [openRej, setOpenRej] = useState(false);
  const [openOp, setOpenOp] = useState(false);
  const [rej, setRej] = useState({ indice: "IGPM", fator: "1,50%" });
  const [op, setOp] = useState({
    tipo: "Transferência",
    contrato: state.contratos[0]?.id ?? "CTR-2091",
    detalhe: "",
  });

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Reajuste e operações"
        description="Cotações de índice, reajuste em lote, transferência, renegociação, permuta e retomada."
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => setOpenOp(true)}>
              Nova operação
            </Button>
            <Button size="sm" onClick={() => setOpenRej(true)}>
              Aplicar reajuste
            </Button>
          </>
        }
      />
      <KpiGrid
        items={[
          { label: "Reajustes", value: state.reajustes.length },
          { label: "Operações", value: state.operacoes.length },
          {
            label: "Contratos ativos",
            value: state.contratos.filter((c) => c.status === "Ativo").length,
          },
          {
            label: "Último índice",
            value: state.reajustes[0]
              ? `${state.reajustes[0].indice} ${state.reajustes[0].fator}`
              : "nenhum",
          },
        ]}
      />

      <ModuleSection title="Reajustes aplicados">
        <DataTable
          columns={[
            { key: "periodo", label: "Período" },
            { key: "indice", label: "Índice" },
            { key: "fator", label: "Fator" },
            { key: "contratos", label: "Contratos" },
            { key: "status", label: "Status" },
          ]}
          rows={state.reajustes.map((r) => ({
            periodo: r.periodo,
            indice: r.indice,
            fator: r.fator,
            contratos: r.contratos,
            status: <StatusPill tone="ok">{r.status}</StatusPill>,
          }))}
        />
      </ModuleSection>

      <ModuleSection title="Operações contratuais">
        <DataTable
          columns={[
            { key: "tipo", label: "Tipo" },
            { key: "contrato", label: "Contrato" },
            { key: "quando", label: "Quando" },
            { key: "detalhe", label: "Detalhe" },
          ]}
          rows={state.operacoes.map((o) => ({
            tipo: <span className="font-medium">{o.tipo}</span>,
            contrato: o.contrato,
            quando: o.quando,
            detalhe: o.detalhe,
          }))}
        />
      </ModuleSection>

      <FormDialog
        open={openRej}
        onOpenChange={setOpenRej}
        title="Aplicar reajuste em lote"
        submitLabel="Aplicar"
        onSubmit={() => {
          const r = aplicarReajuste(rej.indice, rej.fator);
          notify("Reajuste aplicado", `${r.indice} ${r.fator}`);
          setOpenRej(false);
        }}
      >
        <Field label="Índice">
          <select
            className={fieldControlClass}
            value={rej.indice}
            onChange={(e) => setRej({ ...rej, indice: e.target.value })}
          >
            <option>IGPM</option>
            <option>IPCA</option>
            <option>INCC</option>
          </select>
        </Field>
        <Field label="Fator">
          <Input
            value={rej.fator}
            onChange={(e) => setRej({ ...rej, fator: e.target.value })}
          />
        </Field>
      </FormDialog>

      <FormDialog
        open={openOp}
        onOpenChange={setOpenOp}
        title="Nova operação"
        submitLabel="Registrar"
        onSubmit={() => {
          addOperacao({
            tipo: op.tipo,
            contrato: op.contrato,
            detalhe: op.detalhe || `${op.tipo} registrada no demo`,
          });
          if (op.tipo === "Renegociação") {
            updateContrato(op.contrato, { status: "Renegociado" });
          }
          if (op.tipo === "Retomada") {
            updateContrato(op.contrato, { status: "Retomado", saldo: 0 });
          }
          notify("Operação registrada", op.tipo);
          setOpenOp(false);
        }}
      >
        <Field label="Tipo">
          <select
            className={fieldControlClass}
            value={op.tipo}
            onChange={(e) => setOp({ ...op, tipo: e.target.value })}
          >
            {[
              "Transferência",
              "Renegociação",
              "Permuta",
              "Retomada",
              "Troca de plano",
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Contrato">
          <select
            className={fieldControlClass}
            value={op.contrato}
            onChange={(e) => setOp({ ...op, contrato: e.target.value })}
          >
            {state.contratos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} · {c.comprador}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Detalhe">
          <Input
            value={op.detalhe}
            onChange={(e) => setOp({ ...op, detalhe: e.target.value })}
            placeholder="Descrição da operação"
          />
        </Field>
      </FormDialog>
    </div>
  );
}

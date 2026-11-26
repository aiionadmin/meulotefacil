"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import {
  Field,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { ProcessList } from "@/components/app/ProcessList";
import { SearchSelect } from "@/components/app/SearchSelect";
import { useCarteira } from "@/lib/store/carteira-store";
import { formatBRL } from "@/lib/masks/br";

export default function ReajustesPage() {
  const {
    state,
    aplicarReajuste,
    desfazerUltimoReajuste,
    registrarOperacao,
  } = useCarteira();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    indice: "IGPM",
    fator: 1.045,
    mesBase: new Date().getMonth() + 1,
    gerarResiduo: true,
  });
  const [opOpen, setOpOpen] = useState(false);
  const [opForm, setOpForm] = useState({
    contractId: state.contracts[0]?.id ?? "",
    tipo: "antecipacao" as const,
    detalhe: "",
  });

  const residuos = state.installments.filter((p) => p.tipo === "Resíduo");

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Reajuste e operações"
        description="Correção monetária anual com mês-base, resíduos e histórico (H18)."
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
          { label: "Resíduos", value: residuos.length },
          { label: "Operações", value: state.operations.length },
        ]}
      />

      <ModuleSection title="Histórico de reajustes">
        <ProcessList
          storageKey="reajustes-hist"
          exportName="reajustes"
          rows={state.adjustments}
          empty="Sem reajustes."
          columns={[
            {
              key: "indice",
              label: "Índice",
              filter: { type: "text" },
              getValue: (a) => a.indice,
            },
            {
              key: "fator",
              label: "Fator",
              filter: { type: "range" },
              getValue: (a) => a.fator,
              render: (a) => a.fator.toFixed(4),
            },
            {
              key: "mes",
              label: "Mês-base",
              filter: { type: "text" },
              getValue: (a) =>
                `${String(a.mesBase).padStart(2, "0")}/${a.ano}`,
            },
            {
              key: "qtd",
              label: "Parcelas",
              filter: { type: "range" },
              getValue: (a) => a.qtdParcelas,
            },
            {
              key: "res",
              label: "Resíduos",
              filter: { type: "range" },
              getValue: (a) => a.residuosGerados ?? 0,
            },
            {
              key: "quando",
              label: "Quando",
              filter: { type: "period" },
              getValue: (a) => a.criadoEm,
            },
            {
              key: "status",
              label: "Status",
              filter: {
                type: "status",
                options: [
                  { value: "aplicado", label: "Aplicado" },
                  { value: "desfeito", label: "Desfeito" },
                ],
              },
              getValue: (a) => (a.desfeito ? "desfeito" : "aplicado"),
              render: (a) => (
                <StatusPill tone={a.desfeito ? "neutral" : "ok"}>
                  {a.desfeito ? "Desfeito" : "Aplicado"}
                </StatusPill>
              ),
            },
          ]}
        />
      </ModuleSection>

      <ModuleSection title="Resíduos em aberto">
        <ProcessList
          storageKey="reajustes-residuos"
          exportName="residuos"
          rows={residuos}
          empty="Nenhum resíduo gerado."
          columns={[
            {
              key: "contrato",
              label: "Contrato",
              filter: { type: "text" },
              getValue: (p) => p.contratoNumero,
            },
            {
              key: "cliente",
              label: "Cliente",
              filter: { type: "text" },
              getValue: (p) => p.compradorNome,
            },
            {
              key: "n",
              label: "Nº",
              filter: { type: "range" },
              getValue: (p) => p.n,
            },
            {
              key: "valor",
              label: "Valor",
              filter: { type: "range" },
              getValue: (p) => p.valor,
              render: (p) => formatBRL(p.valor),
            },
            {
              key: "venc",
              label: "Vencimento",
              filter: { type: "period" },
              getValue: (p) => p.vencimento,
            },
          ]}
        />
      </ModuleSection>

      <ModuleSection title="Operações do contrato">
        <ProcessList
          storageKey="reajustes-ops"
          exportName="operacoes-contrato"
          rows={state.operations}
          empty="Sem operações."
          columns={[
            {
              key: "tipo",
              label: "Tipo",
              filter: { type: "text" },
              getValue: (o) => o.tipo,
            },
            {
              key: "contrato",
              label: "Contrato",
              filter: { type: "text" },
              getValue: (o) =>
                state.contracts.find((c) => c.id === o.contractId)?.numero ??
                o.contractId,
            },
            {
              key: "detalhe",
              label: "Detalhe",
              filter: { type: "text" },
              getValue: (o) => o.detalhe,
            },
            {
              key: "quando",
              label: "Quando",
              filter: { type: "period" },
              getValue: (o) => o.quando,
            },
          ]}
        />
      </ModuleSection>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Aplicar reajuste anual"
        onSubmit={() => {
          const n = aplicarReajuste(form.fator, form.indice, {
            mesBase: form.mesBase,
            gerarResiduo: form.gerarResiduo,
          });
          notify(`${n} parcelas reajustadas`, `mês-base ${form.mesBase}`);
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
        <Field label="Mês-base (1–12)">
          <Input
            type="number"
            min={1}
            max={12}
            value={form.mesBase}
            onChange={(e) =>
              setForm({
                ...form,
                mesBase: Math.min(12, Math.max(1, Number(e.target.value) || 1)),
              })
            }
          />
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
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.gerarResiduo}
            onChange={(e) =>
              setForm({ ...form, gerarResiduo: e.target.checked })
            }
          />
          Gerar resíduos de arredondamento
        </label>
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
          <SearchSelect
            value={opForm.contractId}
            onChange={(contractId) => setOpForm({ ...opForm, contractId })}
            placeholder="Buscar contrato…"
            options={state.contracts.map((c) => ({
              value: c.id,
              label: `${c.numero} · ${c.compradorNome}`,
            }))}
          />
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

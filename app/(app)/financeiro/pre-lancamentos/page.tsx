"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  StatusPill,
} from "@/components/app/ModulePage";
import {
  Field,
  FormDialog,
  notify,
} from "@/components/app/ModuleToolkit";
import { ProcessBoard } from "@/components/kanban/ProcessBoard";
import { SearchSelect } from "@/components/app/SearchSelect";
import {
  configurePreLancamentoWhatsAppStub,
  notifyStub,
} from "@/lib/integrations";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { useFinanceiro } from "@/lib/store/financeiro-store";
import type { PreLancamento } from "@/lib/domain/financeiro-types";
import { useNovoParam } from "@/lib/ui/use-novo-param";
import { useFase1 } from "@/lib/store/fase1-store";
import { useObras } from "@/lib/store/obras-store";
import { useEmpresa } from "@/lib/empresa/context";
import { userOptions } from "@/lib/ui/people-options";

export default function PreLancamentosPage() {
  const { state, addPreLancamento, aprovarPre, recusarPre, aprovarPresLote } =
    useFinanceiro();
  const { state: fase1 } = useFase1();
  const { state: obrasState } = useObras();
  const { selected: empresaAtiva, empresas } = useEmpresa();
  const [open, setOpen] = useNovoParam();
  const [formDirty, setFormDirty] = useState(false);
  const [motivo, setMotivo] = useState<Record<string, string>>({});
  const solicitanteOpts = useMemo(
    () => userOptions(fase1.users),
    [fase1.users]
  );
  const centroOpts = useMemo(() => {
    const empList = (empresaAtiva ? [empresaAtiva] : empresas).map((e) => ({
      value: e.razaoSocial || e.nome,
      label: e.razaoSocial || e.nome,
      meta: "empresa",
    }));
    const obras = obrasState.obras.map((o) => ({
      value: o.nome,
      label: `${o.codigo} · ${o.nome}`,
      meta: "obra",
    }));
    return [...empList, ...obras];
  }, [empresaAtiva, empresas, obrasState.obras]);
  const [form, setForm] = useState({
    descricao: "",
    valor: 100,
    solicitante: "",
    centroLabel: "",
  });

  function patchForm(patch: Partial<typeof form>) {
    setFormDirty(true);
    setForm((prev) => ({ ...prev, ...patch }));
  }

  const STATUS_COLS = [
    { id: "pendente", label: "Pendente" },
    { id: "aprovado", label: "Aprovado" },
    { id: "recusado", label: "Recusado" },
  ];

  const toCard = useCallback(
    (p: PreLancamento) => ({
      id: p.id,
      columnId: p.status,
      title: p.descricao,
      subtitle: p.solicitante,
      badge: formatBRL(p.valor),
      meta: p.centro.label,
    }),
    []
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Pré-lançamentos"
        description="Kanban | Lista (C19) — despesa com comprovante aguarda revisão."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/financeiro/pagamentos">Pagamentos</Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const r = configurePreLancamentoWhatsAppStub();
                const n = notifyStub(r, "WhatsApp pré-lançamento");
                notify(n.title, n.description);
              }}
            >
              Configurar WhatsApp
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/configuracoes/parametros/integracoes">
                Integrações
              </Link>
            </Button>
            <Button size="sm" onClick={() => { setFormDirty(false); setOpen(true); }}>
              Novo
            </Button>
          </>
        }
      />

      <ProcessBoard
        storageKey="pre-lancamentos"
        columns={STATUS_COLS}
        rows={state.preLancamentos}
        toCard={toCard}
        columnTotals={(_, items) => items.reduce((a, p) => a + p.valor, 0)}
        onMove={(id, to) => {
          const row = state.preLancamentos.find((p) => p.id === id);
          if (!row || row.status !== "pendente") {
            notify("Só pendentes podem mudar de coluna");
            return false;
          }
          if (to === "aprovado") {
            const ok = aprovarPre(id);
            if (ok) notify("Aprovado → lançamento");
            return ok;
          }
          if (to === "recusado") {
            const m = motivo[id]?.trim() || "Recusado no quadro";
            const ok = recusarPre(id, m);
            if (ok) notify("Recusado", m);
            return ok;
          }
          return false;
        }}
        exportName="pre-lancamentos"
        bulkActions={[
          {
            label: "Aprovar seleção",
            onClick: (ids) => {
              const n = aprovarPresLote(ids);
              notify(
                n ? `${n} pré-lançamento(s) aprovados` : "Nenhum pendente"
              );
            },
          },
        ]}
        listColumns={[
          {
            key: "data",
            label: "Data",
            filter: { type: "period" },
            getValue: (p) => p.criadoEm,
            render: (p) => formatDateBR(p.criadoEm),
          },
          {
            key: "desc",
            label: "Descrição",
            filter: { type: "text" },
            getValue: (p) => p.descricao,
          },
          {
            key: "valor",
            label: "Valor",
            filter: { type: "range" },
            getValue: (p) => p.valor,
            render: (p) => formatBRL(p.valor),
          },
          {
            key: "centro",
            label: "Centro",
            filter: { type: "text" },
            getValue: (p) => p.centro.label,
          },
          {
            key: "sol",
            label: "Solicitante",
            filter: { type: "text" },
            getValue: (p) => p.solicitante,
          },
          {
            key: "status",
            label: "Status",
            filter: {
              type: "status",
              options: STATUS_COLS.map((c) => ({
                value: c.id,
                label: c.label,
              })),
            },
            getValue: (p) => p.status,
            render: (p) => (
              <div className="space-y-1">
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
                {p.status === "pendente" ? (
                  <Input
                    className="h-7 w-28"
                    placeholder="Motivo"
                    value={motivo[p.id] ?? ""}
                    onChange={(e) =>
                      setMotivo({ ...motivo, [p.id]: e.target.value })
                    }
                  />
                ) : null}
              </div>
            ),
          },
        ]}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Novo pré-lançamento"
        dirty={formDirty}
        onSubmit={() => {
          if (!form.descricao.trim() || form.valor <= 0) {
            notify("Descrição e valor obrigatórios");
            return;
          }
          addPreLancamento({
            descricao: form.descricao,
            valor: form.valor,
            solicitante: form.solicitante,
            centro: { tipo: "empresa", label: form.centroLabel },
          });
          notify("Pré-lançamento criado");
          setFormDirty(false);
          setOpen(false);
        }}
      >
        <Field label="Descrição *">
          <Input
            value={form.descricao}
            onChange={(e) => patchForm({ descricao: e.target.value })}
          />
        </Field>
        <Field label="Valor *">
          <Input
            type="number"
            value={form.valor}
            onChange={(e) =>
              patchForm({ valor: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Solicitante">
          <SearchSelect
            value={form.solicitante}
            onChange={(solicitante) => patchForm({ solicitante })}
            options={solicitanteOpts}
            placeholder="Selecionar usuário cadastrado…"
          />
        </Field>
        <Field label="Centro de custo">
          <SearchSelect
            value={form.centroLabel}
            onChange={(centroLabel) => patchForm({ centroLabel })}
            options={centroOpts}
            placeholder="Selecionar empresa ou obra…"
          />
        </Field>
      </FormDialog>
    </div>
  );
}

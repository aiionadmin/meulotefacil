"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ModuleHeader, StatusPill } from "@/components/app/ModulePage";
import {
  Field,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { useSystemSettings } from "@/lib/store/system-settings-store";
import type { IndexDef } from "@/lib/domain/system-settings-types";

export default function ConfigIndicesPage() {
  const {
    state,
    indicePadrao,
    updateIndicePadrao,
    upsertIndex,
    removeIndex,
  } = useSystemSettings();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<IndexDef>({
    codigo: "",
    nome: "",
    abreviatura: "",
    correcaoAtraso: false,
    ativo: true,
  });

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Índices"
        description="Índice padrão do sistema, catálogo editável e cotações por competência."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/indices">Cotações</Link>
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setForm({
                  codigo: "",
                  nome: "",
                  abreviatura: "",
                  correcaoAtraso: false,
                  ativo: true,
                });
                setOpen(true);
              }}
            >
              Novo índice
            </Button>
          </>
        }
      />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Índice a usar</CardTitle>
          <CardDescription>
            Padrão em contratos, reajuste anual e correção por atraso.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field label="Índice padrão">
            <select
              className={fieldControlClass}
              value={indicePadrao}
              onChange={(e) => {
                const err = updateIndicePadrao(e.target.value);
                if (err) notify(err);
                else notify("Índice padrão salvo", e.target.value);
              }}
            >
              {state.indices
                .filter((i) => i.ativo)
                .map((i) => (
                  <option key={i.codigo} value={i.codigo}>
                    {i.abreviatura} — {i.nome}
                  </option>
                ))}
            </select>
          </Field>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {state.indices.map((ix) => (
          <Card key={ix.codigo}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium">
                  {ix.abreviatura}{" "}
                  <span className="text-muted-foreground">({ix.codigo})</span>
                </p>
                <p className="text-sm text-muted-foreground">{ix.nome}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {ix.codigo === indicePadrao ? (
                  <StatusPill tone="ok">Padrão</StatusPill>
                ) : null}
                {ix.correcaoAtraso ? (
                  <StatusPill tone="info">Correção atraso</StatusPill>
                ) : null}
                <StatusPill tone={ix.ativo ? "ok" : "neutral"}>
                  {ix.ativo ? "Ativo" : "Inativo"}
                </StatusPill>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setForm(ix);
                    setOpen(true);
                  }}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const err = removeIndex(ix.codigo);
                    if (err) notify(err);
                    else notify("Índice removido", ix.codigo);
                  }}
                >
                  Remover
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={form.codigo ? `Editar ${form.codigo}` : "Novo índice"}
        onSubmit={() => {
          const err = upsertIndex({
            ...form,
            codigo: form.codigo.trim().toUpperCase(),
            abreviatura: form.abreviatura.trim() || form.codigo.trim().toUpperCase(),
          });
          if (err) {
            notify(err);
            return;
          }
          notify("Índice salvo", form.codigo.toUpperCase());
          setOpen(false);
        }}
      >
        <Field label="Código">
          <Input
            value={form.codigo}
            onChange={(e) =>
              setForm({ ...form, codigo: e.target.value.toUpperCase() })
            }
            placeholder="IGPM"
          />
        </Field>
        <Field label="Nome">
          <Input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
        </Field>
        <Field label="Abreviatura">
          <Input
            value={form.abreviatura}
            onChange={(e) =>
              setForm({ ...form, abreviatura: e.target.value })
            }
          />
        </Field>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Usar na correção por atraso</span>
          <Switch
            checked={form.correcaoAtraso}
            onCheckedChange={(v) => setForm({ ...form, correcaoAtraso: v })}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Ativo</span>
          <Switch
            checked={form.ativo}
            onCheckedChange={(v) => setForm({ ...form, ativo: v })}
          />
        </label>
      </FormDialog>
    </div>
  );
}

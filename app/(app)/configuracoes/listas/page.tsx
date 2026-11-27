"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleHeader, StatusPill } from "@/components/app/ModulePage";
import {
  Field,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { useFase1 } from "@/lib/store/fase1-store";
import { useNovoParam } from "@/lib/ui/use-novo-param";

export default function ListasPage() {
  const { state, toggleLookupItem, addLookupItem, can } = useFase1();
  const canEdit = can("cadastros.listas", "inserirAlterar");
  const [open, setOpen] = useNovoParam();
  const [listId, setListId] = useState(state.lookups[0]?.id ?? "");
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Listas de apoio"
        description="J04 — motivos de perda, tipos de demanda/obra, unidades, retenções, bases de insumos/composições, solicitantes, condições de pagamento, segmentos, fontes/setores e tags."
        actions={
          canEdit ? (
            <Button
              size="sm"
              onClick={() => {
                setListId(state.lookups[0]?.id ?? "");
                setOpen(true);
              }}
            >
              Novo item
            </Button>
          ) : null
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        {state.lookups.map((list) => (
          <Card key={list.id}>
            <CardHeader>
              <CardTitle className="text-base">{list.nome}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {list.itens.map((item) => (
                <div
                  key={item.codigo}
                  className="flex items-center justify-between gap-2 border-b border-linha/50 py-2 text-sm last:border-0"
                >
                  <div>
                    <p className="font-medium text-ink">
                      {item.codigo} · {item.nome}
                    </p>
                    <StatusPill tone={item.ativo ? "ok" : "warn"}>
                      {item.ativo ? "Ativo" : "Inativo"}
                    </StatusPill>
                  </div>
                  {canEdit ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        toggleLookupItem(list.id, item.codigo);
                        notify("Item atualizado", item.nome);
                      }}
                    >
                      Alternar
                    </Button>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Novo item de lista"
        onSubmit={() => {
          if (!listId) {
            notify("Selecione a lista");
            return;
          }
          const ok = addLookupItem(listId, { codigo, nome });
          if (!ok) {
            notify("Não foi possível incluir", "Código duplicado ou inválido");
            return;
          }
          notify("Item incluído", nome);
          setCodigo("");
          setNome("");
          setOpen(false);
        }}
      >
        <Field label="Lista">
          <select
            className={fieldControlClass}
            value={listId}
            onChange={(e) => setListId(e.target.value)}
          >
            {state.lookups.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Código">
          <Input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="ex.: motivo_preco"
          />
        </Field>
        <Field label="Nome">
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Rótulo exibido"
          />
        </Field>
      </FormDialog>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModuleHeader, StatusPill } from "@/components/app/ModulePage";
import { PaginatedTable } from "@/components/app/PaginatedTable";
import {
  Field,
  FilterBar,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { formatBRL } from "@/lib/masks/br";
import { useObras } from "@/lib/store/obras-store";
import type { InsumoGrupo } from "@/lib/domain/obras-types";
import { Star } from "lucide-react";
import { useNovoParam } from "@/lib/ui/use-novo-param";

export default function InsumosPage() {
  const { state, addInsumo, toggleInsumoFavorito } = useObras();
  const [q, setQ] = useState("");
  const [grupo, setGrupo] = useState("todos");
  const [open, setOpen] = useNovoParam();
  const [formDirty, setFormDirty] = useState(false);
  const [form, setForm] = useState({
    codigo: "",
    descricao: "",
    grupo: "material" as InsumoGrupo,
    unidade: "un",
    base: "SINAPI",
    custoUnitario: 0,
  });

  function patchForm(patch: Partial<typeof form>) {
    setFormDirty(true);
    setForm((prev) => ({ ...prev, ...patch }));
  }

  const filtered = useMemo(() => {
    let list = state.insumos.filter((i) => i.ativo);
    if (grupo !== "todos") list = list.filter((i) => i.grupo === grupo);
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((i) =>
        [i.codigo, i.descricao, i.base, i.grupo]
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }
    return list;
  }, [state.insumos, q, grupo]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Insumos"
        description="Catálogo — material, mão de obra, equipamento e outros."
        actions={
          <Button size="sm" onClick={() => { setFormDirty(false); setOpen(true); }}>
            Novo insumo
          </Button>
        }
      />
      <FilterBar value={q} onChange={setQ} placeholder="Buscar código ou descrição…">
        <select
          className={fieldControlClass + " max-w-[180px]"}
          value={grupo}
          onChange={(e) => setGrupo(e.target.value)}
        >
          <option value="todos">Todos grupos</option>
          <option value="material">Material</option>
          <option value="mao_de_obra">Mão de obra</option>
          <option value="equipamento">Equipamento</option>
          <option value="outros">Outros</option>
        </select>
      </FilterBar>
      <PaginatedTable
        columns={[
          { key: "fav", label: "" },
          { key: "codigo", label: "Código" },
          { key: "desc", label: "Descrição" },
          { key: "grupo", label: "Grupo" },
          { key: "un", label: "Un." },
          { key: "base", label: "Base" },
          { key: "custo", label: "Custo" },
        ]}
        rows={filtered.map((i) => ({
          fav: (
            <button
              type="button"
              aria-label="Favorito"
              onClick={() => toggleInsumoFavorito(i.id)}
            >
              <Star
                className={
                  i.favorito
                    ? "size-4 fill-amber-500 text-amber-500"
                    : "size-4 text-muted-foreground"
                }
              />
            </button>
          ),
          codigo: i.codigo,
          desc: i.descricao,
          grupo: <StatusPill tone="neutral">{i.grupo.replace(/_/g, " ")}</StatusPill>,
          un: i.unidade,
          base: i.base,
          custo: formatBRL(i.custoUnitario),
        }))}
      />
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Novo insumo"
        dirty={formDirty}
        onSubmit={() => {
          if (!form.codigo || !form.descricao || !form.unidade) {
            notify("Código, descrição e unidade obrigatórios");
            return;
          }
          addInsumo({
            ...form,
            favorito: false,
            ativo: true,
          });
          notify("Insumo criado");
          setFormDirty(false);
          setOpen(false);
        }}
      >
        <Field label="Código *">
          <Input
            value={form.codigo}
            onChange={(e) => patchForm({ codigo: e.target.value })}
          />
        </Field>
        <Field label="Descrição *">
          <Input
            value={form.descricao}
            onChange={(e) => patchForm({ descricao: e.target.value })}
          />
        </Field>
        <Field label="Grupo">
          <select
            className={fieldControlClass}
            value={form.grupo}
            onChange={(e) =>
              patchForm({ grupo: e.target.value as InsumoGrupo })
            }
          >
            <option value="material">Material</option>
            <option value="mao_de_obra">Mão de obra</option>
            <option value="equipamento">Equipamento</option>
            <option value="outros">Outros</option>
          </select>
        </Field>
        <Field label="Unidade *">
          <Input
            value={form.unidade}
            onChange={(e) => patchForm({ unidade: e.target.value })}
          />
        </Field>
        <Field label="Base *">
          <Input
            value={form.base}
            onChange={(e) => patchForm({ base: e.target.value })}
          />
        </Field>
        <Field label="Custo unitário">
          <Input
            type="number"
            value={form.custoUnitario}
            onChange={(e) =>
              patchForm({ custoUnitario: Number(e.target.value) || 0,
              })
            }
          />
        </Field>
      </FormDialog>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import { filterObrasVisiveis } from "@/lib/obras/visibilidade";
import { useFase1 } from "@/lib/store/fase1-store";
import { useObras } from "@/lib/store/obras-store";
import { BoardViews } from "@/components/kanban/BoardViews";
import type {
  Obra,
  ObraStatus,
  PropostaStatus,
} from "@/lib/domain/obras-types";
import { useNovoParam } from "@/lib/ui/use-novo-param";
import { custoLinha } from "@/lib/money/orcamento";
import { SearchSelect } from "@/components/app/SearchSelect";
import { peopleOptions } from "@/lib/ui/people-options";

const FUNIL: { id: PropostaStatus; label: string }[] = [
  { id: "contato_inicial", label: "Contato inicial" },
  { id: "em_elaboracao", label: "Em elaboração" },
  { id: "em_revisao", label: "Em revisão" },
  { id: "enviada", label: "Enviada" },
  { id: "aprovada", label: "Aprovada" },
  { id: "perdida", label: "Perdida" },
];

const STATUS_OBRA: { value: ObraStatus; label: string }[] = [
  { value: "em_orcamento", label: "Em orçamento" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "paralisada", label: "Paralisada" },
  { value: "finalizada", label: "Finalizada" },
];

const EMPTY_FORM = {
  codigo: "",
  nome: "",
  clienteNome: "",
  tipo: "infraestrutura",
  status: "em_orcamento" as ObraStatus,
  propostaStatus: "em_elaboracao" as PropostaStatus,
  bdiPct: 25,
  responsavelObra: "",
  itemCodigo: "1.1",
  itemDescricao: "",
  itemUnidade: "un",
  itemQtd: 1,
  itemCusto: 0,
};

type FormState = typeof EMPTY_FORM;

export default function OrcamentosPage() {
  const {
    state,
    totaisDaObra,
    nodesDaObra,
    updateObra,
    softRemoveObra,
    addNode,
    updateNode,
    removeNode,
  } = useObras();
  const {
    currentUser,
    currentProfileName: perfilNome,
    state: fase1,
  } = useFase1();
  const [q, setQ] = useState("");
  const [view, setView] = useState<"lista" | "funil">("lista");
  const [openNovo, setOpenNovo] = useNovoParam();
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formDirty, setFormDirty] = useState(false);
  const [novaObraId, setNovaObraId] = useState("");
  const [itemDraft, setItemDraft] = useState({
    codigo: "",
    descricao: "",
    unidade: "un",
    quantidade: 1,
    custoUnit: 0,
  });

  function patchForm(patch: Partial<FormState>) {
    setFormDirty(true);
    setForm((prev) => ({ ...prev, ...patch }));
  }

  const clienteOpts = useMemo(
    () => peopleOptions(fase1.people, ["cliente", "comprador"]),
    [fase1.people]
  );

  const obrasFinanceiras = useMemo(() => {
    return filterObrasVisiveis(state.obras, currentUser, perfilNome).filter(
      (o) => !o.finalidade || o.finalidade === "financeiro" || o.finalidade === "ambos"
    );
  }, [state.obras, currentUser, perfilNome]);

  const obraOptsNovo = useMemo(
    () =>
      obrasFinanceiras.map((o) => ({
        value: o.id,
        label: `${o.codigo} · ${o.nome}`,
        meta: o.clienteNome,
      })),
    [obrasFinanceiras]
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return obrasFinanceiras;
    return obrasFinanceiras.filter((o) =>
      [o.codigo, o.nome, o.clienteNome, o.status]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [obrasFinanceiras, q]);

  const editing = editId
    ? state.obras.find((o) => o.id === editId) ?? null
    : null;
  const editNodes = editId ? nodesDaObra(editId) : [];

  function openCreate() {
    setForm(EMPTY_FORM);
    setNovaObraId(obrasFinanceiras[0]?.id ?? "");
    setFormDirty(false);
    setOpenNovo(true);
  }

  function openEdit(o: Obra) {
    setEditId(o.id);
    setForm({
      codigo: o.codigo,
      nome: o.nome,
      clienteNome: o.clienteNome,
      tipo: o.tipo,
      status: o.status,
      propostaStatus: o.propostaStatus ?? "em_elaboracao",
      bdiPct: Math.round((o.bdiPct ?? 0.25) * 10000) / 100,
      responsavelObra: o.responsavelObra ?? "",
      itemCodigo: "1.1",
      itemDescricao: "",
      itemUnidade: "un",
      itemQtd: 1,
      itemCusto: 0,
    });
    setItemDraft({
      codigo: "",
      descricao: "",
      unidade: "un",
      quantidade: 1,
      custoUnit: 0,
    });
    setFormDirty(false);
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Orçamento"
        description="Orçamentos das obras financeiras — selecione a obra cadastrada, itens, BDI e funil."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={view === "lista" ? "default" : "outline"}
              onClick={() => setView("lista")}
            >
              Lista de Orçamentos
            </Button>
            <Button
              size="sm"
              variant={view === "funil" ? "default" : "outline"}
              onClick={() => setView("funil")}
            >
              Funil de Vendas
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/obras">Minhas Obras</Link>
            </Button>
            <Button size="sm" onClick={openCreate}>
              Novo orçamento
            </Button>
          </div>
        }
      />

      <FilterBar value={q} onChange={setQ} placeholder="Pesquisar obra ou cliente…" />

      {view === "lista" ? (
        <PaginatedTable
          columns={[
            { key: "cod", label: "Código" },
            { key: "obra", label: "Obra" },
            { key: "cli", label: "Cliente" },
            { key: "stObra", label: "Status obra" },
            { key: "stProp", label: "Status proposta" },
            { key: "itens", label: "Itens" },
            { key: "custo", label: "Custo" },
            { key: "preco", label: "Preço" },
            { key: "acao", label: "" },
          ]}
          rows={filtered.map((o) => {
            const tot = totaisDaObra(o.id);
            const nItens = nodesDaObra(o.id).filter((n) => n.kind === "item")
              .length;
            return {
              cod: o.codigo,
              obra: o.nome,
              cli: o.clienteNome,
              stObra: (
                <StatusPill tone="info">
                  {STATUS_OBRA.find((s) => s.value === o.status)?.label ??
                    o.status}
                </StatusPill>
              ),
              stProp: (
                <StatusPill tone="warn">
                  {(o.propostaStatus ?? "em_elaboracao").replace(/_/g, " ")}
                </StatusPill>
              ),
              itens: nItens,
              custo: formatBRL(tot.custo || o.orcado),
              preco: formatBRL(tot.preco),
              acao: (
                <div className="flex flex-wrap gap-1">
                  <Button size="sm" variant="outline" onClick={() => openEdit(o)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/obras/${o.id}`}>Abrir</Link>
                  </Button>
                </div>
              ),
            };
          })}
        />
      ) : (
        <BoardViews
          storageKey="obras-funil-propostas"
          columns={FUNIL}
          cards={filtered.map((o) => {
            const tot = totaisDaObra(o.id);
            return {
              id: o.id,
              columnId: o.propostaStatus ?? "em_elaboracao",
              title: o.nome,
              subtitle: o.clienteNome,
              badge: formatBRL(tot.preco || o.orcado),
              meta: o.responsavelObra,
            };
          })}
          onMove={(id, to) => {
            updateObra(id, { propostaStatus: to as PropostaStatus });
            return true;
          }}
          onOpen={(id) => {
            const o = state.obras.find((x) => x.id === id);
            if (o) openEdit(o);
          }}
        />
      )}

      <FormDialog
        open={openNovo}
        onOpenChange={setOpenNovo}
        title="Novo orçamento"
        dirty={formDirty}
        submitLabel="Abrir orçamento"
        onSubmit={() => {
          const obra = obrasFinanceiras.find((o) => o.id === novaObraId);
          if (!obra) {
            notify("Selecione uma obra financeira cadastrada");
            return;
          }
          if (form.itemDescricao.trim()) {
            const nodes = nodesDaObra(obra.id);
            addNode({
              obraId: obra.id,
              kind: "item",
              codigo: form.itemCodigo.trim() || "1.1",
              descricao: form.itemDescricao.trim(),
              unidade: form.itemUnidade || "un",
              quantidade: form.itemQtd || 1,
              custoUnit: form.itemCusto || 0,
              bdiPct: obra.bdiPct,
              ordem: nodes.length + 1,
            });
          }
          setFormDirty(false);
          setOpenNovo(false);
          openEdit(obra);
          notify("Orçamento da obra", obra.codigo);
        }}
      >
        <Field label="Obra *">
          <SearchSelect
            value={novaObraId}
            onChange={(id) => {
              setNovaObraId(id);
              setFormDirty(true);
            }}
            options={obraOptsNovo}
            placeholder="Selecionar obra financeira…"
          />
          {obraOptsNovo.length === 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Nenhuma obra financeira.{" "}
              <Link className="underline" href="/obras?novo=1">
                Cadastrar obra
              </Link>{" "}
              com finalidade Financeiro ou Ambos.
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              Cadastre obras em{" "}
              <Link className="underline" href="/obras">
                Minhas Obras
              </Link>
              .
            </p>
          )}
        </Field>
        <div className="rounded-md border border-linha/70 p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Primeiro item (opcional)
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Código">
              <Input
                value={form.itemCodigo}
                onChange={(e) => patchForm({ itemCodigo: e.target.value })}
              />
            </Field>
            <Field label="Unidade">
              <Input
                value={form.itemUnidade}
                onChange={(e) => patchForm({ itemUnidade: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Descrição">
            <Input
              value={form.itemDescricao}
              onChange={(e) => patchForm({ itemDescricao: e.target.value })}
              placeholder="Ex.: Terraplenagem"
            />
          </Field>
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Quantidade">
              <Input
                type="number"
                value={form.itemQtd}
                onChange={(e) =>
                  patchForm({ itemQtd: Number(e.target.value) || 0 })
                }
              />
            </Field>
            <Field label="Custo unitário">
              <Input
                type="number"
                value={form.itemCusto || ""}
                onChange={(e) =>
                  patchForm({ itemCusto: Number(e.target.value) || 0 })
                }
              />
            </Field>
          </div>
        </div>
      </FormDialog>

      <FormDialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditId(null);
        }}
        title={editing ? `Editar orçamento · ${editing.codigo}` : "Editar"}
        dirty={formDirty}
        onSubmit={() => {
          if (!editing) return;
          if (!form.codigo.trim() || !form.nome.trim() || !form.clienteNome.trim()) {
            notify("Código, obra e cliente são obrigatórios");
            return;
          }
          updateObra(editing.id, {
            codigo: form.codigo.trim(),
            nome: form.nome.trim(),
            clienteNome: form.clienteNome.trim(),
            tipo: form.tipo,
            status: form.status,
            propostaStatus: form.propostaStatus,
            bdiPct: Math.max(0, form.bdiPct) / 100,
            responsavelObra: form.responsavelObra.trim() || undefined,
          });
          notify("Orçamento atualizado", form.codigo);
          setFormDirty(false);
          setEditId(null);
        }}
      >
        {editing ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Código *">
                <Input
                  value={form.codigo}
                  onChange={(e) => patchForm({ codigo: e.target.value })}
                />
              </Field>
              <Field label="Cliente *">
                <SearchSelect
                  value={form.clienteNome}
                  onChange={(clienteNome) => patchForm({ clienteNome })}
                  options={clienteOpts}
                  placeholder="Selecionar cliente cadastrado…"
                />
              </Field>
            </div>
            <Field label="Obra / título *">
              <Input
                value={form.nome}
                onChange={(e) => patchForm({ nome: e.target.value })}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Status da obra">
                <select
                  className={fieldControlClass}
                  value={form.status}
                  onChange={(e) =>
                    patchForm({ status: e.target.value as ObraStatus })
                  }
                >
                  {STATUS_OBRA.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status da proposta">
                <select
                  className={fieldControlClass}
                  value={form.propostaStatus}
                  onChange={(e) =>
                    patchForm({
                      propostaStatus: e.target.value as PropostaStatus,
                    })
                  }
                >
                  {FUNIL.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="BDI (%)">
                <Input
                  type="number"
                  value={form.bdiPct}
                  onChange={(e) =>
                    patchForm({ bdiPct: Number(e.target.value) || 0 })
                  }
                />
              </Field>
              <Field label="Responsável">
                <Input
                  value={form.responsavelObra}
                  onChange={(e) =>
                    patchForm({ responsavelObra: e.target.value })
                  }
                />
              </Field>
            </div>

            <div className="space-y-2 rounded-md border border-linha/70 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Itens do orçamento</p>
                <span className="text-xs text-muted-foreground">
                  {editNodes.filter((n) => n.kind === "item").length} item(ns)
                </span>
              </div>
              <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
                {editNodes.length === 0 ? (
                  <li className="text-muted-foreground">Nenhum item ainda.</li>
                ) : (
                  editNodes.map((n) => (
                    <li
                      key={n.id}
                      className="flex flex-wrap items-center justify-between gap-2 border-b border-linha/50 pb-2 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">
                          {n.codigo} · {n.descricao}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {n.kind}
                          {n.kind === "item"
                            ? ` · ${n.quantidade} ${n.unidade} · ${formatBRL(n.orcado)}`
                            : ""}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {n.kind === "item" ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const qtd = window.prompt(
                                "Quantidade",
                                String(n.quantidade)
                              );
                              if (qtd == null) return;
                              const custo = window.prompt(
                                "Custo unitário",
                                String(n.custoUnit)
                              );
                              if (custo == null) return;
                              updateNode(n.id, {
                                quantidade: Number(qtd) || 0,
                                custoUnit: Number(custo) || 0,
                              });
                              notify("Item atualizado");
                            }}
                          >
                            Ajustar
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (
                              !window.confirm(
                                `Remover ${n.codigo} · ${n.descricao}?`
                              )
                            ) {
                              return;
                            }
                            removeNode(n.id);
                            notify("Item removido");
                          }}
                        >
                          Remover
                        </Button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
              <div className="grid gap-2 border-t border-linha/60 pt-3 sm:grid-cols-2">
                <Field label="Código">
                  <Input
                    value={itemDraft.codigo}
                    onChange={(e) =>
                      setItemDraft((d) => ({ ...d, codigo: e.target.value }))
                    }
                    placeholder="1.2"
                  />
                </Field>
                <Field label="Unidade">
                  <Input
                    value={itemDraft.unidade}
                    onChange={(e) =>
                      setItemDraft((d) => ({ ...d, unidade: e.target.value }))
                    }
                  />
                </Field>
              </div>
              <Field label="Descrição do item">
                <Input
                  value={itemDraft.descricao}
                  onChange={(e) =>
                    setItemDraft((d) => ({ ...d, descricao: e.target.value }))
                  }
                />
              </Field>
              <div className="grid gap-2 sm:grid-cols-3">
                <Field label="Qtd">
                  <Input
                    type="number"
                    value={itemDraft.quantidade}
                    onChange={(e) =>
                      setItemDraft((d) => ({
                        ...d,
                        quantidade: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </Field>
                <Field label="Custo un.">
                  <Input
                    type="number"
                    value={itemDraft.custoUnit || ""}
                    onChange={(e) =>
                      setItemDraft((d) => ({
                        ...d,
                        custoUnit: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </Field>
                <div className="flex items-end">
                  <Button
                    type="button"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (!itemDraft.descricao.trim()) {
                        notify("Informe a descrição do item");
                        return;
                      }
                      addNode({
                        obraId: editing.id,
                        kind: "item",
                        codigo: itemDraft.codigo.trim() || `i-${editNodes.length + 1}`,
                        descricao: itemDraft.descricao.trim(),
                        unidade: itemDraft.unidade || "un",
                        quantidade: itemDraft.quantidade || 1,
                        custoUnit: itemDraft.custoUnit || 0,
                        bdiPct: editing.bdiPct,
                        ordem: editNodes.length + 1,
                      });
                      setItemDraft({
                        codigo: "",
                        descricao: "",
                        unidade: "un",
                        quantidade: 1,
                        custoUnit: 0,
                      });
                      notify(
                        "Item adicionado",
                        formatBRL(
                          custoLinha({
                            quantidade: itemDraft.quantidade || 1,
                            custoUnit: itemDraft.custoUnit || 0,
                          })
                        )
                      );
                    }}
                  >
                    + Item
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-linha/60 pt-3">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/obras/${editing.id}`}>Abrir obra</Link>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (
                    !window.confirm(
                      `Excluir o orçamento ${editing.codigo}? Esta ação remove a obra e seus itens.`
                    )
                  ) {
                    return;
                  }
                  softRemoveObra(editing.id);
                  notify("Orçamento excluído", editing.codigo);
                  setEditId(null);
                }}
              >
                Excluir orçamento
              </Button>
            </div>
          </>
        ) : null}
      </FormDialog>
    </div>
  );
}

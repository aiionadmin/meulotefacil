"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  StatusPill,
  ModuleSection,
} from "@/components/app/ModulePage";
import { PaginatedTable } from "@/components/app/PaginatedTable";
import {
  DetailRow,
  DetailSheet,
  AttachDropZone,
  Field,
  FilterBar,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { SearchSelect } from "@/components/app/SearchSelect";
import { canApprove } from "@/lib/alcadas/check";
import { scTimelineFromSolicitacao } from "@/lib/compras/sc-timeline";
import { formatDateBR } from "@/lib/masks/br";
import { filterObrasVisiveis } from "@/lib/obras/visibilidade";
import { useCompras } from "@/lib/store/compras-store";
import { useObras } from "@/lib/store/obras-store";
import { useFase1 } from "@/lib/store/fase1-store";
import type { CentroCusto, ScStatus, Solicitacao } from "@/lib/domain/compras-types";
import { useNovoParam } from "@/lib/ui/use-novo-param";

const TABS: { id: "todas" | ScStatus; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "rascunho", label: "Rascunho" },
  { id: "em_aprovacao", label: "Em aprovação" },
  { id: "a_atender", label: "A atender" },
  { id: "em_andamento", label: "Em andamento" },
  { id: "concluida", label: "Concluída" },
  { id: "recusada", label: "Recusada" },
];

type ItemDraft = { descricao: string; unidade: string; quantidade: number };

export default function ComprasSolicitacoesPage() {
  const {
    state,
    contadores,
    addSolicitacao,
    enviarSolicitacao,
    aprovarSolicitacao,
    recusarSolicitacao,
    marcarRecebimento,
    addComentarioSc,
    addArquivoSc,
    setPrevisaoEntregaSc,
    criarCotacaoDeSc,
  } = useCompras();
  const { state: obras } = useObras();
  const { currentUser, state: f1, currentProfileName: perfilNome } = useFase1();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("todas");
  const [open, setOpen] = useNovoParam();
  const [formDirty, setFormDirty] = useState(false);
  const [selected, setSelected] = useState<Solicitacao | null>(null);
  const [motivo, setMotivo] = useState("");
  const [comentario, setComentario] = useState("");
  const [form, setForm] = useState({
    descricao: "",
    centroKey: "",
    necessidade: new Date().toISOString().slice(0, 10),
    urgente: false,
    solicitante: "Admin Demo",
    itens: [
      { descricao: "Item 1", unidade: "un", quantidade: 1 },
    ] as ItemDraft[],
  });

  function patchForm(patch: Partial<typeof form>) {
    setFormDirty(true);
    setForm((prev) => ({ ...prev, ...patch }));
  }

  const centros = useMemo(() => {
    const visiveis = filterObrasVisiveis(obras.obras, currentUser, perfilNome);
    const list: { key: string; centro: CentroCusto }[] = visiveis.map(
      (o) => ({
        key: `obra:${o.id}`,
        centro: { tipo: "obra", obraId: o.id, label: o.nome },
      })
    );
    list.push({
      key: "empresa",
      centro: { tipo: "empresa", label: "Meu Lote Fácil" },
    });
    return list;
  }, [obras.obras, currentUser, perfilNome]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { todas: state.solicitacoes.length };
    for (const t of TABS) {
      if (t.id === "todas") continue;
      map[t.id] = state.solicitacoes.filter((s) => s.status === t.id).length;
    }
    return map;
  }, [state.solicitacoes]);

  const filtered = useMemo(() => {
    let list = state.solicitacoes;
    if (tab !== "todas") list = list.filter((s) => s.status === tab);
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((s) =>
        [s.numero, s.descricao, s.centro.label, s.solicitante]
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }
    return list;
  }, [state.solicitacoes, tab, q]);

  const cotNumero = (ids: string[]) =>
    ids
      .map((id) => state.cotacoes.find((c) => c.id === id)?.numero)
      .filter(Boolean)
      .join(", ") || "—";
  const ocNumero = (ids: string[]) =>
    ids
      .map((id) => state.ordens.find((o) => o.id === id)?.numero)
      .filter(Boolean)
      .join(", ") || "—";

  const live = selected
    ? state.solicitacoes.find((s) => s.id === selected.id) ?? selected
    : null;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Solicitação"
        description="Centro de custo obrigatório (Obra ou Empresa). Fluxo: Solicitação → Cotação → Ordem de Compra."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/compras/cotacoes">Cotação</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/compras/ordens">Ordem de Compra</Link>
            </Button>
            <Button size="sm" onClick={() => setOpen(true)}>
              Nova Solicitação
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Solicitações", value: state.solicitacoes.length },
          {
            label: "Em aprovação",
            value: counts.em_aprovacao ?? 0,
          },
          { label: "Cotações", value: state.cotacoes.length },
          { label: "Ordens", value: state.ordens.length },
        ]}
      />

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              tab === t.id
                ? "bg-brand-green text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} ({counts[t.id] ?? 0})
          </button>
        ))}
      </div>

      <FilterBar
        value={q}
        onChange={setQ}
        placeholder="Buscar SC, descrição, centro…"
      />

      <ModuleSection title="Lista">
        <PaginatedTable
          columns={[
            { key: "numero", label: "Nº" },
            { key: "status", label: "Status" },
            { key: "desc", label: "Descrição" },
            { key: "sol", label: "Solicitante" },
            { key: "nec", label: "Necessidade" },
            { key: "centro", label: "Centro" },
            { key: "cot", label: "Cotados" },
            { key: "comp", label: "Comprados" },
            { key: "rec", label: "Recebidos" },
            { key: "vinc", label: "Vínculos" },
          ]}
          rows={filtered.map((s) => {
            const c = contadores(s.itens);
            return {
              numero: (
                <button
                  type="button"
                  className="font-medium hover:text-brand-orange"
                  onClick={() => setSelected(s)}
                >
                  {s.numero}
                </button>
              ),
              status: (
                <StatusPill tone="info">
                  {s.status.replace(/_/g, " ")}
                </StatusPill>
              ),
              desc: (
                <span>
                  {s.descricao}
                  {s.urgente ? (
                    <StatusPill tone="danger"> urgente</StatusPill>
                  ) : null}
                </span>
              ),
              sol: `${s.solicitante} · ${formatDateBR(s.criadoEm)}`,
              nec: formatDateBR(s.necessidade),
              centro: s.centro.label,
              cot: c.cotados,
              comp: c.comprados,
              rec: c.recebidos,
              vinc: (
                <span className="text-xs">
                  {cotNumero(s.cotacaoIds)} / {ocNumero(s.ordemIds)}
                </span>
              ),
            };
          })}
        />
      </ModuleSection>

      <DetailSheet
        open={!!live}
        onOpenChange={(o) => {
          if (!o) {
            setSelected(null);
            setMotivo("");
          }
        }}
        title={live?.numero ?? ""}
      >
        {live ? (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-1">
              {scTimelineFromSolicitacao(live).map((p) => (
                <div
                  key={p.id}
                  className={`rounded-md border px-1.5 py-2 text-center text-[10px] leading-tight ${
                    p.current
                      ? "border-brand-orange bg-brand-orange/10 font-semibold text-brand-orange"
                      : p.done
                        ? "border-brand-green/40 bg-brand-green/5 text-brand-green"
                        : "border-border text-muted-foreground"
                  }`}
                >
                  <div>{p.label}</div>
                  {p.autor || p.quando ? (
                    <div className="mt-0.5 font-normal opacity-80">
                      {[p.autor, p.quando ? formatDateBR(p.quando) : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <DetailRow label="Descrição" value={live.descricao} />
            <DetailRow label="Centro" value={live.centro.label} />
            <DetailRow label="Solicitante" value={live.solicitante} />
            <DetailRow
              label="Necessidade"
              value={formatDateBR(live.necessidade)}
            />
            <DetailRow label="Status" value={live.status} />
            {live.motivoRecusa ? (
              <DetailRow label="Motivo recusa" value={live.motivoRecusa} />
            ) : null}
            <Field label="Previsão de entrega">
              <Input
                type="date"
                value={live.previsaoEntrega ?? ""}
                onChange={(e) => {
                  setPrevisaoEntregaSc(live.id, e.target.value);
                  notify("Previsão atualizada");
                }}
              />
            </Field>
            <div className="text-sm font-medium">Itens</div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {live.itens.map((it) => (
                <li key={it.id}>
                  {it.descricao} · {it.quantidade} {it.unidade} ·{" "}
                  {it.status} · recebido {it.quantidadeRecebida}/
                  {it.quantidade}
                  {live.status === "em_andamento" ||
                  live.status === "a_atender" ||
                  live.ordemIds.length > 0 ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-2 h-7"
                      onClick={() => {
                        marcarRecebimento(live.id, it.id, 1);
                        notify("Recebimento marcado");
                      }}
                    >
                      +1 receb.
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t pt-3">
              <div className="text-sm font-medium">Comentários</div>
              <ul className="max-h-28 space-y-1 overflow-y-auto text-xs text-muted-foreground">
                {(live.comentarios ?? []).length === 0 ? (
                  <li>Nenhum comentário.</li>
                ) : (
                  (live.comentarios ?? []).map((c) => (
                    <li key={c.id}>
                      <span className="font-medium text-foreground">
                        {c.autor}
                      </span>
                      : {c.texto}
                    </li>
                  ))
                )}
              </ul>
              <div className="flex gap-2">
                <Input
                  placeholder="Novo comentário"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!addComentarioSc(live.id, comentario)) {
                      notify("Informe o comentário");
                      return;
                    }
                    setComentario("");
                    notify("Comentário adicionado");
                  }}
                >
                  +
                </Button>
              </div>
              <div className="text-sm font-medium pt-1">Arquivos</div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {(live.arquivos ?? []).length === 0 ? (
                  <li>Nenhum arquivo.</li>
                ) : (
                  (live.arquivos ?? []).map((a) => (
                    <li key={a.id}>{a.nome}</li>
                  ))
                )}
              </ul>
              <AttachDropZone
                onFiles={(files) => {
                  for (const f of files) {
                    if (!addArquivoSc(live.id, f.name)) {
                      notify("Falha ao anexar", f.name);
                      return;
                    }
                  }
                  notify(
                    files.length === 1
                      ? "Arquivo anexado"
                      : `${files.length} arquivos anexados`
                  );
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {live.status === "rascunho" ? (
                <Button
                  size="sm"
                  onClick={() => {
                    if (!enviarSolicitacao(live.id)) {
                      notify("Centro de custo obrigatório");
                      return;
                    }
                    notify("Enviada para aprovação");
                    setSelected(null);
                  }}
                >
                  Enviar
                </Button>
              ) : null}
              {live.status === "em_aprovacao" ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => {
                      const valorSc = live.itens.reduce(
                        (a, it) => a + it.quantidade * 100,
                        0
                      );
                      const gate = canApprove({
                        rules: f1.approvalRules,
                        tipo: "Solicitação de compra",
                        valor: valorSc,
                        perfilNome,
                        centroTipo: live.centro.tipo,
                      });
                      if (!gate.ok) {
                        notify("Alçada insuficiente", gate.reason);
                        return;
                      }
                      aprovarSolicitacao(live.id);
                      notify("Aprovada");
                      setSelected(null);
                    }}
                  >
                    Aprovar
                  </Button>
                  <Input
                    placeholder="Motivo da recusa"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    className="max-w-[200px]"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!recusarSolicitacao(live.id, motivo)) {
                        notify("Informe o motivo");
                        return;
                      }
                      notify("Recusada");
                      setSelected(null);
                      setMotivo("");
                    }}
                  >
                    Recusar
                  </Button>
                </>
              ) : null}
              {live.status === "a_atender" || live.status === "em_andamento" ? (
                <Button
                  size="sm"
                  onClick={() => {
                    const cot = criarCotacaoDeSc(live.id, [
                      {
                        fornecedor: "Distribuidora Sul",
                        email: "ana@sul.demo",
                      },
                      {
                        fornecedor: "Materiais Campinas",
                        email: "bruno@camp.demo",
                      },
                      { fornecedor: "ConstruMax", email: "carla@max.demo" },
                    ]);
                    if (!cot) {
                      notify("Não foi possível criar cotação");
                      return;
                    }
                    notify(`Cotação ${cot.numero} criada`);
                    setSelected(null);
                  }}
                >
                  Gerar cotação (3 forn.)
                </Button>
              ) : null}
              <Button size="sm" variant="outline" asChild>
                <Link href="/compras/cotacoes">Ver cotações</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </DetailSheet>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Nova solicitação de compra"
        dirty={formDirty}
        onSubmit={() => {
          if (!form.descricao.trim()) {
            notify("Informe a descrição");
            return;
          }
          const centro = centros.find((c) => c.key === form.centroKey)?.centro;
          if (!centro?.label) {
            notify("Centro de custo é obrigatório");
            return;
          }
          const itens = form.itens.filter((i) => i.descricao.trim());
          if (!itens.length) {
            notify("Inclua ao menos um item");
            return;
          }
          const sc = addSolicitacao({
            descricao: form.descricao.trim(),
            centro,
            necessidade: form.necessidade,
            urgente: form.urgente,
            solicitante: form.solicitante,
            itens,
          });
          if (!sc) {
            notify("Não foi possível criar (centro obrigatório)");
            return;
          }
          notify(`${sc.numero} criada`);
          setFormDirty(false);
          setOpen(false);
          setForm({
            descricao: "",
            centroKey: "",
            necessidade: new Date().toISOString().slice(0, 10),
            urgente: false,
            solicitante: "Admin Demo",
            itens: [{ descricao: "Item 1", unidade: "un", quantidade: 1 }],
          });
        }}
      >
        <Field label="Centro de custo *">
          <SearchSelect
            value={form.centroKey}
            onChange={(centroKey) => patchForm({ centroKey })}
            placeholder="Buscar obra ou empresa…"
            options={centros.map((c) => ({
              value: c.key,
              label: c.centro.label,
              meta: c.centro.tipo === "obra" ? "Obra" : "Empresa",
            }))}
          />
        </Field>
        <Field label="Descrição *">
          <Input
            value={form.descricao}
            onChange={(e) => patchForm({ descricao: e.target.value })}
          />
        </Field>
        <Field label="Necessidade (receber até)">
          <Input
            type="date"
            value={form.necessidade}
            onChange={(e) =>
              patchForm({ necessidade: e.target.value })
            }
          />
        </Field>
        <Field label="Item 1 — descrição">
          <Input
            value={form.itens[0]?.descricao ?? ""}
            onChange={(e) =>
              patchForm({ itens: [
                  {
                    ...form.itens[0],
                    descricao: e.target.value,
                    unidade: form.itens[0]?.unidade ?? "un",
                    quantidade: form.itens[0]?.quantidade ?? 1,
                  },
                ],
              })
            }
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Unidade">
            <Input
              value={form.itens[0]?.unidade ?? "un"}
              onChange={(e) =>
                patchForm({ itens: [
                    {
                      ...form.itens[0],
                      unidade: e.target.value,
                      descricao: form.itens[0]?.descricao ?? "",
                      quantidade: form.itens[0]?.quantidade ?? 1,
                    },
                  ],
                })
              }
            />
          </Field>
          <Field label="Quantidade">
            <Input
              type="number"
              value={form.itens[0]?.quantidade ?? 1}
              onChange={(e) =>
                patchForm({ itens: [
                    {
                      ...form.itens[0],
                      quantidade: Number(e.target.value) || 1,
                      descricao: form.itens[0]?.descricao ?? "",
                      unidade: form.itens[0]?.unidade ?? "un",
                    },
                  ],
                })
              }
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.urgente}
            onChange={(e) =>
              patchForm({ urgente: e.target.checked })
            }
          />
          Marcar como urgente
        </label>
      </FormDialog>
    </div>
  );
}

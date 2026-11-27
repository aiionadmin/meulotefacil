"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  ModuleSection,
} from "@/components/app/ModulePage";
import { PaginatedTable } from "@/components/app/PaginatedTable";
import {
  AttachDropZone,
  DetailRow,
  DetailSheet,
  Field,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { SearchSelect } from "@/components/app/SearchSelect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatBRL, formatDateBR } from "@/lib/masks/br";
import { canApprove } from "@/lib/alcadas/check";
import { useEmpresa } from "@/lib/empresa/context";
import { useFase1 } from "@/lib/store/fase1-store";
import { useFinanceiro } from "@/lib/store/financeiro-store";
import type { ContaBancaria } from "@/lib/domain/financeiro-types";
import { parseOfxBytes, type OfxTxn } from "@/lib/import/ofx-parse";
import { useNovoParam } from "@/lib/ui/use-novo-param";

type ConcStatus = "pendente" | "conciliado" | "arquivado";

type ConcLinha = OfxTxn & {
  key: string;
  status: ConcStatus;
  pagamentoId?: string;
  conciliadoPor?: string;
  conciliadoEm?: string;
};

function txnKey(tx: OfxTxn, idx: number) {
  return `${tx.data}|${tx.valor}|${tx.memo}|${idx}`;
}

export default function ContasPage() {
  const { state, addConta, conciliarPagamento, desconciliarPagamento } =
    useFinanceiro();
  const { state: f1, currentProfileName: perfilNome } = useFase1();
  const { empresas, selectedId, filterByEmpresa } = useEmpresa();
  const contas = useMemo(
    () => filterByEmpresa(state.contas),
    [filterByEmpresa, state.contas]
  );
  const [linhas, setLinhas] = useState<ConcLinha[]>([]);
  const [ofxMeta, setOfxMeta] = useState("");
  const [open, setOpen] = useNovoParam();
  const [formDirty, setFormDirty] = useState(false);
  const [contaSel, setContaSel] = useState<ContaBancaria | null>(null);
  const [tab, setTab] = useState<ConcStatus>("pendente");
  const [busca, setBusca] = useState("");
  const [tipoMov, setTipoMov] = useState<"todas" | "entrada" | "saida">(
    "todas"
  );
  const [form, setForm] = useState({
    nome: "",
    banco: "",
    tipo: "corrente" as "corrente" | "poupanca" | "caixa",
    proprietario: "empresa" as "empresa" | "cliente",
    dataInicial: "2026-01-01",
    valorInicial: 0,
    boleto: false,
    empresaId:
      selectedId === "todas" ? empresas[0]?.id ?? "" : selectedId,
  });

  function patchForm(patch: Partial<typeof form>) {
    setFormDirty(true);
    setForm((prev) => ({ ...prev, ...patch }));
  }

  const filtradas = useMemo(() => {
    const term = busca.trim().toLowerCase();
    return linhas.filter((l) => {
      if (l.status !== tab) return false;
      if (tipoMov === "entrada" && l.valor < 0) return false;
      if (tipoMov === "saida" && l.valor >= 0) return false;
      if (term && !l.memo.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [linhas, tab, busca, tipoMov]);

  const contagens = useMemo(
    () => ({
      pendente: linhas.filter((l) => l.status === "pendente").length,
      conciliado: linhas.filter((l) => l.status === "conciliado").length,
      arquivado: linhas.filter((l) => l.status === "arquivado").length,
    }),
    [linhas]
  );

  function sugerirMatch(tx: OfxTxn) {
    return state.pagamentos.find(
      (p) =>
        Math.abs(p.valor - Math.abs(tx.valor)) < 0.01 &&
        !p.conciliado &&
        (p.status === "em_aberto" ||
          p.status === "parcial" ||
          p.status === "pago")
    );
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Contas Bancárias"
        description="C02 — contas por empresa; saldo, tipo e proprietário."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/financeiro/transferencias">Transferências</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/financeiro/cobranca-facil">Cobrança Fácil</Link>
            </Button>
            <Button size="sm" onClick={() => { setFormDirty(false); setOpen(true); }}>
              Nova Conta bancária
            </Button>
          </>
        }
      />
      <KpiGrid
        items={[
          {
            label: "Saldo total",
            value: formatBRL(contas.reduce((a, c) => a + c.saldo, 0)),
          },
          { label: "Contas", value: contas.length },
          {
            label: "Ativas",
            value: contas.filter((c) => c.ativa).length,
          },
          {
            label: "Com boleto",
            value: contas.filter((c) => c.boleto).length,
          },
        ]}
      />
      <ModuleSection title="Lista">
        <PaginatedTable
          columns={[
            { key: "banco", label: "Banco / Tipo" },
            { key: "nome", label: "Nome" },
            { key: "emp", label: "Empresa" },
            { key: "prop", label: "Proprietário" },
            { key: "saldo", label: "Valor atual" },
            { key: "ini", label: "Data inicial" },
          ]}
          rows={contas.map((c) => ({
            banco: `${c.banco} · ${c.tipo}`,
            nome: (
              <button
                type="button"
                className="font-medium text-left hover:text-brand-orange"
                onClick={() => setContaSel(c)}
              >
                {c.nome}
              </button>
            ),
            emp:
              empresas.find((e) => e.id === c.empresaId)?.nome ??
              (c.empresaId ? c.empresaId.slice(0, 8) : "—"),
            prop: c.proprietario,
            saldo: formatBRL(c.saldo),
            ini: formatDateBR(c.dataInicial),
          }))}
        />
      </ModuleSection>

      <DetailSheet
        open={!!contaSel}
        onOpenChange={(o) => {
          if (!o) setContaSel(null);
        }}
        title={contaSel?.nome ?? "Conta"}
        footer={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/financeiro/transferencias">Extrato / Transferências</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/financeiro/cobranca-facil">Cobrança Fácil</Link>
            </Button>
          </>
        }
      >
        {contaSel ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-md border border-linha p-2">
                <div className="text-muted-foreground">Saldo no sistema</div>
                <div className="mt-1 font-semibold">
                  {formatBRL(contaSel.saldo)}
                </div>
              </div>
              <div className="rounded-md border border-linha p-2">
                <div className="text-muted-foreground">Saldo no banco</div>
                <div className="mt-1 font-semibold">—</div>
              </div>
              <div className="rounded-md border border-linha p-2">
                <div className="text-muted-foreground">Variação</div>
                <div className="mt-1 font-semibold">—</div>
              </div>
            </div>
            <DetailRow label="Banco" value={`${contaSel.banco} · ${contaSel.tipo}`} />
            <DetailRow
              label="Proprietário"
              value={contaSel.proprietario}
            />
            <DetailRow
              label="Data inicial"
              value={formatDateBR(contaSel.dataInicial)}
            />
            <DetailRow
              label="Saldo inicial"
              value={formatBRL(contaSel.valorInicial)}
            />

            <div className="border-t border-linha pt-3">
              <p className="mb-2 text-sm font-medium">Conciliação</p>
              <AttachDropZone
                accept=".ofx,.OFX,text/plain"
                multiple={false}
                label="Arraste o extrato OFX ou clique"
                onFiles={async (files) => {
                    const f = files[0];
                    if (!f) return;
                    const buf = await f.arrayBuffer();
                    const parsed = parseOfxBytes(buf);
                    if (!parsed.ok) {
                      notify("OFX inválido", parsed.erro ?? "");
                      setLinhas([]);
                      return;
                    }
                    setLinhas(
                      parsed.transacoes.map((tx, idx) => ({
                        ...tx,
                        key: txnKey(tx, idx),
                        status: "pendente" as ConcStatus,
                      }))
                    );
                    setOfxMeta(
                      `Banco ${parsed.banco || "—"} · Conta ${parsed.conta || "—"} · ${parsed.transacoes.length} lançamentos`
                    );
                    setTab("pendente");
                    notify("OFX lido", `${parsed.transacoes.length} transações`);
                  }}
                />
              {ofxMeta ? (
                <p className="mt-2 text-xs text-muted-foreground">{ofxMeta}</p>
              ) : null}

              {linhas.length > 0 ? (
                <div className="mt-3 space-y-3">
                  <Tabs
                    value={tab}
                    onValueChange={(v) => setTab(v as ConcStatus)}
                  >
                    <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
                      <TabsTrigger value="pendente">
                        Pendentes ({contagens.pendente})
                      </TabsTrigger>
                      <TabsTrigger value="conciliado">
                        Conciliados ({contagens.conciliado})
                      </TabsTrigger>
                      <TabsTrigger value="arquivado">
                        Arquivados ({contagens.arquivado})
                      </TabsTrigger>
                    </TabsList>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Input
                        className="max-w-xs"
                        placeholder="Buscar por descrição"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                      />
                      <select
                        className={fieldControlClass + " max-w-[160px]"}
                        value={tipoMov}
                        onChange={(e) =>
                          setTipoMov(
                            e.target.value as "todas" | "entrada" | "saida"
                          )
                        }
                      >
                        <option value="todas">Todas</option>
                        <option value="entrada">Entradas</option>
                        <option value="saida">Saídas</option>
                      </select>
                    </div>
                    <TabsContent value={tab} className="mt-3 space-y-2">
                      {filtradas.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Nenhuma movimentação nesta aba.
                        </p>
                      ) : (
                        filtradas.map((tx) => {
                          const match =
                            tx.status === "pendente"
                              ? sugerirMatch(tx)
                              : tx.pagamentoId
                                ? state.pagamentos.find(
                                    (p) => p.id === tx.pagamentoId
                                  )
                                : undefined;
                          return (
                            <div
                              key={tx.key}
                              className="grid gap-2 rounded-md border border-linha p-3 text-xs sm:grid-cols-2"
                            >
                              <div>
                                <div className="font-medium text-ink">
                                  Banco · {formatBRL(tx.valor)}
                                </div>
                                <div className="text-muted-foreground">
                                  {tx.memo}
                                </div>
                                <div className="mt-1 text-muted-foreground">
                                  {formatDateBR(tx.data)} · {tx.tipo}
                                </div>
                              </div>
                              <div>
                                <div className="font-medium text-ink">
                                  Sistema
                                  {match
                                    ? ` · ${formatBRL(match.valor)}`
                                    : " · —"}
                                </div>
                                {match ? (
                                  <>
                                    <div>{match.favorecido}</div>
                                    <div className="text-muted-foreground">
                                      {match.descricao} · {match.centroLabel}
                                    </div>
                                    {tx.conciliadoPor ? (
                                      <div className="mt-1 text-muted-foreground">
                                        Conciliado por: {tx.conciliadoPor},{" "}
                                        {tx.conciliadoEm
                                          ? formatDateBR(tx.conciliadoEm)
                                          : ""}
                                      </div>
                                    ) : (
                                      <div className="mt-1 text-brand-green">
                                        Sugestão automática
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="text-muted-foreground">
                                    Sem par sugerido
                                  </div>
                                )}
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {tx.status === "pendente" && match ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const gate = canApprove({
                                          rules: f1.approvalRules,
                                          tipo: "Conciliação bancária",
                                          perfilNome,
                                          valor: match.valor,
                                        });
                                        if (!gate.ok) {
                                          notify(
                                            "Alçada insuficiente",
                                            gate.reason
                                          );
                                          return;
                                        }
                                        conciliarPagamento(match.id);
                                        setLinhas((prev) =>
                                          prev.map((l) =>
                                            l.key === tx.key
                                              ? {
                                                  ...l,
                                                  status: "conciliado",
                                                  pagamentoId: match.id,
                                                  conciliadoPor: "Você",
                                                  conciliadoEm: new Date()
                                                    .toISOString()
                                                    .slice(0, 10),
                                                }
                                              : l
                                          )
                                        );
                                        notify("Conciliado", match.descricao);
                                      }}
                                    >
                                      Conciliar
                                    </Button>
                                  ) : null}
                                  {tx.status === "pendente" ? (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        setLinhas((prev) =>
                                          prev.map((l) =>
                                            l.key === tx.key
                                              ? {
                                                  ...l,
                                                  status: "arquivado",
                                                }
                                              : l
                                          )
                                        )
                                      }
                                    >
                                      Arquivar
                                    </Button>
                                  ) : null}
                                  {tx.status === "conciliado" &&
                                  tx.pagamentoId ? (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        const gate = canApprove({
                                          rules: f1.approvalRules,
                                          tipo: "Desconciliar",
                                          perfilNome,
                                        });
                                        if (!gate.ok) {
                                          notify(
                                            "Alçada insuficiente",
                                            gate.reason
                                          );
                                          return;
                                        }
                                        desconciliarPagamento(tx.pagamentoId!);
                                        setLinhas((prev) =>
                                          prev.map((l) =>
                                            l.key === tx.key
                                              ? {
                                                  ...l,
                                                  status: "pendente",
                                                  pagamentoId: undefined,
                                                  conciliadoPor: undefined,
                                                  conciliadoEm: undefined,
                                                }
                                              : l
                                          )
                                        );
                                        notify("Desconciliado");
                                      }}
                                    >
                                      Desconciliar
                                    </Button>
                                  ) : null}
                                  {tx.status === "arquivado" ? (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        setLinhas((prev) =>
                                          prev.map((l) =>
                                            l.key === tx.key
                                              ? {
                                                  ...l,
                                                  status: "pendente",
                                                }
                                              : l
                                          )
                                        )
                                      }
                                    >
                                      Restaurar
                                    </Button>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Importe um OFX para abrir as abas Pendentes, Conciliados e
                  Arquivados.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </DetailSheet>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Nova conta"
        dirty={formDirty}
        onSubmit={() => {
          if (!form.nome.trim()) {
            notify("Nome obrigatório");
            return;
          }
          addConta({
            nome: form.nome,
            banco: form.banco || "—",
            tipo: form.tipo,
            proprietario: form.proprietario,
            dataInicial: form.dataInicial,
            valorInicial: form.valorInicial,
            boleto: form.boleto,
            empresaId:
              form.empresaId ||
              (selectedId === "todas" ? empresas[0]?.id : selectedId),
          });
          notify("Conta criada");
          setFormDirty(false);
          setOpen(false);
        }}
      >
        <Field label="Empresa *">
          <SearchSelect
            value={form.empresaId}
            onChange={(empresaId) => patchForm({ empresaId })}
            placeholder="Buscar empresa…"
            options={empresas.map((e) => ({
              value: e.id,
              label: e.nome,
            }))}
          />
        </Field>
        <Field label="Nome *">
          <Input
            value={form.nome}
            onChange={(e) => patchForm({ nome: e.target.value })}
          />
        </Field>
        <Field label="Banco">
          <Input
            value={form.banco}
            onChange={(e) => patchForm({ banco: e.target.value })}
          />
        </Field>
        <Field label="Tipo">
          <select
            className={fieldControlClass}
            value={form.tipo}
            onChange={(e) =>
              patchForm({ tipo: e.target.value as typeof form.tipo,
              })
            }
          >
            <option value="corrente">Corrente</option>
            <option value="poupanca">Poupança</option>
            <option value="caixa">Caixa/Dinheiro</option>
          </select>
        </Field>
        <Field label="Proprietário *">
          <select
            className={fieldControlClass}
            value={form.proprietario}
            onChange={(e) =>
              patchForm({ proprietario: e.target.value as typeof form.proprietario,
              })
            }
          >
            <option value="empresa">Empresa</option>
            <option value="cliente">Cliente</option>
          </select>
        </Field>
        <Field label="Valor inicial *">
          <Input
            type="number"
            value={form.valorInicial}
            onChange={(e) =>
              patchForm({ valorInicial: Number(e.target.value) || 0,
              })
            }
          />
        </Field>
      </FormDialog>
    </div>
  );
}

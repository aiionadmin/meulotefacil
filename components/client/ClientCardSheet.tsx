"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DetailRow,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import {
  useClientCard,
  type ClientCardTab,
} from "@/lib/client/client-card-context";
import {
  buildMailtoLink,
  buildTelLink,
  buildWhatsAppLink,
  defaultOutboundMessage,
  type OutboundCanal,
} from "@/lib/comms/outbound";
import { useFase1 } from "@/lib/store/fase1-store";
import { useFluxo } from "@/lib/store/fluxo-store";
import { useCarteira } from "@/lib/store/carteira-store";
import { useParte5 } from "@/lib/store/parte5-store";
import { formatBRL } from "@/lib/masks/br";
import { formatDateBR } from "@/lib/dates/format";
import { statusLabel } from "@/lib/status/labels";

const TABS: { id: ClientCardTab; label: string }[] = [
  { id: "resumo", label: "Resumo" },
  { id: "cadastro", label: "Cadastro" },
  { id: "conversas", label: "Conversas" },
  { id: "proposta", label: "Proposta" },
  { id: "contrato", label: "Contrato" },
  { id: "parcelas", label: "Parcelas" },
  { id: "boletos", label: "Boletos" },
  { id: "cobranca", label: "Cobrança" },
  { id: "juridico", label: "Jurídico" },
  { id: "regularizacao", label: "Regularização" },
  { id: "documentos", label: "Documentos" },
  { id: "historico", label: "Histórico" },
];

function norm(s: string) {
  return s.trim().toLowerCase();
}

export function ClientCardSheet() {
  const { open, closeClient } = useClientCard();
  const { state: fase1 } = useFase1();
  const { state: fluxo, registrarConversa, registrarContato } = useFluxo();
  const { state: carteira, saldoDevedor } = useCarteira();
  const { state: parte5 } = useParte5();
  const [canal, setCanal] = useState<OutboundCanal>("whatsapp");
  const [msg, setMsg] = useState("");

  const data = useMemo(() => {
    if (!open) return null;
    const nomeN = norm(open.nome);
    const cardKey =
      open.personId ||
      open.leadId ||
      open.contractId ||
      open.documento ||
      nomeN;

    const person =
      (open.personId
        ? fase1.people.find((p) => p.id === open.personId)
        : undefined) ??
      fase1.people.find(
        (p) =>
          norm(p.nome) === nomeN ||
          (open.documento && p.documento === open.documento)
      );

    const lead =
      (open.leadId
        ? fluxo.leads.find((l) => l.id === open.leadId)
        : undefined) ??
      fluxo.leads.find((l) => norm(l.nome) === nomeN);

    const proposals = fluxo.proposals.filter(
      (p) =>
        (lead && p.leadId === lead.id) ||
        norm(p.cliente) === nomeN ||
        (person && norm(p.cliente) === norm(person.nome))
    );

    const contracts = carteira.contracts.filter(
      (c) =>
        (open.contractId && c.id === open.contractId) ||
        (person && c.compradorId === person.id) ||
        norm(c.compradorNome) === nomeN
    );

    const contractIds = new Set(contracts.map((c) => c.id));
    const parcelas = carteira.installments.filter((i) =>
      contractIds.has(i.contractId)
    );
    const boletos = carteira.bankSlips.filter((b) =>
      contractIds.has(b.contractId)
    );

    const cobranca = fluxo.collection.filter(
      (c) =>
        (open.collectionCaseId && c.id === open.collectionCaseId) ||
        norm(c.cliente) === nomeN ||
        contracts.some((ct) => ct.numero === c.contratoNumero)
    );

    const juridico = fluxo.lawsuits.filter(
      (l) =>
        norm(l.cliente) === nomeN ||
        contracts.some((ct) => ct.numero === l.contratoNumero)
    );

    const regularizacao = fluxo.regularization.filter(
      (r) =>
        (open.regularizationId && r.id === open.regularizationId) ||
        norm(r.cliente) === nomeN
    );

    const documentos = fase1.files.filter(
      (f) =>
        f.comentario?.toLowerCase().includes(nomeN) ||
        f.nome.toLowerCase().includes(nomeN)
    );

    const contatos = fluxo.contacts.filter(
      (c) =>
        cobranca.some((x) => x.id === c.caseId) ||
        c.caseId === `card:${cardKey}`
    );

    const moves = fluxo.cardMoves.filter(
      (m) => lead && m.cardId === lead.id
    );

    const demandas = parte5.demandas.filter(
      (d) =>
        (person && d.clienteId === person.id) ||
        (d.clienteNome && norm(d.clienteNome) === nomeN) ||
        (d.clienteNome && person && norm(d.clienteNome) === norm(person.nome))
    );

    const historico: { quando: string; texto: string }[] = [];
    if (lead) {
      historico.push({
        quando: lead.criadoEm,
        texto: `Lead criado · ${statusLabel(lead.origem)}`,
      });
      if (lead.dataVisita) {
        historico.push({
          quando: lead.dataVisita,
          texto: "Visita registrada",
        });
      }
    }
    for (const p of proposals) {
      historico.push({
        quando: p.validade,
        texto: `Proposta ${statusLabel(p.status)} · ${p.loteLabel} · ${formatBRL(p.valor)}`,
      });
    }
    for (const c of contracts) {
      historico.push({
        quando: c.dataContrato,
        texto: `Contrato ${c.numero} · ${statusLabel(c.status)}`,
      });
    }
    for (const i of parcelas.filter((x) => x.status === "paga" && x.pagoEm)) {
      historico.push({
        quando: i.pagoEm!,
        texto: `Pagamento parcela ${i.n} · ${formatBRL(i.valor)}`,
      });
    }
    for (const c of contatos) {
      historico.push({
        quando: c.quando,
        texto: `Contato cobrança (${c.canal}) · ${c.resultado}`,
      });
    }
    for (const r of regularizacao) {
      historico.push({
        quando: r.prazo ?? lead?.criadoEm ?? "",
        texto: `Regularização · ${statusLabel(r.etapa)}`,
      });
    }
    for (const m of moves) {
      historico.push({
        quando: m.quando,
        texto: `Jornada ${m.de} → ${m.para}${m.motivo ? ` · ${m.motivo}` : ""}`,
      });
    }
    for (const d of demandas) {
      historico.push({
        quando: d.criadoEm,
        texto: `Demanda ${d.numero} · ${statusLabel(d.status)} · ${d.descricao}`,
      });
    }
    for (const c of contatos) {
      historico.push({
        quando: c.quando,
        texto: `Contato ${statusLabel(c.canal)} · ${c.resultado}`,
      });
    }
    historico.sort((a, b) => (a.quando < b.quando ? 1 : -1));

    const telefone =
      person?.celular || person?.telefone1 || lead?.telefone || "";
    const email = person?.email || lead?.email || "";

    return {
      cardKey,
      person,
      lead,
      proposals,
      contracts,
      parcelas,
      boletos,
      cobranca,
      juridico,
      regularizacao,
      documentos,
      contatos,
      demandas,
      historico,
      telefone,
      email,
    };
  }, [open, fase1, fluxo, carteira, parte5]);

  // Keep <Sheet> mounted when closed. Early `return null` while Radix still
  // thought open=true left `pointer-events: none` on <body> and blocked menus
  // (ficha financeira → card do cliente → fechar / navegar).
  const defaultTab = open?.tab ?? "resumo";
  const titulo = data?.person?.nome ?? open?.nome ?? "";

  const sendOutbound = () => {
    if (!open || !data) return;
    const texto =
      msg.trim() || defaultOutboundMessage(canal, titulo);
    if (canal === "whatsapp") {
      if (!data.telefone) {
        notify("Sem telefone", "Cadastre o celular do cliente");
        return;
      }
      window.open(buildWhatsAppLink(data.telefone, texto), "_blank");
    } else if (canal === "email") {
      if (!data.email) {
        notify("Sem e-mail", "Cadastre o e-mail do cliente");
        return;
      }
      window.open(
        buildMailtoLink(data.email, `Meu Lote Fácil · ${titulo}`, texto),
        "_blank"
      );
    } else {
      if (!data.telefone) {
        notify("Sem telefone", "Cadastre o telefone do cliente");
        return;
      }
      window.open(buildTelLink(data.telefone), "_blank");
    }
    const caseId = data.cobranca[0]?.id;
    if (caseId) {
      registrarContato(caseId, canal, texto);
    } else {
      registrarConversa(data.cardKey, canal, texto);
    }
    notify(
      canal === "whatsapp"
        ? "WhatsApp aberto"
        : canal === "email"
          ? "E-mail aberto"
          : "Discagem aberta",
      "Registrado no histórico do card"
    );
    setMsg("");
  };

  return (
    <Sheet
      open={Boolean(open)}
      onOpenChange={(next) => {
        if (!next) closeClient();
      }}
    >
      {open && data ? (
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl"
      >
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="text-left text-lg">{titulo}</SheetTitle>
          <p className="text-left text-xs text-muted-foreground">
            {[
              data.person?.documento ?? open.documento,
              data.person?.cidade
                ? `${data.person.cidade}/${data.person.uf ?? ""}`
                : null,
              data.lead ? statusLabel(data.lead.etapa) : null,
            ]
              .filter(Boolean)
              .join(" · ") || "Card do cliente"}
          </p>
        </SheetHeader>

        <Tabs
          defaultValue={defaultTab}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="overflow-x-auto border-b border-border px-3">
            <TabsList className="h-auto w-max flex-wrap justify-start gap-1 bg-transparent p-2">
              {TABS.map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="text-xs data-[state=active]:bg-muted"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 text-sm">
            <TabsContent value="resumo" className="mt-0 space-y-3">
              <DetailRow
                label="Telefone"
                value={
                  data.person?.celular ??
                  data.person?.telefone1 ??
                  data.lead?.telefone ??
                  "—"
                }
              />
              <DetailRow
                label="E-mail"
                value={data.person?.email ?? data.lead?.email ?? "—"}
              />
              <DetailRow
                label="Empreendimento"
                value={
                  data.contracts[0]?.empNome ??
                  data.lead?.empInteresse ??
                  "—"
                }
              />
              <DetailRow
                label="Contratos"
                value={String(data.contracts.length)}
              />
              <DetailRow
                label="Saldo"
                value={
                  data.contracts.length
                    ? formatBRL(
                        data.contracts.reduce(
                          (s, c) => s + saldoDevedor(c.id),
                          0
                        )
                      )
                    : "—"
                }
              />
              <DetailRow
                label="Cobrança"
                value={
                  data.cobranca[0]
                    ? `${data.cobranca[0].diasAtraso} dias · ${formatBRL(data.cobranca[0].valorAtualizado)}`
                    : "Em dia"
                }
              />
              <DetailRow
                label="Demandas"
                value={
                  data.demandas.length
                    ? `${data.demandas.length} · ${statusLabel(data.demandas[0].status)}`
                    : "Nenhuma"
                }
              />
              {data.demandas.length > 0 ? (
                <div className="space-y-1 rounded-md border border-border px-3 py-2">
                  {data.demandas.slice(0, 5).map((d) => (
                    <p key={d.id} className="text-xs">
                      {d.numero} · {d.descricao} · {statusLabel(d.prioridade)} ·{" "}
                      {statusLabel(d.status)}
                    </p>
                  ))}
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/demandas">Abrir demandas</Link>
                  </Button>
                </div>
              ) : null}
              {data.lead ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/quadros/jornada">Abrir jornada</Link>
                  </Button>
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="cadastro" className="mt-0 space-y-3">
              {data.person ? (
                <>
                  <DetailRow
                    label="Tipo"
                    value={
                      data.person.tipo === "fisica"
                        ? "Pessoa física"
                        : "Pessoa jurídica"
                    }
                  />
                  <DetailRow label="Documento" value={data.person.documento} />
                  <DetailRow
                    label="Papéis"
                    value={data.person.papeis.join(", ") || "—"}
                  />
                  <DetailRow
                    label="Cidade"
                    value={
                      data.person.cidade
                        ? `${data.person.cidade}/${data.person.uf ?? ""}`
                        : "—"
                    }
                  />
                  <DetailRow
                    label="Observações"
                    value={data.person.observacoes ?? "—"}
                  />
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/cadastros/pessoas">Editar cadastro</Link>
                  </Button>
                </>
              ) : data.lead ? (
                <>
                  <DetailRow label="Nome" value={data.lead.nome} />
                  <DetailRow label="Telefone" value={data.lead.telefone} />
                  <DetailRow
                    label="Origem"
                    value={statusLabel(data.lead.origem)}
                  />
                  <DetailRow
                    label="Classificação"
                    value={statusLabel(data.lead.classificacao)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ainda sem pessoa vinculada no cadastro.
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">Cadastro não encontrado.</p>
              )}
            </TabsContent>

            <TabsContent value="conversas" className="mt-0 space-y-3">
              <div className="space-y-2 rounded-md border border-border p-3">
                <p className="text-sm font-medium">Registrar / enviar</p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["whatsapp", "WhatsApp"],
                      ["email", "E-mail"],
                      ["telefone", "Telefone"],
                    ] as const
                  ).map(([id, label]) => (
                    <Button
                      key={id}
                      size="sm"
                      variant={canal === id ? "default" : "outline"}
                      onClick={() => {
                        setCanal(id);
                        if (!msg) {
                          setMsg(defaultOutboundMessage(id, titulo));
                        }
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                <textarea
                  className={fieldControlClass + " min-h-[72px]"}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder={defaultOutboundMessage(canal, titulo)}
                />
                <Button size="sm" onClick={sendOutbound}>
                  Abrir {canal === "whatsapp" ? "WhatsApp" : canal === "email" ? "e-mail" : "telefone"}
                </Button>
                <p className="text-[11px] text-muted-foreground">
                  Abre o canal no dispositivo e grava no card (sem gateway).
                </p>
              </div>
              {data.lead?.ultimoContato ? (
                <DetailRow
                  label="Último contato (lead)"
                  value={formatDateBR(data.lead.ultimoContato)}
                />
              ) : null}
              {data.lead?.canalPreferido ? (
                <DetailRow
                  label="Canal preferido"
                  value={statusLabel(data.lead.canalPreferido)}
                />
              ) : null}
              {data.contatos.length === 0 ? (
                <p className="text-muted-foreground">
                  Nenhuma conversa registrada.
                </p>
              ) : (
                data.contatos.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-md border border-border px-3 py-2"
                  >
                    <p className="text-xs text-muted-foreground">
                      {formatDateBR(c.quando)} · {statusLabel(c.canal)}
                    </p>
                    <p>{c.resultado}</p>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="proposta" className="mt-0 space-y-3">
              {data.proposals.length === 0 ? (
                <p className="text-muted-foreground">Sem propostas.</p>
              ) : (
                data.proposals.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-md border border-border px-3 py-2 space-y-1"
                  >
                    <p className="font-medium">
                      {p.loteLabel} · {statusLabel(p.status)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.empNome} · {formatBRL(p.valor)} · {p.parcelas}x ·
                      entrada {formatBRL(p.entrada)}
                    </p>
                  </div>
                ))
              )}
              <Button size="sm" variant="outline" asChild>
                <Link href="/vendas">Ir para propostas</Link>
              </Button>
            </TabsContent>

            <TabsContent value="contrato" className="mt-0 space-y-3">
              {data.contracts.length === 0 ? (
                <p className="text-muted-foreground">Sem contratos.</p>
              ) : (
                data.contracts.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-md border border-border px-3 py-2 space-y-1"
                  >
                    <p className="font-medium">
                      {c.numero} · {statusLabel(c.status)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.empNome} · {c.quadra}/{c.lote} · {formatBRL(c.preco)}
                    </p>
                    <p className="text-xs">
                      Saldo {formatBRL(saldoDevedor(c.id))}
                    </p>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/carteira?contrato=${c.id}`}>
                        Abrir ficha
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="parcelas" className="mt-0 space-y-2">
              {data.parcelas.length === 0 ? (
                <p className="text-muted-foreground">Sem parcelas.</p>
              ) : (
                data.parcelas.slice(0, 40).map((i) => (
                  <div
                    key={i.id}
                    className="flex items-center justify-between gap-2 border-b border-border py-1.5 text-xs"
                  >
                    <span>
                      {i.n}. {i.tipo} · {formatDateBR(i.vencimento)}
                    </span>
                    <span>
                      {formatBRL(i.valor)} · {statusLabel(i.status)}
                    </span>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="boletos" className="mt-0 space-y-2">
              {data.boletos.length === 0 ? (
                <p className="text-muted-foreground">Sem boletos.</p>
              ) : (
                data.boletos.slice(0, 40).map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between gap-2 border-b border-border py-1.5 text-xs"
                  >
                    <span>
                      {b.nossoNumero} · {b.contratoNumero}
                    </span>
                    <span>
                      {formatBRL(b.valor)} · {statusLabel(b.status)}
                    </span>
                  </div>
                ))
              )}
              <Button size="sm" variant="outline" asChild>
                <Link href="/boletos">Módulo de boletos</Link>
              </Button>
            </TabsContent>

            <TabsContent value="cobranca" className="mt-0 space-y-3">
              {data.cobranca.length === 0 ? (
                <p className="text-muted-foreground">Sem casos de cobrança.</p>
              ) : (
                data.cobranca.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-md border border-border px-3 py-2 space-y-1"
                  >
                    <p className="font-medium">{c.contratoNumero}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.diasAtraso} dias · {formatBRL(c.valorAtualizado)} ·{" "}
                      {statusLabel(c.faixa)}
                    </p>
                  </div>
                ))
              )}
              <Button size="sm" variant="outline" asChild>
                <Link href="/quadros/cobranca">Quadro de cobrança</Link>
              </Button>
            </TabsContent>

            <TabsContent value="juridico" className="mt-0 space-y-3">
              {data.juridico.length === 0 ? (
                <p className="text-muted-foreground">Sem processos jurídicos.</p>
              ) : (
                data.juridico.map((l) => (
                  <div
                    key={l.id}
                    className="rounded-md border border-border px-3 py-2"
                  >
                    <p className="font-medium">{l.contratoNumero}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.tipo} · {statusLabel(l.situacao)} · {l.advogado}
                    </p>
                  </div>
                ))
              )}
              <Button size="sm" variant="outline" asChild>
                <Link href="/juridico">Módulo jurídico</Link>
              </Button>
            </TabsContent>

            <TabsContent value="regularizacao" className="mt-0 space-y-3">
              {data.regularizacao.length === 0 ? (
                <p className="text-muted-foreground">
                  Sem protocolos de regularização.
                </p>
              ) : (
                data.regularizacao.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-md border border-border px-3 py-2"
                  >
                    <p className="font-medium">
                      {r.empNome} · {r.loteLabel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {statusLabel(r.etapa)} · {r.responsavel}
                      {r.prazo ? ` · prazo ${formatDateBR(r.prazo)}` : ""}
                    </p>
                  </div>
                ))
              )}
              <Button size="sm" variant="outline" asChild>
                <Link href="/quadros/regularizacao">Quadro regularização</Link>
              </Button>
            </TabsContent>

            <TabsContent value="documentos" className="mt-0 space-y-2">
              {data.documentos.length === 0 ? (
                <p className="text-muted-foreground">
                  Nenhum documento vinculado.
                </p>
              ) : (
                data.documentos.map((f) => (
                  <div
                    key={f.id}
                    className="flex justify-between gap-2 border-b border-border py-1.5 text-xs"
                  >
                    <span>
                      {f.nome} · {f.tag}
                    </span>
                    <span className="text-muted-foreground">{f.tamanho}</span>
                  </div>
                ))
              )}
              <Button size="sm" variant="outline" asChild>
                <Link href="/arquivos">Arquivos</Link>
              </Button>
            </TabsContent>

            <TabsContent value="historico" className="mt-0 space-y-2">
              {data.historico.length === 0 ? (
                <p className="text-muted-foreground">Sem eventos.</p>
              ) : (
                data.historico.slice(0, 60).map((h, i) => (
                  <div
                    key={`${h.quando}-${i}`}
                    className="border-b border-border py-1.5 text-xs"
                  >
                    <span className="text-muted-foreground">
                      {h.quando ? formatDateBR(h.quando) : "—"}
                    </span>
                    <p>{h.texto}</p>
                  </div>
                ))
              )}
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
      ) : null}
    </Sheet>
  );
}

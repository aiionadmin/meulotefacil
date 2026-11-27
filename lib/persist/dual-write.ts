/**
 * Dual-write best-effort: store (snapshots) continua fonte da UI;
 * tabelas D/E/G recebem upsert quando Supabase está configurado.
 * Falhas só logam — nunca bloqueiam a UI.
 */
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type {
  ComprasConfig,
  Cotacao,
  OrdemCompra,
  Solicitacao,
} from "@/lib/domain/compras-types";
import type {
  Categoria,
  CentroFin,
  ContaBancaria,
  Faturamento,
  Lancamento,
  NaturezaReceita,
  Pagamento,
  PlanoConta,
  PreLancamento,
  Recebimento,
  Transferencia,
} from "@/lib/domain/financeiro-types";
import type {
  Composicao,
  Insumo,
  Obra,
  OrcamentoNode,
} from "@/lib/domain/obras-types";
import { DEMO_ORG_ID } from "./store-keys";
import { stableUuid } from "./stable-uuid";

type SoftResult = { ok: boolean; skipped?: boolean };

function client() {
  if (!isSupabaseConfigured()) return null;
  return createClient();
}

function warn(table: string, err: { message?: string } | null) {
  if (err?.message) {
    console.warn(`[dual-write] ${table}:`, err.message);
  }
}

export async function dualWritePlano(
  plano: PlanoConta,
  orgId: string = DEMO_ORG_ID
): Promise<SoftResult> {
  const sb = client();
  if (!sb) return { ok: true, skipped: true };
  const { error } = await sb.from("planos_conta").upsert(
    {
      id: stableUuid(plano.id),
      organization_id: orgId,
      nome: plano.nome,
      fluxo: plano.fluxo,
      grupo_resultados: plano.grupoResultados,
      ativo: plano.ativo,
    },
    { onConflict: "id" }
  );
  warn("planos_conta", error);
  return { ok: !error };
}

export async function dualWriteCategoria(
  cat: Categoria,
  orgId: string = DEMO_ORG_ID
): Promise<SoftResult> {
  const sb = client();
  if (!sb) return { ok: true, skipped: true };
  const { error } = await sb.from("categorias_financeiras").upsert(
    {
      id: stableUuid(cat.id),
      organization_id: orgId,
      nome: cat.nome,
      plano_id: stableUuid(cat.planoId),
      classificacao_obra: cat.classificacaoObra,
      ativo: cat.ativo,
    },
    { onConflict: "id" }
  );
  warn("categorias_financeiras", error);
  return { ok: !error };
}

export async function dualWriteNatureza(
  nat: NaturezaReceita,
  orgId: string = DEMO_ORG_ID
): Promise<SoftResult> {
  const sb = client();
  if (!sb) return { ok: true, skipped: true };
  const { error } = await sb.from("naturezas_receita").upsert(
    {
      id: stableUuid(nat.id),
      organization_id: orgId,
      nome: nat.nome,
      ativo: nat.ativo,
      linha_resultados: nat.linhaResultados ?? null,
    },
    { onConflict: "id" }
  );
  warn("naturezas_receita", error);
  return { ok: !error };
}

export async function dualWriteComprasConfig(
  cfg: ComprasConfig,
  orgId: string = DEMO_ORG_ID
): Promise<SoftResult> {
  const sb = client();
  if (!sb) return { ok: true, skipped: true };
  const { error } = await sb.from("compras_config").upsert(
    {
      organization_id: orgId,
      cotacao_numero_inicial: cfg.cotacaoNumeroInicial,
      oc_numero_inicial: cfg.ocNumeroInicial,
      permitir_oc_sem_cotacao: cfg.permitirOcSemCotacao,
      fornecedor_documento_obrigatorio: cfg.fornecedorDocumentoObrigatorio,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "organization_id" }
  );
  warn("compras_config", error);
  return { ok: !error };
}

export async function dualWriteObra(
  obra: Pick<
    Obra,
    | "id"
    | "codigo"
    | "nome"
    | "status"
    | "tipo"
    | "clienteNome"
    | "visivelPara"
  >,
  orgId: string = DEMO_ORG_ID
): Promise<SoftResult> {
  const sb = client();
  if (!sb) return { ok: true, skipped: true };
  const oid = stableUuid(obra.id);
  const { error } = await sb.from("obras").upsert(
    {
      id: oid,
      organization_id: orgId,
      codigo: obra.codigo,
      nome: obra.nome,
      status: obra.status,
      tipo: obra.tipo || "loteamento",
      cliente_nome: obra.clienteNome ?? null,
      visivel_para: obra.visivelPara ?? [],
    } as never,
    { onConflict: "id" }
  );
  warn("obras", error);
  if (!error) {
    // Resolve usuários por perfil/nome e sincroniza obra_visibilidade
    const labels = (obra.visivelPara ?? []).map((v) => v.trim()).filter(Boolean);
    await sb.from("obra_visibilidade").delete().eq("obra_id", oid);
    if (labels.length) {
      const lower = labels.map((l) => l.toLowerCase());
      const { data: users } = await sb
        .from("users")
        .select("id, nome, profile_id")
        .eq("organization_id", orgId)
        .is("deleted_at", null);
      const profileIds = [
        ...new Set(
          (users ?? [])
            .map((u) => (u as { profile_id?: string | null }).profile_id)
            .filter((x): x is string => !!x)
        ),
      ];
      const perfilById = new Map<string, string>();
      if (profileIds.length) {
        const { data: profiles } = await sb
          .from("profiles")
          .select("id, nome")
          .in("id", profileIds);
        for (const p of profiles ?? []) {
          perfilById.set(
            (p as { id: string }).id,
            ((p as { nome?: string }).nome ?? "").toLowerCase()
          );
        }
      }
      const matched = (users ?? []).filter((u) => {
        const row = u as {
          id: string;
          nome?: string;
          profile_id?: string | null;
        };
        const perfil = row.profile_id
          ? (perfilById.get(row.profile_id) ?? "")
          : "";
        const nome = (row.nome ?? "").toLowerCase();
        return lower.some(
          (t) => t === perfil || t === nome || t === "administrador"
        );
      });
      if (matched.length) {
        const { error: ve } = await sb.from("obra_visibilidade").insert(
          matched.map((u) => ({
            obra_id: oid,
            user_id: (u as { id: string }).id,
          })) as never
        );
        warn("obra_visibilidade", ve);
      }
    }
  }
  return { ok: !error };
}

export async function dualWriteConta(
  conta: ContaBancaria,
  orgId: string = DEMO_ORG_ID
): Promise<SoftResult> {
  const sb = client();
  if (!sb) return { ok: true, skipped: true };
  const { error } = await sb.from("contas_bancarias").upsert(
    {
      id: stableUuid(conta.id),
      organization_id: orgId,
      nome: conta.nome,
      banco: conta.banco ?? null,
      tipo: conta.tipo,
      proprietario: conta.proprietario,
      data_inicial: conta.dataInicial,
      valor_inicial: conta.valorInicial,
      saldo: conta.saldo,
      ativa: conta.ativa,
      bloqueio_ate: conta.bloqueioAte ?? null,
      boleto: conta.boleto ?? false,
    } as never,
    { onConflict: "id" }
  );
  warn("contas_bancarias", error);
  return { ok: !error };
}

export async function dualWriteLancamento(
  lan: Lancamento,
  orgId: string = DEMO_ORG_ID
): Promise<SoftResult> {
  const sb = client();
  if (!sb) return { ok: true, skipped: true };
  const lanId = stableUuid(lan.id);
  const { error } = await sb.from("lancamentos").upsert(
    {
      id: lanId,
      organization_id: orgId,
      descricao: lan.descricao,
      favorecido: lan.favorecido,
      categoria_id: lan.categoriaId ? stableUuid(lan.categoriaId) : null,
      competencia: lan.competencia,
      vencimento: lan.vencimento,
      pagador: lan.pagador ?? null,
      conta_id: lan.contaId ? stableUuid(lan.contaId) : null,
      valor: lan.valor,
      numero_doc: lan.numeroDoc ?? null,
      forma: lan.forma,
      condicao: lan.condicao,
      order_id: lan.orderId ? stableUuid(lan.orderId) : null,
      observacoes: lan.observacoes ?? null,
    } as never,
    { onConflict: "id" }
  );
  warn("lancamentos", error);
  if (!error && lan.centros?.length) {
    await dualWriteLancamentoCentros(lanId, lan.centros);
  }
  return { ok: !error };
}

async function dualWriteLancamentoCentros(
  lancamentoId: string,
  centros: CentroFin[]
): Promise<void> {
  const sb = client();
  if (!sb) return;
  await sb.from("lancamento_centros").delete().eq("lancamento_id", lancamentoId);
  const rows = centros.map((c, i) => ({
    id: stableUuid(`${lancamentoId}:c:${i}`),
    lancamento_id: lancamentoId,
    centro_tipo: c.tipo,
    obra_id: c.obraId ? stableUuid(c.obraId) : null,
    label: c.label,
    valor: c.valor ?? null,
    pct: c.pct ?? null,
  }));
  const { error } = await sb.from("lancamento_centros").insert(rows as never);
  warn("lancamento_centros", error);
}

export async function dualWritePagamento(
  pag: Pagamento,
  orgId: string = DEMO_ORG_ID
): Promise<SoftResult> {
  const sb = client();
  if (!sb) return { ok: true, skipped: true };
  const { error } = await sb.from("pagamentos").upsert(
    {
      id: stableUuid(pag.id),
      organization_id: orgId,
      lancamento_id: pag.lancamentoId
        ? stableUuid(pag.lancamentoId)
        : null,
      parcela: pag.parcela ?? null,
      vencimento: pag.vencimento,
      valor: pag.valor,
      valor_pago: pag.valorPago,
      status: pag.status,
      favorecido: pag.favorecido ?? null,
      descricao: pag.descricao ?? null,
      categoria_id: pag.categoriaId ? stableUuid(pag.categoriaId) : null,
      conta_id: pag.contaId ? stableUuid(pag.contaId) : null,
      centro_label: pag.centroLabel ?? null,
      forma: pag.forma ?? null,
      condicao: pag.condicao ?? null,
      numero_doc: pag.numeroDoc ?? null,
      pago_em: pag.pagoEm ?? null,
      conciliado: pag.conciliado,
    } as never,
    { onConflict: "id" }
  );
  warn("pagamentos", error);
  return { ok: !error };
}

export async function dualWriteSolicitacao(
  sc: Solicitacao,
  orgId: string = DEMO_ORG_ID
): Promise<SoftResult> {
  const sb = client();
  if (!sb) return { ok: true, skipped: true };
  const id = stableUuid(sc.id);
  const { error } = await sb.from("purchase_requests").upsert(
    {
      id,
      organization_id: orgId,
      numero: sc.numero,
      descricao: sc.descricao,
      solicitante: sc.solicitante,
      necessidade: sc.necessidade,
      urgente: sc.urgente,
      status: sc.status,
      obra_id:
        sc.centro.tipo === "obra" && sc.centro.obraId
          ? stableUuid(sc.centro.obraId)
          : null,
      centro_tipo: sc.centro.tipo,
      aprovado_por: sc.aprovadoPor ?? null,
      aprovado_em: sc.aprovadoEm ?? null,
      motivo_recusa: sc.motivoRecusa ?? null,
      criado_em: sc.criadoEm,
    } as never,
    { onConflict: "id" }
  );
  warn("purchase_requests", error);
  if (!error) {
    await sb.from("purchase_request_items").delete().eq("request_id", id);
    if (sc.itens.length) {
      const { error: ie } = await sb.from("purchase_request_items").insert(
        sc.itens.map((it, i) => ({
          id: stableUuid(it.id),
          request_id: id,
          descricao: it.descricao,
          unidade: it.unidade,
          quantidade: it.quantidade,
          quantidade_cotada: it.quantidadeCotada,
          quantidade_comprada: it.quantidadeComprada,
          quantidade_recebida: it.quantidadeRecebida,
          status: it.status,
          ordem: i,
        })) as never
      );
      warn("purchase_request_items", ie);
    }
  }
  return { ok: !error };
}

export async function dualWriteCotacao(
  cot: Cotacao,
  orgId: string = DEMO_ORG_ID
): Promise<SoftResult> {
  const sb = client();
  if (!sb) return { ok: true, skipped: true };
  const id = stableUuid(cot.id);
  const { error } = await sb.from("quotations").upsert(
    {
      id,
      organization_id: orgId,
      numero: cot.numero,
      descricao: cot.descricao,
      request_id: cot.requestId ? stableUuid(cot.requestId) : null,
      obra_id:
        cot.centro.tipo === "obra" && "obraId" in cot.centro
          ? stableUuid(cot.centro.obraId)
          : null,
      centro_tipo: cot.centro.tipo,
      centro_label: cot.centro.label,
      status: cot.status,
      prioridade: cot.prioridade,
      necessidade: cot.necessidade ?? null,
      solicitante: cot.solicitante,
    } as never,
    { onConflict: "id" }
  );
  warn("quotations", error);
  if (error) return { ok: false };

  await sb.from("quotation_prices").delete().eq("quotation_id", id);
  await sb.from("quotation_items").delete().eq("quotation_id", id);
  await sb.from("quotation_suppliers").delete().eq("quotation_id", id);

  if (cot.itens.length) {
    const { error: ie } = await sb.from("quotation_items").insert(
      cot.itens.map((it, i) => ({
        id: stableUuid(it.id),
        quotation_id: id,
        request_item_id: it.requestItemId
          ? stableUuid(it.requestItemId)
          : null,
        descricao: it.descricao,
        unidade: it.unidade,
        quantidade: it.quantidade,
        valor_orcamento: it.valorOrcamento,
        ordem: i,
      })) as never
    );
    warn("quotation_items", ie);
  }

  if (cot.fornecedores.length) {
    const { error: se } = await sb.from("quotation_suppliers").insert(
      cot.fornecedores.map((f) => ({
        id: stableUuid(f.id),
        quotation_id: id,
        fornecedor: f.fornecedor,
        contato: f.contato ?? null,
        email: f.email ?? null,
        telefone: f.telefone ?? null,
        qualificacao: f.qualificacao,
        public_token: f.publicToken,
        respondido: f.respondido,
      })) as never
    );
    warn("quotation_suppliers", se);
  }

  if (cot.precos.length) {
    const { error: pe } = await sb.from("quotation_prices").insert(
      cot.precos.map((p) => ({
        id: stableUuid(p.id),
        quotation_id: id,
        item_id: stableUuid(p.itemId),
        supplier_id: stableUuid(p.supplierId),
        preco_unitario: p.precoUnitario,
        quantidade_cotada: p.quantidadeCotada,
        prazo_dias: p.prazoDias ?? null,
        vencedor: p.vencedor,
      })) as never
    );
    warn("quotation_prices", pe);
  }

  return { ok: true };
}

export async function dualWriteOrdem(
  oc: OrdemCompra,
  orgId: string = DEMO_ORG_ID
): Promise<SoftResult> {
  const sb = client();
  if (!sb) return { ok: true, skipped: true };
  const id = stableUuid(oc.id);
  const { error } = await sb.from("purchase_orders").upsert(
    {
      id,
      organization_id: orgId,
      numero: oc.numero,
      request_id: oc.requestId ? stableUuid(oc.requestId) : null,
      quotation_id: oc.quotationId ? stableUuid(oc.quotationId) : null,
      fornecedor: oc.fornecedor,
      descricao: oc.descricao,
      obra_id:
        oc.centro.tipo === "obra" && "obraId" in oc.centro
          ? stableUuid(oc.centro.obraId)
          : null,
      valor: oc.valor,
      status: oc.compraStatus,
      aprovacao_status: oc.aprovacaoStatus,
      compra_status: oc.compraStatus,
      frete: oc.frete,
      outras_despesas: oc.outrasDespesas,
      impostos: oc.impostos,
      desconto: oc.desconto,
      previsao_entrega: oc.previsaoEntrega ?? null,
    } as never,
    { onConflict: "id" }
  );
  warn("purchase_orders", error);
  if (!error && oc.itens.length) {
    await sb.from("purchase_order_items").delete().eq("order_id", id);
    const { error: ie } = await sb.from("purchase_order_items").insert(
      oc.itens.map((it, i) => ({
        id: stableUuid(it.id),
        order_id: id,
        quotation_item_id: it.quotationItemId
          ? stableUuid(it.quotationItemId)
          : null,
        descricao: it.descricao,
        unidade: it.unidade,
        quantidade: it.quantidade,
        valor_unitario: it.valorUnitario,
        valor: it.valor,
        ordem: i,
      })) as never
    );
    warn("purchase_order_items", ie);
  }
  return { ok: !error };
}

export async function dualWriteFaturamento(
  fat: Faturamento,
  orgId: string = DEMO_ORG_ID
): Promise<SoftResult> {
  const sb = client();
  if (!sb) return { ok: true, skipped: true };
  const { error } = await sb.from("faturamentos").upsert(
    {
      id: stableUuid(fat.id),
      organization_id: orgId,
      descricao: fat.descricao,
      cliente: fat.cliente,
      natureza_id: stableUuid(fat.naturezaId),
      competencia: fat.competencia,
      vencimento: fat.vencimento,
      centro_tipo: fat.centro.tipo,
      obra_id: fat.centro.obraId ? stableUuid(fat.centro.obraId) : null,
      centro_label: fat.centro.label,
      conta_id: stableUuid(fat.contaId),
      valor_bruto: fat.valorBruto,
      impostos_retidos: fat.impostosRetidos,
      valor_liquido: fat.valorLiquido,
      forma: fat.forma,
      vendedor: fat.vendedor ?? null,
    } as never,
    { onConflict: "id" }
  );
  warn("faturamentos", error);
  return { ok: !error };
}

export async function dualWriteRecebimento(
  rec: Recebimento,
  orgId: string = DEMO_ORG_ID
): Promise<SoftResult> {
  const sb = client();
  if (!sb) return { ok: true, skipped: true };
  const { error } = await sb.from("recebimentos").upsert(
    {
      id: stableUuid(rec.id),
      organization_id: orgId,
      faturamento_id: rec.faturamentoId
        ? stableUuid(rec.faturamentoId)
        : null,
      parcela: rec.parcela,
      vencimento: rec.vencimento,
      valor: rec.valor,
      valor_recebido: rec.valorRecebido,
      status: rec.status,
      cliente: rec.cliente,
      descricao: rec.descricao,
      natureza_id: rec.naturezaId ? stableUuid(rec.naturezaId) : null,
      conta_id: stableUuid(rec.contaId),
      centro_label: rec.centroLabel,
      forma: rec.forma,
      recebido_em: rec.recebidoEm ?? null,
      conciliado: rec.conciliado,
    } as never,
    { onConflict: "id" }
  );
  warn("recebimentos", error);
  return { ok: !error };
}

export async function dualWriteInsumo(
  insumo: Insumo,
  orgId: string = DEMO_ORG_ID
): Promise<SoftResult> {
  const sb = client();
  if (!sb) return { ok: true, skipped: true };
  const { error } = await sb.from("insumos").upsert(
    {
      id: stableUuid(insumo.id),
      organization_id: orgId,
      codigo: insumo.codigo,
      descricao: insumo.descricao,
      grupo: insumo.grupo,
      unidade: insumo.unidade,
      tipo: insumo.tipo ?? null,
      base: insumo.base,
      custo_unitario: insumo.custoUnitario,
      favorito: insumo.favorito,
      ativo: insumo.ativo,
      observacoes: insumo.observacoes ?? null,
    } as never,
    { onConflict: "id" }
  );
  warn("insumos", error);
  return { ok: !error };
}

export async function dualWriteComposicao(
  comp: Composicao,
  orgId: string = DEMO_ORG_ID
): Promise<SoftResult> {
  const sb = client();
  if (!sb) return { ok: true, skipped: true };
  const id = stableUuid(comp.id);
  const { error } = await sb.from("composicoes").upsert(
    {
      id,
      organization_id: orgId,
      codigo: comp.codigo,
      descricao: comp.descricao,
      unidade: comp.unidade,
      tipo: comp.tipo ?? null,
      base: comp.base,
      descricao_detalhada: comp.descricaoDetalhada ?? null,
      favorito: comp.favorito,
      ativo: comp.ativo,
      bdi_pct: comp.bdiPct,
    } as never,
    { onConflict: "id" }
  );
  warn("composicoes", error);
  if (!error) {
    await sb.from("composicao_itens").delete().eq("composicao_id", id);
    if (comp.itens.length) {
      const { error: ie } = await sb.from("composicao_itens").insert(
        comp.itens.map((it, i) => ({
          id: stableUuid(it.id),
          composicao_id: id,
          insumo_id: stableUuid(it.insumoId),
          coeficiente: it.coeficiente,
          ordem: i,
        })) as never
      );
      warn("composicao_itens", ie);
    }
  }
  return { ok: !error };
}

async function ensureBudgetId(
  obraId: string,
  orgId: string
): Promise<string | null> {
  const sb = client();
  if (!sb) return null;
  const bid = stableUuid(`budget:${obraId}`);
  const { error } = await sb.from("budgets").upsert(
    {
      id: bid,
      organization_id: orgId,
      development_id: null,
      obra_id: stableUuid(obraId),
      codigo: `BUD-${obraId.slice(0, 8)}`,
      status: "rascunho",
    } as never,
    { onConflict: "id" }
  );
  warn("budgets", error);
  return error ? null : bid;
}

export async function dualWriteOrcamentoNode(
  node: OrcamentoNode,
  orgId: string = DEMO_ORG_ID
): Promise<SoftResult> {
  const sb = client();
  if (!sb) return { ok: true, skipped: true };
  const budgetId = await ensureBudgetId(node.obraId, orgId);
  if (!budgetId) return { ok: false };
  const { error } = await sb.from("budget_nodes").upsert(
    {
      id: stableUuid(node.id),
      budget_id: budgetId,
      parent_id: node.parentId ? stableUuid(node.parentId) : null,
      kind: node.kind,
      codigo: node.codigo,
      descricao: node.descricao,
      unidade: node.unidade,
      quantidade: node.quantidade,
      custo_unit: node.custoUnit,
      orcado: node.orcado,
      realizado: node.realizado,
      fisico_pct: node.fisicoPct,
      bdi_pct: node.bdiPct,
      composicao_id: node.composicaoId
        ? stableUuid(node.composicaoId)
        : null,
      insumo_id: node.insumoId ? stableUuid(node.insumoId) : null,
      grupo: node.grupo ?? null,
      ordem: node.ordem,
    } as never,
    { onConflict: "id" }
  );
  warn("budget_nodes", error);
  return { ok: !error };
}

export async function dualWriteTransferencia(
  tr: Transferencia,
  orgId: string = DEMO_ORG_ID
): Promise<SoftResult> {
  const sb = client();
  if (!sb) return { ok: true, skipped: true };
  const { error } = await sb.from("transferencias").upsert(
    {
      id: stableUuid(tr.id),
      organization_id: orgId,
      data: tr.data,
      descricao: tr.descricao,
      de_conta_id: stableUuid(tr.deContaId),
      para_conta_id: stableUuid(tr.paraContaId),
      valor: tr.valor,
      pago: tr.pago,
    } as never,
    { onConflict: "id" }
  );
  warn("transferencias", error);
  return { ok: !error };
}

export async function dualWritePreLancamento(
  pre: PreLancamento,
  orgId: string = DEMO_ORG_ID
): Promise<SoftResult> {
  const sb = client();
  if (!sb) return { ok: true, skipped: true };
  const { error } = await sb.from("pre_lancamentos").upsert(
    {
      id: stableUuid(pre.id),
      organization_id: orgId,
      descricao: pre.descricao,
      valor: pre.valor,
      centro_tipo: pre.centro.tipo,
      obra_id: pre.centro.obraId ? stableUuid(pre.centro.obraId) : null,
      centro_label: pre.centro.label,
      solicitante: pre.solicitante,
      status: pre.status,
      motivo_recusa: pre.motivoRecusa ?? null,
      lancamento_id: pre.lancamentoId
        ? stableUuid(pre.lancamentoId)
        : null,
    } as never,
    { onConflict: "id" }
  );
  warn("pre_lancamentos", error);
  return { ok: !error };
}

/** Anexos de SC/cotação/etc. → public.files (metadados; sem upload de blob). */
export async function dualWriteAnexo(input: {
  id: string;
  nome: string;
  rotina: string;
  registroTipo: string;
  registroId: string;
  quando?: string;
  orgId?: string;
}): Promise<SoftResult> {
  const sb = client();
  if (!sb) return { ok: true, skipped: true };
  const orgId = input.orgId ?? DEMO_ORG_ID;
  const { error } = await sb.from("files").upsert(
    {
      id: stableUuid(input.id),
      organization_id: orgId,
      nome: input.nome,
      rotina: input.rotina,
      registro_tipo: input.registroTipo,
      registro_id: stableUuid(input.registroId),
      created_at: input.quando ?? new Date().toISOString(),
    } as never,
    { onConflict: "id" }
  );
  warn("files", error);
  return { ok: !error };
}

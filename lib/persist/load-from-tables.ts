/**
 * Leitura preferindo tabelas D/E/G quando Supabase tem linhas.
 * Snapshot continua fallback / complemento (nós de orçamento, etc.).
 */
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type {
  ComprasConfig,
  Cotacao,
  OrdemCompra,
  Solicitacao,
  ComprasState,
} from "@/lib/domain/compras-types";
import type {
  Categoria,
  ContaBancaria,
  Faturamento,
  FinanceiroState,
  FormaPagamento,
  CondicaoPagamento,
  Lancamento,
  NaturezaReceita,
  Pagamento,
  PlanoConta,
  PreLancamento,
  Recebimento,
  ResultadoGrupo,
  ClassificacaoObra,
  Transferencia,
} from "@/lib/domain/financeiro-types";
import type {
  Composicao,
  Insumo,
  InsumoGrupo,
  Obra,
  ObraStatus,
  ObrasCatalogState,
  OrcamentoNode,
  BudgetNodeKind,
} from "@/lib/domain/obras-types";
import { DEMO_ORG_ID } from "./store-keys";

function client() {
  if (!isSupabaseConfigured()) return null;
  return createClient();
}

function dateStr(v: string | null | undefined): string {
  if (!v) return new Date().toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

/** Overlay parcial de Obras/catálogo/orçamento a partir das tabelas D. */
export async function loadObrasFromTables(
  orgId: string = DEMO_ORG_ID
): Promise<Partial<ObrasCatalogState> | null> {
  const sb = client();
  if (!sb) return null;

  const [obrasRes, insumosRes, compsRes, budgetsRes] = await Promise.all([
    sb
      .from("obras")
      .select(
        "id, codigo, nome, tipo, status, cliente_nome, visivel_para, fisico_pct, orcado, realizado, bdi_pct, area_total, unidade, art, cei_cno, responsavel_tecnico, responsavel_obra, deleted_at"
      )
      .eq("organization_id", orgId)
      .is("deleted_at", null)
      .order("codigo"),
    sb
      .from("insumos")
      .select("*")
      .eq("organization_id", orgId)
      .is("deleted_at", null),
    sb
      .from("composicoes")
      .select("*")
      .eq("organization_id", orgId)
      .is("deleted_at", null),
    sb.from("budgets").select("id, obra_id").eq("organization_id", orgId),
  ]);

  const patch: Partial<ObrasCatalogState> = {};
  let any = false;

  if (obrasRes.error) {
    console.warn("[load-tables] obras:", obrasRes.error.message);
  }
  if (obrasRes.data?.length) {
    any = true;
    patch.obras = obrasRes.data.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: String(row.id),
        codigo: String(row.codigo),
        nome: String(row.nome),
        tipo: String(row.tipo ?? "loteamento"),
        status: (row.status as ObraStatus) ?? "em_orcamento",
        clienteNome: String(row.cliente_nome ?? "Cliente"),
        visivelPara: Array.isArray(row.visivel_para)
          ? (row.visivel_para as string[])
          : ["Administrador"],
        fisicoPct: Number(row.fisico_pct ?? 0),
        orcado: Number(row.orcado ?? 0),
        realizado: Number(row.realizado ?? 0),
        bdiPct: Number(row.bdi_pct ?? 0.25),
        areaTotal: row.area_total != null ? Number(row.area_total) : undefined,
        unidade: String(row.unidade ?? "m²"),
        art: row.art ? String(row.art) : undefined,
        ceiCno: row.cei_cno ? String(row.cei_cno) : undefined,
        responsavelTecnico: row.responsavel_tecnico
          ? String(row.responsavel_tecnico)
          : undefined,
        responsavelObra: row.responsavel_obra
          ? String(row.responsavel_obra)
          : undefined,
        propostaStatus: "em_elaboracao",
        exibirLancamentos: true,
        exibirFaturamentos: true,
        exibirCompras: true,
      } satisfies Obra;
    });
  }

  if (insumosRes.data?.length) {
    any = true;
    patch.insumos = insumosRes.data.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: String(row.id),
        codigo: String(row.codigo),
        descricao: String(row.descricao),
        grupo: (row.grupo as InsumoGrupo) ?? "material",
        unidade: String(row.unidade),
        tipo: row.tipo ? String(row.tipo) : undefined,
        base: String(row.base ?? "SINAPI"),
        custoUnitario: Number(row.custo_unitario ?? 0),
        favorito: Boolean(row.favorito),
        ativo: Boolean(row.ativo ?? true),
        observacoes: row.observacoes ? String(row.observacoes) : undefined,
      } satisfies Insumo;
    });
  }

  if (compsRes.data?.length) {
    any = true;
    const ids = compsRes.data.map((r) => String((r as { id: string }).id));
    const { data: citens } = await sb
      .from("composicao_itens")
      .select("*")
      .in("composicao_id", ids);
    const byComp = new Map<string, typeof citens>();
    for (const it of citens ?? []) {
      const row = it as Record<string, unknown>;
      const cid = String(row.composicao_id);
      const list = byComp.get(cid) ?? [];
      list.push(it);
      byComp.set(cid, list);
    }
    patch.composicoes = compsRes.data.map((r) => {
      const row = r as Record<string, unknown>;
      const id = String(row.id);
      return {
        id,
        codigo: String(row.codigo),
        descricao: String(row.descricao),
        unidade: String(row.unidade),
        tipo: row.tipo ? String(row.tipo) : undefined,
        base: String(row.base ?? "SINAPI"),
        descricaoDetalhada: row.descricao_detalhada
          ? String(row.descricao_detalhada)
          : undefined,
        favorito: Boolean(row.favorito),
        ativo: Boolean(row.ativo ?? true),
        bdiPct: Number(row.bdi_pct ?? 0.25),
        itens: (byComp.get(id) ?? []).map((it) => {
          const i = it as Record<string, unknown>;
          return {
            id: String(i.id),
            insumoId: String(i.insumo_id),
            coeficiente: Number(i.coeficiente ?? 1),
          };
        }),
      } satisfies Composicao;
    });
  }

  if (budgetsRes.data?.length) {
    const budgetIds = budgetsRes.data.map((b) =>
      String((b as { id: string }).id)
    );
    const obraByBudget = new Map(
      budgetsRes.data.map((b) => {
        const row = b as { id: string; obra_id?: string | null };
        return [String(row.id), row.obra_id ? String(row.obra_id) : ""];
      })
    );
    const { data: nodes } = await sb
      .from("budget_nodes")
      .select("*")
      .in("budget_id", budgetIds);
    if (nodes?.length) {
      const mapped: OrcamentoNode[] = [];
      for (const n of nodes) {
        const row = n as Record<string, unknown>;
        const budgetId = String(row.budget_id);
        const obraId = obraByBudget.get(budgetId);
        if (!obraId) continue;
        mapped.push({
          id: String(row.id),
          obraId,
          parentId: row.parent_id ? String(row.parent_id) : undefined,
          kind: (row.kind as BudgetNodeKind) ?? "item",
          codigo: String(row.codigo),
          descricao: String(row.descricao),
          unidade: String(row.unidade ?? "un"),
          quantidade: Number(row.quantidade ?? 0),
          custoUnit: Number(row.custo_unit ?? 0),
          orcado: Number(row.orcado ?? 0),
          realizado: Number(row.realizado ?? 0),
          fisicoPct: Number(row.fisico_pct ?? 0),
          bdiPct: Number(row.bdi_pct ?? 0),
          composicaoId: row.composicao_id
            ? String(row.composicao_id)
            : undefined,
          insumoId: row.insumo_id ? String(row.insumo_id) : undefined,
          grupo: row.grupo ? (row.grupo as InsumoGrupo) : undefined,
          ordem: Number(row.ordem ?? 0),
        });
      }
      if (mapped.length) {
        any = true;
        patch.nodes = mapped;
      }
    }
  }

  return any ? patch : null;
}

/** Overlay parcial de Financeiro a partir das tabelas G. */
export async function loadFinanceiroFromTables(
  orgId: string = DEMO_ORG_ID
): Promise<Partial<FinanceiroState> | null> {
  const sb = client();
  if (!sb) return null;

  const [
    planosRes,
    catsRes,
    natsRes,
    contasRes,
    lansRes,
    pagsRes,
    fatsRes,
    recsRes,
    trsRes,
    preRes,
  ] = await Promise.all([
    sb.from("planos_conta").select("*").eq("organization_id", orgId),
    sb.from("categorias_financeiras").select("*").eq("organization_id", orgId),
    sb.from("naturezas_receita").select("*").eq("organization_id", orgId),
    sb.from("contas_bancarias").select("*").eq("organization_id", orgId),
    sb.from("lancamentos").select("*").eq("organization_id", orgId),
    sb.from("pagamentos").select("*").eq("organization_id", orgId),
    sb.from("faturamentos").select("*").eq("organization_id", orgId),
    sb.from("recebimentos").select("*").eq("organization_id", orgId),
    sb.from("transferencias").select("*").eq("organization_id", orgId),
    sb.from("pre_lancamentos").select("*").eq("organization_id", orgId),
  ]);

  for (const [name, res] of [
    ["planos_conta", planosRes],
    ["categorias_financeiras", catsRes],
    ["naturezas_receita", natsRes],
    ["contas_bancarias", contasRes],
    ["lancamentos", lansRes],
    ["pagamentos", pagsRes],
    ["faturamentos", fatsRes],
    ["recebimentos", recsRes],
    ["transferencias", trsRes],
    ["pre_lancamentos", preRes],
  ] as const) {
    if (res.error) {
      console.warn(`[load-tables] ${name}:`, res.error.message);
    }
  }

  const patch: Partial<FinanceiroState> = {};
  let any = false;

  if (planosRes.data?.length) {
    any = true;
    patch.planos = planosRes.data.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: String(row.id),
        nome: String(row.nome),
        fluxo: row.fluxo as PlanoConta["fluxo"],
        grupoResultados: String(row.grupo_resultados) as ResultadoGrupo,
        ativo: Boolean(row.ativo ?? true),
      };
    });
  }

  if (catsRes.data?.length) {
    any = true;
    patch.categorias = catsRes.data.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: String(row.id),
        nome: String(row.nome),
        planoId: String(row.plano_id),
        classificacaoObra: String(
          row.classificacao_obra ?? "a classificar"
        ) as ClassificacaoObra,
        ativo: Boolean(row.ativo ?? true),
      } satisfies Categoria;
    });
  }

  if (natsRes.data?.length) {
    any = true;
    patch.naturezas = natsRes.data.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: String(row.id),
        nome: String(row.nome),
        ativo: Boolean(row.ativo ?? true),
        linhaResultados: row.linha_resultados
          ? String(row.linha_resultados)
          : undefined,
      } satisfies NaturezaReceita;
    });
  }

  if (contasRes.data?.length) {
    any = true;
    patch.contas = contasRes.data.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: String(row.id),
        nome: String(row.nome),
        banco: String(row.banco ?? ""),
        tipo: row.tipo as ContaBancaria["tipo"],
        proprietario: row.proprietario as ContaBancaria["proprietario"],
        dataInicial: dateStr(row.data_inicial as string),
        valorInicial: Number(row.valor_inicial ?? 0),
        saldo: Number(row.saldo ?? 0),
        ativa: Boolean(row.ativa ?? true),
        bloqueioAte: row.bloqueio_ate
          ? dateStr(row.bloqueio_ate as string)
          : undefined,
        boleto: Boolean(row.boleto ?? false),
      } satisfies ContaBancaria;
    });
  }

  const centrosByLan = new Map<
    string,
    { tipo: "obra" | "empresa"; obraId?: string; label: string; valor?: number; pct?: number }[]
  >();
  if (lansRes.data?.length) {
    const lanIds = lansRes.data.map((r) => String((r as { id: string }).id));
    const { data: centros } = await sb
      .from("lancamento_centros")
      .select("*")
      .in("lancamento_id", lanIds);
    for (const c of centros ?? []) {
      const row = c as Record<string, unknown>;
      const lid = String(row.lancamento_id);
      const list = centrosByLan.get(lid) ?? [];
      list.push({
        tipo: row.centro_tipo as "obra" | "empresa",
        obraId: row.obra_id ? String(row.obra_id) : undefined,
        label: String(row.label),
        valor: row.valor != null ? Number(row.valor) : undefined,
        pct: row.pct != null ? Number(row.pct) : undefined,
      });
      centrosByLan.set(lid, list);
    }
    any = true;
    patch.lancamentos = lansRes.data.map((r) => {
      const row = r as Record<string, unknown>;
      const id = String(row.id);
      return {
        id,
        descricao: String(row.descricao),
        favorecido: String(row.favorecido),
        categoriaId: String(row.categoria_id ?? ""),
        competencia: dateStr(row.competencia as string),
        vencimento: dateStr(row.vencimento as string),
        pagador: String(row.pagador ?? ""),
        contaId: String(row.conta_id ?? ""),
        valor: Number(row.valor),
        numeroDoc: row.numero_doc ? String(row.numero_doc) : undefined,
        forma: (row.forma as FormaPagamento) ?? "pix",
        condicao: (row.condicao as CondicaoPagamento) ?? "a_vista",
        centros: centrosByLan.get(id) ?? [
          { tipo: "empresa", label: "Empresa" },
        ],
        orderId: row.order_id ? String(row.order_id) : undefined,
        observacoes: row.observacoes ? String(row.observacoes) : undefined,
        criadoEm: dateStr(
          (row.created_at as string) ?? (row.competencia as string)
        ),
      } satisfies Lancamento;
    });
  }

  if (pagsRes.data?.length) {
    any = true;
    patch.pagamentos = pagsRes.data.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: String(row.id),
        lancamentoId: String(row.lancamento_id ?? ""),
        parcela: String(row.parcela ?? "1/1"),
        vencimento: dateStr(row.vencimento as string),
        valor: Number(row.valor),
        valorPago: Number(row.valor_pago ?? 0),
        status: (row.status as Pagamento["status"]) ?? "em_aberto",
        favorecido: String(row.favorecido ?? ""),
        descricao: String(row.descricao ?? ""),
        categoriaId: String(row.categoria_id ?? ""),
        contaId: String(row.conta_id ?? ""),
        centroLabel: String(row.centro_label ?? ""),
        forma: (row.forma as FormaPagamento) ?? "pix",
        condicao: (row.condicao as CondicaoPagamento) ?? "a_vista",
        numeroDoc: row.numero_doc ? String(row.numero_doc) : undefined,
        pagoEm: row.pago_em ? dateStr(row.pago_em as string) : undefined,
        conciliado: Boolean(row.conciliado),
        historico: [],
      } satisfies Pagamento;
    });
  }

  if (fatsRes.data?.length) {
    any = true;
    patch.faturamentos = fatsRes.data.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: String(row.id),
        descricao: String(row.descricao),
        cliente: String(row.cliente),
        naturezaId: String(row.natureza_id),
        competencia: dateStr(row.competencia as string),
        vencimento: dateStr(row.vencimento as string),
        centro: {
          tipo: (row.centro_tipo as "obra" | "empresa") ?? "empresa",
          obraId: row.obra_id ? String(row.obra_id) : undefined,
          label: String(row.centro_label ?? "Empresa"),
        },
        contaId: String(row.conta_id),
        valorBruto: Number(row.valor_bruto),
        impostosRetidos: Number(row.impostos_retidos ?? 0),
        valorLiquido: Number(row.valor_liquido),
        forma: (row.forma as FormaPagamento) ?? "pix",
        vendedor: row.vendedor ? String(row.vendedor) : undefined,
        criadoEm: dateStr(
          (row.created_at as string) ?? (row.competencia as string)
        ),
      } satisfies Faturamento;
    });
  }

  if (recsRes.data?.length) {
    any = true;
    patch.recebimentos = recsRes.data.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: String(row.id),
        faturamentoId: row.faturamento_id
          ? String(row.faturamento_id)
          : undefined,
        origem: "faturamento" as const,
        parcela: String(row.parcela ?? "1/1"),
        vencimento: dateStr(row.vencimento as string),
        valor: Number(row.valor),
        valorRecebido: Number(row.valor_recebido ?? 0),
        status: (row.status as Recebimento["status"]) ?? "em_aberto",
        cliente: String(row.cliente ?? ""),
        descricao: String(row.descricao ?? ""),
        naturezaId: row.natureza_id ? String(row.natureza_id) : undefined,
        contaId: String(row.conta_id),
        centroLabel: String(row.centro_label ?? ""),
        forma: (row.forma as FormaPagamento) ?? "pix",
        recebidoEm: row.recebido_em
          ? dateStr(row.recebido_em as string)
          : undefined,
        conciliado: Boolean(row.conciliado),
      } satisfies Recebimento;
    });
  }

  if (trsRes.data?.length) {
    any = true;
    patch.transferencias = trsRes.data.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: String(row.id),
        data: dateStr(row.data as string),
        descricao: String(row.descricao ?? ""),
        deContaId: String(row.de_conta_id),
        paraContaId: String(row.para_conta_id),
        valor: Number(row.valor),
        pago: Boolean(row.pago),
      } satisfies Transferencia;
    });
  }

  if (preRes.data?.length) {
    any = true;
    patch.preLancamentos = preRes.data.map((r) => {
      const row = r as Record<string, unknown>;
      const centroTipo = (row.centro_tipo as string) ?? "empresa";
      return {
        id: String(row.id),
        descricao: String(row.descricao),
        valor: Number(row.valor),
        centro:
          centroTipo === "obra"
            ? {
                tipo: "obra" as const,
                obraId: row.obra_id ? String(row.obra_id) : "",
                label: String(row.centro_label),
              }
            : {
                tipo: "empresa" as const,
                label: String(row.centro_label),
              },
        solicitante: String(row.solicitante ?? ""),
        status: (row.status as PreLancamento["status"]) ?? "pendente",
        motivoRecusa: row.motivo_recusa
          ? String(row.motivo_recusa)
          : undefined,
        criadoEm: dateStr(row.created_at as string),
        lancamentoId: row.lancamento_id
          ? String(row.lancamento_id)
          : undefined,
      } satisfies PreLancamento;
    });
  }

  return any ? patch : null;
}

/** Overlay parcial de Compras a partir das tabelas E. */
export async function loadComprasFromTables(
  orgId: string = DEMO_ORG_ID
): Promise<Partial<ComprasState> | null> {
  const sb = client();
  if (!sb) return null;

  const [cfgRes, scRes, cotRes, ocRes] = await Promise.all([
    sb.from("compras_config").select("*").eq("organization_id", orgId).maybeSingle(),
    sb.from("purchase_requests").select("*").eq("organization_id", orgId),
    sb.from("quotations").select("*").eq("organization_id", orgId),
    sb.from("purchase_orders").select("*").eq("organization_id", orgId),
  ]);

  const patch: Partial<ComprasState> = {};
  let any = false;

  if (cfgRes.data) {
    any = true;
    const row = cfgRes.data as Record<string, unknown>;
    patch.config = {
      cotacaoNumeroInicial: Number(row.cotacao_numero_inicial ?? 1),
      ocNumeroInicial: Number(row.oc_numero_inicial ?? 1),
      permitirOcSemCotacao: Boolean(row.permitir_oc_sem_cotacao),
      fornecedorDocumentoObrigatorio: Boolean(
        row.fornecedor_documento_obrigatorio ?? true
      ),
    } satisfies ComprasConfig;
  }

  if (scRes.data?.length) {
    any = true;
    const ids = scRes.data.map((r) => String((r as { id: string }).id));
    const { data: items } = await sb
      .from("purchase_request_items")
      .select("*")
      .in("request_id", ids);
    const byReq = new Map<string, typeof items>();
    for (const it of items ?? []) {
      const row = it as Record<string, unknown>;
      const rid = String(row.request_id);
      const list = byReq.get(rid) ?? [];
      list.push(it);
      byReq.set(rid, list);
    }
    patch.solicitacoes = scRes.data.map((r) => {
      const row = r as Record<string, unknown>;
      const id = String(row.id);
      const centroTipo = (row.centro_tipo as string) ?? "obra";
      const solicitacao: Solicitacao = {
        id,
        numero: String(row.numero),
        descricao: String(row.descricao ?? ""),
        centro:
          centroTipo === "empresa"
            ? { tipo: "empresa", label: "Empresa" }
            : {
                tipo: "obra",
                obraId: row.obra_id ? String(row.obra_id) : "",
                label: "Obra",
              },
        solicitante: String(row.solicitante ?? ""),
        criadoEm: dateStr(
          (row.criado_em as string) ?? (row.created_at as string)
        ),
        necessidade: dateStr(row.necessidade as string),
        urgente: Boolean(row.urgente),
        status: (row.status as Solicitacao["status"]) ?? "rascunho",
        motivoRecusa: row.motivo_recusa
          ? String(row.motivo_recusa)
          : undefined,
        aprovadoPor: row.aprovado_por ? String(row.aprovado_por) : undefined,
        aprovadoEm: row.aprovado_em
          ? dateStr(row.aprovado_em as string)
          : undefined,
        itens: (byReq.get(id) ?? []).map((it) => {
          const i = it as Record<string, unknown>;
          return {
            id: String(i.id),
            descricao: String(i.descricao),
            unidade: String(i.unidade ?? "un"),
            quantidade: Number(i.quantidade ?? 1),
            quantidadeCotada: Number(i.quantidade_cotada ?? 0),
            quantidadeComprada: Number(i.quantidade_comprada ?? 0),
            quantidadeRecebida: Number(i.quantidade_recebida ?? 0),
            status: String(i.status ?? "solicitado"),
          };
        }),
        cotacaoIds: [],
        ordemIds: [],
      };
      return solicitacao;
    });
  }

  if (cotRes.data?.length) {
    any = true;
    const ids = cotRes.data.map((r) => String((r as { id: string }).id));
    const [itensRes, forsRes, precosRes] = await Promise.all([
      sb.from("quotation_items").select("*").in("quotation_id", ids),
      sb.from("quotation_suppliers").select("*").in("quotation_id", ids),
      sb.from("quotation_prices").select("*").in("quotation_id", ids),
    ]);
    const group = <T extends Record<string, unknown>>(
      rows: T[] | null,
      key: string
    ) => {
      const m = new Map<string, T[]>();
      for (const r of rows ?? []) {
        const k = String(r[key]);
        const list = m.get(k) ?? [];
        list.push(r);
        m.set(k, list);
      }
      return m;
    };
    const itensBy = group(
      (itensRes.data ?? []) as Record<string, unknown>[],
      "quotation_id"
    );
    const forsBy = group(
      (forsRes.data ?? []) as Record<string, unknown>[],
      "quotation_id"
    );
    const precosBy = group(
      (precosRes.data ?? []) as Record<string, unknown>[],
      "quotation_id"
    );

    patch.cotacoes = cotRes.data.map((r) => {
      const row = r as Record<string, unknown>;
      const id = String(row.id);
      const centroTipo = (row.centro_tipo as string) ?? "obra";
      const cot: Cotacao = {
        id,
        numero: String(row.numero),
        descricao: String(row.descricao ?? ""),
        requestId: row.request_id ? String(row.request_id) : undefined,
        centro:
          centroTipo === "empresa"
            ? { tipo: "empresa", label: String(row.centro_label ?? "Empresa") }
            : {
                tipo: "obra",
                obraId: row.obra_id ? String(row.obra_id) : "",
                label: String(row.centro_label ?? "Obra"),
              },
        status: (row.status as Cotacao["status"]) ?? "em_aberto",
        prioridade: Boolean(row.prioridade),
        necessidade: row.necessidade
          ? dateStr(row.necessidade as string)
          : undefined,
        solicitante: String(row.solicitante ?? ""),
        criadoEm: dateStr(row.created_at as string),
        itens: (itensBy.get(id) ?? []).map((it) => ({
          id: String(it.id),
          requestItemId: it.request_item_id
            ? String(it.request_item_id)
            : undefined,
          descricao: String(it.descricao),
          unidade: String(it.unidade ?? "un"),
          quantidade: Number(it.quantidade),
          valorOrcamento: Number(it.valor_orcamento ?? 0),
        })),
        fornecedores: (forsBy.get(id) ?? []).map((f) => ({
          id: String(f.id),
          fornecedor: String(f.fornecedor),
          contato: f.contato ? String(f.contato) : undefined,
          email: f.email ? String(f.email) : undefined,
          telefone: f.telefone ? String(f.telefone) : undefined,
          qualificacao: Number(f.qualificacao ?? 0),
          publicToken: String(f.public_token ?? f.id),
          respondido: Boolean(f.respondido),
        })),
        precos: (precosBy.get(id) ?? []).map((p) => ({
          id: String(p.id),
          itemId: String(p.item_id),
          supplierId: String(p.supplier_id),
          precoUnitario: Number(p.preco_unitario ?? 0),
          quantidadeCotada: Number(p.quantidade_cotada ?? 0),
          prazoDias: p.prazo_dias != null ? Number(p.prazo_dias) : undefined,
          vencedor: Boolean(p.vencedor),
        })),
        ordemIds: [],
      };
      return cot;
    });
  }

  // Anexos (files) → SC / cotação
  const { data: files } = await sb
    .from("files")
    .select("id, nome, registro_tipo, registro_id, created_at")
    .eq("organization_id", orgId)
    .in("registro_tipo", ["solicitacao", "cotacao"])
    .is("deleted_at", null);
  if (files?.length && patch.solicitacoes) {
    any = true;
    const byReg = new Map<string, typeof files>();
    for (const f of files) {
      const row = f as Record<string, unknown>;
      if (String(row.registro_tipo) !== "solicitacao") continue;
      const rid = String(row.registro_id);
      const list = byReg.get(rid) ?? [];
      list.push(f);
      byReg.set(rid, list);
    }
    patch.solicitacoes = patch.solicitacoes.map((sc) => ({
      ...sc,
      arquivos: [
        ...(byReg.get(sc.id) ?? []).map((f) => {
          const row = f as Record<string, unknown>;
          return {
            id: String(row.id),
            nome: String(row.nome),
            quando: dateStr(row.created_at as string),
          };
        }),
        ...(sc.arquivos ?? []),
      ],
    }));
  }
  if (files?.length && patch.cotacoes) {
    any = true;
    const byReg = new Map<string, typeof files>();
    for (const f of files) {
      const row = f as Record<string, unknown>;
      if (String(row.registro_tipo) !== "cotacao") continue;
      const rid = String(row.registro_id);
      const list = byReg.get(rid) ?? [];
      list.push(f);
      byReg.set(rid, list);
    }
    patch.cotacoes = patch.cotacoes.map((c) => ({
      ...c,
      arquivos: [
        ...(byReg.get(c.id) ?? []).map((f) => {
          const row = f as Record<string, unknown>;
          return {
            id: String(row.id),
            nome: String(row.nome),
            quando: dateStr(row.created_at as string),
            origem: "upload" as const,
          };
        }),
        ...(c.arquivos ?? []),
      ],
    }));
  }

  if (ocRes.data?.length) {
    any = true;
    const ids = ocRes.data.map((r) => String((r as { id: string }).id));
    const { data: oitens } = await sb
      .from("purchase_order_items")
      .select("*")
      .in("order_id", ids);
    const byOc = new Map<string, typeof oitens>();
    for (const it of oitens ?? []) {
      const row = it as Record<string, unknown>;
      const oid = String(row.order_id);
      const list = byOc.get(oid) ?? [];
      list.push(it);
      byOc.set(oid, list);
    }
    patch.ordens = ocRes.data.map((r) => {
      const row = r as Record<string, unknown>;
      const id = String(row.id);
      const oc: OrdemCompra = {
        id,
        numero: String(row.numero),
        fornecedor: String(row.fornecedor),
        descricao: String(row.descricao ?? ""),
        centro: row.obra_id
          ? {
              tipo: "obra",
              obraId: String(row.obra_id),
              label: "Obra",
            }
          : { tipo: "empresa", label: "Empresa" },
        quotationId: row.quotation_id ? String(row.quotation_id) : undefined,
        requestId: row.request_id ? String(row.request_id) : undefined,
        valor: Number(row.valor),
        frete: Number(row.frete ?? 0),
        outrasDespesas: Number(row.outras_despesas ?? 0),
        impostos: Number(row.impostos ?? 0),
        desconto: Number(row.desconto ?? 0),
        aprovacaoStatus:
          (row.aprovacao_status as OrdemCompra["aprovacaoStatus"]) ??
          "aguardando_aprovacao",
        compraStatus:
          (row.compra_status as OrdemCompra["compraStatus"]) ?? "aguardando",
        criadoEm: dateStr(row.created_at as string),
        previsaoEntrega: row.previsao_entrega
          ? dateStr(row.previsao_entrega as string)
          : undefined,
        itens: (byOc.get(id) ?? []).map((it) => {
          const i = it as Record<string, unknown>;
          return {
            id: String(i.id),
            quotationItemId: i.quotation_item_id
              ? String(i.quotation_item_id)
              : undefined,
            descricao: String(i.descricao),
            unidade: String(i.unidade ?? "un"),
            quantidade: Number(i.quantidade),
            valorUnitario: Number(i.valor_unitario),
            valor: Number(i.valor),
          };
        }),
      };
      return oc;
    });
  }

  return any ? patch : null;
}

/** Mescla overlay de tabelas por cima do estado (arrays só se vierem populados). */
export function mergeTableOverlay<T extends object>(
  base: T,
  overlay: Partial<T> | null | undefined
): T {
  if (!overlay) return base;
  const next = { ...base };
  for (const [k, v] of Object.entries(overlay) as [keyof T, T[keyof T]][]) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    next[k] = v;
  }
  return next;
}

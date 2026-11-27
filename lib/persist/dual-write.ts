/**
 * Dual-write best-effort: store (snapshots) continua fonte da UI;
 * tabelas D/E/G recebem upsert quando Supabase está configurado.
 * Falhas só logam — nunca bloqueiam a UI.
 */
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ComprasConfig } from "@/lib/domain/compras-types";
import type {
  Categoria,
  CentroFin,
  ContaBancaria,
  Lancamento,
  NaturezaReceita,
  Pagamento,
  PlanoConta,
} from "@/lib/domain/financeiro-types";
import type { Obra } from "@/lib/domain/obras-types";
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
  obra: Pick<Obra, "id" | "codigo" | "nome" | "status" | "tipo" | "clienteNome">,
  orgId: string = DEMO_ORG_ID
): Promise<SoftResult> {
  const sb = client();
  if (!sb) return { ok: true, skipped: true };
  const { error } = await sb.from("obras").upsert(
    {
      id: stableUuid(obra.id),
      organization_id: orgId,
      codigo: obra.codigo,
      nome: obra.nome,
      status: obra.status,
      tipo: obra.tipo || "loteamento",
      cliente_nome: obra.clienteNome ?? null,
    } as never,
    { onConflict: "id" }
  );
  warn("obras", error);
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

/** Comissões e reservas do portal do corretor (§6.3). */

export type ComissaoStatus = "prevista" | "liberada" | "paga";

export type ComissaoCorretor = {
  id: string;
  corretorId: string;
  corretorNome: string;
  vendaRef: string;
  empreendimentoNome: string;
  valorPrevisto: number;
  valorLiberado: number;
  valorPago: number;
  status: ComissaoStatus;
  criadoEm: string;
};

export type ReservaLoteStatus = "ativa" | "expirada" | "convertida" | "cancelada";

export type ReservaLote = {
  id: string;
  lotId: string;
  empNome: string;
  quadra: string;
  lote: string;
  corretorId: string;
  corretorNome: string;
  clienteNome?: string;
  reservadoEm: string;
  /** Data pura YYYY-MM-DD — reserva expira após este dia. */
  expiraEm: string;
  status: ReservaLoteStatus;
};

export function comissoesDoCorretor(
  comissoes: ComissaoCorretor[],
  corretorId: string
): ComissaoCorretor[] {
  return comissoes.filter((c) => c.corretorId === corretorId);
}

export function totaisComissao(comissoes: ComissaoCorretor[]) {
  return comissoes.reduce(
    (acc, c) => ({
      previsto: acc.previsto + c.valorPrevisto,
      liberado: acc.liberado + c.valorLiberado,
      pago: acc.pago + c.valorPago,
    }),
    { previsto: 0, liberado: 0, pago: 0 }
  );
}

/** Marca reservas vencidas e devolve ids de lotes a liberar. */
export function expirarReservas(
  reservas: ReservaLote[],
  hoje: string
): { reservas: ReservaLote[]; lotesLiberados: string[] } {
  const lotesLiberados: string[] = [];
  const next = reservas.map((r) => {
    if (r.status === "ativa" && r.expiraEm < hoje) {
      lotesLiberados.push(r.lotId);
      return { ...r, status: "expirada" as const };
    }
    return r;
  });
  return { reservas: next, lotesLiberados };
}

export function podeReservarLote(
  reservas: ReservaLote[],
  lotId: string,
  lotStatus: string,
  hoje: string
): { ok: true } | { ok: false; motivo: string } {
  if (lotStatus !== "disponivel") {
    return { ok: false, motivo: "Lote não está disponível" };
  }
  const ativa = reservas.find(
    (r) => r.lotId === lotId && r.status === "ativa" && r.expiraEm >= hoje
  );
  if (ativa) {
    return {
      ok: false,
      motivo: `Já reservado por ${ativa.corretorNome} até ${ativa.expiraEm}`,
    };
  }
  return { ok: true };
}

export function criarReserva(input: {
  lotId: string;
  empNome: string;
  quadra: string;
  lote: string;
  corretorId: string;
  corretorNome: string;
  clienteNome?: string;
  hoje: string;
  prazoDias?: number;
  id: string;
}): ReservaLote {
  const dias = input.prazoDias ?? 3;
  const d = new Date(input.hoje + "T12:00:00");
  d.setDate(d.getDate() + dias);
  const expiraEm = d.toISOString().slice(0, 10);
  return {
    id: input.id,
    lotId: input.lotId,
    empNome: input.empNome,
    quadra: input.quadra,
    lote: input.lote,
    corretorId: input.corretorId,
    corretorNome: input.corretorNome,
    clienteNome: input.clienteNome,
    reservadoEm: input.hoje,
    expiraEm,
    status: "ativa",
  };
}

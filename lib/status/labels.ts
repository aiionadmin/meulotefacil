/** Rótulos de status com acento e inicial maiúscula (B08). */

const LABELS: Record<string, string> = {
  em_aberto: "Em aberto",
  em_atraso: "Em atraso",
  vencida: "Vencida",
  vencido: "Vencido",
  paga: "Paga",
  pago: "Pago",
  parcial: "Parcial",
  cancelada: "Cancelada",
  cancelado: "Cancelado",
  recebido: "Recebido",
  ativo: "Ativo",
  inativo: "Inativo",
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
  quitado: "Quitado",
  escritura: "Escritura",
  juridico: "Jurídico",
  advogado: "Advogado",
  caucionado: "Caucionado",
  invadido: "Invadido",
  em_execucao: "Em execução",
  em_andamento: "Em andamento",
  em_aprovacao: "Em aprovação",
  a_fazer: "A fazer",
  a_atender: "A atender",
  concluida: "Concluída",
  concluido: "Concluído",
  rascunho: "Rascunho",
  aprovado: "Aprovado",
  aprovada: "Aprovada",
  recusado: "Recusado",
  perdido: "Perdido",
  novo_contato: "Novo contato",
  em_atendimento: "Em atendimento",
  visita_agendada: "Visita agendada",
  proposta: "Proposta",
  reserva: "Reserva",
  carteira_em_dia: "Carteira em dia",
  cobranca: "Cobrança",
  anuncio: "Anúncio",
  indicacao: "Indicação",
  pre_cadastro: "Pré-cadastro",
  whatsapp: "WhatsApp",
  media: "Média",
  baixa: "Baixa",
  alta: "Alta",
  ok: "OK",
  erro: "Erro",
  pendente: "Pendente",
  enviado: "Enviado",
  devolvido: "Devolvido",
};

export function statusLabel(value: string | null | undefined): string {
  if (!value) return "—";
  const key = value.trim();
  if (LABELS[key]) return LABELS[key];
  const spaced = key.replace(/_/g, " ").trim();
  if (!spaced) return "—";
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

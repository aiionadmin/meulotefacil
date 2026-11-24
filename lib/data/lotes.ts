import type { Lote } from "./types";

/** Mapa ilustrado, grade 4x5 de lotes com polígonos SVG */
export const lotes: Lote[] = [
  // Quadra A
  { id: "l-a1", empreendimentoId: "emp-1", empreendimentoSlug: "residencial-horizonte", quadra: "A", numero: "01", metragem: 220, valor: 98000, status: "disponivel", points: "40,60 110,60 110,120 40,120" },
  { id: "l-a2", empreendimentoId: "emp-1", empreendimentoSlug: "residencial-horizonte", quadra: "A", numero: "02", metragem: 220, valor: 99500, status: "reservado", points: "118,60 188,60 188,120 118,120" },
  { id: "l-a3", empreendimentoId: "emp-1", empreendimentoSlug: "residencial-horizonte", quadra: "A", numero: "03", metragem: 240, valor: 108000, status: "disponivel", points: "196,60 266,60 266,120 196,120" },
  { id: "l-a4", empreendimentoId: "emp-1", empreendimentoSlug: "residencial-horizonte", quadra: "A", numero: "04", metragem: 240, valor: 110000, status: "vendido", points: "274,60 344,60 344,120 274,120" },
  { id: "l-a5", empreendimentoId: "emp-1", empreendimentoSlug: "residencial-horizonte", quadra: "A", numero: "05", metragem: 200, valor: 92000, status: "disponivel", points: "352,60 422,60 422,120 352,120" },
  // Quadra B
  { id: "l-b1", empreendimentoId: "emp-1", empreendimentoSlug: "residencial-horizonte", quadra: "B", numero: "01", metragem: 250, valor: 115000, status: "disponivel", points: "40,140 110,140 110,200 40,200" },
  { id: "l-b2", empreendimentoId: "emp-1", empreendimentoSlug: "residencial-horizonte", quadra: "B", numero: "02", metragem: 250, valor: 116500, status: "disponivel", points: "118,140 188,140 188,200 118,200" },
  { id: "l-b3", empreendimentoId: "emp-1", empreendimentoSlug: "residencial-horizonte", quadra: "B", numero: "03", metragem: 260, valor: 122000, status: "reservado", points: "196,140 266,140 266,200 196,200" },
  { id: "l-b4", empreendimentoId: "emp-1", empreendimentoSlug: "residencial-horizonte", quadra: "B", numero: "04", metragem: 260, valor: 124000, status: "vendido", points: "274,140 344,140 344,200 274,200" },
  { id: "l-b5", empreendimentoId: "emp-1", empreendimentoSlug: "residencial-horizonte", quadra: "B", numero: "05", metragem: 230, valor: 105000, status: "disponivel", points: "352,140 422,140 422,200 352,200" },
  // Quadra C
  { id: "l-c1", empreendimentoId: "emp-1", empreendimentoSlug: "residencial-horizonte", quadra: "C", numero: "01", metragem: 280, valor: 135000, status: "disponivel", points: "40,220 110,220 110,280 40,280" },
  { id: "l-c2", empreendimentoId: "emp-1", empreendimentoSlug: "residencial-horizonte", quadra: "C", numero: "02", metragem: 280, valor: 136000, status: "vendido", points: "118,220 188,220 188,280 118,280" },
  { id: "l-c3", empreendimentoId: "emp-1", empreendimentoSlug: "residencial-horizonte", quadra: "C", numero: "03", metragem: 300, valor: 148000, status: "disponivel", points: "196,220 266,220 266,280 196,280" },
  { id: "l-c4", empreendimentoId: "emp-1", empreendimentoSlug: "residencial-horizonte", quadra: "C", numero: "04", metragem: 300, valor: 150000, status: "reservado", points: "274,220 344,220 344,280 274,280" },
  { id: "l-c5", empreendimentoId: "emp-1", empreendimentoSlug: "residencial-horizonte", quadra: "C", numero: "05", metragem: 270, valor: 128000, status: "disponivel", points: "352,220 422,220 422,280 352,280" },
  // Quadra D
  { id: "l-d1", empreendimentoId: "emp-2", empreendimentoSlug: "jardim-das-colinas", quadra: "D", numero: "01", metragem: 320, valor: 168000, status: "disponivel", points: "40,300 110,300 110,360 40,360" },
  { id: "l-d2", empreendimentoId: "emp-2", empreendimentoSlug: "jardim-das-colinas", quadra: "D", numero: "02", metragem: 320, valor: 170000, status: "reservado", points: "118,300 188,300 188,360 118,360" },
  { id: "l-d3", empreendimentoId: "emp-2", empreendimentoSlug: "jardim-das-colinas", quadra: "D", numero: "03", metragem: 340, valor: 182000, status: "disponivel", points: "196,300 266,300 266,360 196,360" },
  { id: "l-d4", empreendimentoId: "emp-2", empreendimentoSlug: "jardim-das-colinas", quadra: "D", numero: "04", metragem: 340, valor: 185000, status: "vendido", points: "274,300 344,300 344,360 274,360" },
  { id: "l-d5", empreendimentoId: "emp-2", empreendimentoSlug: "jardim-das-colinas", quadra: "D", numero: "05", metragem: 310, valor: 160000, status: "disponivel", points: "352,300 422,300 422,360 352,360" },
];

export const loteStatusColor: Record<Lote["status"], string> = {
  disponivel: "#F7821E",
  reservado: "#FBBF24",
  vendido: "#94A3B8",
};

export const loteStatusLabel: Record<Lote["status"], string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
};

import type { FaseProcesso } from "./nucleos";

export type StatusProcesso =
  | "diagnostico"
  | "projetos"
  | "aprovacao_crf"
  | "registro"
  | "concluido";

export type Processo = {
  id: string;
  protocolo: string;
  nucleoNome: string;
  nucleoSlug: string;
  cidade: string;
  moradorNome: string;
  fase: FaseProcesso;
  status: StatusProcesso;
  atualizadoEm: string;
  docsPendentes: number;
};

export const processos: Processo[] = [
  {
    id: "proc-1",
    protocolo: "MLF-2026-0142",
    nucleoNome: "Jardim Mafhuz (1ª fase)",
    nucleoSlug: "jardim-mafhuz-1a-fase-campinas",
    cidade: "Campinas",
    moradorNome: "Ana Souza",
    fase: "projetos",
    status: "projetos",
    atualizadoEm: "2026-03-12",
    docsPendentes: 2,
  },
  {
    id: "proc-2",
    protocolo: "MLF-2025-0891",
    nucleoNome: "Vila Paula",
    nucleoSlug: "vila-paula-campinas",
    cidade: "Campinas",
    moradorNome: "Bruno Lima",
    fase: "registro",
    status: "registro",
    atualizadoEm: "2026-02-28",
    docsPendentes: 0,
  },
  {
    id: "proc-3",
    protocolo: "MLF-2026-0033",
    nucleoNome: "Kairos",
    nucleoSlug: "kairos-campinas",
    cidade: "Campinas",
    moradorNome: "Carla Mendes",
    fase: "planta",
    status: "projetos",
    atualizadoEm: "2026-03-10",
    docsPendentes: 1,
  },
  {
    id: "proc-4",
    protocolo: "MLF-2024-1204",
    nucleoNome: "Vila Diva (2ª fase)",
    nucleoSlug: "vila-diva-2a-fase-campinas",
    cidade: "Campinas",
    moradorNome: "Diego Rocha",
    fase: "registro",
    status: "concluido",
    atualizadoEm: "2025-08-01",
    docsPendentes: 0,
  },
];

export const statusProcessoLabel: Record<StatusProcesso, string> = {
  diagnostico: "Diagnóstico",
  projetos: "Projetos",
  aprovacao_crf: "Aprovação / CRF",
  registro: "Registro",
  concluido: "Concluído",
};

export const docsMorador = [
  {
    id: "dm-1",
    nome: "RG / CNH",
    status: "enviado" as const,
    processoId: "proc-1",
  },
  {
    id: "dm-2",
    nome: "Comprovante de residência",
    status: "pendente" as const,
    processoId: "proc-1",
  },
  {
    id: "dm-3",
    nome: "Declaração de posse",
    status: "pendente" as const,
    processoId: "proc-1",
  },
  {
    id: "dm-4",
    nome: "RG / CNH",
    status: "aprovado" as const,
    processoId: "proc-2",
  },
];

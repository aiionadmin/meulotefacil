import type { Parte5State } from "./parte5-types";

export const PARTE5_STORAGE_KEY = "mlf-parte5-store-v1";

export function seedParte5(): Parte5State {
  return {
    demandaTipos: [
      {
        id: "dt-1",
        nome: "Ligação de água",
        prazoDias: 15,
        responsavelPadrao: "Operações",
        checklist: ["Protocolo", "Taxa paga", "Vistoria"],
        ativo: true,
      },
      {
        id: "dt-2",
        nome: "Ligação de energia",
        prazoDias: 20,
        responsavelPadrao: "Operações",
        checklist: ["Projeto", "ART", "Protocolo"],
        ativo: true,
      },
      {
        id: "dt-3",
        nome: "Marcação de lote",
        prazoDias: 7,
        responsavelPadrao: "Campo",
        checklist: ["Agendamento", "Equipe", "Fotos"],
        ativo: true,
      },
      {
        id: "dt-4",
        nome: "Limpeza de lote",
        prazoDias: 5,
        responsavelPadrao: "Campo",
        checklist: ["Orçamento", "Execução"],
        ativo: true,
      },
      {
        id: "dt-5",
        nome: "Autorização para construir",
        prazoDias: 10,
        responsavelPadrao: "Atendimento",
        checklist: ["Projeto", "Taxas", "Aprovação"],
        ativo: true,
      },
      {
        id: "dt-6",
        nome: "Segunda via de documento",
        prazoDias: 3,
        responsavelPadrao: "Atendimento",
        checklist: ["Identidade", "Emissão"],
        ativo: true,
      },
      {
        id: "dt-7",
        nome: "Outros",
        prazoDias: 10,
        responsavelPadrao: "Atendimento",
        checklist: ["Descrição", "Encaminhar"],
        ativo: true,
      },
    ],
    demandas: [
      {
        id: "dem-1",
        numero: "DEM-100",
        tipoId: "dt-1",
        empresa: "Meu Lote Fácil",
        empreendimentoId: "dev-horizonte",
        empreendimentoNome: "Residencial Horizonte",
        quadra: "Q12",
        lote: "L05",
        clienteId: "p-ana",
        clienteNome: "Ana Souza",
        descricao: "Pedido de ligação de água via portal",
        prioridade: "alta",
        responsavel: "Operações",
        prazo: "2026-12-05",
        origem: "portal_cliente",
        status: "aberta",
        criadoEm: "2026-11-24",
        custoPrevisto: 450,
      },
      {
        id: "dem-2",
        numero: "DEM-101",
        tipoId: "dt-3",
        empresa: "Meu Lote Fácil",
        empreendimentoId: "dev-horizonte",
        empreendimentoNome: "Residencial Horizonte",
        quadra: "Q08",
        lote: "L02",
        clienteId: "p1",
        clienteNome: "Bruno Lima",
        descricao: "Marcação solicitada pelo corretor",
        prioridade: "normal",
        responsavel: "Campo",
        prazo: "2026-11-28",
        origem: "corretor",
        corretorId: "corr-1",
        status: "agendada",
        criadoEm: "2026-11-22",
      },
    ],
    portalCorretor: {
      corretorId: "corr-1",
      nome: "Ana Corretora",
    },
    portalCliente: {
      clienteId: "p-ana",
      nome: "Ana Souza",
      cpf: "123.456.789-00",
    },
  };
}

/** Isolamento: corretor só vê demandas com o próprio corretorId (ou sem vínculo de outro). */
export function demandasDoCorretor(
  state: Parte5State,
  corretorId: string
) {
  return state.demandas.filter(
    (d) => d.origem === "corretor" && d.corretorId === corretorId
  );
}

/** Isolamento: cliente só vê as próprias demandas. */
export function demandasDoCliente(state: Parte5State, clienteId: string) {
  return state.demandas.filter((d) => d.clienteId === clienteId);
}

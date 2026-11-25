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
        clienteId: "cli-1",
        clienteNome: "Maria Souza",
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
        clienteId: "cli-2",
        clienteNome: "João Lima",
        descricao: "Marcação solicitada pelo corretor Ana",
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
      clienteId: "cli-1",
      nome: "Maria Souza",
      cpf: "123.456.789-00",
    },
    materiaisVenda: [
      {
        id: "mat-1",
        titulo: "Tabela de preços 2026",
        tipo: "tabela",
        empreendimentoNome: "Residencial Horizonte",
        url: "/materiais/tabela-horizonte-2026.csv",
      },
      {
        id: "mat-2",
        titulo: "Folheto comercial",
        tipo: "folheto",
        empreendimentoNome: "Residencial Horizonte",
        url: "/materiais/folheto-horizonte.txt",
      },
      {
        id: "mat-3",
        titulo: "Planta baixa (PDF stub)",
        tipo: "planta",
        empreendimentoNome: "Jardins do Sol",
        url: "/materiais/planta-jardins.txt",
      },
    ],
    comissoes: [
      {
        id: "com-1",
        corretorId: "corr-1",
        corretorNome: "Ana Corretora",
        vendaRef: "CTR-1001",
        empreendimentoNome: "Residencial Horizonte",
        valorPrevisto: 3200,
        valorLiberado: 1600,
        valorPago: 0,
        status: "liberada",
        criadoEm: "2026-11-10",
      },
      {
        id: "com-2",
        corretorId: "corr-1",
        corretorNome: "Ana Corretora",
        vendaRef: "CTR-1008",
        empreendimentoNome: "Jardins do Sol",
        valorPrevisto: 2800,
        valorLiberado: 2800,
        valorPago: 2800,
        status: "paga",
        criadoEm: "2026-10-02",
      },
      {
        id: "com-3",
        corretorId: "corr-2",
        corretorNome: "Bruno Corretor",
        vendaRef: "CTR-1012",
        empreendimentoNome: "Residencial Horizonte",
        valorPrevisto: 4100,
        valorLiberado: 0,
        valorPago: 0,
        status: "prevista",
        criadoEm: "2026-11-20",
      },
    ],
    reservas: [
      {
        id: "rsv-1",
        lotId: "lot-h-a03",
        empNome: "Residencial Horizonte",
        quadra: "A",
        lote: "03",
        corretorId: "corr-1",
        corretorNome: "Ana Corretora",
        clienteNome: "Pré-reserva",
        reservadoEm: "2026-11-22",
        expiraEm: "2026-11-28",
        status: "ativa",
      },
      {
        id: "rsv-exp",
        lotId: "lot-demo-exp",
        empNome: "Jardins do Sol",
        quadra: "Z",
        lote: "99",
        corretorId: "corr-1",
        corretorNome: "Ana Corretora",
        reservadoEm: "2026-11-01",
        expiraEm: "2026-11-10",
        status: "ativa",
      },
    ],
  };
}

export function relatorioDemandas(state: {
  demandas: {
    tipoId: string;
    status: string;
    prazo: string;
    criadoEm: string;
    responsavel: string;
  }[];
  demandaTipos: { id: string; nome: string }[];
  hoje?: string;
}) {
  const hoje = state.hoje ?? new Date().toISOString().slice(0, 10);
  const porTipo = state.demandaTipos.map((t) => ({
    tipo: t.nome,
    qtd: state.demandas.filter((d) => d.tipoId === t.id).length,
  }));
  const concluidas = state.demandas.filter((d) => d.status === "concluida");
  const dias = (a: string, b: string) =>
    Math.max(
      0,
      Math.round(
        (new Date(b + "T12:00:00").getTime() -
          new Date(a + "T12:00:00").getTime()) /
          86400000
      )
    );
  const tempoMedio =
    concluidas.length === 0
      ? 0
      : Math.round(
          (concluidas.reduce(
            (acc, d) => acc + dias(d.criadoEm, d.prazo),
            0
          ) /
            concluidas.length) *
            10
        ) / 10;
  const atrasadas = state.demandas.filter(
    (d) =>
      d.prazo < hoje &&
      d.status !== "concluida" &&
      d.status !== "cancelada"
  );
  const porResponsavel = new Map<string, number>();
  for (const d of atrasadas) {
    porResponsavel.set(
      d.responsavel,
      (porResponsavel.get(d.responsavel) ?? 0) + 1
    );
  }
  return {
    porTipo,
    tempoMedioDias: tempoMedio,
    atrasadas: atrasadas.length,
    atrasadasPorResponsavel: [...porResponsavel.entries()].map(
      ([responsavel, qtd]) => ({ responsavel, qtd })
    ),
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

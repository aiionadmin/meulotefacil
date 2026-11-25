"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  arquivosMock,
  auditoriaMock,
  boletosMock,
  comprasMock,
  configGrupos,
  contasBancarias,
  contratosMock,
  empreendimentosSistema,
  financeiroPagar,
  financeiroReceber,
  fiscalMock,
  lotesSistema,
  operacoesContrato,
  obrasMock,
  parcelasCarteira,
  pessoasMock,
  reajustesMock,
  tarefasMock,
  usuariosMock,
} from "@/lib/data/sistema";
import { useStorePersist } from "@/lib/persist/use-store-persist";
import { saveSnapshot } from "@/lib/persist/snapshots";
import { DEMO_ORG_ID } from "@/lib/persist/store-keys";
import { isDemoToolsAllowed } from "@/lib/runtime/demo-mode";
import { recordAudit } from "@/lib/audit/client-audit";
import { isDevSeedAllowed } from "@/lib/runtime/demo-mode";

export type Pessoa = (typeof pessoasMock)[number];
export type Usuario = (typeof usuariosMock)[number];
export type Auditoria = (typeof auditoriaMock)[number];
export type Empreendimento = (typeof empreendimentosSistema)[number];
export type Lote = (typeof lotesSistema)[number];
export type Contrato = (typeof contratosMock)[number];
export type Parcela = (typeof parcelasCarteira)[number];
export type Boleto = (typeof boletosMock)[number];
export type Reajuste = (typeof reajustesMock)[number];
export type Operacao = (typeof operacoesContrato)[number];
export type Obra = (typeof obrasMock)[number];
export type Compra = (typeof comprasMock)[number];
export type TituloPagar = (typeof financeiroPagar)[number];
export type TituloReceber = (typeof financeiroReceber)[number];
export type Conta = (typeof contasBancarias)[number];
export type NotaFiscal = (typeof fiscalMock)[number];
export type Tarefa = (typeof tarefasMock)[number];
export type Arquivo = (typeof arquivosMock)[number];

export type RelatorioGerado = {
  id: string;
  nome: string;
  quando: string;
};

export type DemoState = {
  pessoas: Pessoa[];
  usuarios: Usuario[];
  auditoria: Auditoria[];
  empreendimentos: Empreendimento[];
  lotes: Lote[];
  contratos: Contrato[];
  parcelas: Parcela[];
  boletos: Boleto[];
  reajustes: Reajuste[];
  operacoes: Operacao[];
  obras: Obra[];
  compras: Compra[];
  pagar: TituloPagar[];
  receber: TituloReceber[];
  contas: Conta[];
  fiscal: NotaFiscal[];
  tarefas: Tarefa[];
  arquivos: Arquivo[];
  configToggles: Record<string, boolean>;
  empresa: { razao: string; cnpj: string; oab: string };
  perfil: { nome: string; email: string };
  favoritosRelatorios: string[];
  relatoriosGerados: RelatorioGerado[];
};

function seedConfigToggles() {
  const toggles: Record<string, boolean> = {};
  for (const g of configGrupos) {
    for (const item of g.itens) {
      toggles[`${g.grupo}::${item}`] = true;
    }
  }
  return toggles;
}

function seedState(): DemoState {
  const allow = isDevSeedAllowed();
  return {
    pessoas: allow ? [...pessoasMock] : [],
    usuarios: allow ? [...usuariosMock] : [],
    auditoria: allow ? [...auditoriaMock] : [],
    empreendimentos: allow ? [...empreendimentosSistema] : [],
    lotes: allow ? [...lotesSistema] : [],
    contratos: allow ? [...contratosMock] : [],
    parcelas: allow ? [...parcelasCarteira] : [],
    boletos: allow ? [...boletosMock] : [],
    reajustes: allow ? [...reajustesMock] : [],
    operacoes: allow ? [...operacoesContrato] : [],
    obras: allow ? [...obrasMock] : [],
    compras: allow ? [...comprasMock] : [],
    pagar: allow ? [...financeiroPagar] : [],
    receber: allow ? [...financeiroReceber] : [],
    contas: allow ? [...contasBancarias] : [],
    fiscal: allow ? [...fiscalMock] : [],
    tarefas: allow ? [...tarefasMock] : [],
    arquivos: allow ? [...arquivosMock] : [],
    configToggles: seedConfigToggles(),
    empresa: {
      razao: "Meu Lote Fácil Ltda",
      cnpj: "12.345.678/0001-90",
      oab: "Dr. Silva · OAB/SP 123456",
    },
    perfil: {
      nome: "Administrador",
      email: "admin@meulotefacil.com.br",
    },
    favoritosRelatorios: ["Posição financeira", "Inadimplência"],
    relatoriosGerados: [],
  };
}

function nowLabel() {
  return new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

type DemoStoreValue = {
  state: DemoState;
  ready: boolean;
  reset: () => void;
  log: (rotina: string, acao: string, usuario?: string) => void;
  addPessoa: (data: Omit<Pessoa, "id">) => Pessoa;
  updatePessoa: (id: string, patch: Partial<Pessoa>) => void;
  addUsuario: (data: Omit<Usuario, "id">) => Usuario;
  updateUsuario: (id: string, patch: Partial<Usuario>) => void;
  addEmpreendimento: (data: Omit<Empreendimento, "id">) => Empreendimento;
  addLote: (data: Omit<Lote, "id">) => Lote;
  updateLote: (id: string, patch: Partial<Lote>) => void;
  massGenerateLotes: (emp: string, quadra: string, qtd: number, area: number, valor: number) => number;
  addContrato: (data: Omit<Contrato, "id"> & { id?: string }) => Contrato;
  updateContrato: (id: string, patch: Partial<Contrato>) => void;
  baixarParcela: (id: string) => void;
  estornarParcela: (id: string) => void;
  gerarBoletosMes: () => number;
  gerarRemessa: () => number;
  processarRetorno: () => number;
  aplicarReajuste: (indice: string, fator: string) => Reajuste;
  addOperacao: (data: Omit<Operacao, "id" | "quando">) => Operacao;
  updateObra: (id: string, patch: Partial<Obra>) => void;
  addCompra: (data: Omit<Compra, "id"> & { id?: string }) => Compra;
  avancarCompra: (id: string) => void;
  aprovarCompra: (id: string) => void;
  baixarPagar: (id: string) => void;
  baixarReceber: (id: string) => void;
  vincularNota: (id: string) => void;
  emitirNfse: (cliente: string, valor: number) => NotaFiscal;
  addTarefa: (data: Omit<Tarefa, "id">) => Tarefa;
  moveTarefa: (id: string, status: Tarefa["status"]) => void;
  addArquivo: (data: Omit<Arquivo, "id" | "quando">) => Arquivo;
  setConfigToggle: (key: string, value: boolean) => void;
  saveEmpresa: (data: DemoState["empresa"]) => void;
  savePerfil: (data: DemoState["perfil"]) => void;
  toggleFavoritoRelatorio: (nome: string) => void;
  gerarRelatorio: (nome: string) => RelatorioGerado;
};

const DemoStoreContext = createContext<DemoStoreValue | null>(null);

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(() => seedState());
  const [ready, setReady] = useState(false);

  useStorePersist({
    storeKey: "demo",
    ready,
    setReady,
    state,
    setState,
    seed: seedState,
  });

  const reset = useCallback(() => {
    if (!isDemoToolsAllowed()) return;
    const next = seedState();
    setState(next);
    void saveSnapshot("demo", next, DEMO_ORG_ID);
  }, []);

  const log = useCallback((rotina: string, acao: string, usuario = "Sistema") => {
    setState((s) => ({
      ...s,
      auditoria: [
        { quando: nowLabel(), usuario, rotina, acao },
        ...s.auditoria,
      ].slice(0, 40),
    }));
    void recordAudit({
      organizationId: DEMO_ORG_ID,
      usuarioNome: usuario,
      rotina,
      acao,
    });
  }, []);

  const value = useMemo<DemoStoreValue>(() => {
    const patch = (fn: (s: DemoState) => DemoState) => setState(fn);

    return {
      state,
      ready,
      reset,
      log,
      addPessoa: (data) => {
        const pessoa: Pessoa = { ...data, id: uid("p") };
        patch((s) => ({ ...s, pessoas: [pessoa, ...s.pessoas] }));
        log("Pessoas", `Cadastrou ${pessoa.nome}`);
        return pessoa;
      },
      updatePessoa: (id, data) => {
        patch((s) => ({
          ...s,
          pessoas: s.pessoas.map((p) => (p.id === id ? { ...p, ...data } : p)),
        }));
        log("Pessoas", `Atualizou pessoa ${id}`);
      },
      addUsuario: (data) => {
        const usuario: Usuario = { ...data, id: uid("u") };
        patch((s) => ({ ...s, usuarios: [usuario, ...s.usuarios] }));
        log("Usuários", `Criou usuário ${usuario.email}`);
        return usuario;
      },
      updateUsuario: (id, data) => {
        patch((s) => ({
          ...s,
          usuarios: s.usuarios.map((u) => (u.id === id ? { ...u, ...data } : u)),
        }));
        log("Usuários", `Atualizou usuário ${id}`);
      },
      addEmpreendimento: (data) => {
        const emp: Empreendimento = { ...data, id: uid("e") };
        patch((s) => ({ ...s, empreendimentos: [emp, ...s.empreendimentos] }));
        log("Empreendimentos", `Cadastrou ${emp.nome}`);
        return emp;
      },
      addLote: (data) => {
        const lote: Lote = { ...data, id: uid("l") };
        patch((s) => ({ ...s, lotes: [lote, ...s.lotes] }));
        log("Lotes", `Cadastrou lote ${lote.emp} ${lote.quadra}/${lote.lote}`);
        return lote;
      },
      updateLote: (id, data) => {
        patch((s) => ({
          ...s,
          lotes: s.lotes.map((l) => (l.id === id ? { ...l, ...data } : l)),
        }));
        log("Lotes", `Atualizou lote ${id}`);
      },
      massGenerateLotes: (emp, quadra, qtd, area, valor) => {
        const novos: Lote[] = Array.from({ length: qtd }, (_, i) => ({
          id: uid("l"),
          emp,
          quadra,
          lote: String(i + 1).padStart(2, "0"),
          area,
          valor,
          status: "Disponível",
          bloqueiaVenda: false,
          bloqueiaFinanceiro: false,
        }));
        patch((s) => ({ ...s, lotes: [...novos, ...s.lotes] }));
        log("Lotes", `Gerou ${qtd} lotes ${emp} quadra ${quadra}`);
        return qtd;
      },
      addContrato: (data) => {
        const contrato: Contrato = {
          ...data,
          id: data.id ?? `CTR-${Math.floor(3000 + Math.random() * 900)}`,
        };
        patch((s) => ({ ...s, contratos: [contrato, ...s.contratos] }));
        log("Vendas", `Criou contrato ${contrato.id}`);
        return contrato;
      },
      updateContrato: (id, data) => {
        patch((s) => ({
          ...s,
          contratos: s.contratos.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }));
        log("Vendas", `Atualizou contrato ${id}`);
      },
      baixarParcela: (id) => {
        patch((s) => {
          const parcela = s.parcelas.find((p) => p.id === id);
          if (!parcela || parcela.status === "Paga") return s;
          const total = parcela.valor + parcela.encargos;
          const caixa = s.contas.find((c) => c.tipo === "Caixa") ?? s.contas[0];
          return {
            ...s,
            parcelas: s.parcelas.map((p) =>
              p.id === id ? { ...p, status: "Paga", encargos: 0 } : p
            ),
            contas: s.contas.map((c) =>
              c.id === caixa?.id ? { ...c, saldo: c.saldo + total } : c
            ),
            receber: s.receber.map((r) =>
              r.origem.includes(parcela.contrato) && r.status !== "Recebido"
                ? { ...r, status: "Recebido" }
                : r
            ),
          };
        });
        log("Carteira > Recebimento", `Baixa de parcela ${id}`);
      },
      estornarParcela: (id) => {
        patch((s) => ({
          ...s,
          parcelas: s.parcelas.map((p) =>
            p.id === id ? { ...p, status: "Em aberto" } : p
          ),
        }));
        log("Carteira > Estorno", `Estornou parcela ${id}`);
      },
      gerarBoletosMes: () => {
        let count = 0;
        patch((s) => {
          const abertas = s.parcelas.filter(
            (p) => p.status === "Em aberto" || p.status === "Vencida"
          );
          const existentes = new Set(s.boletos.map((b) => `${b.contrato}-${b.vencimento}`));
          const novos: Boleto[] = [];
          for (const p of abertas) {
            const key = `${p.contrato}-${p.vencimento}`;
            if (existentes.has(key)) continue;
            novos.push({
              id: uid("bol"),
              nossoNumero: String(15000 + Math.floor(Math.random() * 8000)).padStart(8, "0"),
              contrato: p.contrato,
              vencimento: p.vencimento,
              valor: p.valor + p.encargos,
              banco: "Sicredi 748",
              status: "Emitido",
            });
            count += 1;
          }
          return { ...s, boletos: [...novos, ...s.boletos] };
        });
        log("Boletos", `Gerou ${count} boleto(s) do mês`);
        return count;
      },
      gerarRemessa: () => {
        let count = 0;
        patch((s) => {
          const next = s.boletos.map((b) => {
            if (b.status === "Emitido") {
              count += 1;
              return { ...b, status: "Remessa gerada" };
            }
            return b;
          });
          return { ...s, boletos: next };
        });
        log("Boletos > Remessa", `Remessa CNAB com ${count} título(s)`);
        return count;
      },
      processarRetorno: () => {
        let count = 0;
        patch((s) => {
          const baixados = new Set<string>();
          const boletos = s.boletos.map((b) => {
            if (b.status === "Remessa gerada") {
              count += 1;
              baixados.add(b.contrato);
              return { ...b, status: "Liquidado" };
            }
            return b;
          });
          return {
            ...s,
            boletos,
            parcelas: s.parcelas.map((p) =>
              baixados.has(p.contrato) && p.status !== "Paga"
                ? { ...p, status: "Paga", encargos: 0 }
                : p
            ),
          };
        });
        log("Boletos > Retorno", `Processou retorno: ${count} liquidação(ões)`);
        return count;
      },
      aplicarReajuste: (indice, fator) => {
        const rej: Reajuste = {
          id: uid("rej"),
          periodo: new Date().toISOString().slice(0, 7),
          indice,
          fator,
          contratos: state.contratos.filter((c) => c.status === "Ativo").length || 1,
          status: "Aplicado",
        };
        patch((s) => ({ ...s, reajustes: [rej, ...s.reajustes] }));
        log("Reajuste", `Aplicou ${indice} ${fator}`);
        return rej;
      },
      addOperacao: (data) => {
        const op: Operacao = { ...data, id: uid("op"), quando: nowLabel().split(" ")[0] };
        patch((s) => ({ ...s, operacoes: [op, ...s.operacoes] }));
        log("Operações", `${op.tipo} em ${op.contrato}`);
        return op;
      },
      updateObra: (id, data) => {
        patch((s) => ({
          ...s,
          obras: s.obras.map((o) => (o.id === id ? { ...o, ...data } : o)),
        }));
        log("Obras", `Atualizou obra ${id}`);
      },
      addCompra: (data) => {
        const compra: Compra = {
          ...data,
          id: data.id ?? `SC-${Math.floor(900 + Math.random() * 90)}`,
        };
        patch((s) => ({ ...s, compras: [compra, ...s.compras] }));
        log("Compras", `Criou ${compra.tipo} ${compra.id}`);
        return compra;
      },
      avancarCompra: (id) => {
        patch((s) => ({
          ...s,
          compras: s.compras.map((c) => {
            if (c.id !== id) return c;
            if (c.tipo === "Solicitação")
              return { ...c, tipo: "Cotação", id: `COT-${Math.floor(300 + Math.random() * 90)}`, status: "Em aberto" };
            if (c.tipo === "Cotação")
              return { ...c, tipo: "Ordem de compra", id: `OC-${Math.floor(400 + Math.random() * 90)}`, status: "Em aprovação" };
            return { ...c, status: "Aprovada" };
          }),
        }));
        log("Compras", `Avançou fluxo ${id}`);
      },
      aprovarCompra: (id) => {
        patch((s) => ({
          ...s,
          compras: s.compras.map((c) =>
            c.id === id ? { ...c, status: "Aprovada" } : c
          ),
        }));
        log("Compras > Ordem", `Aprovou ${id}`);
      },
      baixarPagar: (id) => {
        patch((s) => {
          const tit = s.pagar.find((p) => p.id === id);
          if (!tit || tit.status === "Pago") return s;
          const conta = s.contas[0];
          return {
            ...s,
            pagar: s.pagar.map((p) => (p.id === id ? { ...p, status: "Pago" } : p)),
            contas: s.contas.map((c) =>
              c.id === conta.id ? { ...c, saldo: Math.max(0, c.saldo - tit.valor) } : c
            ),
          };
        });
        log("Financeiro > Pagar", `Baixou título ${id}`);
      },
      baixarReceber: (id) => {
        patch((s) => {
          const tit = s.receber.find((r) => r.id === id);
          if (!tit || tit.status === "Recebido") return s;
          const conta = s.contas[0];
          return {
            ...s,
            receber: s.receber.map((r) =>
              r.id === id ? { ...r, status: "Recebido" } : r
            ),
            contas: s.contas.map((c) =>
              c.id === conta.id ? { ...c, saldo: c.saldo + tit.valor } : c
            ),
          };
        });
        log("Financeiro > Receber", `Baixou título ${id}`);
      },
      vincularNota: (id) => {
        patch((s) => ({
          ...s,
          fiscal: s.fiscal.map((n) =>
            n.id === id ? { ...n, status: "Vinculada" } : n
          ),
        }));
        log("Fiscal", `Vinculou nota ${id}`);
      },
      emitirNfse: (cliente, valor) => {
        const nota: NotaFiscal = {
          id: uid("nf"),
          tipo: "NFSe emitida",
          numero: String(100 + Math.floor(Math.random() * 80)),
          emitente: "Meu Lote Fácil",
          valor,
          status: "Emitida",
        };
        patch((s) => ({ ...s, fiscal: [nota, ...s.fiscal] }));
        log("Fiscal > NFSe", `Emitiu NFSe ${nota.numero} para ${cliente}`);
        return nota;
      },
      addTarefa: (data) => {
        const tarefa: Tarefa = { ...data, id: uid("t") };
        patch((s) => ({ ...s, tarefas: [tarefa, ...s.tarefas] }));
        log("Tarefas", `Criou tarefa ${tarefa.titulo}`);
        return tarefa;
      },
      moveTarefa: (id, status) => {
        patch((s) => ({
          ...s,
          tarefas: s.tarefas.map((t) => (t.id === id ? { ...t, status } : t)),
        }));
        log("Tarefas", `Moveu ${id} → ${status}`);
      },
      addArquivo: (data) => {
        const arquivo: Arquivo = {
          ...data,
          id: uid("a"),
          quando: nowLabel().split(" ")[0],
        };
        patch((s) => ({ ...s, arquivos: [arquivo, ...s.arquivos] }));
        log("Arquivos", `Enviou ${arquivo.nome}`);
        return arquivo;
      },
      setConfigToggle: (key, value) => {
        patch((s) => ({
          ...s,
          configToggles: { ...s.configToggles, [key]: value },
        }));
      },
      saveEmpresa: (data) => {
        patch((s) => ({ ...s, empresa: data }));
        log("Configurações", "Salvou dados da empresa");
      },
      savePerfil: (data) => {
        patch((s) => ({ ...s, perfil: data }));
        log("Configurações", "Salvou perfil");
      },
      toggleFavoritoRelatorio: (nome) => {
        patch((s) => {
          const has = s.favoritosRelatorios.includes(nome);
          return {
            ...s,
            favoritosRelatorios: has
              ? s.favoritosRelatorios.filter((n) => n !== nome)
              : [...s.favoritosRelatorios, nome],
          };
        });
      },
      gerarRelatorio: (nome) => {
        const item: RelatorioGerado = {
          id: uid("rel"),
          nome,
          quando: nowLabel(),
        };
        patch((s) => ({
          ...s,
          relatoriosGerados: [item, ...s.relatoriosGerados].slice(0, 20),
        }));
        log("Relatórios", `Gerou ${nome}`);
        return item;
      },
    };
  }, [state, ready, reset, log]);

  return (
    <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>
  );
}

export function useDemoStore() {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) {
    throw new Error("useDemoStore must be used within DemoStoreProvider");
  }
  return ctx;
}

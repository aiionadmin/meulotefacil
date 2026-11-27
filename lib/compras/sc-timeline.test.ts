import { scTimeline } from "./sc-timeline";

const rascunho = scTimeline("rascunho", {
  criadoEm: "2026-11-01",
  solicitante: "Ana",
});
if (!rascunho[0].current) throw new Error("rascunho current");
if (rascunho[0].label !== "Criada") throw new Error("label criada");
if (rascunho[0].autor !== "Ana") throw new Error("autor criada");
if (rascunho[3].done) throw new Error("recebida não done");
if (rascunho[3].label !== "Itens recebidos") throw new Error("label recebidos");

const conc = scTimeline("concluida", {
  criadoEm: "2026-11-01",
  solicitante: "Ana",
  aprovadoEm: "2026-11-02",
  aprovadoPor: "Bob",
  atendidoEm: "2026-11-03",
  atendidoPor: "Compras",
  recebidoEm: "2026-11-04",
  recebidoPor: "Ana",
});
if (!conc[3].current && !conc[3].done) throw new Error("concluida");
if (conc[1].autor !== "Bob") throw new Error("autor aprovada");

const and = scTimeline("em_andamento");
if (!and[2].current) throw new Error("atendida current");
if (and[2].label !== "Atendida") throw new Error("label atendida");

console.log("sc-timeline.test ok");

import { scTimeline } from "./sc-timeline";

const rascunho = scTimeline("rascunho");
if (!rascunho[0].current) throw new Error("rascunho current");
if (rascunho[3].done) throw new Error("recebida não done");

const conc = scTimeline("concluida");
if (!conc[3].current && !conc[3].done) throw new Error("concluida");

const and = scTimeline("em_andamento");
if (!and[2].current) throw new Error("em compra current");

console.log("sc-timeline.test ok");

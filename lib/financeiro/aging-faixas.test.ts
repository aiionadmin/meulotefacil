import { agingPorConta } from "./aging-faixas";

const hoje = new Date();
hoje.setHours(12, 0, 0, 0);
const iso = (offset: number) => {
  const d = new Date(hoje);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

const result = agingPorConta(
  [
    { contaId: "c1", vencimento: iso(-10), valor: 100, aberto: true },
    { contaId: "c1", vencimento: iso(0), valor: 50, aberto: true },
    { contaId: "c1", vencimento: iso(3), valor: 25, aberto: true },
    { contaId: "c1", vencimento: iso(15), valor: 10, aberto: true },
    { contaId: "c1", vencimento: iso(40), valor: 99, aberto: true },
  ],
  [{ id: "c1", nome: "Operacional" }]
);

if (result.length !== 1) throw new Error("1 conta");
const f = result[0].faixas;
if (f[0].qtd !== 1 || f[0].valor !== 100) throw new Error("vencidos90");
if (f[1].qtd !== 1 || f[1].valor !== 50) throw new Error("hoje");
if (f[2].qtd !== 1 || f[2].valor !== 25) throw new Error("em7");
if (f[3].qtd !== 1 || f[3].valor !== 10) throw new Error("em30");

console.log("ok: aging-faixas");

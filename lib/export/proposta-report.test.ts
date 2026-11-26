import { buildPropostaHtml } from "./proposta-report";
import type { Proposal } from "@/lib/domain/fluxo-types";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const p: Proposal = {
  id: "pr-1",
  cliente: "Ana Souza",
  empNome: "Residencial Horizonte",
  loteLabel: "A/01",
  valor: 185000,
  parcelas: 120,
  entrada: 20000,
  validade: "2026-12-31",
  status: "aberta",
  responsavel: "Comercial",
};

const html = buildPropostaHtml(p);
assert(html.includes("Ana Souza"), "cliente");
assert(html.includes("Residencial Horizonte"), "emp");
assert(html.includes("Proposta comercial"), "titulo");
console.log("ok: proposta-report");

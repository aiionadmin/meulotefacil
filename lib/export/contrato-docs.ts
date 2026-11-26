/** H14 — modelos de documento do contrato (contrato, promissórias, mala direta). */

export type ContratoDocInput = {
  numero: string;
  compradorNome: string;
  empNome: string;
  quadra: string;
  lote: string;
  preco: number;
  dataContrato?: string;
  saldo?: number;
  parcelas?: { n: number; vencimento: string; valor: number }[];
};

export type ContratoDocTipo = "contrato" | "promissoria" | "mala_direta";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function buildContratoDocText(
  tipo: ContratoDocTipo,
  c: ContratoDocInput
): string {
  if (tipo === "contrato") {
    return [
      "CONTRATO DE COMPRA E VENDA DE LOTE",
      `Número: ${c.numero}`,
      `Data: ${c.dataContrato ?? "—"}`,
      `Comprador: ${c.compradorNome}`,
      `Empreendimento: ${c.empNome}`,
      `Lote: ${c.quadra}/${c.lote}`,
      `Preço: R$ ${c.preco.toFixed(2).replace(".", ",")}`,
      "",
      "Cláusulas padrão Meu Lote Fácil.",
      "1. Objeto: o lote acima identificado.",
      "2. Preço e forma de pagamento conforme plano.",
      "3. Foro da comarca do imóvel.",
    ].join("\n");
  }
  if (tipo === "promissoria") {
    const series =
      c.parcelas?.slice(0, 12).map(
        (p) =>
          `NP ${String(p.n).padStart(3, "0")} · venc. ${p.vencimento} · R$ ${p.valor.toFixed(2)}`
      ) ?? ["Série gerada conforme plano de pagamento."];
    return [
      "NOTAS PROMISSÓRIAS",
      `Contrato ${c.numero}`,
      `Emitente: ${c.compradorNome}`,
      `Beneficiário: Meu Lote Fácil`,
      "",
      ...series,
    ].join("\n");
  }
  return [
    "MALA DIRETA",
    `Prezado(a) ${c.compradorNome},`,
    "",
    `Referente ao lote ${c.quadra}/${c.lote} em ${c.empNome} (contrato ${c.numero}).`,
    c.saldo != null
      ? `Saldo atualizado: R$ ${c.saldo.toFixed(2).replace(".", ",")}.`
      : "Segue posição financeira atualizada.",
    "",
    "Atenciosamente,",
    "Meu Lote Fácil",
  ].join("\n");
}

export function buildContratoDocHtml(
  tipo: ContratoDocTipo,
  c: ContratoDocInput
): string {
  const titles: Record<ContratoDocTipo, string> = {
    contrato: "Contrato de compra e venda",
    promissoria: "Notas promissórias",
    mala_direta: "Mala direta",
  };
  const body = buildContratoDocText(tipo, c)
    .split("\n")
    .map((l) => (l ? `<p>${esc(l)}</p>` : "<br/>"))
    .join("");
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/>
<title>${titles[tipo]} ${esc(c.numero)}</title>
<style>
body{font-family:Georgia,serif;max-width:720px;margin:2rem auto;color:#1a1a1a;line-height:1.5}
h1{font-size:1.3rem}
@media print{body{margin:0}}
</style></head><body>
<h1>${titles[tipo]}</h1>
${body}
<script>window.onload=function(){window.print()}</script>
</body></html>`;
}

export function downloadContratoDocPdf(
  tipo: ContratoDocTipo,
  c: ContratoDocInput
) {
  const html = buildContratoDocHtml(tipo, c);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (!w) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tipo}-${c.numero}.html`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

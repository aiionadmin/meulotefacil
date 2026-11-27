/** H14 — modelos de documento do contrato (contrato, promissórias, mala direta). */

import {
  PRINT_DOC_CSS,
  buildPrintHeaderHtml,
  empresaFromEmitente,
  openPrintHtml,
  resolveEmitenteLogoDataUrl,
  type PrintEmpresa,
} from "@/lib/export/print-document";

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
  c: ContratoDocInput,
  beneficiario = "Meu Lote Fácil"
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
      `Cláusulas padrão ${beneficiario}.`,
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
      `Beneficiário: ${beneficiario}`,
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
    beneficiario,
  ].join("\n");
}

export async function buildContratoDocHtml(
  tipo: ContratoDocTipo,
  c: ContratoDocInput,
  opts?: { cnpj?: string; empresa?: Partial<PrintEmpresa> }
): Promise<string> {
  const titles: Record<ContratoDocTipo, string> = {
    contrato: "Contrato de compra e venda",
    promissoria: "Notas promissórias",
    mala_direta: "Mala direta",
  };
  const { emitente, logoDataUrl } = await resolveEmitenteLogoDataUrl(
    opts?.cnpj
  );
  const empresa = empresaFromEmitente(emitente, opts?.empresa);
  const body = buildContratoDocText(tipo, c, empresa.razaoSocial)
    .split("\n")
    .map((l) => (l ? `<p>${esc(l)}</p>` : "<br/>"))
    .join("");
  const header = buildPrintHeaderHtml({
    empresa,
    logoDataUrl,
    titulo: titles[tipo],
    subtitulo: `Contrato ${c.numero}`,
  });
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/>
<title>${titles[tipo]} ${esc(c.numero)}</title>
<style>
${PRINT_DOC_CSS}
p{margin:.35rem 0;font-size:.95rem}
</style></head><body><div class="page">
${header}
${body}
<footer class="foot">${esc(empresa.razaoSocial)} · documento gerado pelo sistema</footer>
</div></body></html>`;
}

export async function downloadContratoDocPdf(
  tipo: ContratoDocTipo,
  c: ContratoDocInput,
  opts?: { cnpj?: string; empresa?: Partial<PrintEmpresa> }
) {
  const html = await buildContratoDocHtml(tipo, c, opts);
  openPrintHtml(html, `${tipo}-${c.numero}`);
}

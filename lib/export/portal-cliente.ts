/** I04 — 2ª via / Pix e informe anual do portal do cliente. */

export type PortalParcela = {
  vencimento: string;
  valor: number;
  status: string;
  contratoRef?: string;
};

export type PortalContratoResumo = {
  numero: string;
  empreendimento: string;
  preco: number;
  saldo: number;
};

export function buildSegundaViaPix(opts: {
  cliente: string;
  contrato: string;
  valor: number;
  vencimento: string;
  nossoNumero?: string;
}): string {
  const nn = opts.nossoNumero ?? opts.contrato.replace(/\D/g, "").padStart(8, "0");
  const pixPayload = `00020126580014BR.GOV.BCB.PIX0136mlf-${nn}@meulotefacil.local520400005303986540${opts.valor.toFixed(2)}5802BR5913MEU LOTE FACIL6009SAO PAULO62070503***6304ABCD`;
  return [
    "Meu Lote Fácil — 2ª via / Pix",
    `Cliente: ${opts.cliente}`,
    `Contrato: ${opts.contrato}`,
    `Vencimento: ${opts.vencimento}`,
    `Valor: R$ ${opts.valor.toFixed(2).replace(".", ",")}`,
    `Nosso número: ${nn}`,
    "",
    "Linha digitável (demo):",
    `34191.79001 01043.510047 91020.150008 1 ${String(Math.round(opts.valor * 100)).padStart(14, "0")}`,
    "",
    "Payload Pix (copia e cola):",
    pixPayload,
    "",
    "Documento gerado pelo portal do cliente. Sem liquidação bancária real.",
  ].join("\n");
}

export function buildInformeAnualHtml(opts: {
  ano: number;
  cliente: string;
  cpf: string;
  contratos: PortalContratoResumo[];
  parcelasPagas: PortalParcela[];
}): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const totalPago = opts.parcelasPagas.reduce((a, p) => a + p.valor, 0);
  const rowsCtr = opts.contratos
    .map(
      (c) =>
        `<tr><td>${esc(c.numero)}</td><td>${esc(c.empreendimento)}</td><td>${c.preco.toFixed(2)}</td><td>${c.saldo.toFixed(2)}</td></tr>`
    )
    .join("");
  const rowsPag = opts.parcelasPagas
    .map(
      (p) =>
        `<tr><td>${esc(p.vencimento)}</td><td>${esc(p.contratoRef ?? "")}</td><td>${p.valor.toFixed(2)}</td><td>${esc(p.status)}</td></tr>`
    )
    .join("");
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"/>
<title>Informe anual ${opts.ano}</title>
<style>
body{font-family:Georgia,serif;max-width:720px;margin:2rem auto;color:#1a1a1a;line-height:1.45}
h1{font-size:1.35rem;margin:0 0 .5rem}
.meta{color:#555;font-size:.9rem;margin-bottom:1.25rem}
table{width:100%;border-collapse:collapse;margin:1rem 0;font-size:.9rem}
th,td{border:1px solid #ddd;padding:.4rem .6rem;text-align:left}
th{background:#f4f4f0}
.foot{margin-top:1.5rem;font-size:.8rem;color:#555}
@media print{body{margin:0}}
</style></head><body>
<h1>Informe anual ${opts.ano}</h1>
<p class="meta">${esc(opts.cliente)} · CPF ${esc(opts.cpf)} · Meu Lote Fácil</p>
<h2>Contratos</h2>
<table><thead><tr><th>Nº</th><th>Empreendimento</th><th>Preço</th><th>Saldo</th></tr></thead>
<tbody>${rowsCtr || "<tr><td colspan=4>Nenhum</td></tr>"}</tbody></table>
<h2>Pagamentos no ano</h2>
<table><thead><tr><th>Data</th><th>Ref.</th><th>Valor</th><th>Status</th></tr></thead>
<tbody>${rowsPag || "<tr><td colspan=4>Nenhum</td></tr>"}</tbody></table>
<p><strong>Total pago:</strong> R$ ${totalPago.toFixed(2).replace(".", ",")}</p>
<p class="foot">Documento informativo do portal. Não substitui declaração oficial.</p>
<script>window.onload=function(){window.print()}</script>
</body></html>`;
}

export function downloadInformeAnual(opts: Parameters<typeof buildInformeAnualHtml>[0]) {
  const html = buildInformeAnualHtml(opts);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (!w) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `informe-anual-${opts.ano}.html`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

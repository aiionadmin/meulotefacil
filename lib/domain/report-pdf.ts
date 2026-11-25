/** Relatórios HTML imprimíveis (mapa de cotação, pagamentos, recebimentos). */

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function openPrintHtml(html: string, title = "Relatório") {
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.document.title = title;
  return true;
}

function shell(title: string, body: string) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(title)}</title>
  <style>
    body{font-family:Georgia,serif;color:#1a1a1a;margin:32px;line-height:1.4}
    h1{font-size:20px;margin:0 0 4px}
    .logo{font-weight:700;color:#0f5132;margin-bottom:12px}
    .meta{color:#555;font-size:12px;margin-bottom:16px}
    table{width:100%;border-collapse:collapse;font-size:12px;margin-top:8px}
    th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
    th{background:#f4f6f4}
    .right{text-align:right}
    .winner{background:#e8f5ee;font-weight:600}
    @media print{body{margin:12px} .noprint{display:none}}
  </style>
</head>
<body>
  <div class="logo">Meu Lote Fácil</div>
  <h1>${escapeHtml(title)}</h1>
  ${body}
  <script>window.onload=()=>window.print()</script>
</body>
</html>`;
}

export function buildMapaCotacaoHtml(input: {
  numero: string;
  descricao: string;
  centro: string;
  fornecedores: { id: string; nome: string }[];
  itens: { id: string; descricao: string; unidade: string; quantidade: number; valorOrcamento: number }[];
  precos: {
    itemId: string;
    supplierId: string;
    precoUnitario: number;
    vencedor: boolean;
  }[];
}): string {
  const head = input.fornecedores
    .map((f) => `<th>${escapeHtml(f.nome)}</th>`)
    .join("");
  const rows = input.itens
    .map((it) => {
      const cells = input.fornecedores
        .map((f) => {
          const p = input.precos.find(
            (x) => x.itemId === it.id && x.supplierId === f.id
          );
          if (!p) return "<td>—</td>";
          const cls = p.vencedor ? ' class="winner"' : "";
          return `<td${cls}>R$ ${p.precoUnitario.toFixed(2)}${p.vencedor ? " ★" : ""}</td>`;
        })
        .join("");
      return `<tr>
        <td>${escapeHtml(it.descricao)}<br/><span style="color:#666">${it.quantidade} ${escapeHtml(it.unidade)} · orç. R$ ${it.valorOrcamento.toFixed(2)}</span></td>
        ${cells}
      </tr>`;
    })
    .join("");

  return shell(`Mapa de cotação ${input.numero}`, `
    <p class="meta">${escapeHtml(input.descricao)} · Centro: ${escapeHtml(input.centro)}</p>
    <table>
      <thead><tr><th>Item</th>${head}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `);
}

export function buildPagamentosHtml(
  rows: {
    vencimento: string;
    favorecido: string;
    descricao: string;
    valor: number;
    status: string;
    centro: string;
  }[],
  periodoLabel: string
): string {
  const body = rows
    .map(
      (r) => `<tr>
      <td>${escapeHtml(r.vencimento)}</td>
      <td>${escapeHtml(r.favorecido)}</td>
      <td>${escapeHtml(r.descricao)}</td>
      <td>${escapeHtml(r.centro)}</td>
      <td>${escapeHtml(r.status)}</td>
      <td class="right">R$ ${r.valor.toFixed(2)}</td>
    </tr>`
    )
    .join("");
  const total = rows.reduce((a, r) => a + r.valor, 0);
  return shell("Relatório de pagamentos", `
    <p class="meta">${escapeHtml(periodoLabel)} · ${rows.length} título(s) · Total R$ ${total.toFixed(2)}</p>
    <table>
      <thead><tr><th>Venc.</th><th>Favorecido</th><th>Descrição</th><th>Centro</th><th>Status</th><th class="right">Valor</th></tr></thead>
      <tbody>${body}</tbody>
    </table>
  `);
}

export function buildRecebimentosHtml(
  rows: {
    vencimento: string;
    cliente: string;
    descricao: string;
    valor: number;
    status: string;
    origem: string;
  }[],
  periodoLabel: string
): string {
  const body = rows
    .map(
      (r) => `<tr>
      <td>${escapeHtml(r.vencimento)}</td>
      <td>${escapeHtml(r.cliente)}</td>
      <td>${escapeHtml(r.descricao)}</td>
      <td>${escapeHtml(r.origem)}</td>
      <td>${escapeHtml(r.status)}</td>
      <td class="right">R$ ${r.valor.toFixed(2)}</td>
    </tr>`
    )
    .join("");
  const total = rows.reduce((a, r) => a + r.valor, 0);
  return shell("Relatório de recebimentos", `
    <p class="meta">${escapeHtml(periodoLabel)} · ${rows.length} título(s) · Total R$ ${total.toFixed(2)}</p>
    <table>
      <thead><tr><th>Venc.</th><th>Cliente</th><th>Descrição</th><th>Origem</th><th>Status</th><th class="right">Valor</th></tr></thead>
      <tbody>${body}</tbody>
    </table>
  `);
}

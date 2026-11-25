import type { Rdo } from "./obras-types";
import type { Obra } from "./obras-types";

/** HTML imprimível do RDO (stub de PDF com logo/fotos/assinatura). */
export function buildRdoPrintHtml(rdo: Rdo, obra?: Obra | null): string {
  const fotos = rdo.fotos ?? [];
  const fotoBlocks = fotos.length
    ? fotos
        .map(
          (f) =>
            `<figure style="display:inline-block;margin:8px;width:180px;vertical-align:top">
              <img src="${f.dataUrl}" alt="${escapeHtml(f.legenda)}" style="width:180px;height:120px;object-fit:cover;border:1px solid #ccc"/>
              <figcaption style="font-size:11px;margin-top:4px">${escapeHtml(f.legenda || "Foto")}</figcaption>
            </figure>`
        )
        .join("")
    : `<p style="color:#666;font-size:12px">Sem fotos anexadas.</p>`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <title>RDO ${rdo.numero} — ${escapeHtml(obra?.nome ?? "")}</title>
  <style>
    body{font-family:Georgia,serif;color:#1a1a1a;margin:32px;line-height:1.4}
    h1{font-size:22px;margin:0 0 4px}
    h2{font-size:14px;margin:20px 0 8px;border-bottom:1px solid #ddd;padding-bottom:4px}
    .meta{color:#555;font-size:13px}
    .logo{font-weight:700;color:#0f5132;letter-spacing:.02em;margin-bottom:16px}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
    th{background:#f4f6f4}
    .sign{display:flex;gap:48px;margin-top:48px}
    .sign div{flex:1;border-top:1px solid #333;padding-top:8px;font-size:12px}
    @media print{body{margin:16px}}
  </style>
</head>
<body>
  <div class="logo">Meu Lote Fácil</div>
  <h1>RDO nº ${rdo.numero}</h1>
  <p class="meta">
    Obra: <strong>${escapeHtml(obra?.nome ?? rdo.obraId)}</strong><br/>
    Data: ${rdo.data} · Responsável: ${escapeHtml(rdo.responsavel)} · Status: ${rdo.status}
  </p>
  <h2>Clima</h2>
  <p class="meta">
    Manhã ${rdo.clima.manha.clima}/${rdo.clima.manha.condicao} ·
    Tarde ${rdo.clima.tarde.clima}/${rdo.clima.tarde.condicao} ·
    Noite ${rdo.clima.noite.clima}/${rdo.clima.noite.condicao}
  </p>
  <h2>Efetivo (${rdo.efetivoTotal})</h2>
  <table>
    <thead><tr><th>Tipo</th><th>Função</th><th>Qtd</th><th>Horas</th></tr></thead>
    <tbody>
      ${
        rdo.efetivo.length
          ? rdo.efetivo
              .map(
                (e) =>
                  `<tr><td>${e.tipo}</td><td>${escapeHtml(e.funcao)}</td><td>${e.quantidade}</td><td>${e.horas}</td></tr>`
              )
              .join("")
          : "<tr><td colspan='4'>—</td></tr>"
      }
    </tbody>
  </table>
  <h2>Atividades</h2>
  <table>
    <thead><tr><th>Descrição</th><th>Situação</th><th>% físico</th></tr></thead>
    <tbody>
      ${
        rdo.atividades.length
          ? rdo.atividades
              .map(
                (a) =>
                  `<tr><td>${escapeHtml(a.descricao)}</td><td>${a.situacao}</td><td>${a.fisicoAcumulado}%</td></tr>`
              )
              .join("")
          : "<tr><td colspan='3'>—</td></tr>"
      }
    </tbody>
  </table>
  <h2>Fotos</h2>
  ${fotoBlocks}
  <h2>Observações</h2>
  <p class="meta">${escapeHtml(rdo.observacoes ?? "—")}</p>
  <div class="sign">
    <div>Responsável da obra</div>
    <div>Fiscal / aprovação</div>
  </div>
  <script>window.onload=()=>window.print()</script>
</body>
</html>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function openRdoPrintWindow(rdo: Rdo, obra?: Obra | null) {
  if (typeof window === "undefined") return;
  const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!w) return;
  w.document.write(buildRdoPrintHtml(rdo, obra));
  w.document.close();
}

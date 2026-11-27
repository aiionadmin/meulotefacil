# PR — Visualizador DXF no sistema (MLF-121)

Base: tip #111 (`cursor/replica-externos-stubs-fec9`). Sem deploy VPS.

## Pronto

- Assets em `public/dxf/` (`viewer.html` themed MLF, amostra `MIRASSOL.dxf`)
- Componente reutilizável `components/dxf/DxfViewer.tsx` (iframe)
- Rota autenticada `/empreendimentos/planta` — aba **DXF** (padrão) + Grade/PDF
- Controles preservados: zoom, pan, camadas, medir, abrir/arrastar DXF
- Visual: Montserrat + `#ED8600` no chrome do viewer (canvas intacto)

## Como testar

1. Login no app → Empreendimentos → **Planta** (ou `/empreendimentos/planta`)
2. Aba DXF: amostra Mirassol deve carregar; zoom/pan/camadas/medir
3. Abrir DXF… ou arrastar outro `.dxf`
4. Alternar Grade/PDF (fluxo C05 anterior intacto)
5. Direto: `/dxf/viewer.html?arquivo=MIRASSOL.dxf`

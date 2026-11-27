# Visualizador DXF (Meu Lote Fácil)

Viewer single-file sem dependências, servido em `/dxf/viewer.html`.

## Amostras

- `MIRASSOL.dxf`
- `PARQUE_UNIS.dxf`

Carregar: `/dxf/viewer.html?arquivo=PARQUE_UNIS.dxf`

## Upload no app

Em `/empreendimentos/planta` (aba DXF): somente `.dxf`, **sem limite de MB**.
O arquivo sobe no navegador e abre no viewer via `postMessage` (`mlf-dxf-load`).

## Controles

- Roda: zoom · Arrastar: mover · Duplo clique / `F`: enquadrar
- Medir: dois cliques (`Esc` limpa)
- Camadas: liga/desliga, filtro, mostrar/ocultar todas

DWG não é suportado — exporte como DXF.
Chrome MLF: Montserrat + `#ED8600`.

# PR — Upload DXF sem teto na planta

Base: tip #112 (visualizador DXF). Sem deploy.

## Pronto

- Aba DXF em `/empreendimentos/planta`: upload **somente .dxf**, `AttachDropZone` com `maxBytes={null}` (sem 10 MB)
- Upload abre no `DxfViewer` via `postMessage` (`mlf-dxf-load`) — sem fetch/API com teto
- Amostras: Mirassol + **Parque Unis** (`public/dxf/PARQUE_UNIS.dxf`)
- Demais anexos do sistema mantêm o teto 10 MB

## Como testar

1. `/empreendimentos/planta` → aba DXF
2. Clique **Parque Unis (amostra)** ou arraste um `.dxf` grande (>10 MB se tiver)
3. Viewer deve renderizar; zoom/pan/camadas/medir
4. Confirme que anexos genéricos (SC/lançamento) ainda rejeitam >10 MB

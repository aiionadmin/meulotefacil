# PR — Upload DXF sem teto na planta

Base: tip #112 (visualizador DXF). Sem deploy.

## Pronto

- Aba DXF em `/empreendimentos/planta`: viewer com toolbar **Abrir DXF…** (sem dropzone superior; sem teto de MB no viewer)
- `postMessage` (`mlf-dxf-load`) disponível para upload programático
- Amostras: Mirassol + **Parque Unis** (`public/dxf/PARQUE_UNIS.dxf`)
- Demais anexos do sistema mantêm o teto 10 MB

## Como testar

1. `/empreendimentos/planta` → aba DXF
2. Clique **Parque Unis (amostra)** ou **Abrir DXF…** no viewer
3. Zoom/pan/camadas/medir
4. Anexos genéricos (SC/lançamento) ainda rejeitam >10 MB

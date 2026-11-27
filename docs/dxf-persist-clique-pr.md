# DXF persistido + clique → ficha do lote

## O que mudou
- Clique no número do lote no viewer (`mlf-dxf-pick`) abre ficha completa (status, código, área, valor, comprador/contrato, cartório/certidão se houver).
- **Salvar planta no empreendimento** grava meta em `Development.plantaDxf` + blob no IndexedDB.
- **Salvar + gerar lotes do DXF** importa rótulos das camadas Número/Identificação via `importLots`.
- Upload continua em **Abrir DXF…** no viewer; o app recebe `mlf-dxf-loaded` para poder persistir.

## Como testar
1. Login → `/empreendimentos/planta` (aba DXF).
2. Abrir amostra Mirassol (ou Abrir DXF…).
3. Zoom num número de lote (camada `*Numero*`) e **clique** (sem arrastar).
4. Ficha lateral com dados do lote mapeado (match por nº; se vários, o primeiro + aviso).
5. **Salvar planta no empreendimento** → trocar de empreendimento e voltar: planta reabre.
6. Opcional: **Salvar + gerar lotes do DXF** e conferir grade/lotes novos.

## Deploy
Empilhado sobre #114 (`cursor/dxf-lotes-interativos-fec9`).

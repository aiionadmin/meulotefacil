# Scripts de importação (Fase 5 / 7)

Ordem (§13.2): listas → pessoas → empreendimentos → lotes → contratos → parcelas → recebimentos → financeiro → obras → compras → arquivos.

Cada script é **idempotente**, grava `legacy_system` + `legacy_id`, e não sobrescreve registros já casados.

## Pré-requisitos

- Cópia autorizada do Access/LoteWin (`Finance.mdb` e banco principal — local a confirmar).
- Exportações Mais Controle (plano de contas, categorias, usuários).
- Variáveis: `DATABASE_URL`, `LEGACY_LW_PATH`, `LEGACY_MC_PATH`.

## Uso (quando a cópia existir)

```bash
npx tsx scripts/import/run.ts --entity=pessoas --dry-run
npx tsx scripts/import/run.ts --entity=all --yes
```

Enquanto a cópia não chega, a UI em `/importacao` simula a fila e a conferência contra o painel de 24/11/2026.

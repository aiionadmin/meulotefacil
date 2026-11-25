# Proposta — Fases 5 a 7 (importação, financeiro, obras/compras)

Com base em `docs/especificacao.md` §8, §9.1, §12 e §13.1–13.2.  
**Em implementação** após Fases 1–4.

## Entregas

| Fase | Escopo neste PR |
| --- | --- |
| 5 | Fila de importação idempotente (`scripts/import`), UI `/importacao` com conferência vs painel LoteWin 24/11/2026 |
| 6 | Contas, a pagar, a receber, transferências, pré-lançamentos |
| 7 | Obras/orçamento (árvore + progresso), SC → OC → lançamento a pagar |

## Limites

- Importação real bloqueada até cópia autorizada (`LEGACY_LW_PATH`); UI simula.
- Recebíveis de contrato no financeiro ainda não sincronizam automaticamente com `CarteiraStore` (próximo passo de integração).
- Gantt / curva S / mapa de cotação completo ficam para polimento.

## Critérios

- [x] Migration SQL Fases 5–7
- [x] `OperacoesStore` + telas navegáveis
- [x] Scripts dry-run em `scripts/import`
- [ ] Conferência com dados reais do LoteWin (aguardando cópia)

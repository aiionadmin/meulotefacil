# Proposta — Fases 2 a 4 (estoque + carteira + recebimentos)

Com base em `docs/especificacao.md` §6, §7.1, §11, §12 e §13.1.  
**Em implementação** após aprovação da especificação completa e da Fase 1.

## Entregas

| Fase | Escopo neste PR |
| --- | --- |
| 2 | Empreendimentos, lotes (Emp+Quadra+Lote), status/histórico, geração em massa, tabela de preços, planta clicável |
| 3 | Contratos, ficha financeira, saldo devedor, encargos §11.3 (API server), cards stub na jornada |
| 4 | Caixa (baixa/estorno), boletos, remessa/retorno, reajuste anual, operações (retomada etc.) |

## Fora deste corte

- Importação LoteWin (Fase 5)
- Financeiro completo / obras / compras (Fases 6–7)
- Kanban drag-and-drop completo e leads (Fase 8)
- Fórmulas de reajuste validadas em contratos reais (marcado confirmar na §13.3)

## Critérios de pronto

- [x] Migration SQL Fases 2–4
- [x] Store local espelhando schema
- [x] Telas navegáveis no menu 4–6
- [x] Caso de teste §11.3 (juros/multa) passando
- [ ] Conferência com painel LoteWin (aguardando cópia autorizada)

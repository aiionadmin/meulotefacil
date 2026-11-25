# Parte 3 — entregável (Compras)

Prompt: `docs/prompt-cursor-meu-lote-facil.md` §4.

## Pronto neste PR

- Migration `202611250007_parte3_compras.sql` (itens de SC, cotações, fornecedores, preços, OC com `quotation_id`, config `permitir_oc_sem_cotacao` default false).
- Store demo `lib/store/compras-store.tsx` + seed (`lib/domain/compras-seed.ts`).
- Menu: Solicitações (`/compras`), Cotações (`/compras/cotacoes`), Ordens (`/compras/ordens`); quadro `/quadros/compras`.
- SC: abas por status, contadores “x de y”, centro de custo obrigatório (obra ou empresa), aprovação/recusa, gerar cotação com 3 fornecedores, marcar recebimento.
- Cotação: lista, abas Itens / Fornecedores / Mapa; escolher vencedor; gerar OC.
- OC: lista com totais por aprovação; aprovar gera lançamento a pagar; bloqueio de OC sem cotação no padrão.
- Teste: `npx tsx lib/domain/compras-flow.test.ts`.

## Como testar

1. `/compras` → Nova solicitação (obrigatório escolher centro) → Enviar → Aprovar.
2. Gerar cotação (3 forn.) → `/compras/cotacoes` → Mapa → escolher vencedores → Gerar OC.
3. `/compras/ordens` → Aprovar + lançamento → Marcar entregue.
4. Contadores Cotados/Comprados/Recebidos e vínculos SC↔COT↔OC devem bater.

## Pendente

- PDF mapa, alçadas por faixa de valor, arquivos/comentários, sync Supabase real.
- *(Parcial no polish pós-#32: página pública `/cotacao/[token]`.)*

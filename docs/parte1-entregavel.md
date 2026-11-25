# Parte 1 — entregável

Prompt: `docs/prompt-cursor-meu-lote-facil.md` §2.

## Pronto neste PR

- **Multiempresas**: migration + seletor na topbar (`Todas` + empresas do usuário); seed com 2 empresas.
- **Modalidade** do empreendimento: `loteamento` | `regularizacao` | `ambos` (abas/quadro de regularização respeitam).
- **Importar lotes** CSV (modelo Excel) com conferência antes de gravar.
- **Planta PDF**: upload por empreendimento + lista de versões (marcação de polígonos pendente).
- **Kanban só avança** (Jornada e Regularização); atraso vira **selo**, não muda coluna.
- **Leads** com qualificação + score/temperatura; mínimos para proposta.
- **Proposta** exige empreendimento + lote ou serviço de regularização; **Converter** cria contrato na carteira herdando valores (lote disponível/reservado).
- **Listas** com paginação (10/25/50/100) em leads, propostas, lotes e ficha financeira.
- **Ficha financeira**: sem refresh de todas as parcelas no mount; encargos só da página; teste de 240 parcelas.

## Pendente (próximas iterações / Partes 2–5)

- RLS completa em todas as tabelas + sync real Supabase (demo ainda usa stores existentes).
- Export PDF/Excel e edição em lote em *todas* as listas.
- Desenho de polígonos sobre a planta; preview raster do PDF.
- Modelo `.xlsx` nativo (hoje CSV aberto no Excel).
- Visibilidade de obras no cadastro de usuário (campo preparado; UI completa na Parte 2).
- Obras/RDO, Compras, Financeiro Mais Controle, portais (Partes 2–5).

## Como testar

```bash
npx tsx lib/domain/kanban-forward.test.ts
npx tsx lib/domain/lead-score.test.ts
npx tsx lib/money/ficha-parcelas.test.ts
npm run dev
```

1. Topbar → seletor de empresa (Admin vê Todas / Meu Lote Fácil / Lote Norte).
2. `/empreendimentos` → Novo com modalidade; Importar lotes (baixar modelo CSV).
3. `/empreendimentos/planta` → Upload PDF.
4. `/quadros/jornada` → tentar arrastar para trás (bloqueado); selo Em atraso em Ana Souza.
5. `/quadros/regularizacao` → só avança; emp só loteamento não aparece.
6. `/leads` → novo lead com qualificação; score aparece.
7. `/vendas` → proposta sem empreendimento/lote é recusada.
8. `/carteira` → abre rápido com paginação; encargos só na página.

# OFX + Alçadas + Gantt crítico — entregável

Base: tip de `cursor/polish-gaps-demo-fec9` (#33).

## Pronto neste PR

- **Alçadas**: regras SC/OC por faixa, conciliação e desconciliação; simulação no perfil atual em `/configuracoes/alcadas`; OC respeita alçada ao aprovar.
- **OFX**: parser STMTTRN, importação e match por valor/memo; extrato dia a dia em `/financeiro/contas/[id]`.
- **Gantt**: caminho crítico (predecessores) + export CSV.
- Migration `202611250010_ofx_alcadas.sql`.
- Teste: `npx tsx lib/domain/ofx-alcadas.test.ts`.

## Como testar

1. `/configuracoes/alcadas` → ver faixas OC 5k / 60k.
2. Gerar OC alta e tentar aprovar com perfil sem alçada (ou simular na página).
3. `/financeiro/contas` → abrir conta → Carregar exemplo OFX → Importar.
4. Obra detalhe → Gantt com barras laranja no caminho crítico → Exportar CSV.

## Ainda aberto

- Auth SMS/e-mail real, PDF binário, sync Supabase/RLS em produção, Sefaz/NFSe.

# Relatórios PDF + NFSe/Sefaz + bloqueio — entregável

Base: tip de `cursor/ofx-alcadas-polish-fec9` (#34).

## Pronto neste PR

- PDF imprimível: mapa de cotação, lista de pagamentos e recebimentos (`lib/domain/report-pdf.ts`).
- Meus CNPJs em `/fiscal` com toggles **Emissão NFSe** e **Captura Sefaz** (default off).
- Bloqueio financeiro por data na conta (`/financeiro/contas/[id]`); baixa respeita o bloqueio.
- Migration `202611250011_nfse_relatorios.sql`.
- Teste: `npx tsx lib/domain/report-pdf.test.ts`.

## Como testar

1. `/compras/cotacoes` → mapa → PDF mapa.
2. `/financeiro` e `/financeiro/recebimentos` → PDF lista.
3. Conta → Bloquear até hoje → tentar Pagar título → bloqueado.
4. `/fiscal` → ligar/desligar NFSe/Sefaz (sem provedor).

## Ainda aberto

- Auth SMS/e-mail, PDF binário nativo, provedor NFSe/Sefaz real, sync Supabase.

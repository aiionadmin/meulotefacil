# PR — Externos (stubs desligados)

Base: tip UX aceite (#110). Sem deploy.

## Pronto

Camada `lib/integrations/`:
- Config em memória (flag `enabled` + `provider` placeholder)
- Stubs que **nunca** chamam rede: NFSe, Sefaz, e-mail cotação/OC, WhatsApp cotação/OC/pré, banco Open Finance
- Motivos: `disabled` | `no_provider` | `provider_pending`
- UI: `/configuracoes/parametros/integracoes`
- Botões nas telas de Cotação, OC, Pré-lançamentos, Notas/CNPJs, Cobrança Fácil

## Só flag / provider (sem SDK)

| Canal | Flag | Provedores placeholder | Chamada real |
| --- | --- | --- | --- |
| NFSe | Meu CNPJ + Integrações | focusnfe, enotas | não |
| Sefaz | Meu CNPJ + Integrações | sefaz_nfe | não (upload XML segue) |
| E-mail | Integrações | smtp, resend | não |
| WhatsApp | Integrações | meta_cloud, zapi | não |
| Banco | Integrações | pluggy / ofx_only | não (OFX manual segue) |

## Como testar

1. Configurações → Integrações: ligar intenção e escolher provedor → status “Provedor marcado (stub)”
2. Cotação → Fornecedores → Enviar e-mail / WhatsApp → toast stub
3. OC → Enviar e-mail / WhatsApp → toast stub
4. Notas → Testar NFSe / toggle captura → toast stub
5. `npx tsx lib/integrations/stubs.test.ts`

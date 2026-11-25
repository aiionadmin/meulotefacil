# Parte 5 — entregável (dashboards, portais, demandas)

Prompt: `docs/prompt-cursor-meu-lote-facil.md` §6.

## Pronto neste PR

- Migration `202611250009_parte5_portais_demandas.sql` (tipos, demandas, perfis portal, RLS de isolamento, rotinas de permissão).
- Store `lib/store/parte5-store.tsx` + seed.
- `/demandas` — lista + kanban (Aberta → Cancelada), tipos padrão Mais Controle.
- Dashboards `/dashboard/operacional` e `/dashboard/gerencial` (números clicáveis / atalhos).
- Portais `/portal/corretor` e `/portal/cliente` com isolamento de dados.
- Hub `/empreendimentos/hub` (abas resumo, lotes, vendas, previsão, inadimplência, demandas, obras).
- Teste: `npx tsx lib/domain/parte5-isolation.test.ts`.

## Como testar

1. `/portal/cliente` → Abrir pedido → aparece em `/demandas`.
2. `/portal/corretor` → Abrir demanda com `corretorId` → só lista nas “minhas demandas”.
3. Trocar sessão mentalmente: cliente não lista contratos de outros (contador “ocultos”).
4. `/dashboard/operacional` e `/gerencial` batem com listas de origem (compras, obras, financeiro).
5. `/empreendimentos/hub` — filtrar empreendimento e abas.

## Pendente

- Auth real dos portais (CPF + código), PDF comissões/materiais, planta PDF no hub, sync Supabase com RLS em produção.
- Fine-tuning de permissões por perfil na UI.

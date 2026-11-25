-- Seed Fase 1 — organização demo, 12 perfis, listas de apoio, usuários e pessoas
-- Rode após a migration 202611250001_fase1_acesso_pessoas.sql

do $$
declare
  org_id uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  admin_profile uuid;
  fin_profile uuid;
  com_profile uuid;
  admin_user uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
begin
  insert into public.organizations (id, razao_social, nome_fantasia, cnpj, telefone, email, advogado_nome, advogado_oab)
  values (
    org_id,
    'Meu Lote Fácil Ltda',
    'Meu Lote Fácil',
    '12.345.678/0001-90',
    '(19) 99146-1834',
    'contato@meulotefacil.com.br',
    'Dr. Silva',
    'OAB/SP 123456'
  )
  on conflict (id) do nothing;

  -- 12 perfis (§3.1)
  insert into public.profiles (id, organization_id, codigo, nome, descricao, sistema) values
    (gen_random_uuid(), org_id, 'administrador', 'Administrador', 'Tudo, inclusive Configurações e Auditoria', true),
    (gen_random_uuid(), org_id, 'direcao', 'Direção', 'Leitura; aprova alçadas; resultados', true),
    (gen_random_uuid(), org_id, 'financeiro', 'Financeiro', 'Financeiro, Fiscal, Recebimentos', true),
    (gen_random_uuid(), org_id, 'engenharia', 'Engenharia', 'Obras, orçamentos, solicitações', true),
    (gen_random_uuid(), org_id, 'obras', 'Obras', 'Campo: SC próprias, pré-lançamentos, tarefas', true),
    (gen_random_uuid(), org_id, 'suprimentos', 'Suprimentos', 'Compras, fornecedores, insumos', true),
    (gen_random_uuid(), org_id, 'comercial', 'Comercial', 'Comercial e Jornada', true),
    (gen_random_uuid(), org_id, 'corretor', 'Corretor', 'Próprios leads, propostas e vendas', true),
    (gen_random_uuid(), org_id, 'atendimento', 'Atendimento e caixa', 'Caixa, cadastro, conversas', true),
    (gen_random_uuid(), org_id, 'cobranca', 'Cobrança', 'Inadimplentes, régua, acordos', true),
    (gen_random_uuid(), org_id, 'juridico', 'Jurídico', 'Processos, acordos, retomada', true),
    (gen_random_uuid(), org_id, 'regularizacao', 'Regularização', 'Escrituras, cartórios, documentos', true)
  on conflict (codigo) do nothing;

  select id into admin_profile from public.profiles where codigo = 'administrador';
  select id into fin_profile from public.profiles where codigo = 'financeiro';
  select id into com_profile from public.profiles where codigo = 'comercial';

  insert into public.users (id, organization_id, profile_id, nome, email, status, chave)
  values
    (admin_user, org_id, admin_profile, 'Admin Demo', 'demo@meulotefacil.com.br', 'ativo', true),
    (gen_random_uuid(), org_id, fin_profile, 'Financeiro', 'financeiro@meulotefacil.com.br', 'ativo', false),
    (gen_random_uuid(), org_id, com_profile, 'Comercial', 'vendas@meulotefacil.com.br', 'ativo', false)
  on conflict do nothing;

  insert into public.user_organizations (user_id, organization_id)
  select id, org_id from public.users where organization_id = org_id
  on conflict do nothing;

  -- Listas de apoio (§10.5)
  insert into public.lookup_lists (id, organization_id, codigo, nome) values
    ('11111111-1111-1111-1111-111111111101', org_id, 'status_lote', 'Status do lote'),
    ('11111111-1111-1111-1111-111111111102', org_id, 'tipos_parcela', 'Tipos de parcela'),
    ('11111111-1111-1111-1111-111111111103', org_id, 'formas_pagamento', 'Formas de pagamento'),
    ('11111111-1111-1111-1111-111111111104', org_id, 'tipos_empreendimento', 'Tipos de empreendimento'),
    ('11111111-1111-1111-1111-111111111105', org_id, 'papeis_pessoa', 'Papéis de pessoa')
  on conflict do nothing;

  insert into public.lookup_items (list_id, codigo, nome, ordem, meta) values
    ('11111111-1111-1111-1111-111111111101', 'disponivel', 'Disponível', 1, '{"bloqueia_venda":false,"bloqueia_financeiro":false}'::jsonb),
    ('11111111-1111-1111-1111-111111111101', 'reservado', 'Reservado', 2, '{"bloqueia_venda":true,"bloqueia_financeiro":false}'::jsonb),
    ('11111111-1111-1111-1111-111111111101', 'vendido', 'Vendido', 3, '{"bloqueia_venda":true,"bloqueia_financeiro":false}'::jsonb),
    ('11111111-1111-1111-1111-111111111101', 'quitado', 'Quitado', 4, '{"bloqueia_venda":true,"bloqueia_financeiro":true}'::jsonb),
    ('11111111-1111-1111-1111-111111111101', 'escritura', 'Escritura', 5, '{"bloqueia_venda":true,"bloqueia_financeiro":true}'::jsonb),
    ('11111111-1111-1111-1111-111111111101', 'juridico', 'Jurídico', 6, '{"bloqueia_venda":true,"bloqueia_financeiro":true}'::jsonb),
    ('11111111-1111-1111-1111-111111111102', 'P', 'Prestação', 1, '{"sofre_reajuste":true}'::jsonb),
    ('11111111-1111-1111-1111-111111111102', 'E', 'Sinal', 2, '{"sofre_reajuste":false}'::jsonb),
    ('11111111-1111-1111-1111-111111111102', '@', 'Acordo/Renegociação', 3, '{"sofre_reajuste":false}'::jsonb),
    ('11111111-1111-1111-1111-111111111103', 'pix', 'Pix', 1, '{}'::jsonb),
    ('11111111-1111-1111-1111-111111111103', 'boleto', 'Boleto', 2, '{}'::jsonb),
    ('11111111-1111-1111-1111-111111111103', 'dinheiro', 'Dinheiro', 3, '{}'::jsonb),
    ('11111111-1111-1111-1111-111111111104', 'loteamento', 'Loteamento', 1, '{}'::jsonb),
    ('11111111-1111-1111-1111-111111111104', 'regularizacao', 'Regularização', 2, '{}'::jsonb),
    ('11111111-1111-1111-1111-111111111105', 'cliente', 'Cliente', 1, '{}'::jsonb),
    ('11111111-1111-1111-1111-111111111105', 'comprador', 'Comprador', 2, '{}'::jsonb),
    ('11111111-1111-1111-1111-111111111105', 'fornecedor', 'Fornecedor', 3, '{}'::jsonb),
    ('11111111-1111-1111-1111-111111111105', 'profissional', 'Profissional', 4, '{}'::jsonb),
    ('11111111-1111-1111-1111-111111111105', 'corretor', 'Corretor', 5, '{}'::jsonb),
    ('11111111-1111-1111-1111-111111111105', 'socio', 'Sócio', 6, '{}'::jsonb)
  on conflict do nothing;

  insert into public.people (id, organization_id, tipo, status, nome, documento, celular, email)
  values
    ('cccccccc-cccc-cccc-cccc-ccccccccccc1', org_id, 'fisica', 'ativo', 'Bruno Lima', '123.456.789-00', '(19) 99100-1001', 'bruno@email.com'),
    ('cccccccc-cccc-cccc-cccc-ccccccccccc2', org_id, 'juridica', 'ativo', 'Construtora Horizonte Ltda', '12.345.678/0001-90', '(19) 3232-4400', 'compras@horizonte.com'),
    ('cccccccc-cccc-cccc-cccc-ccccccccccc3', org_id, 'fisica', 'ativo', 'Ana Paula Corretores', '987.654.321-00', '(19) 98888-2200', 'ana@corretores.com')
  on conflict do nothing;

  insert into public.person_roles (person_id, papel) values
    ('cccccccc-cccc-cccc-cccc-ccccccccccc1', 'comprador'),
    ('cccccccc-cccc-cccc-cccc-ccccccccccc1', 'cliente'),
    ('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'fornecedor'),
    ('cccccccc-cccc-cccc-cccc-ccccccccccc3', 'corretor')
  on conflict do nothing;

  insert into public.person_addresses (person_id, tipo, cidade, uf)
  values
    ('cccccccc-cccc-cccc-cccc-ccccccccccc1', 'residencial', 'Campinas', 'SP'),
    ('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'sede', 'Campinas', 'SP'),
    ('cccccccc-cccc-cccc-cccc-ccccccccccc3', 'residencial', 'Valinhos', 'SP')
  on conflict do nothing;

  insert into public.task_boards (organization_id, nome, pasta)
  values (org_id, 'Geral', 'Início')
  on conflict do nothing;

  insert into public.boards (organization_id, codigo, nome) values
    (org_id, 'jornada', 'Jornada do cliente'),
    (org_id, 'cobranca', 'Cobrança'),
    (org_id, 'regularizacao', 'Regularização e escritura'),
    (org_id, 'compras', 'Compras'),
    (org_id, 'obras', 'Obras'),
    (org_id, 'tarefas', 'Tarefas')
  on conflict do nothing;
end $$;

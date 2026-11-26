-- Bloco E — Compras: Solicitação → Cotação → Ordem de Compra
-- Spec: docs/prompt-unico-meu-lote-facil.md Bloco E / Anexo 3

-- Centro de custo: obra_id OU empresa (organization)
alter table public.purchase_requests
  add column if not exists obra_id uuid references public.obras (id),
  add column if not exists centro_tipo text default 'obra'
    check (centro_tipo in ('obra', 'empresa')),
  add column if not exists aprovado_por text,
  add column if not exists aprovado_em timestamptz,
  add column if not exists motivo_recusa text,
  add column if not exists criado_em date default current_date;

create table if not exists public.purchase_request_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.purchase_requests (id) on delete cascade,
  descricao text not null,
  unidade text not null default 'un',
  quantidade numeric(14,4) not null default 1,
  quantidade_cotada numeric(14,4) default 0,
  quantidade_comprada numeric(14,4) default 0,
  quantidade_recebida numeric(14,4) default 0,
  budget_node_id uuid,
  insumo_id uuid references public.insumos (id),
  status text default 'solicitado',
  previsao_entrega date,
  ordem int default 0
);

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  numero text not null,
  descricao text,
  request_id uuid references public.purchase_requests (id),
  obra_id uuid references public.obras (id),
  centro_tipo text not null default 'obra',
  centro_label text not null,
  status text not null default 'em_aberto'
    check (status in (
      'em_aberto', 'solicitado', 'enviado', 'respondido_parcial',
      'cotado_parcial', 'cotado', 'finalizado'
    )),
  prioridade boolean not null default false,
  necessidade date,
  solicitante text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  unique (organization_id, numero)
);

create table if not exists public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations (id) on delete cascade,
  request_item_id uuid references public.purchase_request_items (id),
  descricao text not null,
  unidade text not null default 'un',
  quantidade numeric(14,4) not null,
  valor_orcamento numeric(14,2) default 0,
  ordem int default 0
);

create table if not exists public.quotation_suppliers (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations (id) on delete cascade,
  fornecedor text not null,
  contato text,
  email text,
  telefone text,
  qualificacao int default 0,
  public_token text unique,
  respondido boolean not null default false
);

create table if not exists public.quotation_prices (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations (id) on delete cascade,
  item_id uuid not null references public.quotation_items (id) on delete cascade,
  supplier_id uuid not null references public.quotation_suppliers (id) on delete cascade,
  preco_unitario numeric(14,4),
  quantidade_cotada numeric(14,4),
  prazo_dias int,
  vencedor boolean not null default false,
  unique (item_id, supplier_id)
);

-- Enriquecer OC
alter table public.purchase_orders
  add column if not exists quotation_id uuid references public.quotations (id),
  add column if not exists obra_id uuid references public.obras (id),
  add column if not exists descricao text,
  add column if not exists aprovacao_status text default 'aguardando_aprovacao'
    check (aprovacao_status in (
      'aprovado', 'em_aberto', 'negociando', 'aguardando_aprovacao', 'negado'
    )),
  add column if not exists compra_status text default 'aguardando'
    check (compra_status in (
      'aguardando', 'comprado', 'entregue_parcial', 'entregue_total'
    )),
  add column if not exists frete numeric(14,2) default 0,
  add column if not exists outras_despesas numeric(14,2) default 0,
  add column if not exists impostos numeric(14,2) default 0,
  add column if not exists desconto numeric(14,2) default 0,
  add column if not exists previsao_entrega date,
  add column if not exists payable_id uuid references public.payables (id);

create table if not exists public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.purchase_orders (id) on delete cascade,
  quotation_item_id uuid references public.quotation_items (id),
  descricao text not null,
  unidade text not null default 'un',
  quantidade numeric(14,4) not null,
  valor_unitario numeric(14,4) not null,
  valor numeric(14,2) not null,
  budget_node_id uuid,
  ordem int default 0
);

create table if not exists public.compras_config (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  cotacao_numero_inicial int not null default 1,
  oc_numero_inicial int not null default 1,
  permitir_oc_sem_cotacao boolean not null default false,
  fornecedor_documento_obrigatorio boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.quotations enable row level security;
alter table public.purchase_request_items enable row level security;
alter table public.quotation_items enable row level security;
alter table public.quotation_suppliers enable row level security;
alter table public.quotation_prices enable row level security;
alter table public.purchase_order_items enable row level security;
alter table public.compras_config enable row level security;

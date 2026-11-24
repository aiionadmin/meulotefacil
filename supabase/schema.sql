-- Meu Lote Fácil — schema sugerido (Postgres / Supabase)
-- Execute no SQL Editor do Supabase. Ajuste políticas conforme o produto.

create extension if not exists "pgcrypto";

-- Papéis
create type public.papel as enum ('admin', 'corretor', 'cliente');
create type public.status_empreendimento as enum ('lancamento', 'ultimas_unidades', 'esgotado');
create type public.status_lote as enum ('disponivel', 'reservado', 'vendido');
create type public.status_proposta as enum ('nova', 'em_analise', 'aprovada', 'contrato');
create type public.status_contrato as enum ('rascunho', 'aguardando_assinatura', 'ativo', 'encerrado');
create type public.status_parcela as enum ('a_receber', 'vencida', 'paga');

-- Profiles (1:1 com auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  email text,
  telefone text,
  cpf text,
  papel public.papel not null default 'cliente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.empreendimentos (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nome text not null,
  cidade text not null,
  estado text not null,
  metragem_desde numeric,
  parcela_desde numeric,
  status public.status_empreendimento not null default 'lancamento',
  descricao text,
  imagem_url text,
  created_at timestamptz not null default now()
);

create table public.quadras (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references public.empreendimentos (id) on delete cascade,
  codigo text not null,
  unique (empreendimento_id, codigo)
);

create table public.lotes (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references public.empreendimentos (id) on delete cascade,
  quadra_id uuid references public.quadras (id) on delete set null,
  numero text not null,
  metragem numeric not null,
  valor numeric not null,
  status public.status_lote not null default 'disponivel',
  mapa_points text,
  created_at timestamptz not null default now()
);

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  nome text not null,
  email text,
  telefone text,
  cpf text,
  created_at timestamptz not null default now()
);

create table public.propostas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  lote_id uuid not null references public.lotes (id) on delete restrict,
  valor numeric not null,
  status public.status_proposta not null default 'nova',
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.contratos (
  id uuid primary key default gen_random_uuid(),
  proposta_id uuid references public.propostas (id) on delete set null,
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  lote_id uuid not null references public.lotes (id) on delete restrict,
  valor numeric not null,
  status public.status_contrato not null default 'rascunho',
  assinado_em timestamptz,
  pdf_url text,
  created_at timestamptz not null default now()
);

create table public.parcelas (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos (id) on delete cascade,
  numero int not null,
  total_parcelas int not null,
  valor numeric not null,
  vencimento date not null,
  status public.status_parcela not null default 'a_receber',
  pago_em timestamptz
);

create table public.documentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text,
  tamanho_bytes bigint,
  storage_path text,
  cliente_id uuid references public.clientes (id) on delete cascade,
  empreendimento_id uuid references public.empreendimentos (id) on delete cascade,
  uploaded_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- Helper: papel do usuário atual
create or replace function public.current_papel()
returns public.papel
language sql
stable
security definer
set search_path = public
as $$
  select papel from public.profiles where id = auth.uid();
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.empreendimentos enable row level security;
alter table public.quadras enable row level security;
alter table public.lotes enable row level security;
alter table public.clientes enable row level security;
alter table public.propostas enable row level security;
alter table public.contratos enable row level security;
alter table public.parcelas enable row level security;
alter table public.documentos enable row level security;

-- Profiles: usuário vê/edita o próprio; admin vê todos
create policy "profiles_select_own_or_staff"
  on public.profiles for select
  using (
    id = auth.uid()
    or public.current_papel() in ('admin', 'corretor')
  );

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid() or public.current_papel() = 'admin');

-- Empreendimentos / lotes: leitura pública autenticada; escrita staff
create policy "emp_select_all"
  on public.empreendimentos for select
  using (true);

create policy "emp_write_staff"
  on public.empreendimentos for all
  using (public.current_papel() in ('admin', 'corretor'));

create policy "quadras_select_all"
  on public.quadras for select using (true);

create policy "quadras_write_staff"
  on public.quadras for all
  using (public.current_papel() in ('admin', 'corretor'));

create policy "lotes_select_all"
  on public.lotes for select using (true);

create policy "lotes_write_staff"
  on public.lotes for all
  using (public.current_papel() in ('admin', 'corretor'));

-- Clientes / propostas / contratos / parcelas / docs: staff total; cliente só o próprio
create policy "clientes_staff"
  on public.clientes for all
  using (public.current_papel() in ('admin', 'corretor'));

create policy "clientes_own"
  on public.clientes for select
  using (profile_id = auth.uid());

create policy "propostas_staff"
  on public.propostas for all
  using (public.current_papel() in ('admin', 'corretor'));

create policy "propostas_own"
  on public.propostas for select
  using (
    exists (
      select 1 from public.clientes c
      where c.id = cliente_id and c.profile_id = auth.uid()
    )
  );

create policy "contratos_staff"
  on public.contratos for all
  using (public.current_papel() in ('admin', 'corretor'));

create policy "contratos_own"
  on public.contratos for select
  using (
    exists (
      select 1 from public.clientes c
      where c.id = cliente_id and c.profile_id = auth.uid()
    )
  );

create policy "parcelas_staff"
  on public.parcelas for all
  using (public.current_papel() in ('admin', 'corretor'));

create policy "parcelas_own"
  on public.parcelas for select
  using (
    exists (
      select 1
      from public.contratos ct
      join public.clientes c on c.id = ct.cliente_id
      where ct.id = contrato_id and c.profile_id = auth.uid()
    )
  );

create policy "docs_staff"
  on public.documentos for all
  using (public.current_papel() in ('admin', 'corretor'));

create policy "docs_own"
  on public.documentos for select
  using (
    exists (
      select 1 from public.clientes c
      where c.id = cliente_id and c.profile_id = auth.uid()
    )
  );

-- Trigger: cria profile no signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email, papel)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'papel')::public.papel, 'cliente')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

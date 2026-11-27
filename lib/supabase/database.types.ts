/**
 * Tipos gerados (stub Bloco A + D/E/G cores da réplica).
 * Regenerar com `supabase gen types` quando o projeto remoto estiver ligado.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      store_snapshots: {
        Row: {
          id: string;
          organization_id: string;
          store_key: string;
          payload: Json;
          schema_version: number;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          store_key: string;
          payload?: Json;
          schema_version?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["store_snapshots"]["Insert"]>;
      };
      audit_log: {
        Row: {
          id: string;
          organization_id: string;
          quando: string;
          user_id: string | null;
          usuario_nome: string | null;
          rotina: string;
          registro_tipo: string | null;
          registro_id: string | null;
          acao: string;
          antes: Json | null;
          depois: Json | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          quando?: string;
          user_id?: string | null;
          usuario_nome?: string | null;
          rotina: string;
          registro_tipo?: string | null;
          registro_id?: string | null;
          acao: string;
          antes?: Json | null;
          depois?: Json | null;
        };
        Update: Partial<Database["public"]["Tables"]["audit_log"]["Insert"]>;
      };
      profile_permissions: {
        Row: {
          id: string;
          profile_id: string;
          rotina: string;
          ver: boolean;
          inserir_alterar: boolean;
          remover: boolean;
          especial: Json | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          rotina: string;
          ver?: boolean;
          inserir_alterar?: boolean;
          remover?: boolean;
          especial?: Json | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["profile_permissions"]["Insert"]
        >;
      };
      obras: {
        Row: {
          id: string;
          organization_id: string;
          codigo: string;
          nome: string;
          tipo: string;
          status: string;
          cliente_nome: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          codigo: string;
          nome: string;
          tipo?: string;
          status?: string;
          cliente_nome?: string | null;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["obras"]["Insert"]>;
      };
      planos_conta: {
        Row: {
          id: string;
          organization_id: string;
          nome: string;
          fluxo: string;
          grupo_resultados: string;
          ativo: boolean;
        };
        Insert: {
          id?: string;
          organization_id: string;
          nome: string;
          fluxo: string;
          grupo_resultados: string;
          ativo?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["planos_conta"]["Insert"]>;
      };
      categorias_financeiras: {
        Row: {
          id: string;
          organization_id: string;
          nome: string;
          plano_id: string;
          classificacao_obra: string | null;
          ativo: boolean;
        };
        Insert: {
          id?: string;
          organization_id: string;
          nome: string;
          plano_id: string;
          classificacao_obra?: string | null;
          ativo?: boolean;
        };
        Update: Partial<
          Database["public"]["Tables"]["categorias_financeiras"]["Insert"]
        >;
      };
      naturezas_receita: {
        Row: {
          id: string;
          organization_id: string;
          nome: string;
          ativo: boolean;
          linha_resultados: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          nome: string;
          ativo?: boolean;
          linha_resultados?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["naturezas_receita"]["Insert"]
        >;
      };
      lancamentos: {
        Row: {
          id: string;
          organization_id: string;
          descricao: string;
          favorecido: string;
          categoria_id: string | null;
          valor: number;
        };
        Insert: {
          id?: string;
          organization_id: string;
          descricao: string;
          favorecido: string;
          categoria_id?: string | null;
          valor: number;
        };
        Update: Partial<Database["public"]["Tables"]["lancamentos"]["Insert"]>;
      };
      compras_config: {
        Row: {
          organization_id: string;
          cotacao_numero_inicial: number;
          oc_numero_inicial: number;
          permitir_oc_sem_cotacao: boolean;
          fornecedor_documento_obrigatorio: boolean;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          cotacao_numero_inicial?: number;
          oc_numero_inicial?: number;
          permitir_oc_sem_cotacao?: boolean;
          fornecedor_documento_obrigatorio?: boolean;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["compras_config"]["Insert"]
        >;
      };
    };
  };
};

/**
 * Tipos gerados (stub Bloco A). Regenerar com `supabase gen types` quando o
 * projeto remoto estiver ligado. Cobre as tabelas tocadas em A01–A05.
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
    };
  };
};

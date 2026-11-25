export type AuditAction =
  | "criar"
  | "alterar"
  | "excluir"
  | "baixa"
  | "estorno"
  | "aprovacao"
  | "login"
  | "outro";

export type AuditWriteInput = {
  organizationId: string;
  userId?: string | null;
  usuarioNome: string;
  rotina: string;
  acao: AuditAction | string;
  registroTipo?: string | null;
  registroId?: string | null;
  antes?: unknown;
  depois?: unknown;
};

export type AuditRecord = AuditWriteInput & {
  id: string;
  quando: string;
};

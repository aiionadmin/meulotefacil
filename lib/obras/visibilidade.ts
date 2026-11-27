/** Filtra obras pela regra "Visível para" / permissões do usuário. */

export type ObraVisivelLike = {
  id: string;
  visivelPara?: string[];
};

export type UsuarioVisibilidade = {
  id: string;
  nome: string;
  chave?: boolean;
  verTodasObras?: boolean;
  obraIds?: string[];
};

/**
 * Administrador / chave / verTodasObras → vê tudo.
 * Senão: obraIds explícitos OU match em visivelPara (perfil ou nome).
 */
export function canSeeObra(
  obra: ObraVisivelLike,
  user: UsuarioVisibilidade | null | undefined,
  perfilNome: string
): boolean {
  if (!user) return false;
  if (user.chave || user.verTodasObras) return true;
  if (perfilNome.trim().toLowerCase() === "administrador") return true;
  if (user.obraIds?.includes(obra.id)) return true;

  const lista = obra.visivelPara ?? [];
  if (!lista.length) return false;

  const perfil = perfilNome.trim().toLowerCase();
  const nome = user.nome.trim().toLowerCase();
  return lista.some((v) => {
    const t = v.trim().toLowerCase();
    return t === perfil || t === nome;
  });
}

export function filterObrasVisiveis<T extends ObraVisivelLike>(
  obras: T[],
  user: UsuarioVisibilidade | null | undefined,
  perfilNome: string
): T[] {
  return obras.filter((o) => canSeeObra(o, user, perfilNome));
}

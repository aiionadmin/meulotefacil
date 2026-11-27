/** Validação: empreendimento exige cartório (id ou nome). */

export function validateCartorioObrigatorio(input: {
  cartorioId?: string | null;
  cartorioNome?: string | null;
}): string | null {
  const id = input.cartorioId?.trim();
  const nome = input.cartorioNome?.trim();
  if (id || nome) return null;
  return "Cartório obrigatório — selecione um cadastrado ou informe o nome";
}

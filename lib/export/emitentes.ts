/** Emitentes formais para PDFs/relatórios — CNPJ + logo + dados de documento. */

import { maskCNPJ, onlyDigits } from "@/lib/masks/br";

export type EmitenteId = "mlf" | "la";

export type EmitenteDoc = {
  id: EmitenteId;
  razaoSocial: string;
  nomeFantasia: string;
  /** Somente dígitos (14). */
  cnpjDigits: string;
  cnpj: string;
  endereco: string;
  bairro?: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone: string;
  email: string;
  /** Caminho público da logomarca para documentos (fundo claro). */
  logoDocumentoPath: string;
  /** Marca alternativa / site. */
  logoSitePath?: string;
};

export const EMITENTES: Record<EmitenteId, EmitenteDoc> = {
  mlf: {
    id: "mlf",
    razaoSocial: "Meu Lote Fácil Ltda",
    nomeFantasia: "Meu Lote Fácil",
    cnpjDigits: "47435336000140",
    cnpj: maskCNPJ("47435336000140"),
    endereco: "Rua Baguaçu, 26, Sala 313F, Loteamento Alphaville",
    bairro: "Alphaville",
    cidade: "Campinas",
    uf: "SP",
    cep: "13098-324",
    telefone: "(19) 99146-1834",
    email: "contato@meulotefacil.com.br",
    logoDocumentoPath: "/brand/mlf/logo-documento.png",
    logoSitePath: "/brand/mlf/logo-full-orange.png",
  },
  la: {
    id: "la",
    razaoSocial: "LA Regularizações Ltda",
    nomeFantasia: "LA",
    cnpjDigits: "22930670000140",
    cnpj: maskCNPJ("22930670000140"),
    endereco: "Av. Albino José B. Oliveira, 2270",
    bairro: "Jd. Afife, Barão Geraldo",
    cidade: "Campinas",
    uf: "SP",
    cep: "13084-120",
    telefone: "(19) 99164-5334",
    email: "contato@laregularizacoes.com.br",
    logoDocumentoPath: "/brand/la/logo-documento.png",
    logoSitePath: "/brand/la/logo-preto.png",
  },
};

export const EMITENTES_LIST = Object.values(EMITENTES);

export function normalizeCnpj(cnpj: string): string {
  return onlyDigits(cnpj).slice(0, 14);
}

export function findEmitenteByCnpj(
  cnpj: string | undefined | null
): EmitenteDoc | undefined {
  const d = normalizeCnpj(cnpj ?? "");
  if (!d) return undefined;
  return EMITENTES_LIST.find((e) => e.cnpjDigits === d);
}

export function resolveEmitenteLogoPath(
  cnpj: string | undefined | null
): string {
  const e = findEmitenteByCnpj(cnpj);
  return e?.logoDocumentoPath ?? EMITENTES.mlf.logoDocumentoPath;
}

export function resolveEmitente(
  cnpjOrId: string | EmitenteId | undefined | null
): EmitenteDoc {
  if (cnpjOrId === "mlf" || cnpjOrId === "la") return EMITENTES[cnpjOrId];
  return findEmitenteByCnpj(cnpjOrId ?? "") ?? EMITENTES.mlf;
}

/** Monta bloco textual de endereço para documento formal. */
export function formatEmitenteEndereco(e: {
  endereco?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
}): string {
  const line1 = e.endereco?.trim() || "";
  const line2 = [e.bairro, e.cidade && e.uf ? `${e.cidade}/${e.uf}` : e.cidade || e.uf]
    .filter(Boolean)
    .join(" · ");
  const cep = e.cep ? `CEP ${e.cep}` : "";
  return [line1, line2, cep].filter(Boolean).join(" — ");
}

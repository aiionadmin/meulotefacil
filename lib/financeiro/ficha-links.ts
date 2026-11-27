import type { Contract } from "@/lib/domain/carteira-types";

/** Resolve contrato por id ou número (ref da ficha financeira). */
export function resolveContract(
  contracts: Contract[],
  ref: string | null | undefined
): Contract | undefined {
  if (!ref) return undefined;
  const t = ref.trim();
  if (!t) return undefined;
  return (
    contracts.find((c) => c.id === t) ||
    contracts.find((c) => c.numero === t) ||
    contracts.find((c) => c.numero.replace(/^0+/, "") === t.replace(/^0+/, ""))
  );
}

export function carteiraContratoHref(contractId: string): string {
  return `/carteira?contrato=${encodeURIComponent(contractId)}`;
}

export function contratoHref(contractId: string): string {
  return `/contratos?abrir=${encodeURIComponent(contractId)}`;
}

export function boletosContratoHref(contractId: string): string {
  return `/boletos?contrato=${encodeURIComponent(contractId)}`;
}

/** Links padrão da ficha financeira — preservam o contrato na URL. */
export function fichaFinanceiraNav(contractId: string | undefined) {
  const q = contractId
    ? `?contrato=${encodeURIComponent(contractId)}`
    : "";
  return [
    { href: `/carteira${q}`, label: "Ficha financeira" },
    {
      href: contractId ? contratoHref(contractId) : "/contratos",
      label: "Contrato",
    },
    {
      href: contractId ? boletosContratoHref(contractId) : "/boletos",
      label: "Boletos",
    },
    { href: "/financeiro/recebimentos", label: "Recebimentos" },
    { href: "/caixa", label: "Caixa" },
  ] as const;
}

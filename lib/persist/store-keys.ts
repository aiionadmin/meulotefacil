export const STORE_KEYS = [
  "fase1",
  "carteira",
  "fluxo",
  "operacoes",
  "demo",
  "obras",
  "compras",
  "financeiro",
  "parte5",
  "ui",
] as const;

export type StoreKey = (typeof STORE_KEYS)[number];

export const DEMO_ORG_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

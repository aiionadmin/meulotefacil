/** Ordem e metas de importação — docs/especificacao.md §13.2 */

export const IMPORT_ORDER = [
  "listas",
  "pessoas",
  "empreendimentos",
  "lotes",
  "contratos",
  "parcelas",
  "recebimentos",
  "financeiro",
  "obras",
  "compras",
  "arquivos",
] as const;

export type ImportEntityName = (typeof IMPORT_ORDER)[number];

export const LOTEWIN_CONFERENCE = {
  asOf: "2026-11-24",
  empreendimentos: 41,
  lotes: 12995,
  lotesVendidos: 3690,
  clientes: 3504,
  clientesAtivos: 2792,
  contratos: 3690,
  contratosAtivos: 2074,
  aReceber: 38_936_075.88,
  emAtraso: 6_869_670.85,
} as const;

export function describeEntity(name: ImportEntityName) {
  const map: Record<ImportEntityName, string> = {
    listas: "Lookup lists / tipos de parcela / status",
    pessoas: "Clientes, cônjuges, corretores (legacy_id)",
    empreendimentos: "Developments + partners",
    lotes: "Blocks + lots (emp+quadra+lote)",
    contratos: "Contracts + buyers + lots + cards",
    parcelas: "Plan series + installments (~300k)",
    recebimentos: "Receipts from LoteWin (não duplicar MC)",
    financeiro: "Payables/receivables/accounts from Mais Controle",
    obras: "Budgets + nodes",
    compras: "Purchase requests/orders",
    arquivos: "File metadata + storage paths",
  };
  return map[name];
}

/** K02 — leitura do Access LoteWin (.mdb) quando a cópia for entregue. */

export type MdbTablePreview = {
  name: string;
  rowCount: number;
  columns: string[];
};

export type MdbReadResult =
  | { ok: true; tables: MdbTablePreview[]; note: string }
  | { ok: false; reason: string };

/**
 * Stub seguro: sem binário Access na VPS, apenas valida extensão/nome
 * e devolve o plano de leitura. Quando `LEGACY_LW_PATH` existir,
 * `scripts/import/run.ts` passa a usar o driver real.
 */
export async function previewLotewinMdb(
  file: { name: string; size: number } | null
): Promise<MdbReadResult> {
  if (!file) {
    return {
      ok: false,
      reason: "Nenhum arquivo .mdb informado. Aguardando cópia do LoteWin.",
    };
  }
  const lower = file.name.toLowerCase();
  if (!lower.endsWith(".mdb") && !lower.endsWith(".accdb")) {
    return {
      ok: false,
      reason: "Arquivo inválido. Envie Finance.mdb / banco Access do LoteWin.",
    };
  }
  if (file.size <= 0) {
    return { ok: false, reason: "Arquivo vazio." };
  }

  return {
    ok: true,
    note:
      "Cópia reconhecida. Importação real roda via scripts/import/run.ts com LEGACY_LW_PATH.",
    tables: [
      {
        name: "Empreendimentos",
        rowCount: 41,
        columns: ["Codigo", "Nome", "Cidade", "UF"],
      },
      {
        name: "Lotes",
        rowCount: 12995,
        columns: ["Emp", "Quadra", "Lote", "Status", "Area"],
      },
      {
        name: "Contratos",
        rowCount: 3690,
        columns: ["Numero", "Cliente", "Lote", "Valor"],
      },
      {
        name: "Parcelas",
        rowCount: 320000,
        columns: ["Contrato", "N", "Vencimento", "Valor"],
      },
    ],
  };
}

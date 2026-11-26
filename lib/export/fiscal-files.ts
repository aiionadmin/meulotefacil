/** H28 — geradores DIMOB, SPED Contribuições e arquivo contábil. */

export type DimobContract = {
  numero: string;
  compradorNome: string;
  empNome: string;
  preco: number;
  dataContrato?: string;
  documento?: string;
};

export type ContabInstallment = {
  pagoEm?: string | null;
  contratoNumero: string;
  n: number;
  valor: number;
  status: string;
};

export function buildDimobText(opts: {
  ano: number;
  empresa: string;
  empreendimentos: number;
  metaEmpreendimentos?: number;
  contracts: DimobContract[];
  metaContratos?: number;
}): string {
  const total = opts.contracts.reduce((a, c) => a + c.preco, 0);
  const lines = [
    `DIMOB|ANO=${opts.ano}|EMPRESA=${opts.empresa}|GERADO=${new Date().toISOString().slice(0, 10)}`,
    `EMPREENDIMENTOS|${opts.empreendimentos}|META=${opts.metaEmpreendimentos ?? opts.empreendimentos}`,
    `CONTRATOS|${opts.contracts.length}|META=${opts.metaContratos ?? opts.contracts.length}|TOTAL=${total.toFixed(2)}`,
    ...opts.contracts.map(
      (c) =>
        `R01|${c.numero}|${c.compradorNome}|${c.empNome}|${c.preco.toFixed(2)}|${c.dataContrato ?? ""}|${c.documento ?? ""}`
    ),
    `R99|FIM|${opts.contracts.length}|${total.toFixed(2)}`,
  ];
  return lines.join("\n") + "\n";
}

export function buildSpedContribuicoes(opts: {
  empresa: string;
  empreendimentos: number;
  contracts: DimobContract[];
  limit?: number;
}): string {
  const slice = opts.contracts.slice(0, opts.limit ?? 50);
  const lines = [
    `|0000|SPED|CONTRIBUICOES|${opts.empresa}|`,
    `|0140|${opts.empreendimentos}|`,
    ...slice.map(
      (c) =>
        `|C100|${c.numero}|${c.dataContrato ?? ""}|${c.preco.toFixed(2)}|`
    ),
    "|9999|",
  ];
  return lines.join("\n") + "\n";
}

export function buildContabilidadeCsv(
  installments: ContabInstallment[],
  limit = 200
): string {
  const headers = "data;conta;historico;debito;credito";
  const rows = installments
    .filter((i) => i.status === "paga")
    .slice(0, limit)
    .map(
      (i) =>
        `${i.pagoEm ?? ""};1.1.01;Recibo ${i.contratoNumero} parc.${i.n};0;${i.valor}`
    );
  return [headers, ...rows].join("\n") + "\n";
}

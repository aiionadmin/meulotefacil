/** npx tsx lib/domain/portal-cliente-final.test.ts */
import {
  descricaoPedidoCadastro,
  informeAnualPagamentos,
  valorAtualizadoParcela,
} from "./portal-cliente-extras";
import { moverDemandasEmLote, rowsToCsv } from "./export-csv";
import { seedParte5 } from "./parte5-seed";
import {
  buildDefaultPermissionMatrix,
  can,
} from "./permissoes";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FALHOU", msg);
    process.exit(1);
  }
}

const parcelas = [
  {
    id: "1",
    valor: 1850.5,
    vencimento: "2026-10-20",
    status: "recebido",
    cliente: "Maria Souza",
    contratoRef: "CTR-1001",
    recebidoEm: "2026-10-18",
  },
  {
    id: "2",
    valor: 1850.5,
    vencimento: "2026-09-20",
    status: "recebido",
    cliente: "Maria Souza",
    contratoRef: "CTR-1001",
    recebidoEm: "2026-09-19",
  },
  {
    id: "3",
    valor: 1850.5,
    vencimento: "2026-11-20",
    status: "vencido",
    cliente: "Maria Souza",
    contratoRef: "CTR-1001",
  },
  {
    id: "4",
    valor: 999,
    vencimento: "2026-10-01",
    status: "recebido",
    cliente: "Outro",
    contratoRef: "CTR-X",
    recebidoEm: "2026-10-02",
  },
];

const inf = informeAnualPagamentos(parcelas, "Maria Souza", 2026);
assert(inf.linhas.length === 2, "informe só pagamentos da Maria");
assert(inf.totalPago === 3701, "total pago 1850.5*2");

const at = valorAtualizadoParcela(
  { valor: 238.75, vencimento: "2026-07-10", status: "vencido" },
  "2026-11-24"
);
assert(at.emAtraso, "parcela em atraso");
assert(at.juros === 10.9, "juros referência");
assert(at.multa === 4.78, "multa referência");
assert(at.total === 254.43, "total atualizado");

const desc = descricaoPedidoCadastro({
  clienteId: "cli-1",
  clienteNome: "Maria Souza",
  campo: "Telefone",
  valorAtual: "111",
  valorNovo: "222",
});
assert(desc.includes("Atualização cadastral"), "pedido cadastral");

const seed = seedParte5();
assert(
  seed.demandaTipos.some((t) => t.id === "dt-8"),
  "tipo atualização cadastral"
);
assert(
  (seed.demandas[0].comentarios ?? []).length >= 1,
  "comentário seed"
);

const mov = moverDemandasEmLote(
  ["dem-1", "dem-2"],
  "em_analise",
  seed.demandas
);
assert(mov.length === 2, "lote move 2");

const csv = rowsToCsv(["A", "B"], [["x", 1], ["y;z", 2]]);
assert(csv.includes("A;B"), "header csv");
assert(csv.includes('"y;z"'), "escape ponto-e-vírgula");

const matrix = buildDefaultPermissionMatrix([
  "administrador",
  "direcao",
  "financeiro",
  "comercial",
  "corretor",
]);
assert(can(matrix, "direcao", "dashboard_gerencial", "ver"), "dir vê gerencial");
assert(
  can(matrix, "financeiro", "dashboard_gerencial", "ver"),
  "fin vê gerencial"
);
assert(
  !can(matrix, "comercial", "dashboard_gerencial", "ver"),
  "comercial bloqueado"
);
assert(
  !can(matrix, "corretor", "dashboard_gerencial", "ver"),
  "corretor bloqueado"
);

console.log("OK portal-cliente-final", {
  informe: inf.totalPago,
  atualizado: at.total,
  mov: mov.length,
});

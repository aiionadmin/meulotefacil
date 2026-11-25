/** npx tsx lib/domain/corretor-comissao-reserva.test.ts */
import { seedParte5 } from "./parte5-seed";
import {
  comissoesDoCorretor,
  criarReserva,
  expirarReservas,
  podeReservarLote,
  totaisComissao,
} from "./corretor-comissao-reserva";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FALHOU", msg);
    process.exit(1);
  }
}

const seed = seedParte5();

const ana = comissoesDoCorretor(seed.comissoes, "corr-1");
assert(ana.length === 2, "Ana vê 2 comissões");
assert(
  !ana.some((c) => c.corretorId === "corr-2"),
  "não vaza comissão do Bruno"
);

const tot = totaisComissao(ana);
assert(tot.previsto === 6000, "previsto Ana 3200+2800");
assert(tot.pago === 2800, "pago Ana");

const gateOk = podeReservarLote(
  seed.reservas,
  "lot-h-b01",
  "disponivel",
  "2026-11-25"
);
assert(gateOk.ok, "pode reservar lote livre");

const gateDup = podeReservarLote(
  seed.reservas,
  "lot-h-a03",
  "disponivel",
  "2026-11-25"
);
assert(!gateDup.ok, "bloqueia lote já reservado ativo");

const gateStatus = podeReservarLote(
  seed.reservas,
  "lot-x",
  "vendido",
  "2026-11-25"
);
assert(!gateStatus.ok, "bloqueia status ≠ disponível");

const { reservas, lotesLiberados } = expirarReservas(
  seed.reservas,
  "2026-11-25"
);
assert(lotesLiberados.includes("lot-demo-exp"), "expira reserva vencida");
assert(
  reservas.find((r) => r.id === "rsv-exp")?.status === "expirada",
  "status expirada"
);
assert(
  reservas.find((r) => r.id === "rsv-1")?.status === "ativa",
  "reserva futura permanece ativa"
);

const nova = criarReserva({
  id: "rsv-new",
  lotId: "lot-h-b01",
  empNome: "Residencial Horizonte",
  quadra: "B",
  lote: "01",
  corretorId: "corr-1",
  corretorNome: "Ana Corretora",
  hoje: "2026-11-25",
  prazoDias: 3,
});
assert(nova.expiraEm === "2026-11-28", "expira em +3 dias");
assert(nova.status === "ativa", "nova reserva ativa");

console.log("OK corretor-comissao-reserva", {
  ana: ana.length,
  tot,
  liberados: lotesLiberados,
  expira: nova.expiraEm,
});

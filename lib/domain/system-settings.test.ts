import assert from "node:assert/strict";
import {
  calcReservaExpiraEm,
  isReservaVencida,
  mergeSystemSettings,
  normalizeValidadeReservaDias,
  resolveIndicePadrao,
  validateSystemSettingsPatch,
} from "./system-settings";
import { seedSystemSettings } from "./system-settings-seed";

assert.equal(normalizeValidadeReservaDias(7), 7);
assert.equal(normalizeValidadeReservaDias(0), 7);
assert.equal(normalizeValidadeReservaDias(-3), 7);
assert.equal(normalizeValidadeReservaDias(400), 365);
assert.equal(normalizeValidadeReservaDias("12"), 12);

assert.equal(calcReservaExpiraEm(7, "2026-11-27"), "2026-12-04");
assert.equal(calcReservaExpiraEm(1, "2026-11-27"), "2026-11-28");

assert.equal(isReservaVencida("2026-11-26", "2026-11-27"), true);
assert.equal(isReservaVencida("2026-11-27", "2026-11-27"), false);
assert.equal(isReservaVencida(undefined, "2026-11-27"), false);

const seed = seedSystemSettings();
assert.equal(resolveIndicePadrao(seed), "IGPM");
assert.equal(
  resolveIndicePadrao({
    ...seed,
    indicePadrao: "IPCA",
  }),
  "IPCA"
);
assert.equal(
  resolveIndicePadrao({
    ...seed,
    indicePadrao: "XYZ",
    indices: seed.indices.map((i) =>
      i.codigo === "IGPM" ? i : { ...i, ativo: false }
    ),
  }),
  "IGPM"
);

const merged = mergeSystemSettings(seed, {
  indicePadrao: "IPCA",
  vendas: { ...seed.vendas, validadeReservaDias: 15 },
});
assert.equal(merged.indicePadrao, "IPCA");
assert.equal(merged.vendas.validadeReservaDias, 15);

assert.equal(
  validateSystemSettingsPatch({ vendas: { ...seed.vendas, validadeReservaDias: 0 } }),
  "Validade da reserva deve ser entre 1 e 365 dias"
);
assert.equal(
  validateSystemSettingsPatch({ indicePadrao: "  " }),
  "Índice padrão obrigatório"
);
assert.equal(validateSystemSettingsPatch({ indicePadrao: "IPCA" }), null);

console.log("ok: system-settings");

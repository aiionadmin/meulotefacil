import {
  EMPRESA_LA_ID,
  EMPRESA_MLF_ALIAS,
  EMPRESA_MLF_ID,
  canonicalEmpresaId,
  resolveRowEmpresaId,
  rowBelongsToEmpresa,
} from "./ids";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(canonicalEmpresaId(EMPRESA_MLF_ALIAS) === EMPRESA_MLF_ID, "alias");
assert(canonicalEmpresaId(EMPRESA_MLF_ID) === EMPRESA_MLF_ID, "canon");
assert(canonicalEmpresaId(EMPRESA_LA_ID) === EMPRESA_LA_ID, "la");

assert(
  resolveRowEmpresaId(undefined) === EMPRESA_MLF_ID,
  "default missing → MLF"
);
assert(
  resolveRowEmpresaId(EMPRESA_MLF_ALIAS) === EMPRESA_MLF_ID,
  "alias resolve"
);

assert(
  rowBelongsToEmpresa(EMPRESA_MLF_ID, EMPRESA_MLF_ID),
  "mlf matches uuid"
);
assert(
  rowBelongsToEmpresa(EMPRESA_MLF_ID, EMPRESA_MLF_ALIAS),
  "mlf matches org-demo"
);
assert(
  !rowBelongsToEmpresa(EMPRESA_MLF_ID, EMPRESA_LA_ID),
  "mlf excludes LA"
);
assert(
  rowBelongsToEmpresa(EMPRESA_LA_ID, EMPRESA_LA_ID),
  "la matches"
);
assert(
  !rowBelongsToEmpresa(EMPRESA_LA_ID, EMPRESA_MLF_ID),
  "la excludes mlf"
);
assert(rowBelongsToEmpresa("todas", EMPRESA_LA_ID), "todas passes");

assert(
  resolveRowEmpresaId(undefined, undefined, "Jardins do Sol") === EMPRESA_LA_ID,
  "infer LA by nome"
);
assert(
  resolveRowEmpresaId(undefined, undefined, "Residencial Horizonte") ===
    EMPRESA_MLF_ID,
  "infer MLF by nome"
);
assert(
  rowBelongsToEmpresa(EMPRESA_LA_ID, undefined, undefined, "Jardins do Sol"),
  "LA matches untagged Jardins by nome"
);
assert(
  !rowBelongsToEmpresa(EMPRESA_LA_ID, undefined, undefined, "Residencial Horizonte"),
  "LA excludes untagged Horizonte by nome"
);

console.log("ok: empresa-ids");

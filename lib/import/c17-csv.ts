/**
 * C17 — importação CSV com modelo e conferência por entidade.
 * Formato: cabeçalho na 1ª linha; campos separados por `;` ou `,`.
 */

export type C17EntityId =
  | "clientes"
  | "fornecedores"
  | "profissionais"
  | "insumos"
  | "composicoes"
  | "lancamentos"
  | "faturamentos";

export type C17RowResult = {
  linha: number;
  payload: Record<string, string>;
  erros: string[];
  acao: "criar" | "atualizar" | "ignorar";
};

export type C17Preview = {
  entity: C17EntityId;
  ok: boolean;
  rows: C17RowResult[];
  criar: number;
  atualizar: number;
  erros: number;
};

const MODELS: Record<C17EntityId, string[]> = {
  clientes: ["nome", "cpf_cnpj", "telefone", "email", "cidade"],
  fornecedores: ["razao_social", "cnpj", "telefone", "email"],
  profissionais: ["nome", "cpf", "especialidade", "telefone"],
  insumos: ["codigo", "descricao", "unidade", "preco"],
  composicoes: ["codigo", "descricao", "unidade"],
  lancamentos: ["data", "conta", "categoria", "valor", "historico"],
  faturamentos: ["data", "cliente", "valor", "documento"],
};

export function c17Headers(entity: C17EntityId): string[] {
  return [...MODELS[entity]];
}

export function modeloC17Csv(entity: C17EntityId): string {
  const headers = c17Headers(entity);
  const sample: Record<C17EntityId, string[]> = {
    clientes: ["Ana Souza", "12345678901", "11999990000", "ana@ex.com", "São Paulo"],
    fornecedores: ["Tubos Sul LTDA", "11222333000181", "1133334444", "compras@tubos.com"],
    profissionais: ["Eng. Paula", "98765432100", "civil", "11988887777"],
    insumos: ["INS-001", "Cimento CP-II", "sc", "32.5"],
    composicoes: ["COMP-01", "Fundação padrão", "m2"],
    lancamentos: ["2026-01-15", "1.1.01", "Receita", "1500", "Parcela contrato"],
    faturamentos: ["2026-01-20", "Ana Souza", "1850", "NF-100"],
  };
  return [headers.join(";"), sample[entity].join(";")].join("\n") + "\n";
}

function detectSep(line: string): ";" | "," {
  const semi = (line.match(/;/g) || []).length;
  const comma = (line.match(/,/g) || []).length;
  return semi >= comma ? ";" : ",";
}

function splitLine(line: string, sep: ";" | ","): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQ = !inQ;
      continue;
    }
    if (ch === sep && !inQ) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}

function validateRow(
  entity: C17EntityId,
  payload: Record<string, string>
): string[] {
  const erros: string[] = [];
  const req = MODELS[entity];
  for (const h of req) {
    if (!payload[h]) erros.push(`Campo obrigatório: ${h}`);
  }
  if (entity === "clientes" && payload.cpf_cnpj) {
    const d = onlyDigits(payload.cpf_cnpj);
    if (d.length !== 11 && d.length !== 14) erros.push("cpf_cnpj inválido");
  }
  if (entity === "fornecedores" && payload.cnpj) {
    if (onlyDigits(payload.cnpj).length !== 14) erros.push("cnpj inválido");
  }
  if (entity === "profissionais" && payload.cpf) {
    if (onlyDigits(payload.cpf).length !== 11) erros.push("cpf inválido");
  }
  if (
    (entity === "insumos" || entity === "lancamentos" || entity === "faturamentos") &&
    payload.preco != null &&
    payload.preco !== ""
  ) {
    if (Number.isNaN(Number(String(payload.preco).replace(",", ".")))) {
      erros.push("preco inválido");
    }
  }
  if (
    (entity === "lancamentos" || entity === "faturamentos") &&
    payload.valor
  ) {
    if (Number.isNaN(Number(String(payload.valor).replace(",", ".")))) {
      erros.push("valor inválido");
    }
  }
  return erros;
}

/**
 * Conferência C17. `existingKeys` = identificadores já no store (cpf/cnpj/código).
 */
export function parseC17Csv(
  entity: C17EntityId,
  text: string,
  existingKeys: Set<string> = new Set()
): C17Preview {
  const lines = text
    .replace(/^\ufeff/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) {
    return {
      entity,
      ok: false,
      rows: [
        {
          linha: 1,
          payload: {},
          erros: ["Arquivo vazio ou sem dados"],
          acao: "ignorar",
        },
      ],
      criar: 0,
      atualizar: 0,
      erros: 1,
    };
  }
  const sep = detectSep(lines[0]);
  const headers = splitLine(lines[0], sep).map((h) => h.toLowerCase());
  const expected = MODELS[entity];
  const missing = expected.filter((h) => !headers.includes(h));
  const rows: C17RowResult[] = [];
  if (missing.length) {
    rows.push({
      linha: 1,
      payload: {},
      erros: [`Cabeçalho incompleto: faltam ${missing.join(", ")}`],
      acao: "ignorar",
    });
    return {
      entity,
      ok: false,
      rows,
      criar: 0,
      atualizar: 0,
      erros: 1,
    };
  }

  for (let i = 1; i < lines.length; i++) {
    const cols = splitLine(lines[i], sep);
    const payload: Record<string, string> = {};
    headers.forEach((h, idx) => {
      payload[h] = cols[idx] ?? "";
    });
    const erros = validateRow(entity, payload);
    const key =
      payload.cpf_cnpj ||
      payload.cnpj ||
      payload.cpf ||
      payload.codigo ||
      payload.documento ||
      payload.nome ||
      payload.razao_social ||
      "";
    const keyNorm = onlyDigits(key) || key.toLowerCase();
    let acao: C17RowResult["acao"] = "criar";
    if (erros.length) acao = "ignorar";
    else if (keyNorm && existingKeys.has(keyNorm)) acao = "atualizar";
    rows.push({ linha: i + 1, payload, erros, acao });
  }

  const criar = rows.filter((r) => r.acao === "criar").length;
  const atualizar = rows.filter((r) => r.acao === "atualizar").length;
  const erros = rows.filter((r) => r.erros.length > 0).length;
  return {
    entity,
    ok: erros === 0 && rows.length > 0,
    rows,
    criar,
    atualizar,
    erros,
  };
}

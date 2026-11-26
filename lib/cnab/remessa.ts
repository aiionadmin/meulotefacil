/**
 * Remessa CNAB 400 (Itau 341) simplificada — H22.
 * Gera arquivo texto baixável; layout completo de homologação bancária
 * fica para credenciamento.
 */

export type CnabTitulo = {
  nossoNumero: string;
  vencimento: string; // yyyy-mm-dd
  valor: number;
  contratoNumero: string;
  sacadoNome?: string;
};

function onlyDigits(s: string, size: number) {
  const d = s.replace(/\D/g, "");
  return d.padStart(size, "0").slice(-size);
}

function moneyCents(v: number, size: number) {
  return onlyDigits(String(Math.round(v * 100)), size);
}

function yymmdd(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${y.slice(2)}${m}${d}`;
}

function pad(s: string, size: number) {
  return s.padEnd(size, " ").slice(0, size);
}

function line400(raw: string) {
  return raw.padEnd(400, " ").slice(0, 400);
}

/** Header + detalhe tipo 1 + trailer CNAB 400. */
export function buildCnab400Remessa(
  titulos: CnabTitulo[],
  opts?: { agencia?: string; conta?: string; empresa?: string }
): string {
  const agencia = onlyDigits(opts?.agencia ?? "0001", 4);
  const conta = onlyDigits(opts?.conta ?? "12345", 5);
  const empresa = pad(opts?.empresa ?? "MEU LOTE FACIL", 30);
  const hoje = yymmdd(new Date().toISOString().slice(0, 10));

  const header = line400(
    "01REMESSA01COBRANCA       " +
      agencia +
      "00" +
      conta +
      " " +
      empresa +
      "341" +
      pad("BANCO ITAU SA", 15) +
      hoje +
      "000001"
  );

  const details = titulos.map((t, i) => {
    const seq = String(i + 2).padStart(6, "0");
    return line400(
      "1" +
        "02" +
        onlyDigits("0", 14) +
        agencia +
        "00" +
        conta +
        " " +
        pad(t.contratoNumero, 25) +
        onlyDigits(t.nossoNumero, 8) +
        onlyDigits("0", 13) +
        "109" +
        "N" +
        pad(t.nossoNumero, 10) +
        yymmdd(t.vencimento) +
        moneyCents(t.valor, 13) +
        "341" +
        "00000" +
        "01N" +
        hoje +
        "00" +
        onlyDigits("0", 13) +
        onlyDigits("0", 13) +
        onlyDigits("0", 13) +
        onlyDigits("0", 13) +
        "01" +
        onlyDigits("0", 11) +
        pad((t.sacadoNome ?? "SACADO").toUpperCase(), 40) +
        seq
    );
  });

  const trailer = line400(
    "9" + String(titulos.length + 2).padStart(6, "0")
  );

  return [header, ...details, trailer].join("\r\n");
}

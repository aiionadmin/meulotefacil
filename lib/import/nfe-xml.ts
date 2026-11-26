/**
 * G19 — leitura superficial de XML NFe/NFSe (sem assinatura/Sefaz).
 * Extrai chave, número, emissor, valor e data quando presentes.
 */

export type NfeXmlPreview = {
  ok: boolean;
  tipo: "nfe" | "nfse" | "desconhecido";
  chave?: string;
  numero?: string;
  serie?: string;
  emissor?: string;
  valor?: number;
  emissao?: string;
  erros: string[];
};

function tag(text: string, name: string): string | undefined {
  const re = new RegExp(
    `<${name}[^>]*>([^<]*)</${name}>|<${name}[^>]*/>`,
    "i"
  );
  const m = text.match(re);
  return m?.[1]?.trim() || undefined;
}

function money(raw?: string): number | undefined {
  if (!raw) return undefined;
  const n = Number(String(raw).replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

export function parseNfeXml(xml: string): NfeXmlPreview {
  const erros: string[] = [];
  const text = xml.replace(/^\ufeff/, "").trim();
  if (!text) {
    return { ok: false, tipo: "desconhecido", erros: ["XML vazio"] };
  }
  if (!text.includes("<")) {
    return { ok: false, tipo: "desconhecido", erros: ["Não é XML"] };
  }

  let tipo: NfeXmlPreview["tipo"] = "desconhecido";
  if (/nfeProc|NFe\b|infNFe/i.test(text)) tipo = "nfe";
  else if (/NFSe|CompNfse|InfNfse/i.test(text)) tipo = "nfse";

  const chave =
    tag(text, "chNFe") ||
    text.match(/Id="NFe(\d{44})"/i)?.[1] ||
    tag(text, "CodigoVerificacao");

  const numero =
    tag(text, "nNF") || tag(text, "Numero") || tag(text, "nDPS");
  const serie = tag(text, "serie") || tag(text, "Serie");
  const emissor =
    tag(text, "xNome") ||
    tag(text, "RazaoSocial") ||
    tag(text, "PrestadorNome");
  const valor =
    money(tag(text, "vNF")) ||
    money(tag(text, "ValorServicos")) ||
    money(tag(text, "vLiq"));
  const emissao =
    tag(text, "dhEmi")?.slice(0, 10) ||
    tag(text, "dEmi") ||
    tag(text, "DataEmissao")?.slice(0, 10);

  if (!numero && !chave) erros.push("Número/chave não encontrados");
  if (valor == null) erros.push("Valor não encontrado");

  return {
    ok: erros.length === 0,
    tipo,
    chave,
    numero,
    serie,
    emissor,
    valor,
    emissao,
    erros,
  };
}

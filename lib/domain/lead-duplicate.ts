/** Bloqueio de lead duplicado por telefone/CPF — quem atendeu primeiro prevalece. */

export function digitsOnly(value: string | undefined | null): string {
  return (value ?? "").replace(/\D/g, "");
}

export type LeadDupFields = {
  id: string;
  telefone: string;
  cpf?: string;
  responsavel: string;
  criadoEm: string;
};

export type DuplicateHit = {
  lead: LeadDupFields;
  por: "telefone" | "cpf";
  motivo: string;
};

/**
 * Retorna o lead existente mais antigo (primeiro atendimento) que colide
 * por telefone ou CPF. Sem colisão → null.
 */
export function findDuplicateLead(
  existentes: LeadDupFields[],
  candidato: { telefone: string; cpf?: string },
  opts?: { ignoreId?: string }
): DuplicateHit | null {
  const tel = digitsOnly(candidato.telefone);
  const cpf = digitsOnly(candidato.cpf);
  const pool = existentes
    .filter((l) => l.id !== opts?.ignoreId)
    .slice()
    .sort((a, b) => a.criadoEm.localeCompare(b.criadoEm));

  if (tel.length >= 8) {
    const byTel = pool.find((l) => digitsOnly(l.telefone) === tel);
    if (byTel) {
      return {
        lead: byTel,
        por: "telefone",
        motivo: `Telefone já atendido por ${byTel.responsavel} em ${byTel.criadoEm}`,
      };
    }
  }

  if (cpf.length === 11) {
    const byCpf = pool.find((l) => digitsOnly(l.cpf) === cpf);
    if (byCpf) {
      return {
        lead: byCpf,
        por: "cpf",
        motivo: `CPF já atendido por ${byCpf.responsavel} em ${byCpf.criadoEm}`,
      };
    }
  }

  return null;
}

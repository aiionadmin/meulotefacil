/** D11 — caminho crítico e datas úteis com expediente. */

import type { CronogramaItem } from "@/lib/domain/obras-types";

export type GanttCriticoLinha = CronogramaItem & {
  folgaDias: number;
  caminhoCritico: boolean;
};

function parseDay(iso: string): number {
  return new Date(iso.slice(0, 10) + "T12:00:00").getTime();
}

function addWorkDays(iso: string, days: number, horasDia: number): string {
  // Simplificação: 1 dia de calendário ≈ 1 dia útil (expediente só escala duração).
  const scale = Math.max(1, 8 / Math.max(1, horasDia));
  const add = Math.ceil(days * scale);
  const d = new Date(iso.slice(0, 10) + "T12:00:00");
  d.setDate(d.getDate() + add);
  return d.toISOString().slice(0, 10);
}

/**
 * Recalcula início/fim pela cadeia de predecessores e marca caminho crítico
 * (folga zero até o fim do projeto).
 */
export function computeGanttCritico(
  itens: CronogramaItem[],
  expedienteHoras = 8
): GanttCriticoLinha[] {
  if (!itens.length) return [];
  const byId = new Map(itens.map((i) => [i.id, { ...i }]));
  const ordered: CronogramaItem[] = [];
  const seen = new Set<string>();

  function visit(id: string) {
    if (seen.has(id)) return;
    seen.add(id);
    const it = byId.get(id);
    if (!it) return;
    if (it.predecessorId && byId.has(it.predecessorId)) {
      visit(it.predecessorId);
    }
    ordered.push(it);
  }
  for (const it of itens) visit(it.id);

  // Forward pass: earliest start
  const es = new Map<string, string>();
  const ef = new Map<string, string>();
  for (const it of ordered) {
    let start = it.inicio;
    if (it.predecessorId && ef.has(it.predecessorId)) {
      const predEnd = ef.get(it.predecessorId)!;
      if (predEnd > start) start = predEnd;
    }
    const end = addWorkDays(start, Math.max(1, it.duracaoDias), expedienteHoras);
    es.set(it.id, start);
    ef.set(it.id, end);
  }

  const projectEnd = [...ef.values()].sort().at(-1) ?? "";

  // Backward pass: latest finish = project end for sinks
  const lf = new Map<string, string>();
  const ls = new Map<string, string>();
  const rev = [...ordered].reverse();
  for (const it of rev) {
    const successors = ordered.filter((x) => x.predecessorId === it.id);
    let latestFinish = projectEnd;
    if (successors.length) {
      latestFinish = successors
        .map((s) => ls.get(s.id) ?? es.get(s.id)!)
        .sort()[0];
    }
    lf.set(it.id, latestFinish);
    // latest start ≈ finish - duration
    const start = addWorkDays(
      latestFinish,
      -Math.max(1, it.duracaoDias),
      expedienteHoras
    );
    ls.set(it.id, start);
  }

  return ordered.map((it) => {
    const earlyStart = es.get(it.id)!;
    const lateStart = ls.get(it.id)!;
    const folgaDias = Math.max(
      0,
      Math.round(
        (parseDay(lateStart) - parseDay(earlyStart)) / 86400000
      )
    );
    const caminhoCritico = folgaDias === 0 || Boolean(it.critico);
    return {
      ...it,
      inicio: earlyStart,
      fim: ef.get(it.id)!,
      folgaDias,
      caminhoCritico,
      critico: caminhoCritico,
    };
  });
}

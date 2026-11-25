/**
 * A06 — conjunto único de exemplo (só desenvolvimento).
 * Mesmos clientes/contratos/lotes/obras atravessam fase1, carteira, fluxo, operações e demo.
 */
import { seedFase1 } from "./fase1-seed";
import { seedCarteira } from "./carteira-seed";
import { seedFluxo } from "./fluxo-seed";
import { seedOperacoes } from "./operacoes-seed";
import type { Fase1State, Person } from "./fase1-types";
import type { CarteiraState } from "./carteira-types";
import type { FluxoState } from "./fluxo-types";
import type { OperacoesState } from "./operacoes-types";
import { defaultPermissionsForProfile } from "@/lib/permissions/routines";
import { isDevSeedAllowed } from "@/lib/runtime/demo-mode";

const ANA: Person = {
  id: "p-ana",
  tipo: "fisica",
  status: "ativo",
  nome: "Ana Souza",
  documento: "321.654.987-00",
  papeis: ["comprador", "cliente"],
  celular: "(19) 99111-2200",
  email: "ana.souza@email.com",
  cidade: "Campinas",
  uf: "SP",
  createdAt: "2026-06-01T12:00:00.000Z",
};

function withPermissions(state: Fase1State): Fase1State {
  const permissions = state.profiles.flatMap((p) =>
    defaultPermissionsForProfile(p.codigo).map((row) => ({
      profileId: p.id,
      ...row,
    }))
  );

  const people = state.people.some((p) => p.nome === "Ana Souza")
    ? state.people
    : [ANA, ...state.people];

  return {
    ...state,
    people,
    permissions,
    audit: [
      {
        id: "aud-seed-1",
        quando: new Date().toISOString(),
        usuarioNome: "Sistema",
        rotina: "Sistema",
        acao: "Carga do conjunto unificado de desenvolvimento",
        registroTipo: "seed",
        registroId: "unified-v1",
      },
      ...state.audit,
    ],
  };
}

export function unifiedFase1Seed(): Fase1State {
  if (!isDevSeedAllowed()) {
    const empty = seedFase1();
    return {
      ...empty,
      people: [],
      users: empty.users.filter(
        (u) => u.email !== "admin@meulotefacil.com.br"
      ),
      tasks: [],
      files: [],
      notifications: [],
      audit: [],
      permissions: empty.profiles.flatMap((p) =>
        defaultPermissionsForProfile(p.codigo).map((row) => ({
          profileId: p.id,
          ...row,
        }))
      ),
    };
  }
  return withPermissions(seedFase1());
}

export function unifiedCarteiraSeed(): CarteiraState {
  return seedCarteira();
}

export function unifiedFluxoSeed(): FluxoState {
  return seedFluxo();
}

export function unifiedOperacoesSeed(): OperacoesState {
  return seedOperacoes();
}

/** IDs canônicos compartilhados entre telas (documentação do conjunto). */
export const UNIFIED_IDS = {
  org: "org-demo",
  anaPersonId: "p-ana",
  brunoPersonId: "p1",
  contractAna: "ct-1001",
  contractBruno: "ct-1002",
  lotAna: "lot-h-a01",
  developmentHorizonte: "dev-horizonte",
} as const;

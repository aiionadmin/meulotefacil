"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { unifiedFase1Seed } from "@/lib/domain/unified-seed";
import type {
  AppFile,
  AppTask,
  AppUser,
  ApprovalRule,
  Fase1State,
  Organization,
  Person,
  PersonPapel,
  ProfilePermission,
} from "@/lib/domain/fase1-types";
import { useStorePersist } from "@/lib/persist/use-store-persist";
import { saveSnapshot } from "@/lib/persist/snapshots";
import { DEMO_ORG_ID } from "@/lib/persist/store-keys";
import { recordAudit } from "@/lib/audit/client-audit";
import { can, type PermissionFlags } from "@/lib/permissions/routines";
import { isDemoToolsAllowed } from "@/lib/runtime/demo-mode";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

type Fase1Api = {
  state: Fase1State;
  ready: boolean;
  currentUser: AppUser | undefined;
  currentProfileName: string;
  can: (rotina: string, acao: keyof PermissionFlags) => boolean;
  reset: () => void;
  saveOrganization: (org: Organization) => void;
  addPerson: (data: Omit<Person, "id" | "createdAt">) => Person;
  updatePerson: (id: string, patch: Partial<Person>) => void;
  softDeletePerson: (id: string) => void;
  peopleByPapel: (papel: PersonPapel) => Person[];
  addUser: (data: Omit<AppUser, "id">) => AppUser;
  updateUser: (id: string, patch: Partial<AppUser>) => void;
  addFile: (data: Omit<AppFile, "id" | "createdAt">) => AppFile;
  addTask: (data: Omit<AppTask, "id">) => AppTask;
  moveTask: (id: string, status: AppTask["status"]) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toggleLookupItem: (listId: string, codigo: string) => void;
  addLookupItem: (
    listId: string,
    item: { codigo: string; nome: string }
  ) => boolean;
  toggleApprovalRule: (id: string) => void;
  addApprovalRule: (data: Omit<ApprovalRule, "id">) => ApprovalRule;
  updateApprovalRule: (id: string, patch: Partial<ApprovalRule>) => void;
  setProfilePermission: (
    profileId: string,
    rotina: string,
    flags: PermissionFlags
  ) => void;
};

const Ctx = createContext<Fase1Api | null>(null);

export function Fase1StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Fase1State>(() => unifiedFase1Seed());
  const [ready, setReady] = useState(false);

  useStorePersist({
    storeKey: "fase1",
    ready,
    setReady,
    state,
    setState,
    seed: unifiedFase1Seed,
    merge: (seed, saved) => ({
      ...seed,
      ...saved,
      permissions: saved.permissions?.length
        ? saved.permissions
        : seed.permissions,
    }),
  });

  const pushAudit = useCallback(
    (
      rotina: string,
      acao: string,
      opts?: {
        registroTipo?: string;
        registroId?: string;
        antes?: unknown;
        depois?: unknown;
      }
    ) => {
      setState((s) => {
        const user = s.users.find((u) => u.id === s.currentUserId);
        const event = {
          id: uid("aud"),
          quando: new Date().toISOString(),
          usuarioNome: user?.nome ?? "Sistema",
          rotina,
          acao,
          registroTipo: opts?.registroTipo,
          registroId: opts?.registroId,
          antes: opts?.antes,
          depois: opts?.depois,
        };
        void recordAudit({
          organizationId: DEMO_ORG_ID,
          userId: user?.id,
          usuarioNome: event.usuarioNome,
          rotina,
          acao,
          registroTipo: opts?.registroTipo,
          registroId: opts?.registroId,
          antes: opts?.antes,
          depois: opts?.depois,
        });
        return {
          ...s,
          audit: [event, ...s.audit].slice(0, 200),
        };
      });
    },
    []
  );

  const api = useMemo<Fase1Api>(() => {
    const currentUser = state.users.find((u) => u.id === state.currentUserId);
    const currentProfileName =
      state.profiles.find((p) => p.id === currentUser?.profileId)?.nome ?? "—";
    const myPerms: ProfilePermission[] = state.permissions.filter(
      (p) => p.profileId === currentUser?.profileId
    );

    return {
      state,
      ready,
      currentUser,
      currentProfileName,
      can: (rotina, acao) => {
        if (currentUser?.chave) return true;
        return can(
          myPerms.map((p) => ({
            rotina: p.rotina,
            ver: p.ver,
            inserirAlterar: p.inserirAlterar,
            remover: p.remover,
          })),
          rotina,
          acao
        );
      },
      reset: () => {
        if (!isDemoToolsAllowed()) return;
        const next = unifiedFase1Seed();
        setState(next);
        void saveSnapshot("fase1", next, DEMO_ORG_ID);
        pushAudit("Configurações", "Restaurou dados de desenvolvimento");
      },
      saveOrganization: (org) => {
        const antes = state.organization;
        setState((s) => ({ ...s, organization: org }));
        pushAudit("Configurações > Empresa", "alterar", {
          registroTipo: "organization",
          registroId: org.id,
          antes,
          depois: org,
        });
      },
      addPerson: (data) => {
        const person: Person = {
          ...data,
          id: uid("p"),
          createdAt: new Date().toISOString(),
        };
        setState((s) => ({ ...s, people: [person, ...s.people] }));
        pushAudit("Cadastros > Pessoas", "criar", {
          registroTipo: "person",
          registroId: person.id,
          depois: person,
        });
        return person;
      },
      updatePerson: (id, patch) => {
        const antes = state.people.find((p) => p.id === id);
        setState((s) => ({
          ...s,
          people: s.people.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }));
        pushAudit("Cadastros > Pessoas", "alterar", {
          registroTipo: "person",
          registroId: id,
          antes,
          depois: { ...antes, ...patch },
        });
      },
      softDeletePerson: (id) => {
        const antes = state.people.find((p) => p.id === id);
        setState((s) => ({
          ...s,
          people: s.people.map((p) =>
            p.id === id ? { ...p, status: "inativo" } : p
          ),
        }));
        pushAudit("Cadastros > Pessoas", "excluir", {
          registroTipo: "person",
          registroId: id,
          antes,
          depois: { ...antes, status: "inativo" },
        });
      },
      peopleByPapel: (papel) =>
        state.people.filter((p) => p.papeis.includes(papel)),
      addUser: (data) => {
        const user: AppUser = { ...data, id: uid("u") };
        setState((s) => ({ ...s, users: [user, ...s.users] }));
        pushAudit("Configurações > Usuários", "criar", {
          registroTipo: "user",
          registroId: user.id,
          depois: user,
        });
        return user;
      },
      updateUser: (id, patch) => {
        const antes = state.users.find((u) => u.id === id);
        setState((s) => ({
          ...s,
          users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        }));
        pushAudit("Configurações > Usuários", "alterar", {
          registroTipo: "user",
          registroId: id,
          antes,
          depois: { ...antes, ...patch },
        });
      },
      addFile: (data) => {
        const file: AppFile = {
          ...data,
          id: uid("f"),
          createdAt: new Date().toISOString(),
        };
        setState((s) => ({ ...s, files: [file, ...s.files] }));
        pushAudit("Arquivos", "criar", {
          registroTipo: "file",
          registroId: file.id,
          depois: file,
        });
        return file;
      },
      addTask: (data) => {
        const task: AppTask = { ...data, id: uid("t") };
        setState((s) => ({ ...s, tasks: [task, ...s.tasks] }));
        pushAudit("Tarefas", "criar", {
          registroTipo: "task",
          registroId: task.id,
          depois: task,
        });
        return task;
      },
      moveTask: (id, status) => {
        const antes = state.tasks.find((t) => t.id === id);
        setState((s) => ({
          ...s,
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
        }));
        pushAudit("Tarefas", "alterar", {
          registroTipo: "task",
          registroId: id,
          antes,
          depois: { ...antes, status },
        });
      },
      markNotificationRead: (id) => {
        setState((s) => ({
          ...s,
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, lida: true } : n
          ),
        }));
      },
      markAllNotificationsRead: () => {
        setState((s) => ({
          ...s,
          notifications: s.notifications.map((n) => ({ ...n, lida: true })),
        }));
      },
      toggleLookupItem: (listId, codigo) => {
        setState((s) => ({
          ...s,
          lookups: s.lookups.map((l) =>
            l.id !== listId
              ? l
              : {
                  ...l,
                  itens: l.itens.map((i) =>
                    i.codigo === codigo ? { ...i, ativo: !i.ativo } : i
                  ),
                }
          ),
        }));
        pushAudit("Configurações > Listas", "alterar", {
          registroTipo: "lookup_item",
          registroId: `${listId}:${codigo}`,
        });
      },
      addLookupItem: (listId, item) => {
        const codigo = item.codigo.trim().toLowerCase().replace(/\s+/g, "_");
        const nome = item.nome.trim();
        if (!codigo || !nome) return false;
        let ok = false;
        setState((s) => {
          const list = s.lookups.find((l) => l.id === listId);
          if (!list) return s;
          if (list.itens.some((i) => i.codigo === codigo)) return s;
          ok = true;
          const ordem =
            Math.max(0, ...list.itens.map((i) => i.ordem)) + 1;
          return {
            ...s,
            lookups: s.lookups.map((l) =>
              l.id !== listId
                ? l
                : {
                    ...l,
                    itens: [
                      ...l.itens,
                      { codigo, nome, ordem, ativo: true },
                    ],
                  }
            ),
          };
        });
        if (ok) {
          pushAudit("Configurações > Listas", "inserir", {
            registroTipo: "lookup_item",
            registroId: `${listId}:${codigo}`,
          });
        }
        return ok;
      },
      toggleApprovalRule: (id) => {
        const antes = state.approvalRules.find((r) => r.id === id);
        setState((s) => ({
          ...s,
          approvalRules: s.approvalRules.map((r) =>
            r.id === id ? { ...r, ativo: !r.ativo } : r
          ),
        }));
        pushAudit("Configurações > Alçadas", "alterar", {
          registroTipo: "approval_rule",
          registroId: id,
          antes,
          depois: { ...antes, ativo: !antes?.ativo },
        });
      },
      addApprovalRule: (data) => {
        const rule: ApprovalRule = { ...data, id: uid("ar") };
        setState((s) => ({
          ...s,
          approvalRules: [rule, ...s.approvalRules],
        }));
        pushAudit("Configurações > Alçadas", "criar", {
          registroTipo: "approval_rule",
          registroId: rule.id,
          depois: rule,
        });
        return rule;
      },
      updateApprovalRule: (id, patch) => {
        const antes = state.approvalRules.find((r) => r.id === id);
        setState((s) => ({
          ...s,
          approvalRules: s.approvalRules.map((r) =>
            r.id === id ? { ...r, ...patch } : r
          ),
        }));
        pushAudit("Configurações > Alçadas", "alterar", {
          registroTipo: "approval_rule",
          registroId: id,
          antes,
          depois: { ...antes, ...patch },
        });
      },
      setProfilePermission: (profileId, rotina, flags) => {
        const antes = state.permissions.find(
          (p) => p.profileId === profileId && p.rotina === rotina
        );
        setState((s) => {
          const exists = s.permissions.some(
            (p) => p.profileId === profileId && p.rotina === rotina
          );
          const nextRow: ProfilePermission = {
            profileId,
            rotina,
            ...flags,
          };
          return {
            ...s,
            permissions: exists
              ? s.permissions.map((p) =>
                  p.profileId === profileId && p.rotina === rotina
                    ? nextRow
                    : p
                )
              : [...s.permissions, nextRow],
          };
        });
        pushAudit("Configurações > Perfis", "alterar", {
          registroTipo: "profile_permission",
          registroId: `${profileId}:${rotina}`,
          antes,
          depois: { profileId, rotina, ...flags },
        });
      },
    };
  }, [state, ready, pushAudit]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useFase1() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFase1 must be used within Fase1StoreProvider");
  return ctx;
}

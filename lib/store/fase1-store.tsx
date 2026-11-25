"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { FASE1_STORAGE_KEY, seedFase1 } from "@/lib/domain/fase1-seed";
import type {
  AppFile,
  AppNotification,
  AppTask,
  AppUser,
  Fase1State,
  Organization,
  Person,
  PersonPapel,
} from "@/lib/domain/fase1-types";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowLabel() {
  return new Date().toLocaleString("pt-BR");
}

type Fase1Api = {
  state: Fase1State;
  ready: boolean;
  currentUser: AppUser | undefined;
  currentProfileName: string;
  reset: () => void;
  saveOrganization: (org: Organization) => void;
  setSelectedEmpresa: (id: string) => void;
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
  toggleApprovalRule: (id: string) => void;
};

const Ctx = createContext<Fase1Api | null>(null);

export function Fase1StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Fase1State>(() => seedFase1());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FASE1_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Fase1State>;
        const seed = seedFase1();
        setState({
          ...seed,
          ...parsed,
          organizations: parsed.organizations?.length
            ? parsed.organizations
            : seed.organizations,
          selectedEmpresaId:
            parsed.selectedEmpresaId ?? seed.selectedEmpresaId,
        });
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(FASE1_STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  const log = useCallback((rotina: string, acao: string) => {
    setState((s) => {
      const user = s.users.find((u) => u.id === s.currentUserId);
      return {
        ...s,
        audit: [
          {
            id: uid("aud"),
            quando: nowLabel(),
            usuarioNome: user?.nome ?? "Sistema",
            rotina,
            acao,
          },
          ...s.audit,
        ].slice(0, 80),
      };
    });
  }, []);

  const api = useMemo<Fase1Api>(() => {
    const currentUser = state.users.find((u) => u.id === state.currentUserId);
    const currentProfileName =
      state.profiles.find((p) => p.id === currentUser?.profileId)?.nome ?? "—";

    return {
      state,
      ready,
      currentUser,
      currentProfileName,
      reset: () => {
        const next = seedFase1();
        setState(next);
        localStorage.setItem(FASE1_STORAGE_KEY, JSON.stringify(next));
      },
      saveOrganization: (org) => {
        setState((s) => ({
          ...s,
          organization: org,
          organizations: s.organizations.map((o) =>
            o.id === org.id ? org : o
          ),
        }));
        log("Configurações > Empresa", "Salvou dados da empresa");
      },
      setSelectedEmpresa: (id) => {
        setState((s) => {
          if (id === "todas") {
            return { ...s, selectedEmpresaId: "todas" };
          }
          const org = s.organizations.find((o) => o.id === id);
          if (!org) return s;
          return {
            ...s,
            selectedEmpresaId: id,
            organization: org,
          };
        });
        log(
          "Empresa",
          id === "todas" ? "Selecionou todas as empresas" : `Selecionou ${id}`
        );
      },
      addPerson: (data) => {
        const person: Person = {
          ...data,
          id: uid("p"),
          createdAt: new Date().toISOString(),
        };
        setState((s) => ({ ...s, people: [person, ...s.people] }));
        log("Cadastros > Pessoas", `Cadastrou ${person.nome}`);
        return person;
      },
      updatePerson: (id, patch) => {
        setState((s) => ({
          ...s,
          people: s.people.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }));
        log("Cadastros > Pessoas", `Atualizou pessoa ${id}`);
      },
      softDeletePerson: (id) => {
        setState((s) => ({
          ...s,
          people: s.people.map((p) =>
            p.id === id ? { ...p, status: "inativo" } : p
          ),
        }));
        log("Cadastros > Pessoas", `Inativou pessoa ${id}`);
      },
      peopleByPapel: (papel) =>
        state.people.filter((p) => p.papeis.includes(papel)),
      addUser: (data) => {
        const user: AppUser = { ...data, id: uid("u") };
        setState((s) => ({ ...s, users: [user, ...s.users] }));
        log("Configurações > Usuários", `Criou ${user.email}`);
        return user;
      },
      updateUser: (id, patch) => {
        setState((s) => ({
          ...s,
          users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        }));
        log("Configurações > Usuários", `Atualizou usuário ${id}`);
      },
      addFile: (data) => {
        const file: AppFile = {
          ...data,
          id: uid("f"),
          createdAt: new Date().toISOString(),
        };
        setState((s) => ({ ...s, files: [file, ...s.files] }));
        log("Arquivos", `Enviou ${file.nome}`);
        return file;
      },
      addTask: (data) => {
        const task: AppTask = { ...data, id: uid("t") };
        setState((s) => ({ ...s, tasks: [task, ...s.tasks] }));
        log("Tarefas", `Criou ${task.titulo}`);
        return task;
      },
      moveTask: (id, status) => {
        setState((s) => ({
          ...s,
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
        }));
        log("Tarefas", `Moveu ${id} → ${status}`);
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
        log("Configurações > Listas", `Alternou item ${codigo}`);
      },
      toggleApprovalRule: (id) => {
        setState((s) => ({
          ...s,
          approvalRules: s.approvalRules.map((r) =>
            r.id === id ? { ...r, ativo: !r.ativo } : r
          ),
        }));
        log("Configurações > Alçadas", `Alternou regra ${id}`);
      },
    };
  }, [state, ready, log]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useFase1() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFase1 must be used within Fase1StoreProvider");
  return ctx;
}

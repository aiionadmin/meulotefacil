/** npx tsx lib/ui/people-options.test.ts */
import { peopleOptions, responsavelOptions } from "./people-options";
import type { AppUser, Person } from "@/lib/domain/fase1-types";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FALHOU", msg);
    process.exit(1);
  }
}

const people: Person[] = [
  {
    id: "1",
    tipo: "juridica",
    status: "ativo",
    nome: "Fornecedor A",
    documento: "1",
    papeis: ["fornecedor"],
    createdAt: "",
  },
  {
    id: "2",
    tipo: "fisica",
    status: "inativo",
    nome: "Inativo",
    documento: "2",
    papeis: ["fornecedor"],
    createdAt: "",
  },
  {
    id: "3",
    tipo: "fisica",
    status: "ativo",
    nome: "Cliente B",
    documento: "3",
    papeis: ["cliente", "comprador"],
    createdAt: "",
  },
];

const forn = peopleOptions(people, "fornecedor");
assert(forn.length === 1 && forn[0].value === "Fornecedor A", "só ativos fornecedor");

const cli = peopleOptions(people, ["cliente", "comprador"]);
assert(cli.length === 1 && cli[0].label === "Cliente B", "cliente/comprador");

const users: AppUser[] = [
  {
    id: "u1",
    nome: "Admin",
    email: "a@x.com",
    status: "ativo",
    chave: true,
    profileId: "pf",
    organizationIds: [],
  },
];
const resp = responsavelOptions(people, users);
assert(
  resp.some((o) => o.value === "Admin"),
  "inclui usuário"
);

console.log("OK people-options", forn, cli, resp.length);

"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
} from "@/components/app/ModulePage";
import {
  DetailRow,
  DetailSheet,
  Field,
  FilterBar,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { maskCPF, maskCNPJ, maskPhone } from "@/lib/masks/br";
import { useServerPage } from "@/lib/ui/use-server-page";
import { useFase1 } from "@/lib/store/fase1-store";
import type { Person, PersonPapel } from "@/lib/domain/fase1-types";

const PAPEIS: PersonPapel[] = [
  "cliente",
  "comprador",
  "fornecedor",
  "profissional",
  "corretor",
  "socio",
  "pre_cadastro",
];

const PAGE_SIZES = [10, 25, 50, 100] as const;

export function PeopleModule({
  title,
  description,
  papelFilter,
}: {
  title: string;
  description: string;
  papelFilter?: PersonPapel;
}) {
  const { state, addPerson, updatePerson, softDeletePerson } = useFase1();
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(25);
  const [page, setPage] = useState(0);
  const [openForm, setOpenForm] = useState(searchParams.get("novo") === "1");
  const [selected, setSelected] = useState<Person | null>(null);
  const [form, setForm] = useState({
    tipo: "fisica" as Person["tipo"],
    nome: "",
    documento: "",
    sexo: "",
    nascimento: "",
    nacionalidade: "Brasileira",
    profissao: "",
    rg: "",
    renda: 0,
    estadoCivil: "",
    regimeBens: "",
    conjugeNome: "",
    enderecoResidencial: "",
    procuradorNome: "",
    papel: (papelFilter ?? "cliente") as PersonPapel,
    cidade: "Campinas",
    uf: "SP",
    celular: "",
    email: "",
  });

  const base = useMemo(() => {
    let list = state.people.filter((p) => p.status !== "excluido");
    if (papelFilter) list = list.filter((p) => p.papeis.includes(papelFilter));
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((p) =>
        [p.nome, p.documento, p.cidade, p.email, p.celular, p.papeis.join(" ")]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }
    return list;
  }, [state.people, papelFilter, q]);

  const pageCount = Math.max(1, Math.ceil(base.length / pageSize));
  const pageSafe = Math.min(page, pageCount - 1);
  const rows = base.slice(pageSafe * pageSize, pageSafe * pageSize + pageSize);

  const server = useServerPage<Person>({
    url: "/api/list/pessoas",
    page: pageSafe + 1,
    pageSize,
    q,
    extraParams: papelFilter ? { papel: papelFilter } : undefined,
  });

  const exportCsv = () => {
    const header = ["nome", "documento", "papeis", "cidade", "status"];
    const lines = [
      header.join(";"),
      ...base.map((p) =>
        [p.nome, p.documento, p.papeis.join("|"), p.cidade ?? "", p.status]
          .map((c) => `"${String(c).replace(/"/g, '""')}"`)
          .join(";")
      ),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pessoas.csv";
    a.click();
    URL.revokeObjectURL(url);
    notify("CSV exportado", `${base.length} registro(s)`);
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        title={title}
        description={description}
        actions={
          <>
            <Button size="sm" variant="outline" onClick={exportCsv}>
              Exportar CSV
            </Button>
            <Button size="sm" onClick={() => setOpenForm(true)}>
              Nova pessoa
            </Button>
          </>
        }
      />
      <KpiGrid
        items={[
          { label: "Registros", value: base.length },
          {
            label: "Ativos",
            value: base.filter((p) => p.status === "ativo").length,
          },
          {
            label: "Página",
            value: `${pageSafe + 1}/${pageCount}`,
          },
          {
            label: "API B17",
            value: server.loading
              ? "…"
              : server.data
                ? `${server.data.total} · ${Math.round(server.data.elapsedMs ?? 0)}ms`
                : server.error ?? "—",
          },
        ]}
      />
      <FilterBar value={q} onChange={(v) => { setQ(v); setPage(0); }} placeholder="Buscar nome, CPF/CNPJ, cidade…">
        <select
          className={fieldControlClass + " w-auto"}
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number]);
            setPage(0);
          }}
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n} / página
            </option>
          ))}
        </select>
      </FilterBar>
      <DataTable
        onRowClick={(i) => setSelected(rows[i])}
        columns={[
          { key: "nome", label: "Nome" },
          { key: "doc", label: "CPF/CNPJ" },
          { key: "papeis", label: "Papéis" },
          { key: "cidade", label: "Cidade" },
          { key: "contato", label: "Contato" },
          { key: "status", label: "Status" },
        ]}
        rows={rows.map((p) => ({
          nome: <span className="font-medium">{p.nome}</span>,
          doc: p.documento,
          papeis: p.papeis.join(", "),
          cidade: p.cidade ? `${p.cidade}/${p.uf ?? ""}` : "—",
          contato: p.celular || p.telefone1 || p.email || "—",
          status: (
            <StatusPill tone={p.status === "ativo" ? "ok" : "warn"}>
              {p.status}
            </StatusPill>
          ),
        }))}
      />
      <div className="flex items-center justify-between gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={pageSafe <= 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          Anterior
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={pageSafe >= pageCount - 1}
          onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
        >
          Próxima
        </Button>
      </div>

      <FormDialog
        open={openForm}
        onOpenChange={setOpenForm}
        title="Nova pessoa"
        submitLabel="Cadastrar"
        onSubmit={() => {
          if (!form.nome.trim()) return;
          addPerson({
            tipo: form.tipo,
            status: "ativo",
            nome: form.nome.trim(),
            sexo: form.sexo || undefined,
            nascimento: form.nascimento || undefined,
            nacionalidade: form.nacionalidade || undefined,
            profissao: form.profissao || undefined,
            rg: form.rg || undefined,
            estadoCivil: form.estadoCivil || undefined,
            regimeBens: form.regimeBens || undefined,
            conjugeNome: form.conjugeNome || undefined,
            enderecoResidencial: form.enderecoResidencial || undefined,
            procuradorNome: form.procuradorNome || undefined,
            documento:
              form.documento ||
              (form.tipo === "fisica" ? "pendente" : "pendente"),
            papeis: [form.papel],
            cidade: form.cidade,
            uf: form.uf,
            celular: form.celular || undefined,
            email: form.email || undefined,
          });
          notify("Pessoa cadastrada", form.nome);
          setOpenForm(false);
          setForm({
            tipo: "fisica",
            nome: "",
            documento: "",
    sexo: "",
    nascimento: "",
    nacionalidade: "Brasileira",
    profissao: "",
    rg: "",
    renda: 0,
    estadoCivil: "",
    regimeBens: "",
    conjugeNome: "",
    enderecoResidencial: "",
    procuradorNome: "",
            papel: papelFilter ?? "cliente",
            cidade: "Campinas",
            uf: "SP",
            celular: "",
            email: "",
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tipo">
            <select
              className={fieldControlClass}
              value={form.tipo}
              onChange={(e) =>
                setForm({ ...form, tipo: e.target.value as Person["tipo"] })
              }
            >
              <option value="fisica">Pessoa física</option>
              <option value="juridica">Pessoa jurídica</option>
            </select>
          </Field>
          <Field label="Papel">
            <select
              className={fieldControlClass}
              value={form.papel}
              onChange={(e) =>
                setForm({ ...form, papel: e.target.value as PersonPapel })
              }
            >
              {PAPEIS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Nome / razão social">
          <Input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
          />
        </Field>
        <Field label={form.tipo === "fisica" ? "CPF" : "CNPJ"}>
          <Input
            value={form.documento}
            onChange={(e) =>
              setForm({
                ...form,
                documento:
                  form.tipo === "fisica"
                    ? maskCPF(e.target.value)
                    : maskCNPJ(e.target.value),
              })
            }
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cidade">
            <Input
              value={form.cidade}
              onChange={(e) => setForm({ ...form, cidade: e.target.value })}
            />
          </Field>
          <Field label="Celular">
            <Input
              value={form.celular}
              onChange={(e) =>
                setForm({ ...form, celular: maskPhone(e.target.value) })
              }
            />
          </Field>
        </div>
        <Field label="E-mail">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Sexo">
          <Input
            value={form.sexo}
            onChange={(e) => setForm({ ...form, sexo: e.target.value })}
          />
        </Field>
        <Field label="Nascimento">
          <Input
            type="date"
            value={form.nascimento}
            onChange={(e) => setForm({ ...form, nascimento: e.target.value })}
          />
        </Field>
        <Field label="Nacionalidade">
          <Input
            value={form.nacionalidade}
            onChange={(e) =>
              setForm({ ...form, nacionalidade: e.target.value })
            }
          />
        </Field>
        <Field label="Profissão">
          <Input
            value={form.profissao}
            onChange={(e) => setForm({ ...form, profissao: e.target.value })}
          />
        </Field>
        <Field label="RG">
          <Input
            value={form.rg}
            onChange={(e) => setForm({ ...form, rg: e.target.value })}
          />
        </Field>
        <Field label="Estado civil">
          <Input
            value={form.estadoCivil}
            onChange={(e) => setForm({ ...form, estadoCivil: e.target.value })}
          />
        </Field>
        <Field label="Regime de bens">
          <Input
            value={form.regimeBens}
            onChange={(e) => setForm({ ...form, regimeBens: e.target.value })}
          />
        </Field>
        <Field label="Cônjuge">
          <Input
            value={form.conjugeNome}
            onChange={(e) => setForm({ ...form, conjugeNome: e.target.value })}
          />
        </Field>
        <Field label="Endereço residencial">
          <Input
            value={form.enderecoResidencial}
            onChange={(e) =>
              setForm({ ...form, enderecoResidencial: e.target.value })
            }
          />
        </Field>
        <Field label="Procurador">
          <Input
            value={form.procuradorNome}
            onChange={(e) =>
              setForm({ ...form, procuradorNome: e.target.value })
            }
          />
        </Field>
      </FormDialog>

      <DetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.nome ?? "Pessoa"}
        footer={
          selected ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const next = selected.status === "ativo" ? "inativo" : "ativo";
                  updatePerson(selected.id, { status: next });
                  setSelected({ ...selected, status: next });
                  notify("Status atualizado", next);
                }}
              >
                Alternar status
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  softDeletePerson(selected.id);
                  setSelected(null);
                  notify("Pessoa inativada");
                }}
              >
                Inativar
              </Button>
            </>
          ) : null
        }
      >
        {selected ? (
          <>
            <DetailRow label="Tipo" value={selected.tipo} />
            <DetailRow label="Documento" value={selected.documento} />
            <DetailRow label="Papéis" value={selected.papeis.join(", ")} />
            <DetailRow
              label="Cidade"
              value={
                selected.cidade
                  ? `${selected.cidade}/${selected.uf ?? ""}`
                  : "—"
              }
            />
            <DetailRow
              label="Contato"
              value={selected.celular || selected.telefone1 || "—"}
            />
            <DetailRow label="E-mail" value={selected.email || "—"} />
            <DetailRow label="Status" value={selected.status} />
          </>
        ) : null}
      </DetailSheet>
    </div>
  );
}

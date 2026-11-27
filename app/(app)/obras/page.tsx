"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ModuleHeader,
  KpiGrid,
  StatusPill,
} from "@/components/app/ModulePage";
import { PaginatedTable } from "@/components/app/PaginatedTable";
import {
  Field,
  FilterBar,
  FormSheet,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { formatBRL } from "@/lib/masks/br";
import { filterObrasVisiveis } from "@/lib/obras/visibilidade";
import { useFase1 } from "@/lib/store/fase1-store";
import { useObras } from "@/lib/store/obras-store";
import type { ObraStatus } from "@/lib/domain/obras-types";
import { useCarteira } from "@/lib/store/carteira-store";
import { useNovoParam } from "@/lib/ui/use-novo-param";

const STATUS_LABEL: Record<ObraStatus, string> = {
  em_orcamento: "Em orçamento",
  em_andamento: "Em andamento",
  paralisada: "Paralisada",
  finalizada: "Finalizada",
};

const EMPTY_FORM = {
  codigo: "",
  nome: "",
  tipo: "infraestrutura",
  status: "em_orcamento" as ObraStatus,
  clienteNome: "",
  developmentId: "",
  responsavelObra: "",
  responsavelTecnico: "",
  art: "",
  ceiCno: "",
  areaTotal: 0,
  unidade: "m²",
  bdiPct: 0.25,
  visivelPara: ["Administrador"] as string[],
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
  contatoNome: "",
  contatoTelefone: "",
  contatoEmail: "",
  quemPaga: "empresa" as "empresa" | "cliente",
  contaPadrao: "",
  fatTipo: "pj" as "pj" | "pf",
  fatDocumento: "",
  fatRazao: "",
  fatIe: "",
  fatTelefone: "",
  fatEmail: "",
  fatEmailsCopia: "",
  fatEndereco: "",
  exibirLancamentos: true,
  exibirFaturamentos: true,
  exibirCompras: true,
};

export default function ObrasPage() {
  const { state, addObra, duplicateObra, softRemoveObra } = useObras();
  const {
    state: fase1,
    currentUser,
    currentProfileName: perfilNome,
  } = useFase1();
  const { state: carteira } = useCarteira();
  const perfisAtivos = fase1.profiles;
  const usuariosAtivos = fase1.users.filter((u) => u.status === "ativo");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [open, setOpen] = useNovoParam();
  const [formDirty, setFormDirty] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  function patchForm(patch: Partial<typeof EMPTY_FORM>) {
    setFormDirty(true);
    setForm((prev) => ({ ...prev, ...patch }));
  }

  const filtered = useMemo(() => {
    let list = filterObrasVisiveis(state.obras, currentUser, perfilNome);
    if (statusFilter !== "todos") {
      list = list.filter((o) => o.status === statusFilter);
    }
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((o) =>
        [o.codigo, o.nome, o.clienteNome, o.tipo, o.developmentNome]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }
    return list;
  }, [state.obras, q, statusFilter, currentUser, perfilNome]);

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Minhas Obras"
        description="Cadastro próprio de obra (independente dos lotes). Empreendimento é opcional."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/gestao">Gestão</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/rdo">RDO</Link>
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setForm(EMPTY_FORM);
                setFormDirty(false);
                setOpen(true);
              }}
            >
              Nova Obra
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Obras", value: state.obras.length },
          {
            label: "Em andamento",
            value: state.obras.filter((o) => o.status === "em_andamento")
              .length,
          },
          {
            label: "Orçado",
            value: formatBRL(
              state.obras.reduce((a, o) => a + o.orcado, 0)
            ),
          },
          {
            label: "Realizado",
            value: formatBRL(
              state.obras.reduce((a, o) => a + o.realizado, 0)
            ),
          },
        ]}
      />

      <FilterBar value={q} onChange={setQ} placeholder="Busque uma obra">
        <select
          className={fieldControlClass + " max-w-[180px]"}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="todos">Status da obra</option>
          {(Object.keys(STATUS_LABEL) as ObraStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </FilterBar>

      <PaginatedTable
        exportName="obras"
        columns={[
          { key: "img", label: "" },
          { key: "codigo", label: "Código" },
          { key: "obra", label: "Obra" },
          { key: "cliente", label: "Cliente" },
          { key: "tipo", label: "Tipo" },
          { key: "status", label: "Status da Obra" },
          { key: "visivel", label: "Visível para" },
          { key: "fisico", label: "Físico" },
          { key: "acoes", label: "" },
        ]}
        rows={filtered.map((o) => ({
          img: (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-paper-muted text-[10px] text-muted-foreground">
              img
            </span>
          ),
          codigo: o.codigo,
          obra: (
            <Link
              href={`/obras/${o.id}`}
              className="font-medium hover:text-brand-orange"
            >
              {o.nome}
            </Link>
          ),
          cliente: o.clienteNome,
          tipo: o.tipo,
          status: (
            <StatusPill tone="info">{STATUS_LABEL[o.status]}</StatusPill>
          ),
          visivel: (o.visivelPara ?? []).join(", ") || "—",
          fisico: `${o.fisicoPct}%`,
          acoes: (
            <div className="flex gap-1">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/obras/${o.id}`}>Editar</Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  duplicateObra(o.id);
                  notify("Obra duplicada");
                }}
              >
                Duplicar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  softRemoveObra(o.id);
                  notify("Obra removida da lista");
                }}
              >
                Remover
              </Button>
            </div>
          ),
        }))}
      />

      <FormSheet
        open={open}
        onOpenChange={setOpen}
        title="Nova Obra"
        submitLabel="Salvar dados da obra"
        wide
        dirty={formDirty}
        onSubmit={() => {
          if (!form.nome.trim()) {
            notify("Nome da obra é obrigatório");
            return;
          }
          if (!form.visivelPara.length) {
            notify("Selecione ao menos um perfil ou usuário");
            return;
          }
          const emp = carteira.developments.find(
            (d) => d.id === form.developmentId
          );
          const contatos =
            form.contatoNome.trim() ||
            form.contatoTelefone.trim() ||
            form.contatoEmail.trim()
              ? [
                  {
                    nome: form.contatoNome.trim() || "Contato",
                    telefone: form.contatoTelefone || undefined,
                    email: form.contatoEmail || undefined,
                  },
                ]
              : undefined;
          addObra({
            codigo:
              form.codigo.trim() ||
              `OBR-${String(state.obras.length + 1).padStart(3, "0")}`,
            nome: form.nome.slice(0, 200),
            tipo: form.tipo,
            status: form.status,
            clienteNome: form.clienteNome || "Cliente",
            developmentId: emp?.id,
            developmentNome: emp?.nome,
            areaTotal: form.areaTotal || undefined,
            unidade: form.unidade || "m²",
            art: form.art || undefined,
            ceiCno: form.ceiCno.slice(0, 20) || undefined,
            responsavelObra: form.responsavelObra || undefined,
            responsavelTecnico: form.responsavelTecnico || undefined,
            visivelPara: form.visivelPara,
            bdiPct: form.bdiPct,
            cidade: form.cidade || undefined,
            uf: form.uf || undefined,
            endereco: {
              cep: form.cep || undefined,
              logradouro: form.logradouro || undefined,
              numero: form.numero || undefined,
              complemento: form.complemento || undefined,
              bairro: form.bairro || undefined,
              estado: form.uf || undefined,
              cidade: form.cidade || undefined,
            },
            contatos,
            contaBancariaPadrao: form.contaPadrao
              ? { quemPaga: form.quemPaga, conta: form.contaPadrao }
              : undefined,
            faturamento:
              form.fatDocumento || form.fatRazao || form.fatEmail
                ? {
                    tipo: form.fatTipo,
                    documento: form.fatDocumento || undefined,
                    razaoSocial: form.fatRazao || undefined,
                    ie: form.fatIe || undefined,
                    telefone: form.fatTelefone || undefined,
                    email: form.fatEmail || undefined,
                    emailsCopia: form.fatEmailsCopia || undefined,
                    endereco: form.fatEndereco || undefined,
                  }
                : undefined,
            exibirLancamentos: form.exibirLancamentos,
            exibirFaturamentos: form.exibirFaturamentos,
            exibirCompras: form.exibirCompras,
            propostaStatus: "contato_inicial",
          });
          notify("Obra criada");
          setFormDirty(false);
          setOpen(false);
        }}
      >
        <Field label="Nome da obra *">
          <Input
            value={form.nome}
            maxLength={200}
            onChange={(e) => patchForm({ nome: e.target.value })}
          />
        </Field>
        <Field label="Tipo da obra">
          <Input
            value={form.tipo}
            onChange={(e) => patchForm({tipo: e.target.value })}
            placeholder="Ex.: infraestrutura, loteamento…"
          />
        </Field>
        <Field label="Status *">
          <select
            className={fieldControlClass}
            value={form.status}
            onChange={(e) =>
              patchForm({status: e.target.value as ObraStatus })
            }
          >
            {(Object.keys(STATUS_LABEL) as ObraStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Obra visível para *">
          <div className="space-y-3 rounded-lg border border-linha bg-white p-3">
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Perfis
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {perfisAtivos.map((p) => {
                  const checked = form.visivelPara.includes(p.nome);
                  return (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 text-sm text-ink"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const next = checked
                            ? form.visivelPara.filter((v) => v !== p.nome)
                            : [...form.visivelPara, p.nome];
                          patchForm({ visivelPara: next });
                        }}
                      />
                      {p.nome}
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Usuários
              </p>
              <div className="flex max-h-36 flex-col gap-1.5 overflow-y-auto">
                {usuariosAtivos.map((u) => {
                  const checked = form.visivelPara.includes(u.nome);
                  return (
                    <label
                      key={u.id}
                      className="flex items-center gap-2 text-sm text-ink"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const next = checked
                            ? form.visivelPara.filter((v) => v !== u.nome)
                            : [...form.visivelPara, u.nome];
                          patchForm({ visivelPara: next });
                        }}
                      />
                      <span>
                        {u.nome}
                        <span className="text-muted-foreground">
                          {" "}
                          · {u.email}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            {form.visivelPara.length ? (
              <p className="text-xs text-muted-foreground">
                Selecionados: {form.visivelPara.join(", ")}
              </p>
            ) : null}
          </div>
        </Field>

        <div className="pt-2">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Dados opcionais
          </p>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="gerais">
              <AccordionTrigger className="py-3 text-sm">
                Dados gerais
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <Field label="Código da obra">
                  <Input
                    placeholder="Sugestão automática se vazio"
                    value={form.codigo}
                    onChange={(e) =>
                      patchForm({codigo: e.target.value })
                    }
                  />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Área total">
                    <Input
                      type="number"
                      value={form.areaTotal || ""}
                      onChange={(e) =>
                        patchForm({areaTotal: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </Field>
                  <Field label="Unidade">
                    <Input
                      value={form.unidade}
                      onChange={(e) =>
                        patchForm({unidade: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="ART">
                    <Input
                      value={form.art}
                      onChange={(e) =>
                        patchForm({art: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="CEI/CNO">
                    <Input
                      maxLength={20}
                      value={form.ceiCno}
                      onChange={(e) =>
                        patchForm({ceiCno: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <Field label="Responsável técnico">
                  <Input
                    value={form.responsavelTecnico}
                    onChange={(e) =>
                      patchForm({responsavelTecnico: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Responsável da obra">
                  <Input
                    value={form.responsavelObra}
                    onChange={(e) =>
                      patchForm({responsavelObra: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Empreendimento (opcional)">
                  <select
                    className={fieldControlClass}
                    value={form.developmentId}
                    onChange={(e) =>
                      patchForm({developmentId: e.target.value })
                    }
                  >
                    <option value="">Sem vínculo</option>
                    {carteira.developments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nome}
                      </option>
                    ))}
                  </select>
                </Field>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cliente">
              <AccordionTrigger className="py-3 text-sm">
                Dados do cliente
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <Field label="Cliente">
                  <Input
                    value={form.clienteNome}
                    onChange={(e) =>
                      patchForm({clienteNome: e.target.value })
                    }
                    placeholder="Busca / criação rápida"
                  />
                </Field>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="endereco">
              <AccordionTrigger className="py-3 text-sm">
                Endereço da obra
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <Field label="CEP">
                  <Input
                    value={form.cep}
                    onChange={(e) =>
                      patchForm({cep: e.target.value })
                    }
                  />
                </Field>
                <Field label="Logradouro">
                  <Input
                    value={form.logradouro}
                    onChange={(e) =>
                      patchForm({logradouro: e.target.value })
                    }
                  />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Número">
                    <Input
                      value={form.numero}
                      onChange={(e) =>
                        patchForm({numero: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Complemento">
                    <Input
                      value={form.complemento}
                      onChange={(e) =>
                        patchForm({complemento: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <Field label="Bairro">
                  <Input
                    value={form.bairro}
                    onChange={(e) =>
                      patchForm({bairro: e.target.value })
                    }
                  />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Estado">
                    <Input
                      value={form.uf}
                      maxLength={2}
                      onChange={(e) =>
                        patchForm({uf: e.target.value.toUpperCase(),
                        })
                      }
                    />
                  </Field>
                  <Field label="Cidade">
                    <Input
                      value={form.cidade}
                      onChange={(e) =>
                        patchForm({cidade: e.target.value })
                      }
                    />
                  </Field>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contatos">
              <AccordionTrigger className="py-3 text-sm">
                Contatos
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <Field label="Nome">
                  <Input
                    value={form.contatoNome}
                    onChange={(e) =>
                      patchForm({contatoNome: e.target.value })
                    }
                  />
                </Field>
                <Field label="Telefone">
                  <Input
                    value={form.contatoTelefone}
                    onChange={(e) =>
                      patchForm({contatoTelefone: e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="E-mail">
                  <Input
                    type="email"
                    value={form.contatoEmail}
                    onChange={(e) =>
                      patchForm({contatoEmail: e.target.value })
                    }
                  />
                </Field>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="conta">
              <AccordionTrigger className="py-3 text-sm">
                Conta bancária padrão
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <Field label="Quem paga">
                  <select
                    className={fieldControlClass}
                    value={form.quemPaga}
                    onChange={(e) =>
                      patchForm({quemPaga: e.target.value as "empresa" | "cliente",
                      })
                    }
                  >
                    <option value="empresa">Empresa</option>
                    <option value="cliente">Cliente</option>
                  </select>
                </Field>
                <Field label="Conta">
                  <Input
                    value={form.contaPadrao}
                    onChange={(e) =>
                      patchForm({contaPadrao: e.target.value })
                    }
                    placeholder="Nome ou número da conta"
                  />
                </Field>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faturamento">
              <AccordionTrigger className="py-3 text-sm">
                Dados para Faturamento
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <Field label="Tipo">
                  <select
                    className={fieldControlClass}
                    value={form.fatTipo}
                    onChange={(e) =>
                      patchForm({fatTipo: e.target.value as "pj" | "pf",
                      })
                    }
                  >
                    <option value="pj">PJ</option>
                    <option value="pf">PF</option>
                  </select>
                </Field>
                <Field label={form.fatTipo === "pj" ? "CNPJ" : "CPF"}>
                  <Input
                    value={form.fatDocumento}
                    onChange={(e) =>
                      patchForm({fatDocumento: e.target.value })
                    }
                  />
                </Field>
                <Field
                  label={
                    form.fatTipo === "pj" ? "Razão Social" : "Nome completo"
                  }
                >
                  <Input
                    value={form.fatRazao}
                    onChange={(e) =>
                      patchForm({fatRazao: e.target.value })
                    }
                  />
                </Field>
                {form.fatTipo === "pj" ? (
                  <Field label="Inscrição Estadual">
                    <Input
                      value={form.fatIe}
                      onChange={(e) =>
                        patchForm({fatIe: e.target.value })
                      }
                    />
                  </Field>
                ) : null}
                <Field label="Telefone">
                  <Input
                    value={form.fatTelefone}
                    onChange={(e) =>
                      patchForm({fatTelefone: e.target.value })
                    }
                  />
                </Field>
                <Field label="E-mail">
                  <Input
                    type="email"
                    value={form.fatEmail}
                    onChange={(e) =>
                      patchForm({fatEmail: e.target.value })
                    }
                  />
                </Field>
                <Field label="E-mails em cópia">
                  <Input
                    value={form.fatEmailsCopia}
                    onChange={(e) =>
                      patchForm({fatEmailsCopia: e.target.value,
                      })
                    }
                    placeholder="sepados por vírgula"
                  />
                </Field>
                <Field label="Endereço completo">
                  <Input
                    value={form.fatEndereco}
                    onChange={(e) =>
                      patchForm({fatEndereco: e.target.value })
                    }
                  />
                </Field>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="exibir">
              <AccordionTrigger className="py-3 text-sm">
                Exibir obra para
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-3 text-sm">
                  {(
                    [
                      ["exibirLancamentos", "Lançamentos"],
                      ["exibirFaturamentos", "Faturamentos"],
                      ["exibirCompras", "Compras"],
                    ] as const
                  ).map(([key, label]) => (
                    <label
                      key={key}
                      className="inline-flex items-center gap-1.5"
                    >
                      <input
                        type="checkbox"
                        checked={form[key]}
                        onChange={(e) =>
                          patchForm({[key]: e.target.checked })
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </FormSheet>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  DataTable,
  StatusPill,
  KpiGrid,
} from "@/components/app/ModulePage";
import {
  Field,
  FormDialog,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { SearchSelect } from "@/components/app/SearchSelect";
import { downloadExcel } from "@/lib/export/list-export";
import { useCarteira } from "@/lib/store/carteira-store";
import { statusLabel } from "@/lib/status/labels";

export default function CartoriosPage() {
  const {
    state,
    addCartorio,
    addEscritura,
    setEscrituraStatus,
  } = useCarteira();
  const [openCart, setOpenCart] = useState(false);
  const [openEsc, setOpenEsc] = useState(false);
  const [cartForm, setCartForm] = useState({
    nome: "",
    cidade: "",
    uf: "SP",
    contato: "",
  });
  const [escForm, setEscForm] = useState({
    contractId: "",
    cartorioId: "",
    protocolo: "",
  });

  const cartorioNome = (id: string) =>
    state.cartorios.find((c) => c.id === id)?.nome ?? id;
  const contratoLabel = (id: string) => {
    const c = state.contracts.find((x) => x.id === id);
    return c ? `${c.numero} · ${c.compradorNome}` : id;
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Cartórios e escrituras"
        description="H25 — cadastro de cartórios e controle de escrituras por contrato."
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                downloadExcel(
                  "cartorios",
                  ["Nome", "Cidade", "UF", "Contato"],
                  state.cartorios.map((c) => [
                    c.nome,
                    c.cidade,
                    c.uf,
                    c.contato ?? "",
                  ])
                );
                notify("Excel exportado");
              }}
            >
              Excel
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setOpenEsc(true)}
            >
              Nova escritura
            </Button>
            <Button size="sm" onClick={() => setOpenCart(true)}>
              Novo cartório
            </Button>
          </>
        }
      />
      <KpiGrid
        items={[
          { label: "Cartórios", value: state.cartorios.length },
          { label: "Escrituras", value: state.escrituras.length },
          {
            label: "Registradas",
            value: state.escrituras.filter((e) => e.status === "registrada")
              .length,
          },
        ]}
      />
      <DataTable
        columns={[
          { key: "nome", label: "Cartório" },
          { key: "cidade", label: "Cidade" },
          { key: "contato", label: "Contato" },
        ]}
        rows={state.cartorios.map((c) => ({
          nome: c.nome,
          cidade: `${c.cidade}/${c.uf}`,
          contato: c.contato ?? "—",
        }))}
        empty="Sem cartórios."
      />
      <DataTable
        columns={[
          { key: "protocolo", label: "Protocolo" },
          { key: "contrato", label: "Contrato" },
          { key: "cartorio", label: "Cartório" },
          { key: "status", label: "Status" },
          { key: "acao", label: "" },
        ]}
        rows={state.escrituras.map((e) => ({
          protocolo: e.protocolo,
          contrato: contratoLabel(e.contractId),
          cartorio: cartorioNome(e.cartorioId),
          status: (
            <StatusPill tone="info">{statusLabel(e.status)}</StatusPill>
          ),
          acao:
            e.status !== "registrada" ? (
              <div className="flex flex-wrap gap-1">
                {e.status === "pendente" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEscrituraStatus(e.id, "em_andamento");
                      notify("Em andamento");
                    }}
                  >
                    Andamento
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  onClick={() => {
                    setEscrituraStatus(e.id, "registrada");
                    notify("Escritura registrada");
                  }}
                >
                  Registrar
                </Button>
              </div>
            ) : (
              "—"
            ),
        }))}
        empty="Sem escrituras em andamento."
      />

      <FormDialog
        open={openCart}
        onOpenChange={setOpenCart}
        title="Novo cartório"
        onSubmit={() => {
          const c = addCartorio(cartForm);
          if (!c) {
            notify("Nome, cidade e UF obrigatórios");
            return;
          }
          notify("Cartório cadastrado", c.nome);
          setOpenCart(false);
          setCartForm({ nome: "", cidade: "", uf: "SP", contato: "" });
        }}
      >
        <Field label="Nome *">
          <Input
            value={cartForm.nome}
            onChange={(e) =>
              setCartForm({ ...cartForm, nome: e.target.value })
            }
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Cidade *">
            <Input
              value={cartForm.cidade}
              onChange={(e) =>
                setCartForm({ ...cartForm, cidade: e.target.value })
              }
            />
          </Field>
          <Field label="UF *">
            <Input
              value={cartForm.uf}
              maxLength={2}
              onChange={(e) =>
                setCartForm({ ...cartForm, uf: e.target.value })
              }
            />
          </Field>
        </div>
        <Field label="Contato">
          <Input
            value={cartForm.contato}
            onChange={(e) =>
              setCartForm({ ...cartForm, contato: e.target.value })
            }
          />
        </Field>
      </FormDialog>

      <FormDialog
        open={openEsc}
        onOpenChange={setOpenEsc}
        title="Nova escritura"
        onSubmit={() => {
          const e = addEscritura({
            contractId:
              escForm.contractId || state.contracts[0]?.id || "",
            cartorioId:
              escForm.cartorioId || state.cartorios[0]?.id || "",
            protocolo: escForm.protocolo,
          });
          if (!e) {
            notify("Contrato, cartório e protocolo obrigatórios");
            return;
          }
          notify("Escritura criada", e.protocolo);
          setOpenEsc(false);
          setEscForm({ contractId: "", cartorioId: "", protocolo: "" });
        }}
      >
        <Field label="Contrato *">
          <SearchSelect
            value={escForm.contractId || state.contracts[0]?.id || ""}
            onChange={(contractId) => setEscForm({ ...escForm, contractId })}
            placeholder="Buscar contrato…"
            options={state.contracts.map((c) => ({
              value: c.id,
              label: c.numero,
              meta: c.compradorNome,
            }))}
          />
        </Field>
        <Field label="Cartório *">
          <SearchSelect
            value={escForm.cartorioId || state.cartorios[0]?.id || ""}
            onChange={(cartorioId) => setEscForm({ ...escForm, cartorioId })}
            placeholder="Buscar cartório…"
            options={state.cartorios.map((c) => ({
              value: c.id,
              label: c.nome,
              meta: `${c.cidade}/${c.uf}`,
            }))}
          />
        </Field>
        <Field label="Protocolo *">
          <Input
            className={fieldControlClass}
            value={escForm.protocolo}
            onChange={(e) =>
              setEscForm({ ...escForm, protocolo: e.target.value })
            }
          />
        </Field>
      </FormDialog>
    </div>
  );
}

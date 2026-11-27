"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  KpiGrid,
  DataTable,
  StatusPill,
  ModuleSection,
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
import { SearchSelect } from "@/components/app/SearchSelect";
import { EmpreendimentoMap } from "@/components/app/EmpreendimentoMap";
import {
  EMPTY_GEO_EMP,
  GeoEmpFilters,
  developmentIdsMatching,
  type GeoEmpFilterValues,
} from "@/components/app/GeoEmpFilters";
import { ProcessBoard } from "@/components/kanban/ProcessBoard";
import { formatBRL } from "@/lib/masks/br";
import { downloadTextTemplate } from "@/lib/export/list-export";
import {
  modeloLotesCsv,
  parseLotesCsv,
  type LoteImportPreview,
} from "@/lib/import/lotes-csv";
import { parseXlsxBytes, xlsxRowsToCsv } from "@/lib/import/xlsx-parse";
import { useEmpresa } from "@/lib/empresa/context";
import { useCarteira } from "@/lib/store/carteira-store";
import { useSystemSettings } from "@/lib/store/system-settings-store";
import type { Development, Lot, LotStatus } from "@/lib/domain/carteira-types";
import { validateCartorioObrigatorio } from "@/lib/domain/cartorio-required";
import { nucleos } from "@/lib/data/nucleos";
import {
  findNucleoByBairro,
  findNucleoById,
  nucleoBairroNome,
} from "@/lib/domain/nucleo-bairro";
import { statusLabel } from "@/lib/status/labels";

const STATUS_TONE: Record<LotStatus, "ok" | "warn" | "danger" | "info" | "neutral"> = {
  disponivel: "ok",
  reservado: "warn",
  vendido: "info",
  quitado: "ok",
  escritura: "info",
  advogado: "danger",
  caucionado: "danger",
  invadido: "danger",
  juridico: "danger",
};

const LOT_STATUSES: LotStatus[] = [
  "advogado",
  "caucionado",
  "disponivel",
  "escritura",
  "invadido",
  "juridico",
  "quitado",
  "reservado",
  "vendido",
];

const EMPTY_EMP_FORM = {
  codigo: "",
  nome: "",
  tipo: "loteamento" as Development["tipo"],
  modalidade: "loteamento" as Development["modalidade"],
  status: "em_andamento" as Development["status"],
  cidade: "Campinas",
  uf: "SP",
  cep: "",
  endereco: "",
  latitude: "",
  longitude: "",
  areaTotal: "",
  codigoMunicipio: "",
  padrao: "",
  confrontacao: "",
  matriculaNumero: "",
  matriculaData: "",
  adminRazao: "",
  adminCnpj: "",
  adminEndereco: "",
  contaCorrentePadrao: "",
  numeracaoPropria: false,
  recadoPadrao: "",
  qtdQuadras: 4,
  qtdLotes: 0,
  diasMora: 0,
  taxaMoraMes: 0.01,
  taxaMulta: 0.02,
  diaMulta: 0,
  observacoes: "",
  bairro: "",
  nucleoId: "",
  cartorioId: "",
  cartorioNome: "",
  cartorioCidade: "",
  cartorioUf: "SP",
  cartorioContato: "",
  certidaoNumero: "",
  certidaoData: "",
  certidaoTipo: "",
  certidaoObs: "",
};

export default function EmpreendimentosPage() {
  const {
    state,
    addDevelopment,
    updateDevelopment,
    removeDevelopment,
    removeLot,
    massGenerateLots,
    importLots,
    changeLotStatus,
    updateLot,
  } = useCarteira();
  const { validadeReservaDias } = useSystemSettings();
  const { selectedId, filterByEmpresa, filterByDevelopmentEmpresa } =
    useEmpresa();
  const developmentsAll = useMemo(
    () => filterByEmpresa(state.developments),
    [filterByEmpresa, state.developments]
  );
  const [q, setQ] = useState("");
  const [empFilter, setEmpFilter] = useState("todos");
  const [geo, setGeo] = useState<GeoEmpFilterValues>({ ...EMPTY_GEO_EMP });
  const geoIds = useMemo(
    () => developmentIdsMatching(developmentsAll, geo),
    [developmentsAll, geo]
  );
  const developments = useMemo(() => {
    if (!geoIds) return developmentsAll;
    return developmentsAll.filter((d) => geoIds.has(d.id));
  }, [developmentsAll, geoIds]);
  const [openEmp, setOpenEmp] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [openLotEdit, setOpenLotEdit] = useState(false);
  const [lotForm, setLotForm] = useState({
    quadra: "",
    lote: "",
    area: 0,
    valor: 0,
    status: "disponivel" as LotStatus,
    matricula: "",
    frente: "",
    fundo: "",
    direita: "",
    esquerda: "",
  });
  const [openMass, setOpenMass] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [importDevId, setImportDevId] = useState(
    state.developments[0]?.id ?? ""
  );
  const [importPreview, setImportPreview] = useState<LoteImportPreview | null>(
    null
  );
  const [selected, setSelected] = useState<Lot | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [empForm, setEmpForm] = useState({ ...EMPTY_EMP_FORM });
  const [mass, setMass] = useState({
    developmentId: state.developments[0]?.id ?? "",
    quadra: "E",
    qtd: 5,
    area: 250,
    valor: 180000,
  });
  const [statusForm, setStatusForm] = useState({
    status: "juridico" as LotStatus,
    motivo: "",
  });

  function openNewEmp() {
    setEditingEmpId(null);
    setEmpForm({ ...EMPTY_EMP_FORM });
    setOpenEmp(true);
  }

  function openEditEmp(d: Development) {
    setEditingEmpId(d.id);
    setEmpForm({
      codigo: d.codigo,
      nome: d.nome,
      tipo: d.tipo,
      modalidade: d.modalidade ?? "loteamento",
      status: d.status,
      cidade: d.cidade,
      uf: d.uf,
      cep: d.cep ?? "",
      endereco: d.endereco ?? "",
      latitude:
        d.latitude !== undefined && d.latitude !== null
          ? String(d.latitude)
          : "",
      longitude:
        d.longitude !== undefined && d.longitude !== null
          ? String(d.longitude)
          : "",
      areaTotal: d.areaTotal ?? "",
      codigoMunicipio: d.codigoMunicipio ?? "",
      padrao: d.padrao ?? "",
      confrontacao: d.confrontacao ?? "",
      matriculaNumero: d.matriculaNumero ?? "",
      matriculaData: d.matriculaData ?? "",
      adminRazao: d.adminRazao ?? "",
      adminCnpj: d.adminCnpj ?? "",
      adminEndereco: d.adminEndereco ?? "",
      contaCorrentePadrao: d.contaCorrentePadrao ?? "",
      numeracaoPropria: d.numeracaoPropria ?? false,
      recadoPadrao: d.recadoPadrao ?? "",
      qtdQuadras: d.qtdQuadras,
      qtdLotes: d.qtdLotes,
      diasMora: d.diasMora,
      taxaMoraMes: d.taxaMoraMes,
      taxaMulta: d.taxaMulta,
      diaMulta: d.diaMulta,
      observacoes: d.observacoes ?? "",
      bairro: d.bairro ?? "",
      nucleoId:
        d.nucleoId ||
        findNucleoById(d.nucleoId)?.id ||
        findNucleoByBairro(d.bairro, d.cidade)?.id ||
        "",
      cartorioId: d.cartorioId ?? "",
      cartorioNome: d.cartorioNome ?? "",
      cartorioCidade: d.cartorioCidade ?? "",
      cartorioUf: d.cartorioUf ?? "SP",
      cartorioContato: d.cartorioContato ?? "",
      certidaoNumero: d.certidaoNumero ?? "",
      certidaoData: d.certidaoData ?? "",
      certidaoTipo: d.certidaoTipo ?? "",
      certidaoObs: d.certidaoObs ?? "",
    });
    setOpenEmp(true);
  }

  const lotes = useMemo(() => {
    let list = filterByDevelopmentEmpresa(state.lots, state.developments);
    if (geoIds) {
      list = list.filter((l) => geoIds.has(l.developmentId));
    }
    if (empFilter !== "todos") {
      list = list.filter((l) => l.developmentId === empFilter);
    }
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((l) =>
        [l.empNome, l.quadra, l.lote, l.status, l.compradorNome]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }
    return list;
  }, [
    state.lots,
    state.developments,
    q,
    empFilter,
    geoIds,
    filterByDevelopmentEmpresa,
  ]);

  const disponiveis = lotes.filter((l) => l.status === "disponivel").length;
  const vendidos = lotes.filter((l) => l.status === "vendido").length;

  const LOT_COLS = LOT_STATUSES.map((s) => ({
    id: s,
    label: statusLabel(s),
  }));

  const toLotCard = useCallback(
    (l: Lot) => ({
      id: l.id,
      columnId: l.status,
      title: `${l.quadra}/${l.lote}`,
      subtitle: l.empNome,
      badge: formatBRL(l.valor),
      meta: l.compradorNome ?? `${l.area} m²`,
    }),
    []
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Empreendimentos e lotes"
        description="estoque Emp+Quadra+Lote, status com travas, geração em massa e planta."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/empreendimentos/planta">Planta</Link>
            </Button>
            <Button size="sm" variant="outline" onClick={() => setOpenStatus(true)}>
              Alterar status
            </Button>
            <Button size="sm" variant="outline" onClick={() => setOpenMass(true)}>
              Gerar lotes
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setImportPreview(null);
                setOpenImport(true);
              }}
            >
              Importar lotes
            </Button>
            <Button size="sm" onClick={openNewEmp}>
              Novo empreendimento
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: "Empreendimentos", value: developments.length },
          { label: "Lotes", value: lotes.length },
          { label: "Disponíveis", value: disponiveis },
          { label: "Vendidos", value: vendidos },
        ]}
      />

      <ModuleSection title="Empreendimentos">
        <p className="mb-2 text-xs text-muted-foreground">
          Clique na linha para editar · use Excluir na ficha do formulário.
        </p>
        <DataTable
          onRowClick={(i) => {
            const d = developments[i];
            if (d) openEditEmp(d);
          }}
          columns={[
            { key: "codigo", label: "Código" },
            { key: "nome", label: "Nome" },
            { key: "bairro", label: "Bairro/núcleo" },
            { key: "cartorio", label: "Cartório" },
            { key: "tipo", label: "Tipo" },
            { key: "modalidade", label: "Modalidade" },
            { key: "cidade", label: "Cidade" },
            { key: "status", label: "Status" },
            { key: "lotes", label: "Lotes" },
            { key: "acoes", label: "" },
          ]}
          rows={developments.map((d) => ({
            codigo: d.codigo,
            nome: d.nome,
            bairro: d.bairro || "—",
            cartorio: d.cartorioNome
              ? `${d.cartorioNome}${d.certidaoNumero ? ` · ${d.certidaoNumero}` : ""}`
              : "—",
            tipo: d.tipo,
            modalidade: (d.modalidade ?? "loteamento").replace(/_/g, " "),
            cidade: `${d.cidade}/${d.uf}`,
            status: <StatusPill tone="info">{d.status.replace(/_/g, " ")}</StatusPill>,
            lotes: state.lots.filter((l) => l.developmentId === d.id).length,
            acoes: (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditEmp(d);
                }}
              >
                Editar
              </Button>
            ),
          }))}
        />
      </ModuleSection>

      <FilterBar
        value={q}
        onChange={setQ}
        placeholder="Buscar quadra, lote, status, comprador…"
      >
        <GeoEmpFilters
          developments={developmentsAll}
          value={geo}
          onChange={(next) => {
            setGeo(next);
            setEmpFilter("todos");
          }}
        />
        <select
          className={fieldControlClass + " max-w-[220px]"}
          value={empFilter}
          onChange={(e) => setEmpFilter(e.target.value)}
        >
          <option value="todos">Emp. (atalho lista)</option>
          {developments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nome}
            </option>
          ))}
        </select>
      </FilterBar>

      <ProcessBoard
        storageKey="lotes"
        columns={LOT_COLS}
        rows={lotes}
        toCard={toLotCard}
        columnTotals={(_, items) => items.reduce((a, l) => a + l.valor, 0)}
        onOpen={(id) => setSelected(state.lots.find((l) => l.id === id) ?? null)}
        onMove={(id, to) => {
          changeLotStatus(
            [id],
            to as LotStatus,
            "Movido no quadro de lotes",
            to === "reservado" ? { validadeReservaDias } : undefined
          );
          notify(`Lote → ${statusLabel(to)}`);
          return true;
        }}
        bulkActions={[
          {
            label: "Marcar seleção",
            onClick: (ids) => {
              setSelectedIds(ids);
              notify(`${ids.length} lote(s) selecionado(s) para alterar status`);
            },
          },
        ]}
        exportName="lotes"
        listColumns={[
          {
            key: "emp",
            label: "Empreendimento",
            filter: { type: "text" },
            getValue: (l) => l.empNome,
          },
          {
            key: "ql",
            label: "Q/L",
            filter: { type: "text" },
            getValue: (l) => `${l.quadra}/${l.lote}`,
          },
          {
            key: "area",
            label: "Área",
            filter: { type: "range" },
            getValue: (l) => l.area,
            render: (l) => `${l.area} m²`,
          },
          {
            key: "valor",
            label: "Valor",
            filter: { type: "range" },
            getValue: (l) => l.valor,
            render: (l) => formatBRL(l.valor),
          },
          {
            key: "status",
            label: "Status",
            filter: {
              type: "status",
              options: LOT_COLS.map((c) => ({
                value: c.id,
                label: c.label,
              })),
            },
            getValue: (l) => l.status,
            render: (l) => (
              <StatusPill tone={STATUS_TONE[l.status]}>
                {statusLabel(l.status)}
              </StatusPill>
            ),
          },
          {
            key: "comprador",
            label: "Comprador",
            filter: { type: "text" },
            getValue: (l) => l.compradorNome ?? "",
          },
        ]}
      />

      <DetailSheet
        open={!!selected && !openLotEdit}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected ? `${selected.quadra}/${selected.lote}` : ""}
      >
        {selected ? (
          <div className="space-y-2">
            <DetailRow label="Empreendimento" value={selected.empNome} />
            <DetailRow label="Status" value={selected.status} />
            <DetailRow label="Área" value={`${selected.area} m²`} />
            <DetailRow label="Valor" value={formatBRL(selected.valor)} />
            <DetailRow label="m²" value={formatBRL(selected.valorM2)} />
            <DetailRow label="Matrícula" value={selected.matricula ?? "—"} />
            <DetailRow
              label="Travas"
              value={`venda ${selected.bloqueiaVenda ? "sim" : "não"} · fin. ${selected.bloqueiaFinanceiro ? "sim" : "não"}`}
            />
            <DetailRow label="Comprador" value={selected.compradorNome ?? "—"} />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setLotForm({
                    quadra: selected.quadra,
                    lote: selected.lote,
                    area: selected.area,
                    valor: selected.valor,
                    status: selected.status,
                    matricula: selected.matricula ?? "",
                    frente: selected.frente ?? "",
                    fundo: selected.fundo ?? "",
                    direita: selected.direita ?? "",
                    esquerda: selected.esquerda ?? "",
                  });
                  setOpenLotEdit(true);
                }}
              >
                Editar lote
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  updateLot(selected.id, {
                    valor: selected.valor + 5000,
                    valorM2:
                      Math.round(
                        ((selected.valor + 5000) / selected.area) * 100
                      ) / 100,
                  });
                  notify("Valor atualizado (+R$ 5.000)");
                  setSelected(null);
                }}
              >
                + R$ 5.000 no valor
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  const res = removeLot(selected.id);
                  if (!res.ok) {
                    notify("Não excluído", res.reason ?? "");
                    return;
                  }
                  notify("Lote excluído", `${selected.quadra}/${selected.lote}`);
                  setSelected(null);
                }}
              >
                Excluir lote
              </Button>
            </div>
          </div>
        ) : null}
      </DetailSheet>

      <FormDialog
        open={openLotEdit}
        onOpenChange={(o) => {
          setOpenLotEdit(o);
          if (!o) setSelected(null);
        }}
        title={
          selected
            ? `Editar lote ${selected.quadra}/${selected.lote}`
            : "Editar lote"
        }
        onSubmit={() => {
          if (!selected) return;
          if (!lotForm.quadra.trim() || !lotForm.lote.trim()) {
            notify("Quadra e lote obrigatórios");
            return;
          }
          const area = Number(lotForm.area) || 0;
          const valor = Number(lotForm.valor) || 0;
          updateLot(selected.id, {
            quadra: lotForm.quadra.trim(),
            lote: lotForm.lote.trim(),
            area,
            valor,
            valorM2: area > 0 ? Math.round((valor / area) * 100) / 100 : 0,
            status: lotForm.status,
            matricula: lotForm.matricula || undefined,
            frente: lotForm.frente || undefined,
            fundo: lotForm.fundo || undefined,
            direita: lotForm.direita || undefined,
            esquerda: lotForm.esquerda || undefined,
          });
          if (lotForm.status !== selected.status) {
            changeLotStatus(
              [selected.id],
              lotForm.status,
              "Edição manual do cadastro",
              lotForm.status === "reservado"
                ? { validadeReservaDias }
                : undefined
            );
          }
          notify("Lote atualizado", `${lotForm.quadra}/${lotForm.lote}`);
          setOpenLotEdit(false);
          setSelected(null);
        }}
      >
        <Field label="Quadra *">
          <Input
            value={lotForm.quadra}
            onChange={(e) =>
              setLotForm({ ...lotForm, quadra: e.target.value })
            }
          />
        </Field>
        <Field label="Lote *">
          <Input
            value={lotForm.lote}
            onChange={(e) => setLotForm({ ...lotForm, lote: e.target.value })}
          />
        </Field>
        <Field label="Área (m²)">
          <Input
            type="number"
            value={lotForm.area}
            onChange={(e) =>
              setLotForm({ ...lotForm, area: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Valor">
          <Input
            type="number"
            value={lotForm.valor}
            onChange={(e) =>
              setLotForm({ ...lotForm, valor: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Status">
          <select
            className={fieldControlClass}
            value={lotForm.status}
            onChange={(e) =>
              setLotForm({
                ...lotForm,
                status: e.target.value as LotStatus,
              })
            }
          >
            {LOT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Matrícula">
          <Input
            value={lotForm.matricula}
            onChange={(e) =>
              setLotForm({ ...lotForm, matricula: e.target.value })
            }
          />
        </Field>
        <Field label="Frente">
          <Input
            value={lotForm.frente}
            onChange={(e) =>
              setLotForm({ ...lotForm, frente: e.target.value })
            }
          />
        </Field>
        <Field label="Fundo">
          <Input
            value={lotForm.fundo}
            onChange={(e) => setLotForm({ ...lotForm, fundo: e.target.value })}
          />
        </Field>
        <Field label="Direita">
          <Input
            value={lotForm.direita}
            onChange={(e) =>
              setLotForm({ ...lotForm, direita: e.target.value })
            }
          />
        </Field>
        <Field label="Esquerda">
          <Input
            value={lotForm.esquerda}
            onChange={(e) =>
              setLotForm({ ...lotForm, esquerda: e.target.value })
            }
          />
        </Field>
      </FormDialog>

      <FormDialog
        open={openEmp}
        onOpenChange={(o) => {
          setOpenEmp(o);
          if (!o) setEditingEmpId(null);
        }}
        title={
          editingEmpId ? "Editar empreendimento" : "Novo empreendimento"
        }
        onSubmit={() => {
          if (!empForm.codigo || !empForm.nome) {
            notify("Código e nome obrigatórios");
            return;
          }
          if (!empForm.nucleoId.trim() || !empForm.bairro.trim()) {
            notify("Selecione o bairro / núcleo");
            return;
          }
          {
            const cartorioErr = validateCartorioObrigatorio({
              cartorioId: empForm.cartorioId,
              cartorioNome: empForm.cartorioNome,
            });
            if (cartorioErr) {
              notify("Cartório obrigatório", cartorioErr);
              return;
            }
          }
          const {
            latitude: latStr,
            longitude: lngStr,
            endereco: enderecoStr,
            ...empRest
          } = empForm;
          const lat = latStr.trim() === "" ? undefined : Number(latStr);
          const lng = lngStr.trim() === "" ? undefined : Number(lngStr);
          const patch = {
            ...empRest,
            endereco: enderecoStr.trim() || undefined,
            latitude:
              lat !== undefined && Number.isFinite(lat) ? lat : undefined,
            longitude:
              lng !== undefined && Number.isFinite(lng) ? lng : undefined,
            bairro: empForm.bairro.trim() || undefined,
            nucleoId: empForm.nucleoId.trim() || undefined,
            cartorioId: empForm.cartorioId.trim() || undefined,
            cartorioNome: empForm.cartorioNome.trim() || undefined,
            cartorioCidade: empForm.cartorioCidade.trim() || undefined,
            cartorioUf: empForm.cartorioUf.trim() || undefined,
            cartorioContato: empForm.cartorioContato.trim() || undefined,
            certidaoNumero: empForm.certidaoNumero.trim() || undefined,
            certidaoData: empForm.certidaoData.trim() || undefined,
            certidaoTipo: empForm.certidaoTipo.trim() || undefined,
            certidaoObs: empForm.certidaoObs.trim() || undefined,
          };
          if (editingEmpId) {
            updateDevelopment(editingEmpId, patch);
            notify("Empreendimento atualizado", empForm.nome);
          } else {
            addDevelopment({
              ...patch,
              empresaId:
                selectedId === "todas"
                  ? developments[0]?.empresaId
                  : selectedId,
            });
            notify("Empreendimento criado", empForm.nome);
          }
          setOpenEmp(false);
          setEditingEmpId(null);
        }}
      >
        <Field label="Código *">
          <Input
            value={empForm.codigo}
            onChange={(e) => setEmpForm({ ...empForm, codigo: e.target.value })}
            required
          />
        </Field>
        <Field label="Nome *">
          <Input
            value={empForm.nome}
            onChange={(e) => setEmpForm({ ...empForm, nome: e.target.value })}
            required
          />
        </Field>
        <Field label="Modalidade *">
          <select
            className={fieldControlClass}
            value={empForm.modalidade}
            onChange={(e) =>
              setEmpForm({
                ...empForm,
                modalidade: e.target.value as Development["modalidade"],
                tipo:
                  e.target.value === "regularizacao"
                    ? "regularizacao"
                    : "loteamento",
              })
            }
            required
          >
            <option value="loteamento">Loteamento</option>
            <option value="regularizacao">Regularização</option>
            <option value="loteamento_e_regularizacao">
              Loteamento e regularização
            </option>
          </select>
        </Field>
        <Field label="Bairro / núcleo *">
          <select
            className={fieldControlClass}
            value={empForm.nucleoId}
            required
            onChange={(e) => {
              const id = e.target.value;
              const n = nucleos.find((x) => x.id === id);
              if (!n) {
                setEmpForm({
                  ...empForm,
                  nucleoId: "",
                  bairro: "",
                });
                return;
              }
              setEmpForm({
                ...empForm,
                nucleoId: n.id,
                bairro: nucleoBairroNome(n),
                cidade: n.cidade || empForm.cidade,
                uf: n.estado || empForm.uf,
              });
            }}
          >
            <option value="">Selecione o núcleo (bairro)…</option>
            {nucleos.map((n) => (
              <option key={n.id} value={n.id}>
                {nucleoBairroNome(n)} · {n.cidade}/{n.estado}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            Cadastro em{" "}
            <a className="underline" href="/nucleos">
              /nucleos
            </a>
            . Núcleo = bairro em todo o sistema.
          </p>
        </Field>
        <Field label="Cidade">
          <Input
            value={empForm.cidade}
            onChange={(e) => setEmpForm({ ...empForm, cidade: e.target.value })}
          />
        </Field>
        <Field label="UF">
          <Input
            value={empForm.uf}
            onChange={(e) => setEmpForm({ ...empForm, uf: e.target.value })}
            maxLength={2}
          />
        </Field>
        <Field label="CEP">
          <Input
            value={empForm.cep}
            onChange={(e) => setEmpForm({ ...empForm, cep: e.target.value })}
          />
        </Field>
        <Field label="Endereço / referência (mapa)">
          <Input
            value={empForm.endereco}
            onChange={(e) =>
              setEmpForm({ ...empForm, endereco: e.target.value })
            }
            placeholder="Rua, número ou ponto de referência"
          />
        </Field>
        <Field label="Latitude (opcional)">
          <Input
            value={empForm.latitude}
            onChange={(e) =>
              setEmpForm({ ...empForm, latitude: e.target.value })
            }
            placeholder="-22.9056"
            inputMode="decimal"
          />
        </Field>
        <Field label="Longitude (opcional)">
          <Input
            value={empForm.longitude}
            onChange={(e) =>
              setEmpForm({ ...empForm, longitude: e.target.value })
            }
            placeholder="-47.0608"
            inputMode="decimal"
          />
        </Field>
        <div className="col-span-full">
          <EmpreendimentoMap
            location={{
              nome: empForm.nome,
              endereco: empForm.endereco,
              bairro: empForm.bairro,
              cidade: empForm.cidade,
              uf: empForm.uf,
              cep: empForm.cep,
              latitude: empForm.latitude,
              longitude: empForm.longitude,
            }}
          />
        </div>
        <Field label="Área total">
          <Input
            value={empForm.areaTotal}
            onChange={(e) =>
              setEmpForm({ ...empForm, areaTotal: e.target.value })
            }
          />
        </Field>
        <Field label="Código município">
          <Input
            value={empForm.codigoMunicipio}
            onChange={(e) =>
              setEmpForm({ ...empForm, codigoMunicipio: e.target.value })
            }
          />
        </Field>
        <Field label="Padrão">
          <Input
            value={empForm.padrao}
            onChange={(e) => setEmpForm({ ...empForm, padrao: e.target.value })}
          />
        </Field>
        <Field label="Confrontação">
          <Input
            value={empForm.confrontacao}
            onChange={(e) =>
              setEmpForm({ ...empForm, confrontacao: e.target.value })
            }
          />
        </Field>
        <Field label="Matrícula (número)">
          <Input
            value={empForm.matriculaNumero}
            onChange={(e) =>
              setEmpForm({ ...empForm, matriculaNumero: e.target.value })
            }
          />
        </Field>
        <Field label="Matrícula (data)">
          <Input
            type="date"
            value={empForm.matriculaData}
            onChange={(e) =>
              setEmpForm({ ...empForm, matriculaData: e.target.value })
            }
          />
        </Field>

        <p className="col-span-full mt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Cartório e certidão (cartório obrigatório)
        </p>
        <Field label="Cartório cadastrado *">
          <SearchSelect
            value={empForm.cartorioId}
            onChange={(id) => {
              const c = state.cartorios.find((x) => x.id === id);
              setEmpForm({
                ...empForm,
                cartorioId: id,
                cartorioNome: c?.nome ?? empForm.cartorioNome,
                cartorioCidade: c?.cidade ?? empForm.cartorioCidade,
                cartorioUf: c?.uf ?? empForm.cartorioUf,
                cartorioContato: c?.contato ?? empForm.cartorioContato,
              });
            }}
            placeholder="Buscar cartório (obrigatório)…"
            options={state.cartorios.map((c) => ({
              value: c.id,
              label: `${c.nome} · ${c.cidade}/${c.uf}`,
            }))}
          />
        </Field>
        <Field label="Cartório (nome) *">
          <Input
            value={empForm.cartorioNome}
            onChange={(e) =>
              setEmpForm({ ...empForm, cartorioNome: e.target.value })
            }
            required
            placeholder="Obrigatório se não houver cartório na lista"
          />
        </Field>
        <Field label="Cartório (cidade)">
          <Input
            value={empForm.cartorioCidade}
            onChange={(e) =>
              setEmpForm({ ...empForm, cartorioCidade: e.target.value })
            }
          />
        </Field>
        <Field label="Cartório (UF)">
          <Input
            value={empForm.cartorioUf}
            onChange={(e) =>
              setEmpForm({ ...empForm, cartorioUf: e.target.value })
            }
            maxLength={2}
          />
        </Field>
        <Field label="Cartório (contato)">
          <Input
            value={empForm.cartorioContato}
            onChange={(e) =>
              setEmpForm({ ...empForm, cartorioContato: e.target.value })
            }
          />
        </Field>
        <Field label="Certidão (número)">
          <Input
            value={empForm.certidaoNumero}
            onChange={(e) =>
              setEmpForm({ ...empForm, certidaoNumero: e.target.value })
            }
          />
        </Field>
        <Field label="Certidão (tipo)">
          <Input
            value={empForm.certidaoTipo}
            onChange={(e) =>
              setEmpForm({ ...empForm, certidaoTipo: e.target.value })
            }
            placeholder="Ex.: ônus, inteiro teor, CRF"
          />
        </Field>
        <Field label="Certidão (data)">
          <Input
            type="date"
            value={empForm.certidaoData}
            onChange={(e) =>
              setEmpForm({ ...empForm, certidaoData: e.target.value })
            }
          />
        </Field>
        <Field label="Certidão (observações)">
          <Input
            value={empForm.certidaoObs}
            onChange={(e) =>
              setEmpForm({ ...empForm, certidaoObs: e.target.value })
            }
          />
        </Field>

        <Field label="Administradora (razão)">
          <Input
            value={empForm.adminRazao}
            onChange={(e) =>
              setEmpForm({ ...empForm, adminRazao: e.target.value })
            }
          />
        </Field>
        <Field label="Administradora (CNPJ)">
          <Input
            value={empForm.adminCnpj}
            onChange={(e) =>
              setEmpForm({ ...empForm, adminCnpj: e.target.value })
            }
          />
        </Field>
        <Field label="Administradora (endereço)">
          <Input
            value={empForm.adminEndereco}
            onChange={(e) =>
              setEmpForm({ ...empForm, adminEndereco: e.target.value })
            }
          />
        </Field>
        <Field label="Conta corrente padrão">
          <Input
            value={empForm.contaCorrentePadrao}
            onChange={(e) =>
              setEmpForm({ ...empForm, contaCorrentePadrao: e.target.value })
            }
          />
        </Field>
        <Field label="Recado padrão">
          <Input
            value={empForm.recadoPadrao}
            onChange={(e) =>
              setEmpForm({ ...empForm, recadoPadrao: e.target.value })
            }
          />
        </Field>
        <Field label="Observações">
          <Input
            value={empForm.observacoes}
            onChange={(e) =>
              setEmpForm({ ...empForm, observacoes: e.target.value })
            }
          />
        </Field>
        {editingEmpId ? (
          <div className="flex justify-between gap-2 border-t border-linha pt-3">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                if (
                  !window.confirm(
                    "Excluir este empreendimento e seus lotes sem contrato?"
                  )
                ) {
                  return;
                }
                const res = removeDevelopment(editingEmpId);
                if (!res.ok) {
                  notify("Não excluído", res.reason ?? "");
                  return;
                }
                notify("Empreendimento excluído", empForm.nome);
                setOpenEmp(false);
                setEditingEmpId(null);
              }}
            >
              Excluir empreendimento
            </Button>
          </div>
        ) : null}
      </FormDialog>

      <FormDialog
        open={openMass}
        onOpenChange={setOpenMass}
        title="Gerar lotes em massa"
        onSubmit={() => {
          const n = massGenerateLots(mass);
          notify(n ? `${n} lotes gerados` : "Nada gerado");
          setOpenMass(false);
        }}
      >
        <Field label="Empreendimento">
          <select
            className={fieldControlClass}
            value={mass.developmentId}
            onChange={(e) => setMass({ ...mass, developmentId: e.target.value })}
          >
            {developments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Quadra">
          <Input
            value={mass.quadra}
            onChange={(e) => setMass({ ...mass, quadra: e.target.value })}
          />
        </Field>
        <Field label="Quantidade">
          <Input
            type="number"
            value={mass.qtd}
            onChange={(e) =>
              setMass({ ...mass, qtd: Number(e.target.value) || 1 })
            }
          />
        </Field>
        <Field label="Área (m²)">
          <Input
            type="number"
            value={mass.area}
            onChange={(e) =>
              setMass({ ...mass, area: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Valor">
          <Input
            type="number"
            value={mass.valor}
            onChange={(e) =>
              setMass({ ...mass, valor: Number(e.target.value) || 0 })
            }
          />
        </Field>
      </FormDialog>

      <FormDialog
        open={openStatus}
        onOpenChange={setOpenStatus}
        title="Alterar status de lotes"
        onSubmit={() => {
          if (!selectedIds.length) {
            notify("Selecione lotes na grade");
            return;
          }
          changeLotStatus(
            selectedIds,
            statusForm.status,
            statusForm.motivo || "Alteração manual",
            statusForm.status === "reservado"
              ? { validadeReservaDias }
              : undefined
          );
          notify(`${selectedIds.length} lote(s) → ${statusForm.status}`);
          setSelectedIds([]);
          setOpenStatus(false);
        }}
      >
        <p className="text-sm text-muted-foreground">
          {selectedIds.length} selecionado(s)
        </p>
        <Field label="Novo status">
          <select
            className={fieldControlClass}
            value={statusForm.status}
            onChange={(e) =>
              setStatusForm({
                ...statusForm,
                status: e.target.value as LotStatus,
              })
            }
          >
            {(
              LOT_STATUSES
            ).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Motivo">
          <Input
            value={statusForm.motivo}
            onChange={(e) =>
              setStatusForm({ ...statusForm, motivo: e.target.value })
            }
          />
        </Field>
      </FormDialog>

      <FormDialog
        open={openImport}
        onOpenChange={setOpenImport}
        title="Importar quadras e lotes (C04)"
        onSubmit={() => {
          if (!importPreview || !importDevId) {
            notify("Carregue o arquivo e selecione o empreendimento");
            return;
          }
          const valid = importPreview.rows.filter((r) => r.erros.length === 0);
          if (!valid.length) {
            notify("Nenhuma linha válida");
            return;
          }
          const res = importLots(
            importDevId,
            valid.map((r) => ({
              quadra: r.quadra,
              lote: r.lote,
              area: r.area,
              precoVista: r.precoVista,
              situacao: r.situacao,
              frente: r.frente,
              fundo: r.fundo,
              direita: r.direita,
              esquerda: r.esquerda,
              matricula: r.matricula,
            }))
          );
          notify(
            "Importação concluída",
            `${res.created} criados · ${res.updated} atualizados · ${importPreview.comErro} com erro`
          );
          setOpenImport(false);
          setImportPreview(null);
        }}
      >
        <Field label="Empreendimento">
          <select
            className={fieldControlClass}
            value={importDevId}
            onChange={(e) => setImportDevId(e.target.value)}
          >
            {developments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              downloadTextTemplate("modelo-lotes.csv", modeloLotesCsv())
            }
          >
            Baixar modelo CSV
          </Button>
          <label className="inline-flex cursor-pointer">
            <input
              type="file"
              accept=".csv,.txt,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                let text = "";
                if (/\.xlsx$/i.test(f.name)) {
                  const parsed = await parseXlsxBytes(await f.arrayBuffer());
                  if (!parsed.ok) {
                    notify("XLSX inválido", parsed.erro ?? "");
                    return;
                  }
                  text = xlsxRowsToCsv(parsed.rows);
                } else {
                  text = await f.text();
                }
                const preview = parseLotesCsv(text);
                setImportPreview(preview);
                notify(
                  preview.ok ? "Conferência OK" : "Há erros na conferência",
                  `${f.name} · ${preview.criaveis} ok · ${preview.comErro} com erro`
                );
              }}
            />
            <span className="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent">
              Enviar CSV/XLSX
            </span>
          </label>
        </div>
        {importPreview ? (
          <div className="max-h-48 overflow-auto rounded-md border border-border text-xs">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="p-1">Linha</th>
                  <th className="p-1">Quadra/Lote</th>
                  <th className="p-1">Área</th>
                  <th className="p-1">Situação</th>
                  <th className="p-1">Erros</th>
                </tr>
              </thead>
              <tbody>
                {importPreview.rows.map((r) => (
                  <tr key={r.line} className="border-b border-border/60">
                    <td className="p-1">{r.line}</td>
                    <td className="p-1">
                      {r.quadra}/{r.lote}
                    </td>
                    <td className="p-1">{r.area}</td>
                    <td className="p-1">{r.situacao}</td>
                    <td className="p-1 text-rose-700">
                      {r.erros.join("; ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Nada é gravado antes da confirmação. Use o modelo CSV (Excel
            compatível).
          </p>
        )}
      </FormDialog>
    </div>
  );
}

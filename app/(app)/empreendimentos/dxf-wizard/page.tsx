"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ModuleHeader,
  ModuleSection,
} from "@/components/app/ModulePage";
import {
  Field,
  fieldControlClass,
  notify,
} from "@/components/app/ModuleToolkit";
import { DxfViewer } from "@/components/dxf/DxfViewer";
import {
  labelsToLotRows,
  type DxfTextLabel,
} from "@/lib/dxf/match-lote";
import { formatBRL } from "@/lib/masks/br";
import { saveDxfBlob } from "@/lib/persist/dxf-blob";
import { useCarteira } from "@/lib/store/carteira-store";
import type { LotStatus } from "@/lib/domain/carteira-types";

type Step = 1 | 2 | 3;

const DXF_SAMPLES = [
  { id: "MIRASSOL.dxf", label: "Mirassol (amostra)" },
  { id: "PARQUE_UNIS.dxf", label: "Parque Unis (amostra)" },
];

export default function DxfWizardPage() {
  const { state, importLots, updateDevelopment } = useCarteira();
  const [step, setStep] = useState<Step>(1);
  const [devId, setDevId] = useState(state.developments[0]?.id ?? "");
  const [dxfSample, setDxfSample] = useState("MIRASSOL.dxf");
  const [dxfFile, setDxfFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [bufferName, setBufferName] = useState<string | null>(null);
  const [labels, setLabels] = useState<DxfTextLabel[]>([]);
  const [areaPadrao, setAreaPadrao] = useState(250);
  const [precoPadrao, setPrecoPadrao] = useState(120000);
  const [busy, setBusy] = useState(false);

  const emp = state.developments.find((d) => d.id === devId);
  const preview = useMemo(
    () =>
      labelsToLotRows(labels, {
        area: areaPadrao || 250,
        precoVista: precoPadrao || 120000,
      }),
    [labels, areaPadrao, precoPadrao]
  );

  const onLabels = useCallback((labs: DxfTextLabel[]) => {
    setLabels(labs);
  }, []);

  async function gerarLotes() {
    if (!emp) {
      notify("Selecione o empreendimento");
      return;
    }
    if (!preview.length) {
      notify("Nenhum lote detectado no DXF");
      return;
    }
    setBusy(true);
    try {
      const nome = dxfFile?.name || bufferName || dxfSample;
      if (buffer) {
        await saveDxfBlob(devId, nome, buffer);
      }
      updateDevelopment(devId, {
        plantaDxf: {
          nome,
          sampleId: buffer || dxfFile ? undefined : dxfSample,
          savedAt: new Date().toISOString(),
          labelCount: labels.length,
        },
      });
      const res = importLots(
        devId,
        preview.map((r) => ({
          ...r,
          situacao: "disponivel" as LotStatus,
        }))
      );
      notify(
        "Lotes gerados a partir do DXF",
        `${emp.nome}: +${res.created} criados · ${res.updated} atualizados · ${preview.length} no preview`
      );
      setStep(3);
    } catch (err) {
      notify(
        "Falha ao gerar lotes",
        err instanceof Error ? err.message : "erro"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Wizard: importar DXF → lotes"
        description="1) Empreendimento · 2) DXF e preview · 3) Gerar cadastro de lotes."
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link href="/empreendimentos/planta">Planta</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/empreendimentos">Empreendimentos</Link>
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-2 text-sm">
        {([1, 2, 3] as Step[]).map((s) => (
          <span
            key={s}
            className={
              step === s
                ? "rounded-md bg-brand-orange px-3 py-1 font-medium text-white"
                : "rounded-md border border-linha px-3 py-1 text-muted-foreground"
            }
          >
            {s === 1
              ? "1. Empreendimento"
              : s === 2
                ? "2. DXF + preview"
                : "3. Resultado"}
          </span>
        ))}
      </div>

      {step === 1 ? (
        <ModuleSection title="Escolha o empreendimento">
          <Field label="Empreendimento *">
            <select
              className={fieldControlClass}
              value={devId}
              onChange={(e) => setDevId(e.target.value)}
            >
              {state.developments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                  {d.plantaDxf ? " · planta salva" : ""}
                </option>
              ))}
            </select>
          </Field>
          <div className="mt-4">
            <Button
              size="sm"
              disabled={!devId}
              onClick={() => setStep(2)}
            >
              Continuar → DXF
            </Button>
          </div>
        </ModuleSection>
      ) : null}

      {step === 2 ? (
        <>
          <ModuleSection title={`DXF · ${emp?.nome ?? ""}`}>
            <div className="mb-3 flex flex-wrap gap-2">
              {DXF_SAMPLES.map((s) => (
                <Button
                  key={s.id}
                  size="sm"
                  variant={
                    !dxfFile && !buffer && dxfSample === s.id
                      ? "default"
                      : "outline"
                  }
                  onClick={() => {
                    setDxfFile(null);
                    setBuffer(null);
                    setBufferName(null);
                    setDxfSample(s.id);
                    setLabels([]);
                  }}
                >
                  {s.label}
                </Button>
              ))}
              <Button size="sm" variant="ghost" onClick={() => setStep(1)}>
                ← Trocar empreendimento
              </Button>
            </div>
            <p className="mb-2 text-sm text-muted-foreground">
              Abra um DXF no viewer (botão Abrir DXF…) ou use uma amostra. Os
              rótulos das camadas Número/Identificação viram preview de lotes.
            </p>
            <DxfViewer
              arquivo={dxfFile || buffer ? null : dxfSample}
              file={dxfFile}
              buffer={dxfFile ? null : buffer}
              bufferName={bufferName}
              height="56vh"
              title={`Wizard DXF · ${dxfFile?.name || bufferName || dxfSample}`}
              onLabels={onLabels}
              onLoaded={({ name, buffer: buf }) => {
                setBuffer(buf);
                setBufferName(name);
                if (/MIRASSOL|PARQUE_UNIS/i.test(name)) {
                  setDxfSample(name);
                } else {
                  setDxfFile(null);
                }
              }}
            />
          </ModuleSection>

          <ModuleSection title="Preview dos lotes a gerar">
            <div className="mb-3 grid gap-3 sm:grid-cols-2">
              <Field label="Área padrão (m²)">
                <Input
                  type="number"
                  value={areaPadrao || ""}
                  onChange={(e) =>
                    setAreaPadrao(Number(e.target.value) || 0)
                  }
                />
              </Field>
              <Field label="Preço à vista padrão">
                <Input
                  type="number"
                  value={precoPadrao || ""}
                  onChange={(e) =>
                    setPrecoPadrao(Number(e.target.value) || 0)
                  }
                />
              </Field>
            </div>
            <p className="mb-2 text-sm text-muted-foreground">
              {labels.length} rótulos DXF · {preview.length} lotes únicos no
              preview
            </p>
            <div className="max-h-64 overflow-auto rounded-md border border-linha">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-muted/60">
                  <tr>
                    <th className="px-3 py-2">Quadra</th>
                    <th className="px-3 py-2">Lote</th>
                    <th className="px-3 py-2">Área</th>
                    <th className="px-3 py-2">Preço</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 200).map((r) => (
                    <tr
                      key={`${r.quadra}/${r.lote}`}
                      className="border-t border-linha/70"
                    >
                      <td className="px-3 py-1.5">{r.quadra}</td>
                      <td className="px-3 py-1.5">{r.lote}</td>
                      <td className="px-3 py-1.5">{r.area}</td>
                      <td className="px-3 py-1.5">
                        {formatBRL(r.precoVista)}
                      </td>
                    </tr>
                  ))}
                  {!preview.length ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-4 text-muted-foreground"
                      >
                        Nenhum lote detectado ainda — abra o DXF e aguarde os
                        rótulos.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={busy || !preview.length}
                onClick={() => void gerarLotes()}
              >
                {busy ? "Gerando…" : `Gerar ${preview.length} lotes`}
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/empreendimentos/planta`}>Ir à planta</Link>
              </Button>
            </div>
          </ModuleSection>
        </>
      ) : null}

      {step === 3 ? (
        <ModuleSection title="Concluído">
          <p className="text-sm text-ink">
            Lotes gerados para <strong>{emp?.nome}</strong>. A planta DXF ficou
            vinculada ao empreendimento.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" asChild>
              <Link href="/empreendimentos">Ver empreendimentos</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/empreendimentos/planta">Abrir planta</Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setStep(2);
                setLabels([]);
              }}
            >
              Importar outro DXF
            </Button>
          </div>
        </ModuleSection>
      ) : null}
    </div>
  );
}

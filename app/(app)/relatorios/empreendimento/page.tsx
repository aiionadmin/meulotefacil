"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModuleHeader,
  ModuleSection,
  StatusPill,
} from "@/components/app/ModulePage";
import { Field, notify } from "@/components/app/ModuleToolkit";
import { SearchSelect } from "@/components/app/SearchSelect";
import { useCarteira } from "@/lib/store/carteira-store";
import { useFase1 } from "@/lib/store/fase1-store";
import { useEmpresa } from "@/lib/empresa/context";
import {
  EMITENTES,
  EMITENTES_LIST,
  formatEmitenteEndereco,
  resolveEmitente,
  type EmitenteId,
} from "@/lib/export/emitentes";
import {
  DEFAULT_EMP_REPORT_SECTIONS,
  EMP_REPORT_SECTION_LABELS,
  buildEmpreendimentoReportHtml,
  openEmpreendimentoReport,
  type EmpReportSections,
  type EmpresaReportInfo,
} from "@/lib/export/empreendimento-report";

const STEPS = ["Emitente", "Empreendimento", "Conteúdo", "Gerar"] as const;

export default function RelatorioEmpreendimentoPage() {
  const { state } = useCarteira();
  const { state: f1 } = useFase1();
  const { selected: empSel, empresas } = useEmpresa();
  const [step, setStep] = useState(0);
  const [emitenteId, setEmitenteId] = useState<EmitenteId>(() => {
    const bySel = resolveEmitente(empSel?.cnpj ?? f1.organization.cnpj);
    return bySel.id;
  });
  const [devId, setDevId] = useState(state.developments[0]?.id ?? "");
  const [sections, setSections] = useState<EmpReportSections>({
    ...DEFAULT_EMP_REPORT_SECTIONS,
  });

  const emitente = EMITENTES[emitenteId];
  const development = state.developments.find((d) => d.id === devId);
  const lots = useMemo(
    () => state.lots.filter((l) => l.developmentId === devId),
    [state.lots, devId]
  );
  const contracts = useMemo(
    () => state.contracts.filter((c) => c.developmentId === devId),
    [state.contracts, devId]
  );
  const socios = useMemo(
    () => state.socios.filter((s) => s.developmentId === devId),
    [state.socios, devId]
  );

  /** Dados formais: catálogo emitente + overrides da org/seleção. */
  const empresa: EmpresaReportInfo = useMemo(() => {
    const org = f1.organization;
    const fromList = empresas.find(
      (e) => e.cnpj.replace(/\D/g, "") === emitente.cnpjDigits
    );
    if (emitenteId === "mlf") {
      return {
        razaoSocial: org.razaoSocial || emitente.razaoSocial,
        nomeFantasia: org.nomeFantasia || emitente.nomeFantasia,
        cnpj: org.cnpj || emitente.cnpj,
        telefone: org.telefone || emitente.telefone,
        email: org.email || emitente.email,
        endereco: org.endereco || emitente.endereco,
        bairro: org.bairro || emitente.bairro,
        cidade: org.cidade || emitente.cidade,
        uf: org.uf || emitente.uf,
        cep: org.cep || emitente.cep,
        inscricaoEstadual: org.inscricaoEstadual,
      };
    }
    return {
      razaoSocial: fromList?.razaoSocial ?? emitente.razaoSocial,
      nomeFantasia: fromList?.nome ?? emitente.nomeFantasia,
      cnpj: fromList?.cnpj ?? emitente.cnpj,
      telefone: fromList?.telefone ?? emitente.telefone,
      email: fromList?.email ?? emitente.email,
      endereco: fromList?.endereco ?? emitente.endereco,
      bairro: fromList?.bairro ?? emitente.bairro,
      cidade: fromList?.cidade ?? emitente.cidade,
      uf: fromList?.uf ?? emitente.uf,
      cep: fromList?.cep ?? emitente.cep,
    };
  }, [emitente, emitenteId, empresas, f1.organization]);

  const selectedCount = (
    Object.keys(sections) as (keyof EmpReportSections)[]
  ).filter((k) => sections[k]).length;

  function gerar() {
    if (!development) {
      notify("Selecione um empreendimento");
      return;
    }
    if (selectedCount === 0) {
      notify("Marque ao menos uma seção");
      return;
    }
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const html = buildEmpreendimentoReportHtml({
      empresa,
      development,
      lots,
      contracts,
      socios,
      sections,
      logoUrl: sections.logo
        ? `${origin}${emitente.logoDocumentoPath}`
        : undefined,
    });
    openEmpreendimentoReport(
      html,
      `relatorio-${emitenteId}-${development.codigo.toLowerCase()}`
    );
    notify("Relatório gerado", "Janela de impressão / PDF do navegador");
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Relatório do empreendimento"
        description="Wizard: emitente (empresa + logo por CNPJ), empreendimento, seções e PDF formatado."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link href="/relatorios">Central de relatórios</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <StatusPill
            key={label}
            tone={i === step ? "info" : i < step ? "ok" : "neutral"}
          >
            {i + 1}. {label}
          </StatusPill>
        ))}
      </div>

      {step === 0 ? (
        <ModuleSection title="1 · Empresa emitente">
          <p className="mb-3 text-sm text-muted-foreground">
            A logomarca segue o CNPJ do emitente (MLF ou LA). Dados completos
            entram no cabeçalho do documento formal.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {EMITENTES_LIST.map((e) => {
              const active = e.id === emitenteId;
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setEmitenteId(e.id)}
                  className={`rounded-sm border px-3 py-3 text-left transition ${
                    active
                      ? "border-brand-orange bg-paper"
                      : "border-linha hover:border-brand-orange/50"
                  }`}
                >
                  <div className="mb-2 flex h-12 items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={e.logoDocumentoPath}
                      alt={e.nomeFantasia}
                      className="max-h-12 w-auto object-contain"
                    />
                  </div>
                  <div className="text-sm font-medium text-ink">
                    {e.razaoSocial}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    CNPJ {e.cnpj}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatEmitenteEndereco(e)}
                  </div>
                </button>
              );
            })}
          </div>
        </ModuleSection>
      ) : null}

      {step === 1 ? (
        <ModuleSection title="2 · Empreendimento">
          <Field label="Empreendimento">
            <SearchSelect
              value={devId}
              onChange={setDevId}
              placeholder="Buscar empreendimento…"
              options={state.developments.map((d) => ({
                value: d.id,
                label: `${d.nome} · ${d.cidade}/${d.uf}`,
              }))}
            />
          </Field>
          {development ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {development.bairro
                ? `Bairro/núcleo: ${development.bairro} · `
                : ""}
              {lots.length} lotes · {contracts.length} contratos
              {development.cartorioNome
                ? ` · Cartório: ${development.cartorioNome}`
                : ""}
            </p>
          ) : null}
        </ModuleSection>
      ) : null}

      {step === 2 ? (
        <ModuleSection title="3 · O que aparece no relatório">
          <p className="mb-3 text-sm text-muted-foreground">
            Marque as seções. Logo = marca do emitente selecionado (
            {emitente.nomeFantasia}).
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              Object.keys(EMP_REPORT_SECTION_LABELS) as (keyof EmpReportSections)[]
            ).map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-start gap-2 rounded-sm border border-linha px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={sections[key]}
                  onChange={(e) =>
                    setSections((s) => ({ ...s, [key]: e.target.checked }))
                  }
                />
                <span>{EMP_REPORT_SECTION_LABELS[key]}</span>
              </label>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => setSections({ ...DEFAULT_EMP_REPORT_SECTIONS })}
            >
              Padrão
            </Button>
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() =>
                setSections(
                  Object.fromEntries(
                    (
                      Object.keys(sections) as (keyof EmpReportSections)[]
                    ).map((k) => [k, true])
                  ) as EmpReportSections
                )
              }
            >
              Marcar tudo
            </Button>
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={() =>
                setSections(
                  Object.fromEntries(
                    (
                      Object.keys(sections) as (keyof EmpReportSections)[]
                    ).map((k) => [k, false])
                  ) as EmpReportSections
                )
              }
            >
              Limpar
            </Button>
          </div>
        </ModuleSection>
      ) : null}

      {step === 3 ? (
        <ModuleSection title="4 · Revisar e gerar">
          <div className="mb-4 flex h-14 items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={emitente.logoDocumentoPath}
              alt={emitente.nomeFantasia}
              className="max-h-14 w-auto object-contain"
            />
          </div>
          <div className="space-y-2 text-sm">
            <p>
              Emitente: <strong>{empresa.razaoSocial}</strong> · {empresa.cnpj}
            </p>
            <p className="text-muted-foreground">
              {formatEmitenteEndereco(empresa)}
            </p>
            <p>
              Contato:{" "}
              {[empresa.telefone, empresa.email].filter(Boolean).join(" · ") ||
                "—"}
            </p>
            <p>
              Empreendimento:{" "}
              <strong>{development?.nome ?? "—"}</strong>
            </p>
            <p>
              Seções: <strong>{selectedCount}</strong> ·{" "}
              {(
                Object.keys(sections) as (keyof EmpReportSections)[]
              )
                .filter((k) => sections[k])
                .map((k) => EMP_REPORT_SECTION_LABELS[k])
                .join(", ") || "nenhuma"}
            </p>
            <p className="text-muted-foreground">
              O navegador abre a visualização formatada; use “Salvar como PDF”
              / Imprimir.
            </p>
          </div>
        </ModuleSection>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Voltar
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            size="sm"
            onClick={() => {
              if (step === 1 && !development) {
                notify("Selecione um empreendimento");
                return;
              }
              if (step === 2 && selectedCount === 0) {
                notify("Marque ao menos uma seção");
                return;
              }
              setStep((s) => s + 1);
            }}
          >
            Continuar
          </Button>
        ) : (
          <Button size="sm" onClick={gerar}>
            Gerar relatório
          </Button>
        )}
      </div>
    </div>
  );
}

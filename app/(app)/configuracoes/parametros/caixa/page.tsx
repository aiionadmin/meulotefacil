"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ModuleHeader } from "@/components/app/ModulePage";
import { Field, notify } from "@/components/app/ModuleToolkit";
import { useCarteira } from "@/lib/store/carteira-store";

export default function ParametrosCaixaPage() {
  const { state, updateReceiptParams } = useCarteira();
  const form = state.receiptParams ?? {
    multaAcumulativa: false,
    naoReceberAtuaisComAtrasadas: true,
    pagamentoParcial: true,
    unirVendasNoCaixa: false,
    despesaBancariaPadrao: 2.5,
    textoRecibo: "Recebemos a importância acima em pagamento de parcela(s).",
    reciboVias: 1 as const,
    autenticacao: true,
    estornoSoAdmin: true,
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Caixa e recebimento"
        description="Parâmetros H21: multa, atuais com atraso, parcial, união de vendas e recibo."
        actions={
          <Button
            size="sm"
            onClick={() => notify("Parâmetros salvos", "Caixa")}
          >
            Salvar
          </Button>
        }
      />
      <div className="grid max-w-xl gap-4">
        <Field label="Vias do recibo (1 ou 2)">
          <Input
            type="number"
            min={1}
            max={2}
            value={form.reciboVias}
            onChange={(e) =>
              updateReceiptParams({
                reciboVias: Number(e.target.value) === 2 ? 2 : 1,
              })
            }
          />
        </Field>
        <Field label="Despesa bancária padrão (R$)">
          <Input
            type="number"
            step="0.01"
            value={form.despesaBancariaPadrao}
            onChange={(e) =>
              updateReceiptParams({
                despesaBancariaPadrao: Number(e.target.value) || 0,
              })
            }
          />
        </Field>
        <Field label="Texto do recibo">
          <Input
            value={form.textoRecibo}
            onChange={(e) =>
              updateReceiptParams({ textoRecibo: e.target.value })
            }
          />
        </Field>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Exigir autenticação</span>
          <Switch
            checked={form.autenticacao}
            onCheckedChange={(v) => updateReceiptParams({ autenticacao: v })}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Estorno só administrador</span>
          <Switch
            checked={form.estornoSoAdmin}
            onCheckedChange={(v) => updateReceiptParams({ estornoSoAdmin: v })}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Não receber atuais com atrasadas</span>
          <Switch
            checked={form.naoReceberAtuaisComAtrasadas}
            onCheckedChange={(v) =>
              updateReceiptParams({ naoReceberAtuaisComAtrasadas: v })
            }
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Multa acumulativa</span>
          <Switch
            checked={form.multaAcumulativa}
            onCheckedChange={(v) =>
              updateReceiptParams({ multaAcumulativa: v })
            }
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Permitir pagamento parcial</span>
          <Switch
            checked={form.pagamentoParcial}
            onCheckedChange={(v) =>
              updateReceiptParams({ pagamentoParcial: v })
            }
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Unir vendas no caixa</span>
          <Switch
            checked={form.unirVendasNoCaixa}
            onCheckedChange={(v) =>
              updateReceiptParams({ unirVendasNoCaixa: v })
            }
          />
        </label>
      </div>
    </div>
  );
}

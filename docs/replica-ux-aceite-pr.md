# PR — UX aceite (DnD, unsaved amplo, auto-etapas)

Base: tip dual-write resto (#109). Sem deploy.

## Pronto

### DnD / anexos (até 10 MB)
- `AttachDropZone` reutilizável em `ModuleToolkit` (arrastar/clique, limite 10 MB)
- Lançamento (pagamentos), SC detalhe, cotação PDF, obra → Arquivos, contas OFX, notas XML/PDF

### Unsaved amplo
- `FormSheet` / `FormDialog` com prop `dirty` + confirmação ao sair
- Aplicado em: Nova Obra (já), lançamento, SC, plano de contas, alçadas, pré-lançamentos, transferências, recebimentos, contas, insumos, composições, vincular NF, árvore/despesa da obra

### Auto-etapas
- Flag `abrirEtapasItensAutomatico` (parâmetros financeiro) ao escolher obra no lançamento
- Selects de etapa/item no centro de custo; preenchimento automático quando a flag está ligada

## Pendente / fora deste bloco
- Integrações externas → ver `docs/replica-externos-stubs-pr.md` (PR seguinte)
- Storage real de anexos (hoje registra nome / parse local)

## Como testar
1. Financeiro → Pagamentos → Criar lançamento: editar campos, Cancelar → confirma “não salvas”; escolher obra com orçamento → etapa/item; anexar por arraste
2. Configurações → Parâmetros financeiro: desligar “abrir etapas…” e repetir (não pré-seleciona)
3. SC / Cotação / Contas OFX / Notas: arrastar arquivo
4. Plano de contas / Alçadas: editar e fechar sem salvar → confirmação

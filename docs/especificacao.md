# Especificação completa do sistema unificado Meu Lote Fácil

Nov 25, 2026 · @Ramael Fernando

## 1. Prompt de abertura para o Cursor

Este documento inteiro é o prompt: exporte em Markdown, salve como `docs/especificacao.md` no repositório e cole o bloco abaixo na primeira conversa com o Cursor. A stack é sugestão, não decisão do cliente: troque se já houver outra definida.

```markdown
Você vai construir o sistema de gestão da Meu Lote Fácil / L & A, empresa de
loteamentos, regularização fundiária e obras. Ele substitui dois sistemas:
o LoteWin (lotes, contratos, parcelas, boletos) e o Mais Controle (obras,
compras, financeiro). A especificação completa está em docs/especificacao.md.

Princípios:
1. Um sistema só. Tudo o que os dois faziam igual existe uma única vez.
2. Duas formas de navegar o mesmo dado: MENU (lista e formulário por rotina)
   e KANBAN (quadros por processo). Nunca duplique regra entre as duas:
   as duas telas chamam os mesmos serviços.
3. O card do cliente reúne tudo: cadastro, origem, conversas, lote, contrato,
   parcelas e boletos, cobrança e jurídico, regularização, obra, documentos
   e histórico.
4. Todo acesso passa por perfil: cada rotina tem ver, inserir/alterar e
   remover, e cada usuário enxerga só os empreendimentos e contas liberados.
5. Nada de regra financeira no front-end. Cálculo de juros, multa, correção,
   reajuste e saldo fica no servidor, com teste automatizado.

Stack sugerida:
- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- PostgreSQL (Supabase) com Row Level Security e Auth
- Storage para anexos (até 10 MB por arquivo)
- Zod para validação, TanStack Table para listas, dnd-kit para o Kanban

Regras técnicas:
- pt-BR em tudo: moeda BRL, datas DD/MM/AAAA, máscaras de CPF, CNPJ, CEP e
  telefone, busca de endereço por CEP.
- Multiempresa: toda tabela tem organization_id.
- Dinheiro em numeric(14,2); valor em índice em numeric(18,6). Nunca float.
- Exclusão lógica. Toda tabela tem created_by, updated_by e trilha de auditoria.
- Toda operação que mexe em parcelas (reajuste, transferência, renegociação,
  troca, retomada, antecipação) roda em transação e guarda o estado anterior
  para poder ser desfeita.
- Toda lista tem busca, filtros, paginação (10/25/50/100), seleção em lote,
  exportar CSV/XLSX e impressão em PDF.
- Todo cadastro aceita anexos com tag e comentários.
- Dados pessoais (CPF, RG, renda, contas) são sensíveis: não registrar em log.

Como trabalhar:
- Comece propondo o schema do banco e a estrutura de pastas; espere aprovação.
- Siga a ordem de entrega da seção 13. Um módulo por vez, com migrations,
  seeds de exemplo e testes das regras da seção 11.
- Itens marcados "(confirmar)" não foram vistos em detalhe no sistema atual:
  implemente o básico e pergunte antes de inventar regra.
```

**Como ler as origens:** MC = já existe no Mais Controle; LW = já existe no LoteWin; MC+LW = existe nos dois e foi unificado; NOVO = nenhum dos dois tem. "(confirmar)" marca o que foi lido só pelo nome do menu do LoteWin.

## 2. Mapa completo de menus

O sistema tem 15 menus no menu lateral e 93 telas de primeiro nível. A barra superior traz busca global (cliente, CPF, lote, contrato), seletor de empresa, notificações, botão "Novo" com atalhos e menu do usuário.

| Menu | Submenus (telas) | Origem |
| --- | --- | --- |
| 1. Início | Painel; Notificações; Minhas tarefas | MC+LW |
| 2. Quadros | Jornada do cliente; Cobrança; Regularização e escritura; Compras; Obras; Tarefas | NOVO (Compras, Obras e Tarefas reaproveitam MC) |
| 3. Comercial | Leads; Atendimento; Propostas e reservas; Efetuar venda; Pré-cadastro de cliente; Tabela de preços; Comissões; Consulta geral de vendas | LW + NOVO |
| 4. Empreendimentos | Empreendimentos; Quadras e lotes; Planta do loteamento; Alterar status de lotes; Histórico de lotes; Sócios; Despesas do empreendimento | LW + MC |
| 5. Contratos | Contratos; Ficha financeira; Planos de pagamento; Transferência e renegociação; Troca de lote; Retomada de lote; Antecipação de parcelas; Resíduos; Observações do lote | LW |
| 6. Recebimentos | Caixa (receber); Movimento e fechamento do caixa; Emissão de boletos e carnês; Remessa e retorno bancário; Baixa manual; Reajuste anual | LW |
| 7. Cobrança e jurídico | Inadimplentes; Régua de cobrança; Acordos; Processos judiciais | LW + NOVO |
| 8. Regularização | Processos de regularização; Escrituras; Cartórios | LW + NOVO |
| 9. Obras | Obras; Orçamentos; Cronograma; Gestão de custos; Relatório gerencial; Insumos; Composições | MC |
| 10. Compras | Solicitações; Cotações; Ordens de compra | MC |
| 11. Financeiro | Contas a pagar; Pré-lançamentos; Contas a receber; Contas bancárias; Transferências; Conciliação; Fluxo de caixa; Resultados; Cheques | MC + LW |
| 12. Fiscal | NFe recebidas; NFSe emitidas; CNPJs e certificados; DIMOB; SPED Contribuições; Exportação contábil | MC + LW |
| 13. Cadastros | Pessoas; Clientes; Fornecedores; Profissionais; Corretores | MC+LW |
| 14. Relatórios e arquivos | Central de relatórios; Arquivos | MC+LW |
| 15. Configurações | Empresa; Usuários; Perfis de acesso; Alçadas; Listas de apoio; Plano de contas e categorias; Índices; Regras de cobrança; Parâmetros de venda; Boletos e bancos; Quadros e etapas; Modelos de documento; Integrações; Auditoria; Importação de dados | MC+LW + NOVO |

**Atalhos do botão "Novo":** lead, venda, recebimento, boleto, lançamento a pagar, faturamento, transferência, solicitação de compra, cotação, ordem de compra, tarefa.

**Regra de navegação:** todo item que aparece em um quadro também existe em uma tela de menu, e vice-versa. O menu é para operar por rotina (emitir todos os boletos do mês); o quadro é para acompanhar por caso (o que falta para este cliente).

## 3. Níveis de acesso

O acesso tem três camadas: o **perfil** define o que o usuário pode fazer em cada rotina, a **visibilidade** define em quais empreendimentos e contas, e a **alçada** define quem aprova o quê.

### 3.1 Perfis iniciais

Doze perfis já vêm cadastrados e podem ser editados ou copiados. Os seis primeiros existem hoje no Mais Controle; os demais são novos, para cobrir o lado de lotes.

| Perfil | Para quem | Vê e opera |
| --- | --- | --- |
| Administrador | Responsável pelo sistema | Tudo, inclusive Configurações e Auditoria |
| Direção | Sócios e diretoria | Tudo em leitura; aprova alçadas; vê resultados e relatório dos sócios |
| Financeiro | Contas a pagar e receber | Financeiro, Fiscal, Recebimentos; lê Contratos e Compras |
| Engenharia | Engenheiros | Obras, Orçamentos, Gestão; cria solicitações de compra |
| Obras | Equipe de campo | Solicitações de compra próprias, pré-lançamentos próprios, tarefas |
| Suprimentos | Compras | Compras, Fornecedores, Insumos |
| Comercial | Gestor de vendas | Comercial inteiro, Empreendimentos em leitura, quadro Jornada |
| Corretor | Corretores | Só os próprios leads, propostas e vendas; planta e tabela de preços |
| Atendimento e caixa | Recepção | Caixa, segunda via, cadastro do cliente, conversas |
| Cobrança | Equipe de cobrança | Inadimplentes, régua, acordos, ficha financeira em leitura |
| Jurídico | Advogado | Processos, acordos, retomada; contratos e documentos em leitura |
| Regularização | Equipe de escrituras | Processos de regularização, escrituras, cartórios, documentos |

Perfis futuros, fora da primeira entrega: Contabilidade (leitura do Fiscal e exportações) e Cliente (portal com parcelas e segunda via).

### 3.2 Matriz de permissões

Cada perfil tem, para cada rotina, três chaves: **Ver**, **Inserir e alterar**, **Remover**. As rotinas da matriz são as 93 telas da seção 2, mais estas permissões especiais:

| Permissão especial | Origem |
| --- | --- |
| Ver remuneração de profissionais | MC |
| Ver saldo e extrato de cada conta bancária | MC |
| Ver centro de custo "Empresa" | MC |
| Estornar recebimento | LW |
| Alterar valor de parcela para menor | LW |
| Editar nosso número de boleto | LW |
| Alterar parcela já paga ou com boleto gerado | LW |
| Executar e desfazer reajuste anual | LW |
| Executar transferência, renegociação, troca e retomada | LW |
| Aplicar antecipação de parcelas | LW |
| Solicitação de compra: própria, de terceiros, atender | MC |
| Pré-lançamento: próprio, gerenciar todos | MC |
| Orçamento: ver custo, ver preço de venda | MC |
| Mover card entre colunas do quadro | NOVO |
| Ver conversas de outros atendentes | NOVO |

### 3.3 Visibilidade e alçadas

- **Por empresa:** o usuário só vê as empresas (CNPJ) liberadas.
- **Por empreendimento:** cada empreendimento lista quem o enxerga; vale para lotes, contratos, obra, compras e financeiro.
- **Por conta bancária:** só os usuários listados veem saldo e extrato; a conta continua disponível para lançar.
- **Por carteira:** o corretor só vê os próprios cards.
- **Alçadas:** aprovação de ordem de compra, conciliação, desconciliação, relatório gerencial, desconto acima do limite e estorno.
- **No Kanban:** o usuário vê só as abas do card que o perfil permite. O jurídico não vê a aba Obra; o corretor não vê Cobrança e jurídico.

## 4. Quadros Kanban

São seis quadros. O principal é a Jornada do cliente; os outros cinco acompanham processos paralelos. As colunas de cada quadro são configuráveis em Configurações > Quadros e etapas.

### 4.1 Jornada do cliente (quadro principal)

Um card por cliente e lote. Antes de existir lote, o card é só do cliente.

| Coluna | Entra quando | Sai quando |
| --- | --- | --- |
| 1. Novo contato | Lead criado (formulário, anúncio, WhatsApp, cadastro manual) | Primeira resposta do atendente |
| 2. Em atendimento | Atendente respondeu | Proposta criada ou lead perdido |
| 3. Proposta e reserva | Lote escolhido, status do lote vira Reservado | Venda efetuada ou reserva vencida |
| 4. Contrato | Venda finalizada, parcelas geradas, status vira Vendido | Primeira parcela paga |
| 5. Carteira em dia | Primeira parcela paga | Atraso além da tolerância, ou quitação |
| 6. Cobrança e jurídico | Parcela vencida além da tolerância | Atraso regularizado, acordo ou retomada |
| 7. Quitado | Saldo devedor zerado, status vira Quitado | Processo de escritura aberto |
| 8. Escritura e entrega | Processo de regularização aberto, status vira Escritura | Matrícula entregue (card concluído) |

Saídas laterais: **Perdido** (com motivo), **Retomado** (lote volta a Disponível), **Transferido** (card passa ao novo comprador, mantendo o histórico).

**Movimento:** as colunas 3 a 8 mudam sozinhas pelo evento do sistema; arrastar à mão só é permitido nas colunas 1 e 2 e para marcar Perdido. Isso impede que o quadro diga uma coisa e o financeiro outra.

**Face do card:** nome, empreendimento e lote, origem, responsável, dias na etapa, e selos de alerta (reserva vencendo, parcelas em atraso, documento pendente).

**Filtros do quadro:** empreendimento, responsável, origem, período, com atraso, parado há mais de N dias.

### 4.2 Abas do card

Abrir o card mostra doze abas. Cada uma é a mesma tela do menu, filtrada para aquele cliente e lote.

| Aba | Conteúdo | Tela de menu equivalente |
| --- | --- | --- |
| Resumo | Etapa, lote, saldo devedor, próxima ação, alertas | — |
| Cliente | Cadastro completo, cônjuge, procurador, promitentes | Cadastros > Clientes |
| Origem | Canal, campanha, página, data do primeiro clique, corretor | Comercial > Leads |
| Conversas | WhatsApp, e-mail, recados e comentários internos | Comercial > Atendimento |
| Lote | Dados do lote, status, planta, confrontações | Empreendimentos > Quadras e lotes |
| Contrato | Proposta, plano, reajuste, comissão, operações | Contratos > Contratos |
| Parcelas e boletos | Ficha financeira, receber, boleto, carnê, antecipação | Contratos > Ficha financeira |
| Cobrança e jurídico | Atraso, contatos de cobrança, acordo, processo | Cobrança e jurídico |
| Regularização e escritura | Etapas, documentos, cartório, matrícula | Regularização |
| Obra | Andamento do empreendimento (só leitura) | Obras > Gestão de custos |
| Documentos | Anexos do cliente e do contrato, pendências por etapa | Relatórios e arquivos > Arquivos |
| Histórico | Linha do tempo e auditoria | Configurações > Auditoria |

### 4.3 Demais quadros

| Quadro | Card | Colunas |
| --- | --- | --- |
| Cobrança | Contrato em atraso | A vencer em 5 dias; 1 a 30 dias; 31 a 90 dias; Acordo em andamento; Jurídico; Retomada |
| Regularização e escritura | Processo por lote | Documentos do cliente; Prefeitura; Cartório; Registro; Matrícula pronta; Entregue |
| Compras | Solicitação | Rascunho; Em aprovação; A atender; Em cotação; Comprado; Recebido; Recusada |
| Obras | Obra | Em orçamento; Em andamento; Paralisada; Finalizada |
| Tarefas | Tarefa | Livre, por quadro e pasta |

O funil de propostas de obra do Mais Controle (Contato inicial, Em elaboração, Em revisão) vira uma visão do quadro Obras, na coluna Em orçamento.

### 4.4 Regras comuns aos quadros

- Cada coluna pode ter um limite de dias; passado o limite, o card ganha selo de parado.
- Cada mudança de coluna grava data, usuário e motivo no histórico.
- Contadores por coluna e tempo médio em cada etapa alimentam o relatório de funil.
- Cards respeitam a visibilidade por empreendimento e por carteira.

## 5. Telas: Início, Comercial e Cadastros

Nas seções 5 a 9, cada tela traz o que a lista mostra, os campos do formulário e as ações. Campos com \* são obrigatórios.

### 5.1 Início

**Painel** (MC+LW). Blocos exibidos conforme o perfil:

- Carteira: empreendimentos, lotes e vendidos, clientes ativos, contratos ativos, total a receber, vencimentos em 30 dias, inadimplência.
- Listas: últimos recebimentos, inadimplentes, próximos vencimentos, cada uma com "ver todos".
- Obras por status: evolução física, orçado, realizado, saldo.
- Pagamentos e recebimentos em aberto: vencidos nos últimos 90 dias, hoje, 7 dias, 30 dias.
- Pré-lançamentos pendentes, notas fiscais sem lançamento, fluxo de caixa.
- Funil: cards por etapa da Jornada (NOVO).
- Filtro geral por empreendimento e botão Atualizar.

**Notificações** (MC): lista com filtro de não lidas. Gatilhos: lead novo, reserva vencendo, parcela em atraso, aprovação pendente, tarefa atribuída, prazo jurídico.

**Minhas tarefas** (MC): tarefas do usuário, por prazo.

### 5.2 Comercial

**Leads** (NOVO)

- Lista: nome, telefone, empreendimento de interesse, origem, responsável, etapa, criado em, último contato.
- Formulário: nome \*, telefone \*, e-mail, empreendimento de interesse, origem \* (veículo de comunicação), campanha, anúncio, página de entrada, data e hora do primeiro clique, responsável, observações.
- Ações: atribuir, converter em cliente, marcar perdido com motivo, abrir conversa, importar lista.
- Entrada automática por formulário do site e por WhatsApp, guardando os parâmetros de campanha.

**Atendimento** (NOVO)

- Caixa de conversas por cliente: WhatsApp e e-mail, com responsável e situação (aberta, aguardando cliente, encerrada).
- Enviar planta, tabela, proposta, contrato e boleto pela conversa; modelos de mensagem.
- Recados do lote e comentários internos na mesma linha do tempo (LW + MC).

**Propostas e reservas** (MC + LW)

- Lista: cliente, lote, valor, status da proposta, validade da reserva, responsável.
- Formulário: cliente \*, lote(s) \*, tabela de preços, entrada, número de parcelas, valor da parcela, desconto, condição de pagamento, validade, responsável, comentários de negociação.
- Ações: simular plano, reservar lote, gerar proposta em PDF, aplicar desconto (com alçada), converter em venda, cancelar reserva.

**Efetuar venda** (LW). Assistente em 7 etapas:

1. Selecionar lote(s): busca, carrinho com área, padrão, status, proposta e preço. Origem: venda direta, pré-venda ou aplicativo.
2. Comprador e promitentes: cliente principal, cônjuge, demais compradores.
3. Adicionais e recados: procurador, observações, recado do lote.
4. Dados do lote: área, confrontações, valor do m², preço (campos liberados por configuração).
5. Cópia de plano: nenhum, copiar de plano existente, ou por valor do m².
6. Plano de pagamento: séries (sinal, prestações, intermediárias), tipo de reajuste, índice, 1º vencimento, conta, desconto por pontualidade, multa.
7. Comissão e finalização: corretor, base e percentual, veículo de comunicação, conferência e confirmação.

As etapas 2 a 7 não foram vistas por dentro no LoteWin (confirmar campos).

**Pré-cadastro de cliente** (LW, confirmar): cadastro rápido antes da venda, completado depois.

**Tabela de preços** (LW)

- Por empreendimento: % juros, % entrada, três opções de número de parcelas, comissão, abater entrada no financiamento, valores por m² por tabela, status de lote a não listar.
- Ações: carregar, processar, imprimir.

**Comissões** (LW, confirmar): comissões por venda e corretor, a pagar e pagas; base no preço do lote ou em entrada e intermediárias; gera lançamento a pagar.

**Consulta geral de vendas** (LW): filtro por empreendimento e período; lista de vendas com cliente, lote, preço, corretor e situação.

### 5.3 Cadastros

**Pessoas** (MC+LW). Um cadastro com papéis; Clientes, Fornecedores, Profissionais e Corretores são visões filtradas.

| Bloco | Campos |
| --- | --- |
| Identificação | Tipo \* (física ou jurídica), papéis \*, status, nome ou razão social \*, nome fantasia, CPF/CNPJ, inscrição estadual, inscrição municipal |
| Contato | Telefone 1, telefone 2, celular, e-mail |
| Endereços | Residencial/sede e comercial/representante legal: CEP, logradouro, número, complemento, bairro, cidade, UF; endereço de correspondência \* |
| Dados civis (comprador) | Sexo \*, nascimento, nacionalidade, naturalidade, filiação, profissão \*, RG, órgão expedidor, data de expedição, renda familiar, estado civil \*, data de casamento, regime |
| Cônjuge | Nome, nascimento, nacionalidade, naturalidade, filiação, profissão, CPF, RG, órgão expedidor |
| Procurador | Nome, CPF |
| Pessoas de contato | Nome, cargo, e-mail, telefone, aniversário; usar em cotações e ordens de compra |
| Cliente | Fonte, setor, conta bancária, comentário |
| Fornecedor | Segmento, qualificação (1 a 5), conta bancária |
| Profissional | Status (ativo, inativo, afastado, interessado, ex-funcionário), função, nível, regime (horista, diarista, mensalista, empreiteiro), remuneração, admissão, demissão, perfil, filhos, nome da mãe e do pai, duas referências |
| Corretor | CRECI, percentual padrão de comissão, usuário vinculado |
| Arquivos | Anexos com tag |

- Listas: busca, filtro por papel, status, cidade, segmento, qualificação; importar, exportar, imprimir, remover selecionados.
- Ações no cliente: ver contratos, abrir card, mala direta, contrato, promissória, documentos.

## 6. Telas: Empreendimentos, Lotes e Contratos

### 6.1 Empreendimentos

**Empreendimentos** (LW + MC). O empreendimento é também o centro de custo da obra.

| Aba | Campos |
| --- | --- |
| Cadastro | Código \*, nome \* (até 200 caracteres), tipo \* (loteamento, regularização, AVCB, construção; com criação rápida), status \* (em orçamento, em andamento, paralisada, finalizada), cidade, UF, CEP, código do município, área total, unidade, quantidade de quadras, quantidade de lotes, observações, recado padrão |
| Administração | Razão social, CNPJ, CEP, endereço, cidade, UF, telefone |
| Registro | Número e data da matrícula, complemento da quadra, site da prefeitura (IPTU) |
| Financeiro | Conta corrente padrão, numeração de recibo própria, quem paga (empresa ou cliente), dados para faturamento (PJ/PF, CNPJ, razão social, inscrição estadual, telefone, e-mail, e-mails em cópia, endereço) |
| Encargos | Dias de mora, taxa de mora, dia da multa, taxa de multa (sobrepõem o padrão do sistema) |
| Obra | ART, CEI/CNO (até 20 caracteres), responsável técnico, responsável da obra, endereço, contatos |
| Sócios | Sócio e percentual de participação |
| Acesso | Usuários que enxergam; exibir em lançamentos, faturamentos e compras |
| Lotes | Grade de lotes (tela seguinte) |
| E-mail | Remetente e texto para envio de boletos (confirmar) |

- Lista: imagem, código, nome, cliente/administradora, tipo, status, quem enxerga.
- Ações: novo, editar, duplicar, remover, importar, planta do loteamento, comentários, arquivos.

**Quadras e lotes** (LW)

- Lista: empreendimento, quadra, lote, área, padrão, custo, valor, status, comprador atual.
- Formulário: empreendimento \*, quadra \*, lote \*, área \*, padrão, custo, valor, valor do m², confrontações (frente, fundo, direita, esquerda), matrícula do lote, observações, fotos.
- Ações: gerar lotes em massa (quadra, quantidade, área padrão), incluir, alterar, excluir, atualizar valor do m² em massa, exportar.

**Planta do loteamento** (LW): imagem da planta por empreendimento com lotes clicáveis; cores por status; clique abre o lote ou inicia a reserva.

**Alterar status de lotes** (LW): seleção de um ou vários lotes, novo status, motivo.

**Histórico de lotes** (LW): por lote, todas as vendas, trocas, transferências e retomadas, com datas e compradores.

**Sócios** (LW, confirmar): cadastro de sócios e participação por empreendimento; base do relatório dos sócios.

**Despesas do empreendimento** (LW, confirmar): despesas lançadas contra o empreendimento; no sistema novo, são lançamentos a pagar com esse centro de custo.

### 6.2 Contratos

**Contratos** (LW)

- Lista: número, cliente, lote, data, preço, saldo devedor, situação (ativo, quitado, cancelado, renegociado, transferido, trocado), corretor.
- Cabeçalho: número/proposta, cliente, lote, empreendimento, corretor, preço, valor base, base para comissão.
- Datas: contrato, assinatura, venda (DIMOB), lançamento, 1ª parcela, última parcela, última transferência.
- Condições: tipo de reajuste, mês-base, moeda de referência, moeda do resíduo, moeda da correção por atraso, acréscimo de reajuste, desconto % e dia limite, taxa de banco, multa (acumulativa ou não) e percentual, conta corrente, emite boleto.
- Ações: imprimir contrato, promissórias, documentos, ver ficha, abrir card, últimos reajustes.

**Ficha financeira** (LW)

- Busca por empreendimento, quadra, lote, comprador, cônjuge ou proposta; vendas atuais ou canceladas/renegociadas/transferidas/trocadas.
- Grade: tipo, data de pagamento, vencimento, valor na moeda, moeda, valor em reais, juros, multa, correção monetária, despesa bancária, número da prestação, referente, nosso número.
- Rodapé: quantidade de registros, total pago, saldo devedor.
- Ações: incluir, alterar e excluir parcela; alterar vencimento; pagamento; pesquisar e cancelar boleto; recado; documentos; exportar para Excel; modo edição; agrupar.

**Planos de pagamento** (LW)

- Campos: entradas (quantidade contratada e gerada), prestações (contratada e gerada), moedas, corretor, datas, preço, valor base, base de comissão.
- Grade de séries: código (tipo de parcela), quantidade, saldo, valor, moeda, data da próxima prestação, data do reajuste, valor anterior.
- Ações: editar, confirmar, cancelar, contrato, últimos reajustes, exportar.

**Transferência e renegociação** (LW)

- Modo: transferência, renegociação, ou as duas juntas. Data da operação \*.
- Transferência: novo comprador, taxa de transferência (opcional), bloqueio se houver débito (configurável).
- Renegociação: saldo devedor apurado, novo plano, parcela de acordo.
- Ações: transferir, desfazer, contrato, promissória, documentos.

**Troca de lote** (LW): data de base \*, lote a ser trocado \*, trocado por \*; processar. O lote antigo volta a Disponível.

**Retomada de lote** (LW): mostra contrato e plano; data da retomada \*; opção de não guardar histórico; opção de limpar status ao retomar. O lote volta a Disponível e o card vai para Retomado.

**Antecipação de parcelas** (LW)

- Campos: lote \*, tipo de parcela, data de cálculo, vencimento, taxa de juros de desconto.
- Opções: quitação no mesmo mês da venda, ausência de parcela no 2º mês, imprimir só selecionadas, verificar prorrogação; aplicar do fim para o início ou do início para o fim.
- Grade com seleção, valor e valor a pagar; total e valor da quitação.
- Ações: processar (simula), aplicar antecipação, imprimir.

**Resíduos** (LW, confirmar): diferença de correção acumulada por contrato; cálculo, cobrança como parcela ou rateio no saldo.

**Observações do lote** (LW, confirmar): notas por lote, com data e usuário.

## 7. Telas: Recebimentos, Cobrança, Jurídico e Regularização

### 7.1 Recebimentos

**Caixa (receber)** (LW)

- Abertura: data do dia, dias de tolerância de mora, imprimir recibo (sim/não), 1 ou 2 vias.
- Busca do cliente por empreendimento, quadra, lote, comprador ou cônjuge. Se houver recado do lote, ele aparece antes.
- Cabeçalho: comprador, endereço, telefone, contrato; editar contato ali mesmo.
- Grade de parcelas em aberto: seleção, descrição, vencimento, valor, juros, correção, multa, desconto, total, nosso número, seguro. Total a pagar das selecionadas.
- Ações: pagamento (forma, conta, data), pagamento com data anterior, estorno, gerar parcelas do próximo período, alterar status, emitir boleto, cancelar boleto, recibo com autenticação, recado.

**Movimento e fechamento do caixa** (LW): recebimentos do dia por forma de pagamento e usuário; fechamento com saldo; relatório de caixa (resumo e fechamento).

**Emissão de boletos e carnês** (LW)

- Filtros: lote ou cliente, mês/ano, data do documento, taxa bancária, tipo de receita, conta corrente.
- Opções: atualizar parcelas, atualizar só vencimento, emitir boletos já processados, filtrar dia de vencimento, filtrar bloqueados, não processar entrada confirmada, reajustados no mês, reemitir só gerados, unificar parcelas, atualizar encargos para N dias.
- Duas grades: selecionados e excluídos, com mover entre elas; ordenação; quantidade.
- Saída: remessa, boleto avulso, carnê retrato, carnê paisagem, PDF por e-mail ou WhatsApp.
- Ações: processar, gerar arquivo, imprimir, exportar para Excel, limpar.

**Remessa e retorno bancário** (LW): gerar arquivo de remessa por conta; importar arquivo de retorno; baixa automática com relatório do que baixou e do que foi rejeitado; histórico de arquivos.

**Baixa manual** (LW, confirmar): baixa de boleto pago fora do retorno, com data de crédito.

**Reajuste anual** (LW)

- Modo: reajustar ou desfazer reajuste.
- Filtros: período, índice, fator, empreendimento (ou todos), tipos de parcela com reajuste.
- Lista dos contratos atingidos, com marcar e desmarcar todos; total de lotes.
- Opções: acréscimo exponencial, não mostrar quitados, valores inteiros.
- Ações: filtrar (simula), processar, relatório.

### 7.2 Cobrança e jurídico

**Inadimplentes** (LW)

- Lista: cliente, lote, parcelas em atraso, valor original, valor atualizado, dias de atraso, último contato, responsável, situação.
- Filtros: empreendimento, faixa de atraso, valor, responsável, com acordo, no jurídico.
- Ações: registrar contato, enviar cobrança, propor acordo, enviar ao jurídico, emitir boleto atualizado, relatórios de inadimplência e histórico da inadimplência.

**Régua de cobrança** (NOVO)

- Passos configuráveis por dias em relação ao vencimento (ex.: 5 dias antes, no dia, 3, 10, 30 e 60 dias depois), cada um com canal (WhatsApp, e-mail, tarefa para cobrador) e modelo de mensagem.
- Registro de cada envio no card. Pausa da régua quando há acordo ou processo.

**Acordos** (LW + NOVO)

- Formulário: contrato \*, parcelas incluídas, valor atualizado, desconto concedido (com alçada), entrada, novas parcelas, vencimentos.
- Gera parcelas do tipo Acordo/Renegociação e dá baixa nas originais. Quebra de acordo reabre o saldo.

**Processos judiciais** (NOVO)

- Formulário: contrato \*, tipo de ação, número do processo, vara e comarca, advogado responsável, valor da causa, data de distribuição, situação, próximo prazo.
- Andamentos com data, descrição e anexo; prazos geram tarefa e notificação.
- Status do lote vira Advogado ou Jurídico, com bloqueio financeiro se configurado.

### 7.3 Regularização

**Processos de regularização** (NOVO, com apoio do LW)

- Um processo por lote, com etapas configuráveis. Sugestão inicial: documentos do cliente, protocolo na prefeitura, aprovação, cartório, registro, matrícula pronta, entrega.
- Cada etapa: responsável, prazo, lista de documentos exigidos, situação, observações, anexos.
- Parcelas de Regularização, Homologação e Entrega de Matrícula ligadas ao processo.
- O fluxo real da empresa ainda precisa ser levantado com o cliente.

**Escrituras** (LW, confirmar): lotes quitados aptos a escriturar, escrituras em andamento e concluídas; relatório de escrituras; emissão de termo de quitação.

**Cartórios** (LW, confirmar): nome, cidade, endereço, telefone, oficial.

## 8. Telas: Obras e Compras

Tudo nesta seção vem do Mais Controle. A obra usa o mesmo cadastro do empreendimento (seção 6.1).

### 8.1 Obras

**Obras**: lista dos empreendimentos com visão de obra: imagem, código, nome, cliente, tipo, status, quem enxerga. Detalhe com informações da obra, cliente, comentários e arquivos.

**Orçamentos**

- Lista: código, obra, cliente, status da obra, status da proposta, custo, preço; filtros por período e status.
- Aba Orçamento: árvore etapa > subetapa > item; por linha: código, descrição, unidade, quantidade, custo unitário, custo total, BDI, preço. Ações por nível: adicionar composição, insumo, item, subetapa, etapa; remover; reordenar. Rodapé com custo total, BDI e preço. Trava de edição.
- Aba Proposta: status, datas de criação, entrega e venda, responsável, condição de pagamento, desconto, preço final, comentários; gerar proposta.
- Aba Contrato: documentos gerados por modelo.
- Aba Cronograma físico-financeiro: distribuição por período.
- Aba Arquivos e aba Relatórios (sintético, analítico, por etapa e área, curva ABC).
- Configurações: modelo de proposta, BDI dinâmico ou fixo, arredondamento.

**Cronograma**: Gantt por etapa com duração, início, fim, predecessores, caminho crítico e dias não úteis; exportar.

**Gestão de custos**

- Cabeçalho: evolução física (%), status, cliente, cronograma planejado e realizado.
- Visão geral: orçado, realizado, saldo e evolução por grupo (mão de obra, material, equipamento, outros); custo por m²; gráficos.
- Por etapa e item: orçado, realizado, saldo, % realizado, evolução física editável; linha de custos sem apropriação.
- Curva S, Gantt, arquivos, anotações.
- Relatórios: insumos orçados x realizados, curva ABC, custos por área, custos por categoria, resultado financeiro, pagamentos, pagamentos por etapa, desempenho de custos.

**Relatório gerencial**: por obra e período, com número, título e status; aprovação por alçada.

**Insumos**

- Lista: favorito, código, descrição, tipo, unidade, grupo, base, custo unitário; filtros por base, grupo, tipo, ativo.
- Formulário: grupo \* (material, mão de obra, equipamento, outros), código \* (sequencial sugerido), descrição \*, unidade \*, tipo, base \*, custo, status, observações, arquivos.
- Ações: histórico de preços, importar, exportar, imprimir, salvar e inserir novo.

**Composições**: código \*, descrição \*, unidade \*, tipo, base \*, descrição detalhada, status; insumos com coeficiente; custo por grupo, BDI e preço unitário calculados.

### 8.2 Compras

**Solicitações**

- Lista em abas por status com contador: todas, rascunho, em aprovação, a atender, em andamento, concluída, recusada. Colunas: número, status, descrição, solicitante, necessidade, centro de custo, cotados, comprados, recebidos, vínculos.
- Formulário: centro de custo \*, descrição, necessidade (receber até), urgente; itens por etapa do orçamento com insumo, descrição, unidade e quantidade.
- Detalhe: linha do tempo (criada, aprovada, atendida, recebida), marcar recebimento, ver cotações, arquivos, comentários.

**Cotações**

- Lista: número, descrição, centro de custo, itens, fornecedores, criação, necessidade.
- Cabeçalho: número, descrição, status (em aberto, solicitado, enviado ao fornecedor, respondido parcialmente, cotado parcialmente, cotado, finalizado), prioridade, necessidade, solicitante.
- Abas: Itens (por obra e solicitação de origem), Fornecedores (contato, qualificação, local de entrega), Mapa de cotação (item x fornecedor, melhor compra, desconto, frete), Arquivos.
- Ações: buscar solicitação, enviar aos fornecedores, gerar ordem de compra do vencedor.

**Ordens de compra**

- Lista: número, fornecedor, valor, descrição, centro de custo, criação, aprovação, previsão de entrega, status; totais por situação.
- Cabeçalho: número, fornecedor \*, descrição, aprovação (aprovado, em aberto, negociando, aguardando aprovação, negado), status da compra (aguardando, comprado, entregue parcial, entregue total).
- Abas: Itens (por obra ou empresa; item, unidade, quantidade, valor unitário, valor), Informações (fornecedor, faturar para, condição de pagamento, prazo, data e local de entrega, responsável pelo recebimento), Resumo, Arquivos.
- Totais: frete, outras despesas, impostos, desconto, valor total.
- Ações: gerar lançamento a pagar, saldo de compra, imprimir, compartilhar, enviar por WhatsApp.

## 9. Telas: Financeiro, Fiscal, Relatórios, Tarefas e Arquivos

### 9.1 Financeiro

**Contas a pagar** (MC)

- Lista por mês: vencimento, status, valor, favorecido, descrição e categoria, documento, condição e conta, centro de custo, data de pagamento, anexo. Colunas configuráveis; totais de pago, em aberto e total.
- Filtros: tipo de data, conta, favorecido, centro de custo, grupo, categoria, quem paga, condição, forma de pagamento, ordem de compra, retenção.
- Lançamento: valor \*, descrição, favorecido, categoria \*, competência \*, vencimento \*, pagador \* (empresa ou cliente), conta \*, número do documento, forma de pagamento, observações, arquivos, marcar como pago.
- Centro de custo: empresa ou empreendimento; rateio entre vários; etapa e item do orçamento; vínculo com insumos.
- Opções: repetir (recorrente), parcelar, retenções.
- Ações: pagar, pagar em lote, baixa parcial, estornar, conciliar, editar, relatórios em PDF (simples e agrupado).
- Detalhe do pagamento: histórico de baixas com valor, data, conta, forma e usuário; comentários.

**Pré-lançamentos** (MC): despesa enviada por qualquer usuário com valor, descrição, centro de custo e comprovante; o financeiro aprova (vira lançamento) ou recusa com motivo.

**Contas a receber** (MC + LW)

- Lista por mês: vencimento, status, valor, cliente, condição e conta, descrição e natureza, origem (contrato de lote ou faturamento avulso).
- Parcelas de contrato de lote aparecem aqui automaticamente, sem digitação; a baixa é feita no Caixa ou pelo retorno do boleto.
- Faturamento avulso: valor \*, descrição, cliente, natureza \*, competência \*, vencimento \*, centro de custo \*, conta \*, documento, forma de recebimento, vendedor, parcelar, impostos retidos, marcar como recebido.
- Ações: receber, estornar, emitir nota fiscal, editar, importar faturamentos, relatórios.

**Contas bancárias** (MC+LW)

- Lista: banco, tipo, nome, proprietário, integração, cobrança por boleto, bloqueio, saldo (ocultável).
- Formulário: nome \*, proprietário \* (empresa ou cliente), data inicial \*, saldo inicial \*, tipo, banco, agência, conta, carteira e convênio de boleto, usuários que veem saldo e extrato.
- Ações: extrato, bloquear, ativar integração, ativar boletos.

**Transferências** (MC): data, descrição, conta de origem, conta de destino, valor, paga; filtros por período e situação.

**Conciliação** (MC): extrato importado (integração ou arquivo OFX) ao lado dos lançamentos; sugerir pares, conciliar, desconciliar (com alçada), criar lançamento a partir do extrato.

**Fluxo de caixa** (MC): plano de contas x período (diário, semanal, mensal); realizado e previsto; por proprietário, conta e centro de custo; saldo inicial, transferências, receitas, despesas, total; extrato e impressão.

**Resultados** (MC+LW): demonstrativo mensal por plano de contas (receita bruta, impostos, receita líquida, despesas variáveis, despesas operacionais, resultado financeiro), por caixa ou competência, por centro de custo.

**Cheques** (LW, confirmar): cheques pré-datados recebidos, com banco, número, valor, data de depósito e situação.

### 9.2 Fiscal

- **NFe recebidas** (MC): captura automática por CNPJ; emissão, série e número, emissor, valor, lançamento vinculado; vincular, desvincular, PDF, XML.
- **NFSe emitidas** (MC+LW): emissão a partir do recebimento; lista com situação; cancelar.
- **CNPJs e certificados** (MC): CNPJ, razão social, certificado digital e validade, emissão de NFSe, captura automática.
- **DIMOB** (LW, confirmar): geração do arquivo anual de vendas de imóveis a partir dos contratos e recebimentos.
- **SPED Contribuições** (LW, confirmar): contador, declarantes, empresas SCP, clientes e lançamentos de NFSe, gerar arquivo.
- **Exportação contábil** (LW): arquivo para o sistema da contabilidade; formatos existentes hoje: Domínio, Folhamatic, ConsisaNet, Copan, Telecont.

### 9.3 Relatórios e arquivos

**Central de relatórios** (MC+LW). Filtro por empreendimento e período, saída em tela, PDF e Excel, favoritos.

| Grupo | Relatórios |
| --- | --- |
| Lotes | Lotes; por status; vagos; vendidos; quitados; cancelados; lotes por plano; histórico de lotes; controle de lotes; escrituras |
| Carteira | Posição financeira; previsão da carteira; previsão e recebimentos; geral recebido; vendas e recebimentos de lotes; parcelas adiantadas; reajustes anuais; resíduos; ficha financeira |
| Cobrança | Inadimplência; histórico da inadimplência; cobrança; boletos; boletos cancelados |
| Caixa e sócios | Caixa (resumo e fechamento); relatório dos sócios |
| Comercial | Funil por etapa; origem dos leads; veículos de comunicação; comissões |
| Orçamento | Sintético; analítico; cronograma; cronograma físico-financeiro; curva ABC |
| Gestão de obra | Orçado x realizado; insumos orçados x realizados; curva ABC de insumos; desempenho de custos; pagamentos por etapa |
| Compras | Insumos orçados x comprados; extrato de compras |
| Financeiro | Pagamentos; recebimentos; lançamentos; demonstração de resultado; fluxo de caixa |
| Contábil | Custo diferido e reconhecimento de lucro; C/L contábil; apropriação de resultado (confirmar) |

**Arquivos** (MC): todos os anexos do sistema; data, nome, tipo, tamanho, rotina de origem com link, tag; filtros; espaço usado.

### 9.4 Tarefas

Quadros em pastas; tarefa com título, descrição, responsável, prazo, prioridade, anexos, comentários e vínculo opcional com card, obra ou processo (MC). Agenda e mensagens internas do LoteWin (confirmar) viram tarefas com data e notificações.

## 10. Configurações

São 15 telas. Os valores entre parênteses são os que estão no LoteWin hoje e devem vir como padrão.

**1. Empresa** (MC+LW): razão social, CNPJ, inscrição estadual, endereço, telefone, logotipo; advogado (nome, CPF, OAB); CPF do responsável; empresas adicionais.

**2. Usuários** (MC+LW): nome, e-mail, perfil, status, empresas visíveis, empreendimentos visíveis, corretor vinculado, usuário-chave; redefinir senha.

**3. Perfis de acesso** (MC): nome do perfil e a matriz da seção 3; marcar todos por bloco; copiar perfil.

**4. Alçadas** (MC + NOVO): quem aprova ordem de compra e a partir de qual valor; quem concilia; quem desconcilia; quem aprova relatório gerencial; limite de desconto por perfil; quem autoriza estorno.

**5. Listas de apoio** (MC+LW). Incluir, editar e desativar em cada uma:

| Lista | Valores iniciais |
| --- | --- |
| Status do lote | Advogado, Caucionado, Disponível, Escritura, Invadido, Jurídico, Quitado, Reservado, Vendido; cada um com bloqueio financeiro e bloqueio de venda (hoje só Vendido bloqueia venda) |
| Tipos de parcela | Prestação (P), Sinal (E), Transferência (T), Reembolso (R), Desconto (D), IPTU (I), Regularização (G), Homologação (0), Entrega de Matrícula (M), Pavimentação Asfalto (A), Acordo/Renegociação (@), Diferença (#); cada um com conta de receita e "sofre reajuste" |
| Tipos de reajuste | Anual, Mensal, Fixa, Saldo devedor, Mensal com juros, Mensal juros fixo |
| Tipos de empreendimento | Loteamento, Regularização, AVCB, Construção |
| Veículos de comunicação (origem) | A definir com o cliente |
| Motivos de perda | A definir com o cliente |
| Formas de pagamento | Dinheiro, Pix, Boleto, Cartão, Cheque, Permuta, Transferência |
| Naturezas de receita | Venda de imóveis, Prestação de serviços, Medição, Projetos, Taxa de administração, Reembolso, Juros de contrato, Juros de aplicação, Licitação, Outras receitas |
| Outras | Fontes, setores, segmentos, unidades, tipos e bases de insumo e composição, tipos de retenção, funções e perfis de profissional, solicitantes, condições de pagamento, tags de arquivo, bancos, impostos |

**6. Plano de contas e categorias** (MC+LW): conta com nome, classificação no fluxo de caixa (receita ou despesa) e grupo no resultado; categoria com plano de conta e classificação de custo de obra (mão de obra, material, equipamento, terreno, outros).

**7. Índices** (LW): código, nome, abreviatura (Real, IGPM, IPCA); cotação por mês; índice de correção por atraso.

**8. Regras de cobrança** (LW)

| Parâmetro | Padrão |
| --- | --- |
| Dias de tolerância de mora | 2 |
| Taxa de mora ao mês | 1,00% |
| Dia de início da multa | 0 |
| Taxa de multa | 2,00% |
| Multa diferenciada após N dias e sua taxa | Desligado |
| Multa acumulativa | Não |
| Encargos por empreendimento | Desligado |
| Calcular multa e juros sobre despesa bancária | Não |
| Conceder desconto do cadastro do cliente | Sim |
| Não receber parcela atual havendo atrasada | Não |
| Pagamento parcial atualiza vencimento | Não |
| Unir vendas do mesmo cliente no caixa | Sim |
| Estornar somente administrador | Não |
| Bloquear alteração de parcela paga | Sim |
| Permitir adiantar várias parcelas | Sim |
| Ao quitar, mudar status do lote para Quitado | Sim |
| Texto do recibo; próximo número de recibo; autenticar recibo | Texto livre; 25; não |
| Passos da régua de cobrança | A definir |

**9. Parâmetros de venda** (LW)

- Campos liberados na venda: data de lançamento, área, confrontações, juros, preço, valor do m², valor total.
- Cópia de plano: nenhum, selecionar plano, selecionar valor por m².
- Gerar todas as parcelas após a venda (sim) ou em lotes anuais.
- Plano automático na venda; data de reajuste obrigatória; veículo de comunicação obrigatório.
- Intermediárias e prestações em meses diferentes; primeira parcela com correção pro-rata.
- Base do reajuste anual: contrato, primeira parcela (atual) ou contrato flexível.
- Cálculo do resíduo do mês: anterior, posterior ou atual (atual); resíduo corrigido; rateio do resíduo no saldo; reajuste sobre saldo devedor.
- Comissão: sobre o preço do lote ou sobre entrada e intermediárias; validar valor da comissão.
- Transferência: cobrar taxa; impedir com débito em aberto.
- Datas de venda aceitas (de/até); validade padrão da reserva.
- Máscara do código do lote; pesquisa padrão por comprador, lote, segundo comprador ou proposta.

**10. Boletos e bancos** (LW): por conta, banco, carteira, convênio, layout de remessa; nosso número incremental e próximo número; mensagem do boleto com variáveis de multa e juros; texto da despesa bancária; taxa bancária; bloquear emissão; bloquear parcela com boleto gerado; atualizar boleto vencido; verificar inadimplentes na remessa e limite de parcelas em atraso; PDF com senha; baixa automática e data de crédito.

**11. Quadros e etapas** (NOVO): colunas de cada quadro, ordem, limite de dias, evento que move o card, abas visíveis por perfil.

**12. Modelos de documento** (MC+LW): proposta, contrato, promissória, recibo, termo de quitação, mensagens de WhatsApp e e-mail, com campos de mesclagem do cliente, lote e contrato.

**13. Integrações** (MC + NOVO): WhatsApp, bancos (extrato e boletos), notas fiscais, formulários do site e anúncios (captura de lead), e-mail de envio, API de relatórios.

**14. Auditoria** (MC+LW): quem, quando, rotina, registro, valor anterior e novo; filtros por usuário, período e rotina.

**15. Importação de dados** (NOVO): carga por planilha de pessoas, lotes, contratos e parcelas; importadores do LoteWin e do Mais Controle; relatório de conferência.

**Configurações de outras áreas** (MC): meses de provisionamento de recorrentes; documento obrigatório em lançamento e em pagamento; abrir etapas ao escolher obra; número inicial de cotação e de ordem; ordem sem cotação; CNPJ/CPF obrigatório em fornecedor; expediente das obras (dias e horários); BDI e arredondamento.

O LoteWin tem cerca de 75 chaves; aqui estão as que mudam regra de cálculo ou de bloqueio. As demais (impressão, mensagens de tela) devem ser revistas com o cliente antes de implementar.

## 11. Regras de negócio e cálculos

Estas regras ficam no servidor e têm teste automatizado. As fórmulas exatas do LoteWin não estão documentadas: o que segue é o comportamento observado nas telas, e cada fórmula precisa ser validada contra contratos reais antes de entrar em produção.

### 11.1 Lote

- Chave única: empreendimento + quadra + lote.
- Um lote tem no máximo um contrato ativo.
- Status com "bloqueia venda" impede reserva e venda; com "bloqueia financeiro" impede recebimento e boleto.
- Reserva muda o status para Reservado e expira na validade, voltando a Disponível.
- Venda muda para Vendido; quitação, para Quitado; abertura de escritura, para Escritura; retomada e troca devolvem a Disponível.

### 11.2 Contrato e parcelas

- O plano é formado por séries; cada série tem tipo de parcela, quantidade, valor, moeda e primeiro vencimento.
- A parcela guarda o valor na moeda do contrato e o valor em reais na data.
- Parcelas podem ser geradas todas na venda ou em blocos de 12, a cada reajuste.
- Parcela paga não pode ser alterada; parcela com boleto registrado só muda cancelando o boleto, se a trava estiver ligada.
- Saldo devedor = soma das parcelas em aberto, a valor atualizado.
- Um contrato pode ter mais de um comprador (promitentes) e mais de um lote.

### 11.3 Atraso

- A parcela está em atraso quando passa do vencimento mais os dias de tolerância.
- Juros de mora: taxa mensal proporcional aos dias de atraso, sobre o valor da parcela.
- Multa: percentual único sobre o valor da parcela; multa diferenciada após N dias, se ligada.
- Correção monetária por atraso: pelo índice do contrato, se configurado.
- Encargos do empreendimento prevalecem sobre os do sistema; condições do contrato prevalecem sobre os do empreendimento.
- Desconto por pontualidade: percentual do contrato, válido até o dia limite.
- Total da parcela = valor + juros + multa + correção + despesa bancária − desconto.

Exemplo lido na tela: parcela de R$ 238,75 vencida em 10/07/2026, consultada em 24/11/2026, mostrava juros de R$ 10,90 e multa de R$ 4,78 (2%), total R$ 254,43. Serve como primeiro caso de teste.

### 11.4 Reajuste

- Reajuste anual: no mês-base, as parcelas em aberto dos tipos marcados são multiplicadas pelo fator do índice no período.
- Base do período: data do contrato, primeira parcela ou contrato flexível, conforme configuração.
- Opções: acréscimo percentual sobre o índice, arredondar para valores inteiros, primeira parcela pro-rata.
- O reajuste guarda o valor anterior de cada parcela e pode ser desfeito por completo.
- Resíduo: diferença entre o que foi cobrado e o que o índice indicaria; pode virar parcela própria ou ser rateado no saldo.
- Boletos já emitidos com valor antigo precisam ser reemitidos; o sistema lista quais.

### 11.5 Operações sobre o contrato

| Operação | Efeito | Desfazer |
| --- | --- | --- |
| Antecipação | Desconta juros das parcelas escolhidas pela taxa informada; baixa as parcelas | Estorno do recebimento |
| Transferência | Troca o comprador; mantém plano e histórico; pode gerar parcela de taxa | Sim |
| Renegociação | Encerra as parcelas em aberto e cria novo plano sobre o saldo | Sim |
| Acordo | Junta parcelas atrasadas em novas parcelas do tipo Acordo | Quebra de acordo reabre o saldo |
| Troca de lote | Move o contrato para outro lote; o antigo volta a Disponível | A confirmar |
| Retomada | Cancela o contrato; lote volta a Disponível; guarda histórico | A confirmar |

### 11.6 Integração entre carteira e financeiro

- Cada parcela de contrato é um recebível no financeiro, com cliente, lote, empreendimento e conta de receita do tipo de parcela.
- A baixa no caixa ou pelo retorno do boleto baixa o recebível e cai na conta bancária; não existe segunda digitação.
- Estorno no caixa reabre o recebível.
- Comissão de venda gera lançamento a pagar ao corretor.
- Ordem de compra aprovada gera lançamento a pagar; lançamento apropriado em etapa do orçamento alimenta o realizado da obra.

### 11.7 Movimentos automáticos do Kanban

| Evento | Card vai para |
| --- | --- |
| Lead criado | Novo contato |
| Primeira resposta do atendente | Em atendimento |
| Lote reservado | Proposta e reserva |
| Reserva vencida sem venda | Em atendimento |
| Venda finalizada | Contrato |
| Primeira parcela paga | Carteira em dia |
| Parcela vencida além da tolerância | Cobrança e jurídico |
| Atraso regularizado | Carteira em dia |
| Saldo devedor zerado | Quitado |
| Processo de escritura aberto | Escritura e entrega |
| Matrícula entregue | Concluído |
| Retomada do lote | Retomado |

## 12. Modelo de dados

Sugestão de entidades, agrupadas por módulo. Toda tabela tem `id`, `organization_id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at` e, quando importada, `legacy_system` e `legacy_id`.

| Módulo | Tabelas |
| --- | --- |
| Acesso | organizations, users, profiles, profile\_permissions, user\_organizations, user\_developments, approval\_rules, audit\_log |
| Apoio | lookup\_lists, lookup\_items, indexes, index\_quotes, document\_templates, message\_templates, settings |
| Pessoas | people, person\_roles, person\_addresses, person\_contacts, person\_spouses, person\_attorneys, employees, brokers |
| Comercial | leads, lead\_sources, conversations, messages, proposals, proposal\_items, reservations, price\_tables, price\_table\_values, commissions |
| Empreendimentos | developments, development\_partners, blocks, lots, lot\_status\_history, lot\_notes, site\_plans |
| Contratos | contracts, contract\_buyers, contract\_lots, payment\_plans, plan\_series, installments, installment\_adjustments, contract\_operations (transferência, renegociação, troca, retomada, antecipação, com snapshot para desfazer) |
| Recebimentos | cash\_sessions, receipts, receipt\_items, reversals, bank\_slips, remittance\_files, return\_files, return\_items, adjustment\_runs |
| Cobrança e jurídico | collection\_steps, collection\_contacts, agreements, agreement\_installments, lawsuits, lawsuit\_events |
| Regularização | regularization\_cases, regularization\_steps, regularization\_documents, notary\_offices, deeds |
| Kanban | boards, board\_columns, cards, card\_moves |
| Obras | budgets, budget\_nodes (árvore), budget\_items, inputs, input\_price\_history, compositions, composition\_items, schedules, schedule\_tasks, progress\_entries, management\_reports |
| Compras | purchase\_requests, purchase\_request\_items, quotations, quotation\_items, quotation\_suppliers, quotation\_prices, purchase\_orders, purchase\_order\_items, goods\_receipts |
| Financeiro | chart\_of\_accounts, categories, bank\_accounts, bank\_account\_users, entries (a pagar), entry\_allocations, payables, payments, pre\_entries, invoices (faturamentos), receivables, transfers, bank\_statements, reconciliations, checks |
| Fiscal | tax\_entities, certificates, received\_invoices, issued\_service\_invoices, tax\_files |
| Geral | files, file\_tags, comments, tasks, task\_boards, notifications |

**Relacionamentos centrais**

- `developments` 1:N `blocks` 1:N `lots`.
- `contracts` N:N `people` (por `contract_buyers`, com papel: principal, cônjuge, promitente) e N:N `lots`.
- `contracts` 1:N `plan_series` 1:N `installments`.
- `installments` 1:1 `receivables`: a parcela é a fonte; o recebível é a visão financeira.
- `receipts` N:N `installments` (por `receipt_items`); `bank_slips` N:N `installments` (boleto unificado).
- `cards` aponta para `leads`, `people`, `lots` e `contracts`; só `leads` é obrigatório no início.
- `entries` 1:N `entry_allocations` para `developments` e `budget_nodes`.
- `developments` é o centro de custo comum a lotes, obra, compras e financeiro.

**Índices e desempenho.** A carteira atual tem 3.690 contratos; se os planos tiverem cerca de 88 parcelas, como o único contrato visto, a tabela `installments` fica na ordem de 300 mil linhas na carga inicial (estimativa). Índices por contrato, vencimento, situação e empreendimento são obrigatórios, e o saldo devedor deve ser calculado por consulta agregada, não linha a linha na tela.

## 13. Migração, ordem de entrega e pontos a confirmar

### 13.1 Ordem de entrega

| Fase | Entrega | Resultado |
| --- | --- | --- |
| 1 | Acesso, perfis, auditoria, listas de apoio, pessoas, arquivos | Sistema navegável, com menu e permissões |
| 2 | Empreendimentos, quadras, lotes, planta, status, tabela de preços | Estoque de lotes cadastrado |
| 3 | Contratos, planos, parcelas, ficha financeira, regras de atraso | Carteira calculando igual ao LoteWin |
| 4 | Caixa, boletos, remessa e retorno, reajuste, operações sobre o contrato | Operação de cobrança completa |
| 5 | Importação do LoteWin e conferência | Dados reais no sistema novo |
| 6 | Financeiro: pagar, receber, contas, conciliação, fluxo de caixa, resultado | Substitui o financeiro do Mais Controle |
| 7 | Obras, orçamento, gestão, compras; importação do Mais Controle | Substitui o restante do Mais Controle |
| 8 | Leads, atendimento, propostas, venda em etapas, quadro Jornada | Kanban de ponta a ponta |
| 9 | Cobrança com régua, acordos, jurídico, regularização, demais quadros | Processos novos |
| 10 | Fiscal, relatórios, tarefas, integrações externas | Fechamento |

O Kanban entra na fase 8, mas a tabela `cards` nasce na fase 3: cada contrato importado já ganha o seu card na coluna certa.

### 13.2 Migração

- **LoteWin:** cópia do banco de dados no servidor do cliente. O módulo financeiro aponta para `\\servidor\E\Fannys Informatica\Sistema Financeiro\dadosw\Finance.mdb` (Microsoft Access). O banco principal ainda precisa ser localizado, e seu formato confirmado.
- **Mais Controle:** exportação rotina por rotina e API de relatórios; plano de contas, categorias, listas, usuários e perfis copiados das telas.
- Scripts idempotentes em `/scripts/import`, um por entidade, guardando `legacy_id`.
- Ordem: listas > pessoas > empreendimentos > lotes > contratos > parcelas > recebimentos > financeiro > obras > compras > arquivos.
- Conferência obrigatória contra o painel do LoteWin em 24/11/2026: 41 empreendimentos, 12.995 lotes (3.690 vendidos), 3.504 clientes (2.792 ativos), 3.690 contratos (2.074 ativos), R$ 38.936.075,88 a receber, R$ 6.869.670,85 em atraso.
- **Não contar em dobro:** os recebimentos de lotes também estão no Mais Controle como "venda de lotes" de clientes genéricos. Na importação, valem os do LoteWin; os do Mais Controle são descartados ou casados.
- Nenhum dado foi extraído até agora. A cópia precisa de autorização do cliente e de local de guarda definido, por conter CPF, RG, renda e dados bancários.

### 13.3 Pontos a confirmar antes de programar

- [ ] Campos das etapas 2 a 7 da venda no LoteWin.
- [ ] Fórmulas exatas de juros, correção, reajuste, resíduo e antecipação, validadas com contratos reais.
- [ ] Valores padrão da seção 10: foram lidos de uma tela em acesso remoto e devem ser conferidos pelo cliente.
- [ ] Telas do LoteWin não abertas: comissões, pré-cadastro, resíduos, baixa manual e automática, cobrança, todo o menu Financeiro, usuários e grupos, DIMOB, SPED, NF ABI, cartórios e todos os relatórios.
- [ ] Bancos, carteiras e layout de remessa usados nos boletos.
- [ ] DIMOB, SPED e NFSe: saem do sistema ou do contador? Qual sistema o contador usa?
- [ ] Fluxo real de regularização fundiária: etapas, documentos e prazos.
- [ ] Fluxo de cobrança e do jurídico: quando um contrato vai ao advogado.
- [ ] Canais de entrada de leads e ferramenta de WhatsApp a integrar.
- [ ] Quais das funções sem uso hoje entram: composições, relatório gerencial, medições, estoque, diário de obras, portal do cliente.
- [ ] Stack: a sugerida na seção 1 ou outra já definida.

### 13.4 Limite desta especificação

O lado do Mais Controle foi mapeado tela a tela. O lado do LoteWin foi mapeado em quatro sessões curtas de acesso remoto: todos os menus foram lidos e cerca de vinte telas abertas. O que está marcado "(confirmar)" foi inferido do nome do menu. As funções marcadas NOVO (leads, conversas, régua de cobrança, processos, regularização por etapas, quadros) não existem em nenhum dos dois sistemas e foram desenhadas aqui a partir do seu pedido.

# Relatório unificado: o que o novo sistema precisa ter

Nov 24, 2026 · @Ramael Fernando

## 1. Resumo

O novo sistema precisa de 14 módulos para substituir os dois atuais: o **Mais Controle** cuida de obras, compras e financeiro da empresa, e o **LoteWin** cuida de lotes, compradores, contratos e cobrança. Eles se sobrepõem em 12 funções (seção 2), que aqui viram uma só.

| Módulo do novo sistema | De onde vem |
| --- | --- |
| 1. Pessoas (clientes, compradores, fornecedores, profissionais, corretores) | Os dois |
| 2. Usuários, perfis, alçadas e auditoria | Os dois |
| 3. Empreendimentos, quadras e lotes | LoteWin |
| 4. Vendas e contratos de lote | LoteWin |
| 5. Carteira: parcelas, recebimento e caixa | LoteWin |
| 6. Boletos e remessa bancária | LoteWin (o Mais Controle tem, desligado) |
| 7. Reajuste e operações sobre o contrato | LoteWin |
| 8. Obras, orçamento e gestão de custos | Mais Controle |
| 9. Compras | Mais Controle |
| 10. Financeiro (pagar, receber, contas, fluxo de caixa, resultado) | Os dois |
| 11. Fiscal e contábil | Os dois |
| 12. Painéis e relatórios | Os dois |
| 13. Tarefas, agenda, recados e arquivos | Os dois |
| 14. Configurações e parâmetros | Os dois |

**Tamanho dos dados a migrar**

| Dado | Quantidade | Sistema |
| --- | --- | --- |
| Empreendimentos | 41 | LoteWin |
| Lotes | 12.995 (3.690 vendidos) | LoteWin |
| Clientes compradores | 3.504 | LoteWin |
| Contratos | 3.690 (2.074 ativos) | LoteWin |
| Carteira a receber | R$ 38.936.075,88 | LoteWin |
| Usuários | 7 | Mais Controle |

**Como ler:** em cada tabela a coluna Origem diz de onde veio a função: MC (Mais Controle), LW (LoteWin) ou MC+LW (existe nos dois e foi unificada). "Só menu" marca funções do LoteWin que vi apenas pelo nome no menu, sem abrir a tela; o detalhe delas precisa ser confirmado (seção 11).

O detalhe tela a tela, com todos os campos, está no documento [Mapeamento do Mais Controle + Prompt de desenvolvimento (Cursor)](https://claude.ai/artifact/Y1Kn5ghMnLhrQu7VbidvRo).

## 2. O que se repete nos dois e vira uma coisa só

Doze funções existem nos dois sistemas. O novo sistema fica com uma versão de cada, com os campos e regras do lado mais completo.

| Função | No Mais Controle | No LoteWin | No novo sistema |
| --- | --- | --- | --- |
| Cadastro de clientes | Clientes (PJ/PF, contatos, fonte, setor) | Compradores (dados civis, cônjuge, procurador, demais promitentes) | Um cadastro de pessoas com papéis; os campos civis do LoteWin entram como bloco do comprador |
| Fornecedores e favorecidos | Fornecedores com qualificação e segmento | Favorecidos e Sacados (só menu) | O mesmo cadastro de pessoas, papel fornecedor |
| Usuários e permissões | Usuários, Perfis de Acesso por rotina, visibilidade por obra | Usuários, Grupo de usuários, Acessos | Um controle de acesso por perfil e rotina, com visibilidade por obra, empreendimento e conta |
| Auditoria | Histórico de Alterações | Auditoria, Histórico de Lotes | Um registro de quem fez o quê, consultável por usuário, rotina, período e lote |
| Obra x Empreendimento | Obra do tipo Loteamento, com orçamento e custos | Empreendimento, com quadras e lotes | Um empreendimento com dois lados: custo (obra) e venda (lotes) |
| Contas bancárias | Contas, saldo, integração, conciliação | Conta corrente, Bancos, de-para com o financeiro | Um cadastro de contas, usado por pagamentos, recebimentos e boletos |
| Contas a receber | Faturamentos e Recebimentos lançados à mão | Parcelas do contrato, caixa, baixa por boleto | As parcelas do contrato geram o recebível; acaba a digitação dupla de "venda de lotes" |
| Contas a pagar e compras | Lançamentos, Pagamentos, Solicitação, Cotação, Ordem de Compra | Financeiro > Movimento > Contas e Compras (só menu) | O fluxo do Mais Controle, que é o mais completo |
| Plano de contas e centro de custo | Plano de contas, Categorias, centro de custo por obra | Tipos de Centros de Custos, códigos de receita | Um plano de contas e um centro de custo (empresa, obra ou empreendimento) |
| Boletos | Cobrança Fácil (não ativada) | Remessa CNAB, boleto, carnê, baixa automática | Um módulo de boletos, com as regras do LoteWin |
| Notas fiscais | Captura de NFe, emissão de NFSe | NFSe, NF ABI (só menu) | Um módulo fiscal: NFe recebidas e NFSe emitidas |
| Painéis e relatórios | Painel de obras e financeiro; relatórios de orçamento, gestão, compras, financeiro | Painel de carteira; relatórios financeiros e técnicos | Um painel com as duas visões e uma central de relatórios |

Também se repetem, com menor peso: anexos de documentos, modelos de contrato, recados e comentários, comissões e vendedor, e envio por WhatsApp.

**Ganho da unificação:** hoje a venda de lotes entra no Mais Controle como recebimento de um cliente genérico ("MIRASSOL - VENDA DE LOTES"), digitado à parte. No sistema único, cada parcela recebida já cai no financeiro com o comprador, o lote e o empreendimento certos.

## 3. Base e cadastros

### 3.1 Pessoas

Um cadastro único, em que a mesma pessoa pode ter vários papéis.

| Função | Origem |
| --- | --- |
| Pessoa física ou jurídica, ativo/inativo, com um ou mais papéis: cliente, comprador, fornecedor, profissional, corretor, sócio | MC+LW |
| Dados básicos: nome ou razão social, nome fantasia, CPF/CNPJ, inscrições estadual e municipal, telefones, celular, e-mail | MC+LW |
| Dois endereços (residencial/sede e comercial/representante legal) e escolha do endereço de correspondência; busca por CEP | LW |
| Dados civis do comprador: sexo, nascimento, nacionalidade, naturalidade, filiação, profissão, RG, órgão expedidor, renda familiar, estado civil, data de casamento, regime | LW |
| Cônjuge com os mesmos dados civis | LW |
| Procurador (nome, CPF) e demais promitentes do contrato | LW |
| Pessoas de contato (nome, cargo, e-mail, telefone, aniversário); opção de usar o contato em cotações e ordens de compra | MC |
| Cliente: fonte, setor, conta bancária, comentário | MC |
| Fornecedor: segmento, qualificação em estrelas, CNPJ/CPF obrigatório por configuração | MC |
| Profissional: status (ativo, inativo, afastado, interessado, ex-funcionário), função, nível, regime (horista, diarista, mensalista, empreiteiro), remuneração com permissão própria, admissão, demissão, referências | MC |
| Corretor e comissão | LW |
| Pré-cadastro de cliente (antes da venda) | LW, só menu |
| Mala direta e mensagem de aniversário | LW |
| Importar, exportar, imprimir e remover em lote | MC |

### 3.2 Usuários, perfis e auditoria

| Função | Origem |
| --- | --- |
| Login, logoff, troca de senha, troca de usuário | MC+LW |
| Usuários com perfil de acesso e status; usuário-chave | MC+LW |
| Perfis com permissão por rotina: visualizar, inserir/alterar, remover | MC |
| Visibilidade por empresa, por obra/empreendimento e por conta bancária | MC |
| Ações restritas a administrador: estornar, alterar valor menor na ficha, editar nosso número | LW |
| Alçadas: aprovação de compras, conciliação, desconciliação, relatório gerencial | MC |
| Auditoria de alterações por usuário, rotina e período; histórico por lote | MC+LW |
| Mais de uma empresa (CNPJ) na mesma conta, com seletor | MC+LW |

### 3.3 Listas de apoio

Cadastros simples, editáveis pelo cliente: fontes, setores, segmentos, unidades, tipos de obra, tipos e bases de insumos e composições, tipos de retenção, perfis de profissional, solicitantes, condições de pagamento, tags de arquivo (MC); cartórios, bancos, índices/moedas, status de lote, códigos de recebimento, veículos de comunicação, impostos, sócios (LW).

### 3.4 Arquivos, recados e comentários

| Função | Origem |
| --- | --- |
| Anexos em qualquer cadastro (até 10 MB), com tag | MC+LW |
| Repositório central de arquivos com filtro por período, rotina, tipo e tag | MC |
| Recado por lote ou cliente, que aparece ao abrir o caixa; recado padrão por empreendimento | LW |
| Comentários em obra, pagamento, solicitação e proposta | MC |
| Observações do lote | LW, só menu |

## 4. Empreendimentos e lotes

O empreendimento é o centro do sistema: liga os lotes e contratos (lado da venda) à obra e seus custos (lado da execução).

| Função | Origem |
| --- | --- |
| Cadastro do empreendimento: código, nome, tipo (loteamento, regularização, AVCB, construção), status, cidade, UF, CEP, código do município, área total, quantidade de quadras e de lotes | MC+LW |
| Empresa administradora por empreendimento (razão social, CNPJ, endereço, telefone) | LW |
| Sócios do empreendimento e relatório dos sócios | LW |
| Matrícula (número e data), complemento da quadra | LW |
| Conta corrente padrão e numeração de recibo própria | LW |
| Encargos próprios do empreendimento: dias e taxa de mora, dia e taxa de multa | LW |
| Site da prefeitura para consulta de IPTU | LW |
| Dados de obra: ART, CEI/CNO, responsável técnico, responsável da obra, endereço, contatos, quem paga, dados de faturamento | MC |
| Usuários que enxergam o empreendimento | MC |
| Duplicar empreendimento | MC |
| Despesas do empreendimento | LW, só menu |

**Lotes**

| Função | Origem |
| --- | --- |
| Lote identificado por Empreendimento + Quadra + Lote, com máscara configurável | LW |
| Campos do lote: área, padrão, custo, valor, confrontações (frente, fundo, direita, esquerda), observações, fotos | LW |
| Gerar lotes em massa por quadra; incluir, alterar, excluir | LW |
| Atualizar o valor do m² em massa | LW |
| Status do lote configurável, cada um com "bloqueia financeiro" e "bloqueia venda". Em uso: Advogado, Caucionado, Disponível, Escritura, Invadido, Jurídico, Quitado, Reservado, Vendido | LW |
| Alterar status do lote; ao quitar, mudar para Quitado automaticamente | LW |
| Planta do loteamento com imagem e cores para lotes vagos e vendidos | LW |
| Tabela de preços por empreendimento: valor por m² por tabela, % juros, % entrada, opções de número de parcelas, comissão, abater entrada no financiamento, status a não listar | LW |
| Histórico do lote (vendas anteriores, retomadas, trocas) | LW |
| Importação de empreendimentos e lotes | LW |

## 5. Vendas e contratos de lote

A venda é um assistente em sete etapas que termina num contrato com plano de pagamento.

1. Selecionar um ou mais lotes (carrinho com área, padrão, status, proposta, preço).
2. Comprador e demais promitentes.
3. Adicionais e recados.
4. Dados do lote.
5. Cópia de plano (reaproveitar um plano existente).
6. Plano de pagamento.
7. Comissão e finalização.

Só a etapa 1 foi vista por dentro; as demais estão descritas pelo nome e pelas telas vizinhas.

| Função | Origem |
| --- | --- |
| Origem da venda: direta, pré-venda, pré-venda vinda de aplicativo | LW |
| Contrato com: proposta/número, comprador, lote, corretor, preço, valor base, base para comissão | LW |
| Datas: contrato, assinatura, venda (DIMOB), lançamento, vencimento da 1ª parcela, última parcela, última transferência | LW |
| Plano em séries: entradas (sinal), prestações e intermediárias, cada série com quantidade, saldo, valor, moeda, data da próxima prestação e data do reajuste | LW |
| Tipo de reajuste por contrato: anual (com mês-base), mensal, fixa, saldo devedor, mensal com juros, mensal com juros fixo | LW |
| Moeda de referência, moeda do resíduo e moeda da correção por atraso (Real, IGPM, IPCA) | LW |
| Condições do contrato: acréscimo de reajuste, desconto % até o dia N, taxa de banco, multa (acumulativa ou não) e percentual, conta corrente, emite boleto | LW |
| Parcelas geradas todas de uma vez ou em lotes anuais (ex.: 88 contratadas, 12 geradas) | LW |
| Tipos de parcela: Prestação, Sinal, Transferência, Reembolso, Desconto, IPTU, Regularização, Homologação, Entrega de Matrícula, Pavimentação, Acordo/Renegociação, Diferença | LW |
| Impressão de contrato por modelo, promissórias e documentos do contrato | MC+LW |
| Comissões: cálculo sobre o preço do lote ou sobre entrada/intermediárias; parcela de comissão | LW |
| Veículo de comunicação (origem da venda), obrigatório por configuração | LW |
| Consulta geral de vendas por empreendimento e período | LW |
| Funil de vendas em kanban, com etapas e responsável | MC |
| Proposta comercial com status, desconto, condição de pagamento e histórico de negociação | MC |

## 6. Carteira: recebimento, boletos, reajuste e operações

Este módulo só existe no LoteWin e é o de regra mais pesada. Todas as funções abaixo vêm dele.

### 6.1 Ficha financeira do contrato

- Extrato por lote com todas as parcelas: tipo, vencimento, data de pagamento, valor na moeda, valor em reais, juros, multa, correção monetária, despesa bancária, número da prestação ("x de y").
- Incluir, alterar e excluir parcela; alterar vencimento; registrar pagamento; recado.
- Pesquisar e cancelar boleto da parcela.
- Consulta de vendas atuais e de vendas canceladas, renegociadas, transferidas ou trocadas.
- Exportar para Excel; versão em relatório.

### 6.2 Recebimento no caixa

- Abertura com data do dia, dias de tolerância de mora e opção de recibo em 1 ou 2 vias.
- Parcelas em aberto do comprador com juros, correção, multa, desconto e total calculados até a data; seleção das parcelas a pagar e total.
- Pagamento, pagamento com data anterior, estorno (pode ser restrito a administrador), recibo com autenticação e texto configurável.
- Movimento do caixa, fechamento e saldo do caixa.
- Regras configuráveis: não receber parcela atual havendo atrasada, pagamento parcial atualiza vencimento, unir vendas no caixa, multa acumulativa.
- Correção do contato do comprador na própria tela.

### 6.3 Encargos por atraso

- Padrão atual: mora de 1% após 2 dias e multa de 2%.
- Multa diferenciada após N dias; encargos por empreendimento; correção monetária por atraso em moeda fixa.
- Desconto por pontualidade vindo do cadastro do cliente.

### 6.4 Boletos e remessa bancária

- Geração por mês, empreendimento, cliente, tipo de receita e conta corrente.
- Saídas: arquivo de remessa CNAB, boleto avulso, carnê (retrato ou paisagem), envio em PDF com senha.
- Opções: atualizar parcelas, atualizar só vencimento, reemitir, unificar parcelas num boleto, filtrar por dia de vencimento, bloqueados e reajustados no mês, atualizar encargos para N dias.
- Mensagem do boleto com variáveis de multa e juros; instruções; nosso número incremental.
- Baixa manual e baixa automática por arquivo de retorno; relatório de boletos e de boletos cancelados.
- Bancos em uso: Sicredi (código 748 nas contas); a tela cita Itaú, Bradesco, HSBC, Banco do Brasil e Caixa.
- Travas: bloquear emissão, bloquear alteração de parcela com boleto gerado, verificar inadimplentes ao gerar remessa.

### 6.5 Reajuste

- Cadastro de índices com cotação por período.
- Correção monetária anual em lote: por período, índice, fator, empreendimento e tipos de parcela; lista dos contratos atingidos; relatório; **desfazer reajuste**.
- Opções: acréscimo exponencial, ignorar quitados, valores inteiros, primeira parcela pro-rata, reajuste sobre saldo devedor.
- Base do reajuste anual: data do contrato, primeira parcela ou contrato flexível.
- Resíduos: cálculo do residual do mês, resíduo corrigido, rateio do resíduo no saldo das parcelas.

### 6.6 Operações sobre o contrato

| Operação | O que faz |
| --- | --- |
| Adiantamento de parcelas | Quitação antecipada com taxa de desconto, do fim para o início do plano ou o inverso; valor da quitação |
| Transferência | Troca o comprador do contrato; pode cobrar taxa; pode ser desfeita |
| Renegociação | Refaz o plano do saldo devedor; pode ser combinada com transferência; pode ser desfeita |
| Troca de lote | Passa o contrato para outro lote, com data de base |
| Retomada de lote | Cancela a venda e devolve o lote, com data da retomada e opção de guardar o histórico |
| Alteração de plano | Edita as séries de parcelas do contrato |
| Alteração de cadastro do cliente | Edita o comprador do contrato |

### 6.7 Cobrança e inadimplência

- Lista de inadimplentes, próximos vencimentos e últimos recebimentos.
- Rotina de cobrança e relatórios de cobrança, inadimplência e histórico da inadimplência (só menu).
- Status Advogado e Jurídico para lotes em cobrança judicial.
- Aviso de parcelas em atraso em contratos renegociados.

## 7. Obras: orçamento, gestão e compras

Este bloco só existe no Mais Controle. Todas as funções abaixo vêm dele.

### 7.1 Catálogo

- Insumos: grupo (material, mão de obra, equipamento, outros), código, descrição, unidade, tipo, base, custo, status, favorito, histórico de preços; importar, exportar, imprimir.
- Composições: serviço formado por insumos com coeficiente; custo por grupo, BDI e preço unitário. Hoje sem uso na conta.

### 7.2 Orçamento

- Árvore Etapa > Subetapa > Item, com insumos e composições, quantidade, custo unitário, custo total e BDI (dinâmico ou fixo); arredondamento; trava de edição.
- Cronograma em Gantt por etapa, com duração, início, fim, predecessores, caminho crítico e dias não úteis.
- Cronograma físico-financeiro por período.
- Proposta gerada a partir do orçamento e contratos por modelo.
- Relatórios: sintético, analítico, por etapa e área de obra, curva ABC.

### 7.3 Gestão da obra

- Evolução física (%) e status da obra; cronograma planejado e realizado.
- Orçado x realizado por grupo e por etapa/item, com saldo e % realizado; custos sem apropriação; custo por m².
- Curva S, Gantt, arquivos e anotações.
- Relatório gerencial periódico com aprovação por alçada.
- Relatórios: insumos orçados x realizados, curva ABC, custos por área, custos por categoria, resultado financeiro, pagamentos, pagamentos por etapa, desempenho de custos.
- Expediente das obras (dias e horários), base do cronograma.

### 7.4 Compras

Fluxo encadeado, com vínculo entre as etapas:

1. **Solicitação:** por centro de custo, com necessidade, urgência e itens ligados à etapa do orçamento. Status: rascunho, em aprovação, a atender, em andamento, concluída, recusada. Contadores de cotado, comprado e recebido; marcar recebimento.
2. **Cotação:** itens, fornecedores convidados, mapa comparativo de preços com melhor compra, desconto e frete. Status de em aberto a finalizado.
3. **Ordem de compra:** fornecedor, itens por obra, frete, impostos, desconto, condição de pagamento, prazo e local de entrega. Aprovação (aprovado, em aberto, negociando, aguardando, negado) e entrega (aguardando, comprado, parcial, total).
4. **Lançamento financeiro** gerado a partir da ordem.

Também: alçada de aprovação, numeração inicial configurável, ordem sem cotação por configuração, envio por WhatsApp, leitura de orçamento em PDF, relatórios de insumos orçados x comprados e extrato de compras.

## 8. Financeiro, fiscal e contábil

O financeiro do novo sistema segue o desenho do Mais Controle, que é o mais completo, e recebe automaticamente o que vem da carteira de lotes.

### 8.1 Contas a pagar

| Função | Origem |
| --- | --- |
| Lançamento com valor, descrição, favorecido, categoria, competência, vencimento, pagador (empresa ou cliente), conta, documento e forma de pagamento | MC |
| Apropriação por centro de custo: empresa, obra/empreendimento, etapa e item do orçamento; rateio entre várias obras; vínculo com insumos | MC |
| Parcelamento, recorrência (com meses de provisionamento) e retenções | MC |
| Pagamento, baixa parcial, estorno, pagar e conciliar em lote | MC |
| Lista por mês com filtros por conta, favorecido, centro de custo, categoria, condição, forma, ordem de compra e retenção; colunas configuráveis; totais | MC |
| Pré-lançamento: despesa enviada por qualquer usuário, que o financeiro aprova ou recusa | MC |
| Leitura automática de documento para preencher o lançamento | MC |
| Cheques pré-datados | LW, só menu |

### 8.2 Contas a receber

| Função | Origem |
| --- | --- |
| Recebíveis gerados pelas parcelas dos contratos de lote, com comprador, lote e empreendimento | LW |
| Faturamento avulso (serviços, medições, projetos, taxas): valor, cliente, natureza, competência, vencimento, centro de custo, conta, vendedor | MC |
| Parcelamento, impostos retidos, recebimento, estorno | MC |
| De-para entre tipo de parcela e conta de receita; centro de custo de comissão | LW |
| Importação de faturamentos | MC |

### 8.3 Contas, caixa e resultado

| Função | Origem |
| --- | --- |
| Contas bancárias e caixa: banco, agência, tipo, proprietário (empresa ou cliente), saldo inicial, usuários que veem o saldo, bloqueio | MC+LW |
| Transferências entre contas | MC |
| Extrato e conciliação: manual, por arquivo OFX e por integração bancária; conciliação automática | MC+LW |
| Fluxo de caixa: plano de contas x período, realizado e previsto, por conta, proprietário e centro de custo | MC |
| Demonstrativo de resultados mensal, por caixa ou competência, por centro de custo | MC+LW |
| Plano de contas, categorias e classificação de custo de obra | MC+LW |

### 8.4 Fiscal e contábil

| Função | Origem |
| --- | --- |
| Captura de NFe emitidas contra o CNPJ, com vínculo ao lançamento, PDF e XML | MC |
| Emissão de NFSe a partir do recebimento; cadastro de CNPJs e certificado digital | MC+LW |
| DIMOB (declaração de vendas de imóveis) | LW, só menu |
| SPED Contribuições: contador, declarantes, empresas SCP, geração de arquivo | LW, só menu |
| Exportação para a contabilidade (Domínio, Folhamatic, ConsisaNet, Copan, Telecont) e arquivo para contabilidade | LW |
| Relatórios contábeis: custo diferido e reconhecimento de lucro, apropriação de resultado, C/L contábil | LW, só menu |
| Impostos | LW, só menu |

## 9. Painéis, relatórios, tarefas e configurações

### 9.1 Painel inicial

Um painel único, com blocos conforme o perfil do usuário.

| Bloco | Origem |
| --- | --- |
| Carteira: empreendimentos, lotes e vendidos, clientes ativos, contratos ativos, total a receber, vencimentos em 30 dias, inadimplência | LW |
| Listas: últimos recebimentos, inadimplentes, próximos vencimentos | LW |
| Obras por status, com evolução física, orçado, realizado e saldo | MC |
| Pagamentos e recebimentos em aberto: vencidos, hoje, 7 dias, 30 dias | MC |
| Pré-lançamentos pendentes, notas fiscais sem lançamento, fluxo de caixa | MC |
| Notificações | MC |

### 9.2 Central de relatórios

Todos com filtro por empreendimento/centro de custo e período, saída em tela, PDF e Excel, e favoritos.

| Grupo | Relatórios | Origem |
| --- | --- | --- |
| Lotes | Lotes, por status, vagos, vendidos, quitados, cancelados, por plano, histórico de lotes, controle de lotes, escrituras | LW |
| Carteira | Posição financeira, previsão da carteira, previsão e recebimentos, geral recebido, vendas e recebimentos de lotes, parcelas adiantadas, reajustes anuais, resíduos, ficha financeira | LW |
| Cobrança | Inadimplência, histórico da inadimplência, cobrança, boletos, boletos cancelados | LW |
| Caixa e sócios | Relatório de caixa (resumo e fechamento), relatório dos sócios | LW |
| Comercial | Veículos de comunicação, comissões | LW |
| Orçamento | Sintético, analítico, cronograma, cronograma físico-financeiro, curva ABC | MC |
| Gestão de obra | Orçado x realizado, insumos orçados x realizados, curva ABC de insumos, desempenho de custos, pagamentos por etapa | MC |
| Compras | Insumos orçados x comprados, extrato de compras | MC |
| Financeiro | Pagamentos, recebimentos, lançamentos (simples e agrupados), demonstração de resultado, fluxo de caixa | MC+LW |

Os relatórios do LoteWin estão listados pelo nome do menu; nenhum foi aberto.

### 9.3 Tarefas, agenda e comunicação

| Função | Origem |
| --- | --- |
| Quadros de tarefas em kanban, em pastas, com responsável, prazo, prioridade e anexos | MC |
| Agenda, contatos e mensagens internas | LW, só menu |
| WhatsApp: solicitações de compra, cotações, ordens e pré-lançamentos | MC |
| E-mail: envio de boletos e relatórios | LW |

### 9.4 Configurações e parâmetros

| Grupo | Parâmetros | Origem |
| --- | --- | --- |
| Empresa | Dados, logotipo, advogado (nome, CPF, OAB), responsável | MC+LW |
| Encargos | Dias e taxa de mora, dia e taxa de multa, multa diferenciada, por empreendimento | LW |
| Caixa | Recibo, autenticação, estorno restrito, regras de recebimento | LW |
| Vendas | Campos liberados na venda, plano automático, geração de parcelas, veículo obrigatório, validação de datas, cálculo de comissão | LW |
| Boletos | Mensagens, nosso número, despesa bancária, travas de emissão e de baixa | LW |
| Reajuste | Tipos de reajuste, base do reajuste anual, cálculo de resíduo | LW |
| Financeiro | Meses de provisionamento, documento obrigatório, abertura automática de etapas | MC |
| Compras | Numeração inicial, ordem sem cotação, alçada | MC |
| Obras | Expediente, modelo de proposta, BDI, arredondamento | MC |
| Aparência | Cores da planta, máscara do código do lote, opção padrão de pesquisa | LW |

O LoteWin tem cerca de 75 chaves de liga/desliga nos parâmetros. Antes de reproduzir todas, vale perguntar ao cliente quais estão de fato em uso: muitas existem para atender outros clientes do fornecedor.

## 10. O que fica de fora ou depende de decisão do cliente

**Pode sair sem perda** (são do fornecedor, não do negócio)

- Guia de implantação, comunicados, Hub de Soluções, Indique e Ganhe, blog e loja de adicionais do Mais Controle.
- Minha Assinatura e limites de plano.
- Acesso remoto e licença da máquina do LoteWin.
- Itens desabilitados no menu do LoteWin (importação Excel Vece, parâmetros do financeiro, relatórios de previsão e de cheques).

**Existe no sistema atual, mas não está em uso: decidir se entra**

| Função | Situação hoje |
| --- | --- |
| Composições de serviço | Disponível, sem nenhum cadastro |
| Tarefas em kanban | Disponível, sem quadros |
| Contratos por modelo no orçamento | Disponível, sem documentos |
| Relatório gerencial de obra | Disponível, sem relatórios |
| Emissão de NFSe | Disponível, nenhuma emitida |
| Pré-lançamentos | Disponível, nenhum pendente |
| Medição de obras e de contratos, Estoque, Diário de obras | Não contratados |
| Portal do cliente | Não contratado |
| BI | Não contratado |
| Módulo Plantão de vendas e aplicativo de pré-venda | Existem no LoteWin; uso não confirmado |

**Integrações externas: cada uma é um projeto à parte**

- Integração bancária (Open Finance) para extrato e conciliação: 12 contas ligadas hoje.
- Registro de boletos e arquivos de remessa e retorno por banco.
- Captura de NFe e emissão de NFSe, que dependem de certificado digital e da prefeitura.
- WhatsApp.
- Exportação para o sistema da contabilidade: confirmar qual dos cinco formatos o contador usa.
- DIMOB e SPED: confirmar se são gerados pelo sistema ou pelo contador.

**O que nenhum dos dois tem e você já planejava**

Processo de regularização fundiária com etapas, documentos e prazos (hoje ele aparece só como tipo de parcela e nome de empreendimento) e portal do comprador com parcelas e segunda via.

## 11. Pendências e migração

Este relatório cobre os dois sistemas por inteiro no nível de função, mas não no nível de campo: parte do LoteWin foi lida só pelo nome do menu, porque cada sessão de acesso remoto dura cerca de 4 minutos.

**Telas do LoteWin ainda não abertas**

- Etapas 2 a 7 da venda e a edição do lote.
- Comissões, pré-cadastro de cliente, veículos de comunicação, observações do lote.
- Resíduos, despesas do empreendimento, alteração de planos.
- Baixa manual e automática de boletos, cobrança.
- Todo o menu Financeiro (bancos, contas, compras, cheques, impostos, sócios, movimento).
- Usuários, grupos, auditoria, agenda e mensagens.
- DIMOB, SPED, NF ABI, cartórios, conta corrente.
- Todos os relatórios.

**Telas do Mais Controle ainda não abertas**

Nova cotação, nova transferência, extrato e conciliação bancária, importadores e o conteúdo de cada relatório.

**Perguntas para o cliente**

- [ ] Quais parâmetros e chaves do LoteWin estão de fato em uso?
- [ ] O Plantão de vendas e o aplicativo de pré-venda são usados?
- [ ] Com quais bancos os boletos são registrados hoje e em que carteira?
- [ ] DIMOB, SPED e NFSe saem do sistema ou do contador? Qual sistema o contador usa?
- [ ] O financeiro do LoteWin ("Finance") é usado, ou todo o financeiro da empresa já está no Mais Controle?
- [ ] Como é o processo de regularização fundiária fora do sistema (etapas, documentos, prazos)?
- [ ] Das funções sem uso da seção 10, quais devem entrar?

**Migração de dados**

| Origem | Como obter | Situação |
| --- | --- | --- |
| LoteWin: empreendimentos, lotes, compradores, contratos, parcelas, recebimentos | Cópia do banco de dados no servidor do cliente. O módulo financeiro aponta para `\\servidor\E\Fannys Informatica\Sistema Financeiro\dadosw\Finance.mdb` (Microsoft Access); o banco principal deve estar na mesma estrutura, a confirmar | Não obtido |
| Mais Controle: contatos, insumos, orçamentos, compras, lançamentos, pagamentos, recebimentos, arquivos | Exportação rotina por rotina e API para Relatórios (já ativada) | Não iniciado |
| Mais Controle: plano de contas, categorias, listas de apoio, usuários, perfis | Sem exportação; copiar das telas | Não iniciado |

Nenhum dado foi baixado até agora. Os dois sistemas guardam dados pessoais e financeiros (CPF, RG, renda, contas), então a cópia precisa da autorização do cliente e de um local de guarda definido.

**Ponto de atenção na migração:** o mesmo dinheiro está nos dois sistemas. As parcelas recebidas no LoteWin também foram lançadas no Mais Controle como recebimentos genéricos de "venda de lotes". Ao importar os dois, esses recebimentos precisam ser casados ou descartados para não contar em dobro.

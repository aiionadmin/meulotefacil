# Prompt para o Cursor: ajustes do cliente + Obras, Compras e Financeiro iguais ao Mais Controle

25/11/2026

## 1. O que o cliente pediu

Este documento é um prompt único, com tudo, dividido em 5 partes (seções 2 a 6). Cole inteiro no Cursor ou uma parte por vez, nesta ordem. Na tabela abaixo, a coluna "Prompt" indica a parte. Ele parte do sistema como está hoje no repositório (demo com dados locais) e incorpora as anotações à mão do cliente e a orientação de deixar Obras, Compras e Financeiro iguais ao Mais Controle, com RDO.

**Uma decisão que as anotações resolvem:** a empresa trabalha com lotes e com regularização. O cliente pede que cada empreendimento seja marcado como só lote, só regularização ou ambos. Isso encerra a dúvida da análise anterior.

| Anotação do cliente | Como entrou | Prompt |
| --- | --- | --- |
| Quadros 2.1 (Jornada) e 2.3 (Regularizações e escrituras) não retornam, só avançam | Card só anda para a frente; atraso vira selo no card e vai para o quadro de Cobrança | 1 |
| Qualificação de leads mais completa | Campos de qualificação e pontuação no lead | 1 |
| Na proposta, informar qual empreendimento | Empreendimento obrigatório na proposta | 1 |
| Filtros nos campos de busca | Filtros em todas as listas e nos campos de seleção | 1 |
| Empreendimentos: importar lotes e quadras por Excel | Importador com modelo e conferência | 1 |
| Empreendimento só lote, só regularização ou ambos | Campo "modalidade" que liga e desliga abas e etapas | 1 |
| Planta em PDF, real ao projeto | Upload do PDF da planta, com marcação dos lotes por cima | 1 |
| Sistema multiempresas | Seletor de empresa e todos os dados separados por empresa | 1 |
| Ao entrar em Ficha financeira o sistema trava | Correção de erro, com paginação no servidor | 1 |
| Edições em remessa | Edição em lote nas listas | 1 |
| Importação e exportação em remessa (PDF, Excel) | Exportar PDF e Excel em toda lista; importar Excel nos cadastros | 1 |
| Obras e orçamentos não têm nada | Módulo Obras completo, igual ao Mais Controle, com RDO | 2 |
| Compras: Solicitação, Cotação, OC, sempre com centro de custo | Fluxo em três etapas com aprovação; centro de custo obrigatório | 3 |
| Financeiro: criar categorias e planos de conta | Cadastros com a carga inicial copiada do Mais Controle | 4 |
| Financeiro: lançamentos > pagamentos, faturamentos > recebimentos, notas fiscais, contas, fluxo de caixa e resultados por empresa, obra e geral | Módulo Financeiro completo | 4 |
| Dashboards: números gerais e gerencial | Dois painéis | 5 |
| Portal do corretor: gestão de leads | Portal próprio | 5 |
| Portal do cliente: lotes e regularização | Portal próprio | 5 |
| Gestão de empreendimento: planta, gestão visual de lotes, propostas e contratos, boletos, previsão de carteira, KPI de inadimplência | Visão única por empreendimento | 5 |
| Gestão de demandas (ligação de água, marcação de lotes...) | Módulo novo de demandas | 5 |

**Três leituras minhas que você deve conferir com o cliente:**

- "Só avançam": entendi que nenhum card volta de coluna. Com isso, atraso de pagamento deixa de mover o card na Jornada.
- "Independentes", escrito ao lado de Obras: entendi que a obra tem cadastro próprio, sem depender de um empreendimento de lotes. O vínculo fica opcional.
- Na segunda folha há "Lançamentos" com três ramificações ilegíveis na foto. Não entrou em nenhum prompt.

## 2. Parte 1: abertura e ajustes gerais

**Contexto para o Cursor**

Você está trabalhando no repositório `aiionadmin/meulotefacil` (Next.js 15 App Router, React 19, TypeScript, Tailwind v4, shadcn/Radix, Supabase, React Hook Form + Zod, TanStack Table, dnd-kit, Recharts). Hoje o sistema é uma demonstração: os dados vêm de seeds e ficam no navegador. A especificação de referência está em `docs/especificacao.md`. Este prompt complementa a especificação e, onde houver conflito, vale este prompt.

Regras de trabalho:

- Entregue por partes, um PR por parte, na ordem deste documento. Não faça deploy.
- Todo dado novo nasce no Supabase, com migration, RLS e tipos gerados. Não crie nada novo em localStorage.
- Regra de dinheiro (juros, multa, saldo, baixa, rateio) roda no servidor, com teste automatizado.
- Mantenha a identidade visual atual do Meu Lote Fácil. "Igual ao Mais Controle" significa mesmas telas, campos, fluxos, status e relatórios, e não a cópia de marca, textos ou desenho de tela.
- Ao terminar cada parte, liste o que ficou pronto, o que ficou pendente e como testar.

**2.1 Multiempresas**

- Tabela `empresas` (razão social, nome fantasia, CNPJ, endereço, logo, status). Toda tabela de negócio recebe `empresa_id` obrigatório, com RLS que só libera as empresas do usuário.
- Seletor de empresa na barra superior, com a opção "Todas" para quem tem acesso a mais de uma. A escolha vale para todas as telas e fica gravada por usuário.
- No cadastro de usuário: "Visibilidade das empresas" e "Visibilidade das obras".
- Plano de contas, categorias, naturezas, contas bancárias, numeração de documentos e parâmetros são por empresa. Ao criar uma empresa, copie o padrão da seção 5.9.
- Relatórios, fluxo de caixa e resultados aceitam uma empresa, várias ou o consolidado.

**2.2 Empreendimento: modalidade, importação e planta**

- Campo obrigatório **Modalidade**: `Loteamento`, `Regularização` ou `Loteamento e regularização`. A modalidade liga e desliga abas, etapas dos quadros e campos. Empreendimento só de regularização não mostra venda de lotes; só de loteamento não mostra o quadro de regularizações.
- **Importar quadras e lotes por Excel**: botão "Importar" na aba Lotes, com download do modelo (.xlsx). Colunas do modelo: quadra, lote, área (m²), frente, fundo, lateral direita, lateral esquerda, confrontações, matrícula, inscrição municipal, preço à vista, situação, observação. Fluxo: enviar arquivo, tela de conferência com erros por linha (lote repetido, área inválida, situação desconhecida), opção de criar novos e atualizar existentes, confirmação e relatório final (criados, atualizados, recusados). Nada é gravado antes da confirmação.
- **Planta real em PDF**: upload do PDF do projeto por empreendimento (várias folhas e versões, com data e autor). A planta abre em visualizador com zoom e arraste. Modo de edição para desenhar a área de cada lote sobre a planta e ligar ao cadastro. Modo de consulta com cada lote colorido pela situação (disponível, reservado, proposta, vendido, quitado, inadimplente, bloqueado), legenda, filtro e clique no lote para abrir a ficha. Guarde o PDF original e gere imagem para exibir.

**2.3 Quadros que só avançam**

- Nos quadros 2.1 Jornada do cliente e 2.3 Regularizações e escrituras, o card só pode ser movido para colunas à frente. Arrastar para trás é bloqueado, com aviso.
- Situações que hoje fariam o card voltar viram selos no próprio card (Em atraso, Pendência de documento, Aguardando cliente, Exigência do cartório), sem mudar de coluna. A cobrança continua no quadro de Cobrança.
- Saídas do fluxo são estados finais e não colunas anteriores: Perdido, Cancelado, Distrato. Exigem motivo.
- Só o perfil Administrador pode corrigir um avanço feito por engano, com motivo obrigatório e registro no histórico do card.
- Cada avanço grava data, usuário e tempo na etapa anterior.

**2.4 Qualificação de leads**

Amplie o cadastro do lead com: origem e campanha, corretor responsável, empreendimento de interesse, tipo de interesse (comprar lote, regularizar imóvel, ambos), finalidade (morar, investir, construir para vender), faixa de valor pretendida, valor de entrada disponível, parcela mensal que cabe no orçamento, forma de pagamento pretendida, prazo para decidir, cidade e bairro, se já visitou o empreendimento, data da visita, melhor horário de contato, canal preferido, objeções e observações.

- Pontuação automática (0 a 100) com pesos configuráveis e classificação Frio, Morno e Quente.
- Checklist de qualificação visível no card; o lead só avança para Proposta com os campos mínimos preenchidos (configurável).
- Motivo de perda obrigatório, a partir de lista configurável.
- CPF, renda e estado civil ficam para a etapa de proposta, e não para a captação.

**2.5 Proposta com empreendimento**

- A proposta exige Empreendimento e, em seguida, Quadra e Lote (filtrados pelo empreendimento e pela situação disponível) ou o serviço de regularização. O empreendimento aparece na lista, no card, no PDF e nos filtros.
- Fluxo de venda: Proposta (1) e depois Contrato (2). O contrato nasce da proposta aprovada, herdando cliente, lote, valores e plano de pagamento.

**2.6 Filtros, edição em lote, importação e exportação**

Crie um componente único de lista e aplique em todas as telas de listagem:

- Busca por texto e filtros por coluna (texto, lista, período, faixa de valor, situação), com filtros salvos por usuário e botão "Limpar filtros".
- Todo campo de seleção (cliente, lote, fornecedor, obra, insumo, conta, categoria) tem busca por digitação e filtro por empresa e empreendimento.
- Paginação no servidor (10, 25, 50, 100), ordenação por coluna e escolha de colunas visíveis.
- Seleção por caixa de marcação e barra de **ações em lote**: editar campos em comum, mudar situação, atribuir responsável, baixar, conciliar, exportar, remover. Toda ação em lote mostra a quantidade afetada, pede confirmação e grava auditoria.
- **Exportar** em Excel e PDF respeitando os filtros. **Importar** por Excel, com modelo e tela de conferência, nos cadastros: clientes, fornecedores, profissionais, insumos, composições, lotes, lançamentos e faturamentos.
- Imprimir em toda lista.

**2.7 Erro: Ficha financeira trava**

Ao entrar em Ficha financeira o sistema congela. Investigue e corrija a causa. Suspeitas a verificar primeiro: cálculo de juros e multa de todas as parcelas a cada renderização, lista sem paginação e leitura de todo o estado local. Critérios de aceite:

- A ficha abre em até 2 segundos com um contrato de 240 parcelas.
- Parcelas paginadas no servidor; encargos calculados no servidor e só para as parcelas exibidas.
- Estado de carregamento e mensagem de erro; nunca tela congelada.
- Teste automatizado que abre a ficha com volume alto de parcelas.

## 3. Parte 2: Obras, igual ao Mais Controle, com RDO

O módulo Obras é independente dos lotes: uma obra tem cadastro próprio e não precisa de empreendimento. O vínculo com empreendimento é um campo opcional. Hoje as telas de Obras e Orçamentos estão vazias; construa tudo abaixo.

Menu Obras: Minhas Obras, Orçamento (Lista e Funil de Vendas), Gestão, RDO. Menu Catálogo: Insumos, Composições. O centro de custo é transversal: todo registro de compras e financeiro pertence a uma Obra ou à Empresa.

**3.1 Insumos**

- Lista: favorito (estrela), Código, Descrição, Tipo, Unidade, Grupo, Base, Custo Unitário e botão Histórico de Preços por linha.
- Filtros: busca, Base, Grupo, Tipo, Ativo/Inativo. Ações: Novo, Imprimir, Importar, Exportar, Remover selecionados.
- Cadastro: Grupo (Material, Mão de Obra, Equipamento, Outros), Código \* (sequencial sugerido), Descrição \*, Unidade \*, Tipo, Base \*, Custo, Status, Observações, Arquivos. Botões Salvar e Salvar e inserir novo.
- Histórico de preços alimentado pelas ordens de compra.

**3.2 Composições**

- Lista: favorito, Código, Descrição, Tipo, Unidade, Base, Custo Unitário; filtros Base, Tipo, Ativo/Inativo.
- Cadastro: Código \*, Descrição \*, Unidade \*, Tipo, Base \*, Descrição detalhada, Status.
- Insumos da composição: Código, Descrição, Grupo, Unidade, Coeficiente, Custo Unitário, Custo Total.
- Totais calculados: custo unitário por grupo (Mão de Obra, Material, Equipamento, Outros), BDI (%) e preço unitário.

**3.3 Minhas Obras**

Lista com imagem, Código, Obra, Cliente, Tipo, Status e "Visível para". Ações por linha: Editar, Duplicar, Remover. Status: Em orçamento, Em andamento, Paralisada, Finalizada.

| Grupo | Campos de Nova Obra |
| --- | --- |
| Obrigatórios | Nome da obra (até 200 caracteres), Tipo da obra (com criação rápida de tipo), Status \*, Visível para \* (usuários) |
| Dados gerais | Código da obra, Área total, Unidade (m²), ART, CEI/CNO (até 20 caracteres), Responsável técnico, Responsável da obra, Empreendimento (opcional) |
| Dados do cliente | Cliente (busca) com criação rápida |
| Endereço | CEP, Logradouro, Número, Complemento, Bairro, Estado, Cidade |
| Contatos | Lista de contatos da obra |
| Conta bancária padrão | Quem paga (Empresa ou Cliente), Conta |
| Dados para faturamento | PJ ou PF, CNPJ, Razão Social, Inscrição Estadual, Telefone, E-mail, E-mails em cópia, endereço completo |
| Exibir obra para | Lançamentos, Faturamentos, Compras (liga/desliga) |

A tela de detalhe mostra informações da obra, cliente, comentários e arquivos.

**3.4 Orçamento**

Cada obra tem um orçamento, base da gestão de custos e da proposta comercial.

- Lista: Código, Obra, Cliente, Status Obra, Status Proposta, Custo, Preço. Filtros por período, status da obra e status da proposta. Configurações: Modelo de Proposta, BDI (Dinâmico ou Fixo), Arredondamento.
- Funil de Vendas: quadro kanban de propostas (Contato Inicial, Em Elaboração, Em Revisão e demais etapas configuráveis), com total por coluna e cartões com cliente, obra, valor e responsável.

| Aba do orçamento | Conteúdo |
| --- | --- |
| Orçamento | Árvore Etapa > Subetapa > Item (composição ou insumo), com Quantidade, Custo Unitário, Custo Total e BDI. Em cada nível: + Composição, + Insumo, + Item, + Subetapa, + Etapa, Remover. Rodapé com custo total, BDI e preço. Trava "Editar orçamento" |
| Proposta | Status da proposta, Data de criação, Data de entrega, Data de venda, Responsável, Condição de pagamento, Preço total com desconto. Ações: Aplicar desconto, Configurar proposta, Gerar proposta (PDF). Comentários da negociação |
| Contrato | Documentos de contrato a partir de modelos (Gerenciar Modelos) |
| Cronograma | Gráfico de Gantt por etapa: Duração, Início, Fim, Predecessores, caminho crítico, dias a desconsiderar, exportar. Usa o Expediente das obras |
| Cronograma Físico-Financeiro | Distribuição por período (mensal e outros), com opção de importar períodos do cronograma |
| Arquivos | Anexos do orçamento |
| Relatórios | Orçamento Sintético, Analítico, por Etapa e Área de Obra, Curva ABC |

**3.5 Gestão da obra**

Compara orçado e realizado por obra. Lista com Obra, Cliente e Status; filtro por status.

| Aba | Conteúdo |
| --- | --- |
| Cabeçalho | Evolução física (%), Status editável, Cliente, Cronograma planejado e realizado, atalho para o Orçamento, Exportar e Imprimir tela |
| Visão Geral | Custo orçado, realizado, saldo e evolução de custos por grupo (Mão de Obra, Material, Equipamento, Outros). Gráficos de distribuição dos custos realizados e resumo de custos, com valor por m² |
| Gestão de Custos | Por etapa e item: custo orçado, custo realizado, saldo, % realizado e evolução física editável. Linha de "custos sem apropriação". Gráfico Orçado x Realizado por etapa |
| Curva S | Avanço acumulado planejado x realizado, físico e financeiro |
| Cronograma | Gantt e tabela, alimentados pelo cronograma do orçamento |
| RDO | Diários da obra (item 3.6) |
| Arquivos | Anexos da obra |
| Relatórios | Insumos Orçados x Realizados, Curva ABC, Custos por Área de Obra, Custos Realizados por Categorias, Resultado Financeiro, Pagamentos, Resumo de Pagamentos por Etapa, Desempenho de Custos |
| Relatório Gerencial | Relatórios periódicos com Número, Período, Título e Status, sujeitos à alçada de aprovação |
| Anotações | Texto livre sobre a obra |

O custo realizado vem dos lançamentos financeiros apropriados à obra, etapa e item. A classificação por grupo vem da categoria do lançamento (seção 5.9). Categorias marcadas como "Oculta na Gestão" não entram.

**3.6 RDO (Relatório Diário de Obras)**

Módulo novo. O cliente não tem o Diário de Obras contratado no Mais Controle, então não há tela para copiar. Construa conforme abaixo.

- Um RDO por obra e por dia, com número sequencial por obra. Bloqueie duplicidade de data.
- Lista: Número, Data, Dia da semana, Obra, Responsável, Clima, Efetivo total, Status, Anexos. Filtros por obra, período, status e responsável. Visão em calendário que destaca os dias úteis sem RDO, usando o Expediente das obras.
- Status: Rascunho, Enviado, Aprovado, Devolvido (com motivo). Depois de aprovado, o RDO não é mais editado; correções entram como adendo. Alçada de aprovação de RDO em Ajustes.

| Bloco do RDO | Campos |
| --- | --- |
| Cabeçalho | Obra \*, Data \*, Número, Responsável \*, Prazo contratual, dias decorridos e dias restantes (calculados) |
| Clima | Manhã, tarde e noite: Claro, Nublado, Chuvoso. Condição de trabalho de cada turno: Praticável ou Impraticável. Índice de chuva (mm), opcional |
| Efetivo | Mão de obra própria por função (quantidade e horas), a partir de Profissionais. Mão de obra terceirizada por fornecedor e função. Total do dia |
| Equipamentos | Equipamento, quantidade, situação (Em uso, Parado, Em manutenção), horas trabalhadas |
| Atividades | Etapa e item do orçamento, descrição do que foi feito, situação (Iniciada, Em andamento, Concluída, Paralisada), quantidade executada e % acumulado |
| Materiais recebidos | Material, quantidade, fornecedor e ordem de compra. Marca o recebimento na ordem e na solicitação |
| Ocorrências | Tipo (Acidente, Paralisação, Falta de material, Visita, Fiscalização, Outros), descrição, horário, impacto no prazo (Sim/Não) |
| Fotos | Várias fotos com legenda, direto da câmera do celular |
| Observações | Texto livre e comentários |
| Assinaturas | Responsável da obra e fiscal ou cliente, com nome, data e hora |

- Botão "Copiar do dia anterior" (efetivo e equipamentos). Tela pensada para celular, com rascunho salvo automaticamente.
- Ao aprovar o RDO, o % acumulado das atividades atualiza a evolução física do item na Gestão de Custos e alimenta a Curva S. Ocorrência com impacto no prazo aparece no Cronograma.
- Saídas: PDF do RDO com logo da empresa, fotos e assinaturas; relatório por período (efetivo, dias impraticáveis, ocorrências, avanço); exportação em Excel.
- Permissões próprias: RDO (visualizar, inserir e alterar, remover) e Aprovar RDO.

**3.7 Critérios de aceite da Parte 2**

- Criar obra, montar orçamento com etapa, subetapa, composição e insumo, e ver custo, BDI e preço corretos.
- Gerar cronograma, cronograma físico-financeiro e Curva S a partir do orçamento.
- Lançar despesa apropriada a um item e ver o realizado na Gestão de Custos.
- Criar, enviar e aprovar um RDO e ver a evolução física atualizada.

## 4. Parte 3: Compras, igual ao Mais Controle

O fluxo tem três etapas encadeadas, nesta ordem: **1. Solicitação, 2. Cotação, 3. Ordem de Compra**. Cada etapa guarda o vínculo com a anterior. Regra do cliente: toda solicitação tem centro de custo obrigatório (uma Obra ou a Empresa), e cotação e ordem herdam esse centro de custo.

**4.1 Solicitação**

- Lista com abas por status e contador: Todas, Rascunho, Em aprovação, A atender, Em andamento, Concluída, Recusada.
- Colunas: Nº, Status, Descrição, Solicitante e data, Necessidade, Centro de Custo, Cotados, Comprados, Recebidos (cada um como "x de y") e Vínculos (números das cotações e ordens).
- Filtros: período, busca por número ou descrição, centro de custo, colunas visíveis, impressão.
- Nova Solicitação: Centro de custo \*, Descrição, Necessidade (receber até), Marcar como urgente (destaca na lista). Itens escolhidos do orçamento da obra (etapa e item) ou do catálogo de insumos, com quantidade.
- Detalhe: linha do tempo em 4 passos (criada, aprovada, atendida, itens recebidos) com autor e data; botão Marcar recebimento; itens agrupados por etapa do orçamento, com Status (ex.: Em cotação), Item, Unidade, Quantidade solicitada, Recebimento (x de y) e Previsão de entrega; atalho Ver Cotações; Arquivos; Comentários.
- Aprovação: a solicitação enviada vai para Em aprovação; o aprovador aprova ou recusa com motivo.
- Permissões separadas: Solicitação Própria, Solicitação de Terceiros e Atender Solicitação.

**4.2 Cotação**

- Lista: anexo, Número, Descrição, Centro de Custo, Quantidade de itens, Fornecedores, Criação (data e autor), Necessidade. Filtros por período e status.
- Cabeçalho: Número (sequencial), Descrição, Status, Prioridade (Sim/Não), Necessidade, Solicitante, Relatórios. Resumo no topo: Itens, Fornecedores, Criação, Criado por.
- Status: Em aberto, Solicitado, Enviado ao fornecedor, Respondido parcialmente, Cotado parcialmente, Cotado, Finalizado.
- Aba Itens: agrupados por centro de custo e item do orçamento, com a solicitação de origem; Item, Descrição, Unidade, Quantidade. Botão Buscar solicitação (traz os itens de solicitações aprovadas). Observações.
- Aba Fornecedores: Fornecedor, Contato, E-mail, Telefone, Qualificação; envio do pedido de cotação por e-mail e WhatsApp; Local de entrega (endereço completo, com busca). Use os contatos marcados como "Considerar este contato em Cotações e Ordens de Compra".
- Aba Mapa de Cotação: comparativo item x fornecedor com quantidade cotada, quantidade comprada, valor do orçamento, preço de cada fornecedor e destaque da melhor compra; subtotal, desconto %, frete. Permite escolher o vencedor por item ou no total e gerar as ordens de compra.
- Aba Arquivos.
- Página pública por link, sem login, para o fornecedor preencher preços e prazo.

**4.3 Ordem de Compra**

- Lista: Número, Fornecedor, Valor, Descrição, Centro de Custo, Criação, Aprovação, Previsão de entrega e Status da compra. Totais por situação no rodapé (Total, Aprovado, Em aberto, Negociando, Aguardando aprovação, Negado). Menu Relatórios.
- Cabeçalho: Número, Fornecedor \*, Descrição, Valor total, Criação, Criado por, Responsável pela aprovação, cotação de origem.
- Aprovação: Aprovado, Em aberto, Negociando, Aguardando aprovação, Negado.
- Status da compra: Aguardando, Comprado, Entregue Parcial, Entregue Total.
- Aba Itens: por obra (ou Empresa) e item do orçamento; Item, Descrição, Unidade, Quantidade, Valor Unitário, Valor. Botões Buscar solicitação e Saldo de Compra (orçado menos já comprado).
- Totais: + Frete, + Outras Despesas, + Impostos, - Desconto, Valor Total.
- Aba Informações: dados do fornecedor, dados para faturamento, Condição de pagamento, Prazo de entrega, Data de entrega, Local de entrega, Responsável pelo recebimento, dados do lançamento, Observações.
- Aba Resumo da Compra e aba Arquivos.
- Ações: gerar Lançamento financeiro a partir da ordem (com parcelas pela condição de pagamento e a mesma apropriação de obra, etapa e item), enviar por e-mail e WhatsApp, compartilhar, imprimir (PDF).

**4.4 Etapas de aprovação e configurações**

- Alçada de aprovação de compras em Ajustes: aprovadores por faixa de valor e por centro de custo, para a Solicitação e para a Ordem de Compra. Ordem acima da alçada do usuário vai para Aguardando aprovação.
- Toda aprovação ou recusa grava usuário, data e motivo, e avisa o solicitante.
- Configurações: número inicial da cotação; número inicial da ordem de compra; permitir ordem de compra sem cotação. **Padrão: não permitir**, para cumprir o fluxo pedido pelo cliente. Fornecedores: CNPJ/CPF obrigatório (liga/desliga).
- Listas de apoio: Solicitantes e Condições de Pagamento.

**4.5 Relatórios e critérios de aceite**

- Relatórios: Insumos Orçados x Comprados, Extrato de compras, Mapa de cotação em PDF.
- Aceite: criar solicitação com centro de custo, aprovar, gerar cotação com três fornecedores, escolher no mapa, gerar ordem, aprovar pela alçada, gerar o lançamento e marcar o recebimento. Os contadores "x de y" e os vínculos devem bater em todas as telas.
- Não deve ser possível salvar solicitação sem centro de custo, nem ordem sem cotação com a configuração padrão.

## 5. Parte 4: Financeiro, igual ao Mais Controle

O financeiro separa o título da sua baixa: **Lançamento gera Pagamentos** (parcelas a pagar) e **Faturamento gera Recebimentos** (parcelas a receber). Menu Financeiro: Pagamentos, Recebimentos, Pré-lançamentos, Notas Fiscais, Contas Bancárias, Transferências, Fluxo de Caixa, Resultados. Em Ajustes: Plano de contas, Categorias, Naturezas.

**5.1 Pagamentos e Lançamentos**

- Lista de Pagamentos com navegação por mês. Colunas: Vencimento, Status, Valor, Favorecido, Descrição e Categoria, Nº Doc, Condição e Conta, Centro de Custo, data Pago, Anexo. Colunas configuráveis. Totais ocultáveis: Pago, Em aberto, Total.
- Filtro rápido por situação (Todos, Em aberto, Vencidos, Pagos). Ações em lote: Pagar, Conciliar.
- Filtros avançados: Tipo de data (Vencimento, Competência, Pagamento), Conta bancária, Favorecido, Centro de Custo, Grupo, Categoria, Quem paga, Condição de pagamento, Forma de pagamento, Ordem de Compra, Retenção.
- Relatórios em PDF: Pagamentos, Pagamentos agrupados. Download da lista.
- Ações por linha: Pagar, Estornar, Editar Lançamento.
- Detalhe do pagamento: valor e status, Vencimento, Condição, Forma de pagamento, Pagador, Favorecido; histórico de pagamentos (valor, data, conta, forma, quem baixou); comentários; detalhes do lançamento; impressão. Aceita baixa parcial.

| Grupo | Campos de Criar lançamento |
| --- | --- |
| Principal | Valor \*, Descrição, Favorecido, Categoria \*, Competência \*, Vencimento \*, Pagador \* (Empresa ou Cliente), Conta \*, Número do documento, Forma de pagamento |
| Centro de custo | Apropriar por Obra ou Empresa; várias obras (rateio por valor ou %); etapa e item do orçamento; Vincular insumos |
| Opções | Repetir Lançamento (recorrente), Parcelar Lançamento, Retenções |
| Outros | Arquivos, Observações, Marcar como pago |

Condições: À vista, Recorrente, Parcelado (x/y). Formas: Boleto, Pix, Permuta, Transferência, Dinheiro, Cartão (lista configurável).

**5.2 Recebimentos e Faturamentos**

- Lista de Recebimentos por mês. Colunas: Vencimento, Status (com selo de conciliado), Valor, Cliente, Condição e Conta, Descrição e Natureza. Um recebimento pode ter mais de uma conta e forma de pagamento.
- Ações por linha: Receber, Estornar, Emitir Nota Fiscal, Editar Faturamento. Menu: Ver Faturamentos, Importar Faturamentos. Relatórios em PDF: Recebimentos, Recebimentos agrupados.
- Lista de Faturamentos: Lançamento (data), Valor Bruto, Impostos Retidos, Valor Líquido, Cliente, Descrição e Natureza.

| Grupo | Campos de Novo Faturamento |
| --- | --- |
| Principal | Valor \*, Descrição, Cliente, Natureza \*, Competência \*, Vencimento \*, Centro de Custo \*, Conta \*, Número do documento, Forma de recebimento, Vendedor |
| Opções | Parcelar Faturamento, Impostos retidos, Marcar como recebido |
| Outros | Arquivos, Observações |

**5.3 Ligação com a carteira de lotes**

As parcelas dos contratos de lote e de regularização continuam nascendo na carteira (contrato, ficha financeira, boletos). Elas aparecem em Recebimentos como origem "Contrato", somente leitura, com link para a ficha. A baixa do boleto gera o recebimento na conta bancária. Não crie faturamento manual para a mesma parcela, para não contar a receita duas vezes.

**5.4 Pré-lançamentos**

Despesa registrada por qualquer usuário (com foto do comprovante) que aguarda revisão do financeiro para virar lançamento. Estados: Pendente, Aprovado (vira lançamento), Recusado (volta ao remetente com motivo). Permissões separadas: os próprios e gerenciar todos.

**5.5 Notas Fiscais**

- Notas recebidas: Emissão, Série e número, situação, Emissor e CNPJ, Valor, Lançamento (lançada ou não), Meu CNPJ. Ações: Ver lançamentos vinculados, Vincular e Desvincular lançamento, baixar PDF e XML, ações em massa.
- Nesta fase, entrada por upload de XML e PDF. Captura automática na Sefaz e emissão de NFSe ficam preparadas no modelo de dados e desligadas até a escolha do provedor.
- Meus CNPJs: CNPJ, Razão Social, Certificado Digital e validade, Emissão NFSe (liga/desliga), Captura automática (liga/desliga).

**5.6 Contas Bancárias e Transferências**

- Lista de contas: Banco e tipo (Corrente, Poupança, Caixa/Dinheiro), Nome, Proprietário (Empresa ou Cliente), Integração bancária, Bloqueio financeiro (bloquear/desbloquear), Valor Atual (ocultável). Filtros: ativas, proprietário, banco.
- Nova Conta: Nome \*, Proprietário \*, Data inicial \*, Valor inicial \*, Tipo de conta, Banco, Conta visível para (usuários que veem extrato e saldo).
- Extrato da conta com saldo dia a dia. Conciliação por arquivo OFX e manual, com alçadas de quem concilia e de quem desconcilia. Bloqueio financeiro impede alteração de movimentos até a data do bloqueio.
- Transferências. Lista: Data, Descrição, Conta de Origem, Conta de Destino, Valor, Pago. Filtros: período, Todas, Pagas, Em Aberto, busca avançada, limpar filtros. Ação em lote: Conciliar. Botões Novo, Imprimir, Exportar para Excel.
- Nova Transferência: Data da Transferência \*, Valor \*, Marcar como Pago (Sim/Não), Conta de Origem \*, Conta de Destino \*, Descrição, Arquivos.

**5.7 Fluxo de Caixa**

- Matriz Plano de Contas x período. Filtros: Visualização (Diário, Semanal, Mensal), Período, Tipo (Pagos e Recebidos, Previstos), Proprietário, Contas, Centro de Custo, "considerar saldo inicial de contas e transferências".
- Linhas: Saldo Inicial, Saldo Inicial de Conta, Saldo Transferência, Receitas e Despesas abertas por plano de contas, Total. Botões Visualizar Extrato e Imprimir.
- Três visões pedidas pelo cliente: **Empresa** (só o centro de custo Empresa), **Obras** (uma ou várias obras) e **Geral** (tudo somado).

**5.8 Resultados**

- Demonstrativo mensal por plano de contas: Receita Operacional Bruta, Impostos, Receita Operacional Líquida, Despesas Variáveis, Despesas Operacionais, Resultado Financeiro, Resultado. Contas "Somente Fluxo de Caixa" não entram.
- Filtros: Período, Visualização (Regime de Caixa ou Competência), Centro de Custo. Mesmas três visões: Empresa, Obra e Geral.

**5.9 Plano de contas e Categorias (carga inicial)**

Telas de cadastro com incluir, editar, inativar e excluir (bloqueie a exclusão se houver lançamento). Plano de contas: Nome, Fluxo de Caixa (Receitas ou Despesas), grupo em Resultados, categorias vinculadas. Categoria: Nome, Plano de Conta, Classificação em Gestão de Obra. Carregue os dados abaixo, copiados do Mais Controle do cliente.

| Plano de conta (Despesas) | Grupo em Resultados |
| --- | --- |
| Aluguel, Condomínio e IPTU | Despesas Operacionais |
| Compra de Terreno | Despesas Variáveis |
| Despesas Financeiras | Resultado Financeiro |
| Devolução de Compras | Somente Fluxo de Caixa |
| Distribuição de Lucros | Somente Fluxo de Caixa |
| Equipamentos | Despesas Variáveis |
| Gerais e Administrativas | Despesas Operacionais |
| Impostos | Receita Operacional Bruta (dedução) |
| Materiais | Despesas Variáveis |
| Mão de Obra | Despesas Variáveis |
| Mão de Obra Terceirizada | Despesas Variáveis |
| Outras Despesas | Despesas Variáveis |
| Pagamento de Empréstimo | Somente Fluxo de Caixa |
| Pessoal Administrativo | Despesas Operacionais |
| Pro Labore | Despesas Operacionais |
| Propaganda e Marketing | Despesas Variáveis |

Classificações em Gestão de Obra: Mão de Obra (Salários), Mão de Obra (Encargos), Mão de Obra (Terceirizada), Materiais, Equipamentos, Compra de Terreno, Outros, Oculta na Gestão.

Categorias com vínculo conferido na tela:

| Categoria | Plano de conta | Classificação em Gestão de Obra |
| --- | --- | --- |
| 13º Salário Mão de Obra | Mão de Obra | Mão de Obra (Salários) |
| 13º Salário Pessoal Administrativo | Pessoal Administrativo | Outros |
| Aluguel de Equipamento | Equipamentos | Equipamentos |
| Assistência Médica Mão de Obra | Mão de Obra | Mão de Obra (Encargos) |
| Cartório | Outras Despesas | Outros |
| Comissão de Vendedores | Gerais e Administrativas | Outros |
| Devolução de Compras | Devolução de Compras | Oculta na Gestão |
| Distrato | Outras Despesas | Oculta na Gestão |
| Distribuição de Lucros | Distribuição de Lucros | Oculta na Gestão |
| Empréstimo | (conferir) | Oculta na Gestão |
| Materiais | Materiais | Materiais |
| Mão de Obra Terceirizada | Mão de Obra Terceirizada | Mão de Obra (Terceirizada) |
| Pagamento de Empréstimo | Pagamento de Empréstimo | Oculta na Gestão |
| Plataforma | Gerais e Administrativas | Mão de Obra (Terceirizada) |

Demais categorias a criar (vínculo a conferir na tela do Mais Controle antes de entrar em produção): Aluguel; Aquisição de Equipamento; Assistência Médica Pessoal Administrativo; Compra de Terreno; Condomínio; Contabilidade; Cursos e Treinamentos; Despesas Financeiras; DOAÇÃO; Encargos Mão de Obra; Encargos Pessoal Administrativo; Energia Elétrica; Horas Extras Mão de Obra; Horas Extras Pessoal Administrativo; Hospedagem; Impostos; Internet; IPTU; Juros; JUROS e MULTAS; Limpeza; Manutenção; Manutenção de Equipamentos; Material de Escritório; Outras Despesas; Pro Labore; Propaganda e Marketing; Rescisões Trabalhistas Mão de Obra; Rescisões Trabalhistas Pessoal Administrativo; Salário Mão de Obra; Salário Pessoal Administrativo; SERVIÇOS DE TERCEIROS; Telefone Celular; Telefone Fixo; Transporte; Vale Alimentação Mão de Obra; Vale Alimentação Pessoal Administrativo; Vale Transporte Mão de Obra; Vale Transporte Pessoal Administrativo; Viagens; Água e Esgoto.

Regra provisória para essas: nome terminado em "Mão de Obra" vai para o plano Mão de Obra; terminado em "Pessoal Administrativo" vai para Pessoal Administrativo com classificação Outros; categoria com o mesmo nome de um plano vai para esse plano. As restantes ficam marcadas como "a classificar" para o financeiro do cliente definir.

Naturezas de receita (usadas no Faturamento): Juros de Contrato, Licitação, Medição, Outras receitas, Prestação de Serviços, Projetos, Reembolso, Taxa de Administração, Venda, Venda de Imóveis, Juros de Aplicação Financeira. Deixe a lista editável.

**5.10 Configurações e critérios de aceite**

- Configurações avançadas: meses para provisionamento de recorrentes; número do documento obrigatório em lançamentos; idem em pagamentos; abrir etapas e itens automaticamente ao selecionar a obra.
- Alçada de usuários: quem concilia, quem desconcilia, quem aprova Relatório Gerencial.
- Relatórios em Exportar: Recebimentos, Pagamentos, Lançamentos.
- Aceite: lançamento parcelado com rateio em duas obras gera os pagamentos certos; baixa parcial e estorno funcionam; transferência movimenta as duas contas; fluxo de caixa e resultados fecham com os extratos nas três visões (Empresa, Obra, Geral); regime de caixa e de competência dão valores coerentes.

## 6. Parte 5: dashboards, portais, gestão de empreendimento e demandas

**6.1 Dashboards**

Dois painéis, ambos com filtro de empresa, empreendimento, obra e período.

- **Números gerais** (operacional): empreendimentos, lotes por situação, clientes ativos, contratos ativos, leads do mês e por etapa, propostas em aberto, vendas do mês, a receber, vencimentos em 7 e 30 dias, inadimplência (valor e quantidade), processos de regularização por etapa, demandas abertas, obras em andamento, pagamentos e recebimentos em aberto por faixa (vencidos, hoje, 7 dias, 30 dias).
- **Gerencial** (direção): vendas por empreendimento e por corretor, conversão do funil, previsão de carteira mês a mês, KPI de inadimplência (%, valor, faixas de atraso, evolução em 12 meses), fluxo de caixa realizado e previsto, resultado por empresa e por obra, orçado x realizado e evolução física das obras, compras por situação.
- Todo número é clicável e abre a lista já filtrada. Acesso por perfil: o gerencial só para Direção e Financeiro.

**6.2 Gestão de empreendimento (visão única)**

A tela do empreendimento reúne, em abas: Resumo, Planta (item 2.2), Lotes (gestão visual e lista), Vendas (Propostas e depois Contratos), Boletos (gerar, baixar e reemitir, individual e em lote), Previsão de carteira (recebimentos previstos por mês), Inadimplência (KPI, faixas de atraso e lista de devedores), Regularização (quando a modalidade incluir), Demandas, Obras vinculadas e Arquivos.

**6.3 Portal do corretor**

Área separada, com login próprio, para corretores e imobiliárias. O corretor só vê os próprios dados.

- Gestão de leads: cadastrar lead com a qualificação do item 2.4, quadro por etapa, registrar contatos e agendar visita. Bloqueio de lead duplicado por telefone e CPF, com regra de quem atendeu primeiro.
- Espelho de vendas: planta e lista de lotes disponíveis por empreendimento, com preço e condições. Reserva de lote com prazo para expirar.
- Propostas: criar, acompanhar situação e baixar o PDF.
- Comissões: vendas próprias, comissão prevista, liberada e paga.
- Materiais de venda: tabela de preços, folhetos e plantas para baixar.

**6.4 Portal do cliente**

Área separada, com login por CPF e código enviado ao celular ou e-mail. O cliente só vê os próprios contratos.

- Lotes: contratos, lote e quadra, saldo devedor, parcelas pagas e em aberto, segunda via de boleto e Pix, valor atualizado de parcela vencida, informe anual de pagamentos, contrato em PDF.
- Regularização: linha do tempo do processo (etapa atual e próximas), documentos pendentes com envio pelo portal, exigências e previsão de entrega da escritura.
- Demandas: abrir pedido (item 6.5) e acompanhar o andamento.
- Dados cadastrais: pedido de atualização, que entra como tarefa para o atendimento aprovar.

**6.5 Gestão de demandas**

Módulo novo para pedidos operacionais ligados a lote, cliente ou empreendimento.

- Tipos configuráveis, cada um com prazo padrão, responsável padrão e checklist: Ligação de água, Ligação de energia, Marcação de lote (demarcação), Limpeza de lote, Autorização para construir, Segunda via de documento, Outros.
- Campos: Número, Tipo \*, Empresa \*, Empreendimento \*, Quadra e Lote, Cliente, Descrição, Prioridade, Responsável, Prazo, Origem (interno, portal do cliente, corretor), Custo previsto, Arquivos e fotos, Comentários.
- Quadro kanban: Aberta, Em análise, Agendada, Em execução, Concluída, Cancelada. Lista com filtros e ações em lote. Alerta de prazo vencido.
- Integrações: a demanda aparece no card do cliente e na ficha do lote; pode gerar uma Solicitação de compra com centro de custo; pode gerar cobrança ao cliente (faturamento) quando o serviço for pago.
- Relatório: demandas por tipo, tempo médio de atendimento e atrasadas por responsável.

**6.6 Perfis de acesso**

Inclua na matriz de permissões (Visualizar, Inserir e Alterar, Remover) as rotinas novas: RDO, Aprovar RDO, Demandas, Dashboard gerencial, Importação em lote, Edição em lote, Corrigir avanço de card. Crie os perfis externos Corretor e Cliente, restritos aos portais.

**6.7 Critérios de aceite da Parte 5**

- Um corretor não consegue ver lead, proposta ou comissão de outro corretor. Um cliente não consegue ver contrato de outro cliente. Teste as duas regras no banco (RLS), e não só na tela.
- Os números dos dashboards batem com as listas de origem com os mesmos filtros.
- Demanda aberta no portal do cliente aparece no quadro interno e no card do cliente.

## 7. Estado atual do sistema no ar (conferido em 25/11/2026)

Use esta seção como ponto de partida: é o que existe hoje em produção, comparado ao que este prompt pede.

| Área | Como está hoje | Situação |
| --- | --- | --- |
| Multiempresas | Uma "organização ativa" em Configurações > Empresa | Falta |
| Empreendimento | Tipo existe na lista de apoio (loteamento, regularização, AVCB, construção), sem efeito nas telas | Parcial |
| Lotes | Só "Gerar lotes" (geração em massa); sem importação por Excel | Falta |
| Planta | Quadrados coloridos por quadra; sem PDF do projeto | Falta |
| Jornada do cliente | 8 colunas; arraste só nas colunas 1 e 2; coluna "Cobrança e jurídico" recebe o cliente em atraso | Diverge do item 2.3 |
| Leads | Formulário com nome, telefone, e-mail e origem | Falta a qualificação |
| Proposta | Lead, lote em texto livre, valor, entrada, parcelas; sem empreendimento | Falta |
| Listas | Só busca por texto; sem filtros, edição em lote, importação ou exportação | Falta |
| Ficha financeira | Abre com 7 parcelas de exemplo; travamento relatado pelo cliente não reproduzido | Investigar (item 2.7) |
| Obras | Lista com orçado, realizado e saldo; painel lateral com 3 itens de orçamento e "Atualizar progresso" | Muito parcial |
| RDO, Insumos, Composições | Não existem | Falta |
| Compras | Solicitação simples (descrição, centro de custo, necessidade, nº de itens, valor estimado, urgente) e lista de ordens; sem Cotação | Parcial |
| Financeiro | Uma tela com contas, a pagar, a receber, pré-lançamentos e transferências; lançamento só com favorecido, descrição, valor e conta | Muito parcial |
| Plano de contas e categorias | Não existem | Falta |
| Fluxo de caixa e resultados | Só como itens da Central de relatórios | Falta |
| Notas fiscais | Lista com vincular, DIMOB, SPED e exportação contábil | Quase pronto |
| Dashboard | Um painel único | Parcial |
| Portais e demandas | Não existem | Falta |

**Erros encontrados no que já está no ar (corrigir junto com a Parte 1)**

- Datas com um dia a menos: a parcela com vencimento 10/07/2026 aparece como 09/07/2026 na Ficha financeira e no Financeiro. Trate datas sem hora como data pura, sem conversão de fuso.
- Números divergentes entre telas: "A receber" aparece como R$ 2.497,25 no Painel, R$ 2.533,41 na Ficha financeira e R$ 13.129,25 no Financeiro; as obras do Painel não são as mesmas da tela Obras; a mesma parcela aparece "em aberto" numa tela e "vencida" em outra. Cada indicador deve ter uma única fonte e uma única regra.
- Textos internos visíveis ao usuário: "Fase 7", "§11.3", "legado demo". Remova.
- Status exibidos como código: "em_execucao", "em aprovacao", "disponivel". Exiba o rótulo com acento e inicial maiúscula.
- O cálculo de encargos está correto (parcela de R$ 238,75 com R$ 15,68 de juros e multa). Mantenha o teste.

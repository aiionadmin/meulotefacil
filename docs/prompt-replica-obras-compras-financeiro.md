# Meu Lote Fácil: réplica dos menus Obras, Compras e Financeiro do Mais Controle (prompt para o Cursor)

Data: 27/11/2026. Base: conferência tela por tela do Mais Controle em uso pelo cliente, nos dias 24, 25 e 27/11/2026.

## 1. Objetivo e regras

Reconstruir, dentro do sistema atual (`aiionadmin/meulotefacil`: Next.js 15 App Router, React 19, TypeScript, Tailwind v4, shadcn/Radix, Supabase), os menus **Obras**, **Compras** e **Financeiro** com a mesma estrutura do Mais Controle: mesmos itens de menu, na mesma ordem, mesmas telas, colunas, filtros, campos, botões, status, fluxos e relatórios descritos neste documento.

- Substitua as telas atuais `/obras`, `/compras`, `/financeiro`, `/fiscal` e os quadros de Obras e Compras pelas telas deste documento. Não mantenha as telas-resumo antigas em paralelo.
- Use os nomes de menu, tela, coluna, campo, botão e status exatamente como escritos aqui.
- Campos com asterisco (*) são obrigatórios.
- Visual: componentes e identidade do Meu Lote Fácil. Não use logotipo, nome, mascote, ícones nem textos de marketing do Mais Controle.
- Todo dado no Supabase, com migration, RLS por empresa e tipos gerados. Nada em localStorage. Regra de dinheiro no servidor, com teste automatizado.
- Toda lista: busca, filtros, ordenação, escolha de colunas, paginação no servidor, exportar Excel, imprimir, e o alternador **Lista | Kanban** onde houver status (padrão que o sistema já tem).
- Todo formulário: aviso ao sair com alterações não salvas; anexos por arrastar e soltar, até 10 MB por arquivo.
- Um PR por menu, nesta ordem: Base comum (seção 2), Obras, Compras, Financeiro. Em cada PR, liste o que ficou pronto, o que ficou pendente e como testar. Não faça deploy.

## 2. Estrutura de menus e base comum

**Menus e rotas**

| Menu | Item | Rota no sistema novo |
| --- | --- | --- |
| Obras | Minhas Obras | `/obras` |
| Obras | Orçamento (Lista de Orçamentos e Funil de Vendas) | `/orcamentos` |
| Obras | Medição de Obras | `/medicoes/obras` |
| Obras | Medição de Contratos | `/medicoes/contratos` |
| Obras | Gestão | `/gestao` e `/gestao/[obra]/[aba]` |
| Obras | RDO (extra) | `/rdo` |
| Catálogo | Insumos | `/catalogo/insumos` |
| Catálogo | Composições | `/catalogo/composicoes` |
| Compras | Solicitação | `/compras/solicitacoes` |
| Compras | Cotação | `/compras/cotacoes` |
| Compras | Ordem de Compra | `/compras/ordens` |
| Financeiro | Pagamentos (e Lançamentos) | `/financeiro/pagamentos` |
| Financeiro | Recebimentos (e Faturamentos) | `/financeiro/recebimentos` |
| Financeiro | Pré-lançamentos | `/financeiro/pre-lancamentos` |
| Financeiro | Notas Fiscais | `/financeiro/notas-fiscais` |
| Financeiro | Cobrança Fácil | `/financeiro/cobranca-facil` |
| Financeiro | Contas Bancárias (e Transferências) | `/financeiro/contas` e `/financeiro/transferencias` |
| Financeiro | Fluxo de Caixa | `/financeiro/fluxo-de-caixa` |
| Financeiro | Resultados | `/financeiro/resultados` |

**Botão "Novo" global** (topo do menu): Lançamento, Faturamento, Transferência, Solicitação, Cotação, Ordem de compra. Cada um abre direto o formulário.

**Centro de custo.** Conceito transversal dos três menus: todo registro de compras e financeiro pertence a uma **Obra** ou à **Empresa**. Dentro da obra, a apropriação desce até etapa e item do orçamento. Usuário só vê as obras em que está em "Visível para"; ver o centro de custo Empresa é uma permissão própria.

**Cadastros de apoio usados pelos três menus** (crie ou complete): Clientes, Fornecedores (com qualificação em estrelas e contatos marcados para cotação e ordem), Profissionais, e as listas Tipos de Obra, Unidades, Tipos e Bases de insumos e composições, Tipos de Retenção, Solicitantes, Condições de Pagamento, Formas de pagamento, Tags de arquivo.

**Ajustes** (tela de configurações dos três menus): Expediente das obras (dias da semana e horários de manhã e tarde); Configurações avançadas; Alçada de usuários; Plano de contas; Categorias; Regras padrão de cobrança.

**Permissões.** Matriz por perfil com Visualizar, Inserir e Alterar, Remover para cada rotina:

- Obras: Cadastro de Obras, Gerenciar Visibilidade das Obras, Orçamento de Custo, Orçamento de Venda, Contrato do Orçamento, Gestão, Relatório Gerencial, Medição de Obras, Medição de Contratos, RDO, Aprovar RDO.
- Catálogo: Insumos, Composições.
- Compras: Solicitação Própria, Solicitação de Terceiros, Atender Solicitação, Cotação, Ordem de Compra, Configurar Alçada de Aprovação.
- Financeiro: Faturamento, Recebimentos, Lançamentos, Pagamentos, Cobrança Fácil, Transferências Bancárias, Contas Bancárias, Integração Bancária, Fluxo de Caixa, Resultados, Gerenciar CNPJs, Emissão NFSe, Captura NFe, Pré-lançamentos (próprio), Gerenciar todos os Pré-lançamentos.
- Gerais: Ajustes, Plano de Contas, Categorias, Listas de apoio, Visualizar Centro de Custo Empresa, Profissionais: valor de remuneração.

## 3. Menu Obras

O módulo Obras é independente dos lotes: uma obra tem cadastro próprio e não precisa de empreendimento. O vínculo com empreendimento é um campo opcional. Hoje as telas de Obras e Orçamentos estão vazias; construa tudo abaixo.

Itens do menu Obras, nesta ordem: **Minhas Obras, Orçamento, Medição de Obras, Medição de Contratos, Gestão, RDO**. O Catálogo (Insumos e Composições) é pré-requisito do Orçamento e entra junto. O centro de custo é transversal: todo registro de compras e financeiro pertence a uma Obra ou à Empresa.

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

Rota `/obras`. Título "Minhas Obras" e botão **Nova Obra**. Lista com imagem da obra, Código, Obra, Cliente, Tipo, Status da Obra e "Visível para" (avatares dos usuários, com "+N"). Ordenação por Código, Obra e Cliente. Filtros no topo: busca "Busque uma obra", Status da obra, Status da proposta, Visível para. Ícones: escolher colunas, filtro avançado, baixar lista. Menu por linha (três pontos): Editar, Duplicar, Remover. Paginação "1 - 10". Status da obra: Em orçamento, Em andamento, Paralisada, Finalizada.

Nova Obra abre em painel lateral, com Nome da obra, Tipo da obra, Status * e Obra visível para * no topo, e os demais grupos como seções recolhíveis sob o título "Dados opcionais": Dados gerais, Dados do cliente, Endereço da obra, Contatos, Conta bancária padrão, Dados para Faturamento, Exibir obra para. Botão "Salvar dados da obra".

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

- Rota `/orcamentos`, com duas abas: **Lista de Orçamentos** e **Funil de Vendas**. Botões: Novo, Configurações (engrenagens) e Imprimir.
- Lista: Código (ordenável), Obra, Cliente, Status Obra, Status Proposta (com marcador colorido), Custo, Preço. Busca por texto, período (de/até) e botão Filtro (status da obra, status da proposta). "Carregar mais" no fim.
- Menu Configurações: Modelo de Proposta, BDI (Dinâmico/Fixo), Arredondamento.
- Funil de Vendas: quadro kanban de propostas com as colunas Contato Inicial, Em Elaboração, Em Revisão e as demais etapas (configuráveis). Cada coluna mostra contador, "Total: R$" e menu de três pontos; rodapé "+ Adicionar um cartão". Cartão com Cliente, Obra, Valor e avatar do responsável. Topo: Pesquisar, período, filtro e botão de ocultar valores.

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

Rota `/gestao`. Lista com Obra, Cliente e Status; busca por texto; filtro de status com as opções Todos, A Iniciar, Em Andamento, Paralisada, Finalizada; botão Imprimir; paginação 10, 25, 50, 100. Clicar na obra abre a gestão com as abas abaixo.

| Aba | Conteúdo |
| --- | --- |
| Cabeçalho | Evolução física (%), Status editável, Cliente, Cronograma planejado e realizado, atalho para o Orçamento, Exportar e Imprimir tela |
| Visão Geral | Custo orçado, realizado, saldo e evolução de custos por grupo (Mão de Obra, Material, Equipamento, Outros). Gráficos de distribuição dos custos realizados e resumo de custos, com valor por m² |
| Gestão de Custos | Por etapa e item: custo orçado, custo realizado, saldo, % realizado e evolução física editável. Linha de "custos sem apropriação". Gráfico Orçado x Realizado por etapa |
| Curva S | Avanço acumulado planejado x realizado, físico e financeiro |
| Cronograma | Gantt e tabela, alimentados pelo cronograma do orçamento |
| Arquivos | Anexos da obra |
| Relatórios | Insumos Orçados x Realizados, Curva ABC, Custos por Área de Obra, Custos Realizados por Categorias, Resultado Financeiro, Pagamentos, Resumo de Pagamentos por Etapa, Desempenho de Custos |
| Relatório Gerencial | Relatórios periódicos com Número, Período, Título e Status, sujeitos à alçada de aprovação |
| Anotações | Texto livre sobre a obra |

O custo realizado vem dos lançamentos financeiros apropriados à obra, etapa e item. A classificação por grupo vem da categoria do lançamento (seção 5.9). Categorias marcadas como "Oculta na Gestão" não entram.

**3.5.1 Medição de Obras e Medição de Contratos**

Os dois itens aparecem no menu do Mais Controle, mas não estão contratados na conta do cliente, então não havia tela para conferir. Construa assim:

- **Medição de Obras** (medição para o cliente). Lista por obra: Número, Período, Obra, Cliente, Valor medido, % acumulado, Status. Nova medição: obra, período, itens do orçamento com quantidade e valor contratados, medido no período, acumulado anterior, acumulado atual e saldo. Status: Em elaboração, Enviada, Aprovada, Faturada. Ações: gerar PDF do boletim, aprovar, gerar Faturamento com a natureza "Medição".
- **Medição de Contratos** (medição de empreiteiros e fornecedores). Cadastro de contrato: fornecedor, obra, objeto, valor, início e fim, retenção (%), itens com quantidade e preço. Medição por período sobre os itens do contrato, com retenção e saldo. Status: Em elaboração, Aprovada, Lançada. Ação: gerar Lançamento a pagar apropriado à obra, etapa e item.
- As duas alimentam a evolução física e a Curva S da Gestão.

**3.6 RDO (Relatório Diário de Obras)**

Item extra pedido pelo cliente. O Diário de Obras não está contratado na conta dele no Mais Controle, então não há tela para replicar. Construa conforme abaixo e inclua a aba RDO na Gestão da obra.

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

**3.7 Critérios de aceite de Obras**

- Criar obra, montar orçamento com etapa, subetapa, composição e insumo, e ver custo, BDI e preço corretos.
- Gerar cronograma, cronograma físico-financeiro e Curva S a partir do orçamento.
- Lançar despesa apropriada a um item e ver o realizado na Gestão de Custos.
- Criar, enviar e aprovar um RDO e ver a evolução física atualizada.

## 4. Menu Compras

Itens do menu Compras, nesta ordem: **Solicitação, Cotação, Ordem de Compra**. Rotas `/compras/solicitacoes`, `/compras/cotacoes`, `/compras/ordens`. O fluxo tem três etapas encadeadas, nesta ordem: **1. Solicitação, 2. Cotação, 3. Ordem de Compra**. Cada etapa guarda o vínculo com a anterior. Regra do cliente: toda solicitação tem centro de custo obrigatório (uma Obra ou a Empresa), e cotação e ordem herdam esse centro de custo.

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
- Importação do orçamento do fornecedor em PDF para preencher os preços do mapa (no Mais Controle isso é feito por IA; aqui, deixe o upload e o preenchimento manual, com o ponto de integração preparado).

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
- Configurações: número inicial da cotação; número inicial da ordem de compra; permitir ordem de compra sem cotação. Padrão: não permitir, para cumprir o fluxo pedido pelo cliente. Fornecedores: CNPJ/CPF obrigatório (liga/desliga).
- Listas de apoio: Solicitantes e Condições de Pagamento.

**4.5 Relatórios e critérios de aceite**

- Relatórios: Insumos Orçados x Comprados, Extrato de compras, Mapa de cotação em PDF.
- Aceite: criar solicitação com centro de custo, aprovar, gerar cotação com três fornecedores, escolher no mapa, gerar ordem, aprovar pela alçada, gerar o lançamento e marcar o recebimento. Os contadores "x de y" e os vínculos devem bater em todas as telas.
- Não deve ser possível salvar solicitação sem centro de custo, nem ordem sem cotação com a configuração padrão.

## 5. Menu Financeiro

O financeiro separa o título da sua baixa: **Lançamento gera Pagamentos** (parcelas a pagar) e **Faturamento gera Recebimentos** (parcelas a receber). Itens do menu Financeiro, nesta ordem: **Pagamentos, Recebimentos, Pré-lançamentos, Notas Fiscais, Cobrança Fácil, Contas Bancárias, Fluxo de Caixa, Resultados**. Transferências abre por um botão dentro de Contas Bancárias. Em Ajustes: Plano de contas, Categorias, Naturezas.

**5.1 Pagamentos e Lançamentos**

- Rota `/financeiro/pagamentos`. Cabeçalho: botão **Relatórios**, botão **Novo Lançamento** (com seta: "Criar com IA") e menu de três pontos (**Ver Lançamentos**, **Importar Lançamentos**).
- Barra da lista: navegação por mês (anterior, "novembro 2026", próximo), Pesquisar, situação, Ações, escolher colunas, Filtrar, Exportar Excel.
- Colunas padrão: Vencimento (ordenável), Status, Valor, Favorecido, Descrição e Categoria, Nº Doc, Condição e Conta, Centro de Custo, Pago (data), Anexo. Colunas opcionais no seletor: Quem paga, Juros/Multa, Desconto, Grupo, Ordem de Compra, Forma de Pagamento, e "Mostrar/Ocultar todas".
- Status em selo (Pago, Em aberto, Vencido), com marca de conciliado. Rodapé "Exibir totais": Pago, Em aberto, Total.
- Situação: Todos pagamentos, Em aberto, Pagos. Ações em lote (com linhas marcadas): Pagar, Conciliar.
- Filtros avançados: Tipo de data (Vencimento, Competência, Pagamento), Conta bancária, Favorecido, Centro de Custo, Grupo, Categoria, Quem paga, Condição de pagamento, Forma de pagamento, Ordem de Compra, Retenção.
- Relatórios em PDF: Pagamentos, Pagamentos agrupados. Download da lista.
- Menu por linha (três pontos): em parcela paga, Estornar e Editar Lançamento; em parcela em aberto, Pagar e Editar Lançamento.
- Detalhe do pagamento: valor e status, Vencimento, Condição, Forma de pagamento, Pagador, Favorecido; histórico de pagamentos (valor, data, conta, forma, quem baixou); comentários; detalhes do lançamento; impressão. Aceita baixa parcial.

| Grupo | Campos de Criar lançamento |
| --- | --- |
| Principal | Valor \*, Descrição, Favorecido, Categoria \*, Competência \*, Vencimento \*, Pagador \* (Empresa ou Cliente), Conta \*, Número do documento, Forma de pagamento |
| Centro de custo | Apropriar por Obra ou Empresa; várias obras (rateio por valor ou %); etapa e item do orçamento; Vincular insumos |
| Busca | Link "Buscar dados" abaixo do valor (localiza e preenche dados do documento) |
| Opções (chaves liga/desliga) | Repetir Lançamento: "Repetir lançamento a cada" e "Término das repetições". Parcelar Lançamento: Parcelas * (contador com menos e mais), Intervalo entre as parcelas * (Mensal, Semanal, Quinzenal) e, para cada parcela, Vencimento *, Valor a pagar * e chave Pago; linha Total com a regra "a soma das parcelas deve ser igual ao valor total do pagamento". Retenções: tipo de retenção e valor |
| Outros | Arquivos (arrastar e soltar, até 10 MB), Observações (opcional), chave Marcar como pago |
| Botões | Cancelar, Confirmar Lançamento e, na seta, "Confirmar e inserir novo" |

O formulário abre em painel sobre a lista, com o título "Criar lançamento". Pagador vem preenchido com "Empresa"; Competência e Vencimento vêm com a data do dia. A apropriação tem a opção Obra ou Empresa, o campo Obra e os links "Adicionar obras" (rateio) e "Vincular insumos".

Condições exibidas na lista: À vista, Recorrente, "x/y parcelas". Formas vistas: Boleto, Pix, Permuta. Deixe a lista de formas configurável.

**5.2 Recebimentos e Faturamentos**

- Rota `/financeiro/recebimentos`. Cabeçalho: **Relatórios** (Recebimentos, Recebimentos agrupados), **Novo Faturamento** (com seta: "Nova Venda de Unidade") e menu de três pontos (**Ver Faturamentos**, **Importar Faturamentos**).
- Barra da lista igual à de Pagamentos. Situação: Todos recebimentos, Em aberto, Recebidos. Ações em lote: Conciliar.
- Colunas: Vencimento, Status (Recebido, Em aberto, com marca de conciliado), Valor, Cliente, Condição e Conta, Descrição e Natureza, N. Doc, Centro de Custo, Recebido (data), Anexo. Um recebimento pode ter mais de uma conta e forma de pagamento ("2 contas", "Formas Pgto").
- Menu por linha: Estornar, Emitir Nota Fiscal, Emitir nota fiscal rápida, Editar Faturamento; em parcela em aberto, Receber.
- "Nova Venda de Unidade": atalho de faturamento para venda de imóvel. No sistema novo, esse atalho abre a venda de lote do módulo de contratos.
- Lista de Faturamentos: Lançamento (data), Valor Bruto, Impostos Retidos, Valor Líquido, Cliente, Descrição e Natureza.

| Grupo | Campos de Novo Faturamento |
| --- | --- |
| Principal | Valor \*, Descrição, Cliente, Natureza \*, Competência \*, Vencimento \*, Centro de Custo \*, Conta \*, Número do documento, Forma de recebimento, Vendedor |
| Opções (chaves) | Parcelar Faturamento (mesma mecânica do lançamento), Impostos retidos, Marcar como recebido |
| Outros | Arquivos, Observações |

**5.3 Ligação com a carteira de lotes**

As parcelas dos contratos de lote e de regularização continuam nascendo na carteira (contrato, ficha financeira, boletos). Elas aparecem em Recebimentos como origem "Contrato", somente leitura, com link para a ficha. A baixa do boleto gera o recebimento na conta bancária. Não crie faturamento manual para a mesma parcela, para não contar a receita duas vezes.

**5.4 Pré-lançamentos**

Rota `/financeiro/pre-lancamentos`. Tela inicial com três botões: "Saiba como funciona", "Configurar WhatsApp" e **Novo Pré-lançamento**. Despesa registrada por qualquer usuário (com foto do comprovante) que aguarda revisão do financeiro para virar lançamento. Cada usuário vê só os próprios; só usuários autorizados transformam pré-lançamento em lançamento. Estados: Pendente, Aprovado (vira lançamento), Recusado (volta ao remetente com motivo). Permissões separadas: os próprios e gerenciar todos.

**5.5 Notas Fiscais**

- Notas recebidas: Emissão, Série e número, situação, Emissor e CNPJ, Valor, Lançamento (lançada ou não), Meu CNPJ. Ações: Ver lançamentos vinculados, Vincular e Desvincular lançamento, baixar PDF e XML, ações em massa.
- Nesta fase, entrada por upload de XML e PDF. Captura automática na Sefaz e emissão de NFSe ficam preparadas no modelo de dados e desligadas até a escolha do provedor.
- Meus CNPJs: CNPJ, Razão Social, Certificado Digital e validade, Emissão NFSe (liga/desliga), Captura automática (liga/desliga).

**5.5.1 Cobrança Fácil**

Item de menu próprio. No Mais Controle é a emissão automática de boletos com baixa automática, por conta bancária conectada; na conta do cliente está desativada. Aqui:

- Tela com as contas habilitadas para boleto, botão Ativar por conta e "Regras Padrão" (juros, multa, dias de protesto, instruções, mensagem).
- Emitir boleto a partir de um Recebimento em aberto, individual ou em lote; acompanhar status (emitido, registrado, pago, vencido, cancelado); baixa automática por retorno bancário, que marca o recebimento como recebido e conciliado.
- Use o mesmo motor de boletos e remessa que já existe para a carteira de lotes. Não crie um segundo.

**5.6 Contas Bancárias e Transferências**

- Rota `/financeiro/contas`. Cabeçalho: botões **Transferências** e **Nova Conta bancária**.
- Lista de contas: Banco e tipo (Corrente, Caixa/Dinheiro e outros), Nome, Proprietário (Empresa ou Cliente), Integração bancária (Ativa ou botão Ativar), Cobrança Fácil (Desativada ou ativa), Bloqueio financeiro (botão Bloquear/Desbloquear), Valor Atual. Filtros: busca, Contas ativas, proprietários, bancos, status de integração. Ícones: escolher colunas e "Exibir valores" (olho). Menu por linha: Remover.
- Nova Conta: Nome \*, Proprietário \*, Data inicial \*, Valor inicial \*, Tipo de conta, Banco, Conta visível para (usuários que veem extrato e saldo).
- **Tela da conta** (clicar na conta). Cabeçalho: botões Extrato, Editar Conta, menu (Remover) e Voltar; estrela "Tornar conta padrão". Cartões: Saldo no sistema, Saldo no Banco (com "Atualizar saldo") e Variação. Chave "Conta ativa". Etiquetas: Data inicial, Saldo inicial, Proprietário, "Conta visível para: N usuários". Blocos de Integração Bancária e de emissão de boleto.
- **Conciliação**, na mesma tela, em três abas com contador: **Conciliações Pendentes**, **Conciliados**, **Arquivados**. Filtros: período com navegação, "Buscar por descrição", Ações em massa, Tipo de movimentação (Todas, entradas, saídas) e "Filtrar sugestões automáticas".
- Cada linha da conciliação tem dois lados: à esquerda "Movimentações do banco" (selo, valor, descrição do extrato, data, botões "Mais detalhes" e "Desconciliar"); à direita "Movimentações no sistema" (favorecido ou cliente, valor, descrição, centro de custo, categoria ou natureza, data, "Conciliado por: usuário, data e hora", Anexos e link para abrir o registro).
- Na aba Pendentes: sugerir o par automaticamente por valor e data, permitir escolher outro registro, criar lançamento ou faturamento a partir da linha do banco, e Arquivar a linha.
- Entrada do extrato por arquivo OFX. Integração bancária automática fica preparada e desligada. Alçadas de quem concilia e de quem desconcilia. Bloqueio financeiro impede alteração de movimentos da conta.
- Transferências. Lista: Data, Descrição, Conta de Origem, Conta de Destino, Valor, Pago. Filtros: período, Todas, Pagas, Em Aberto, busca avançada, limpar filtros. Ação em lote: Conciliar. Botões Novo, Imprimir, Exportar para Excel.
- Nova Transferência: Data da Transferência \*, Valor \*, Marcar como Pago (Sim/Não), Conta de Origem \*, Conta de Destino \*, Descrição, Arquivos.

**5.7 Fluxo de Caixa**

- Rota `/financeiro/fluxo-de-caixa`. Filtros: Visualização (Diário, Mensal), Período (de/até), Tipo (Pagos / Recebidos, Em aberto, Todos), Proprietário, Contas Ativas (Todas as Contas ou seleção), Centro de Custo (com "Selecione a opção Obra"), caixa marcada "Considerar o saldo inicial de contas e transferências". Botões Aplicar filtros, Visualizar Extrato e Imprimir.
- Matriz com a primeira coluna "Plano de Contas" fixa, uma coluna por dia ou mês, coluna Total fixa à direita e navegação Anterior/Próximo.
- Linhas, nesta ordem: Saldo Inicial; Saldo Inicial de Conta; Saldo Transferência; **Receitas** (aberta por plano de contas: Receita Operacional Bruta, Receitas Financeiras); **Despesas** (aberta por plano de contas); Saldo; Saldo Final. Cada linha de plano de contas expande para as categorias. Gráfico do fluxo de caixa abaixo da matriz.
- Três visões pedidas pelo cliente: **Empresa** (só o centro de custo Empresa), **Obras** (uma ou várias obras) e **Geral** (tudo somado).

**5.8 Resultados**

- Rota `/financeiro/resultados`. Matriz com uma coluna por mês e coluna Total, navegação Anterior/Próximo e Imprimir. Contas "Somente Fluxo de Caixa" não entram.
- Linhas, nesta ordem:
  1. **Receita Operacional Bruta**: Outras receitas, Contrato, Execução de Obras, Venda de Imóveis, Prestação de Serviços, Venda de Bens, Aluguel
  2. **Impostos**
  3. **Receita Operacional Líquida** (1 menos 2)
  4. **Despesas Variáveis**: Mão de Obra, Mão de Obra Terceirizada, Materiais, Equipamentos, Compra de Terreno, Outras Despesas
  5. **Lucro Bruto** e **Margem Bruta (%)**
  6. **Despesas Operacionais**: Gerais e Administrativas; Aluguel, Condomínio e IPTU; Pessoal Administrativo; e a linha **% Despesas Operacionais**
  7. **Lucro Operacional** e **Margem Operacional (%)**
  8. **Resultado Financeiro**: Juros de Recebimentos, Descontos de Pagamentos, Estorno, Juros de Aplicações Financeiras, Despesas Financeiras, Juros de Pagamentos
  9. **Lucro Líquido** e **Margem Líquida (%)**
- Filtros: Período (mês inicial e final), Visualização (Regime de Caixa, Regime de Competência), Centro de Custo (Todos, Empresa ou Obra, com seleção da obra), botão Aplicar filtros. Com isso saem as três visões pedidas: Empresa, Obra e Geral.

**5.9 Plano de contas e Categorias (carga inicial)**

Telas de cadastro com incluir, editar, inativar e excluir (bloqueie a exclusão se houver lançamento). Plano de contas: Nome, Fluxo de Caixa (Receitas ou Despesas), grupo em Resultados, categorias vinculadas. Categoria: Nome, Plano de Conta, Classificação em Gestão de Obra. Carregue os dados abaixo, copiados do Mais Controle do cliente.

| Plano de conta | Grupo em Resultados |
| --- | --- |
| Receita Operacional Bruta (Receitas) | Receita Operacional Bruta |
| Receitas Financeiras (Receitas) | Resultado Financeiro |

Planos de conta de despesa:

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
| Despesas Financeiras (JUROS e MULTAS) | Despesas Financeiras | (conferir) |
| Distribuição de Lucros | Distribuição de Lucros | Oculta na Gestão |
| Empréstimo | (conferir) | Oculta na Gestão |
| Materiais | Materiais | Materiais |
| Mão de Obra Terceirizada | Mão de Obra Terceirizada | Mão de Obra (Terceirizada) |
| Pagamento de Empréstimo | Pagamento de Empréstimo | Oculta na Gestão |
| Plataforma | Gerais e Administrativas | Mão de Obra (Terceirizada) |

Demais categorias a criar (vínculo a conferir na tela do Mais Controle antes de entrar em produção): Aluguel; Aquisição de Equipamento; Assistência Médica Pessoal Administrativo; Compra de Terreno; Condomínio; Contabilidade; Cursos e Treinamentos; DOAÇÃO; Encargos Mão de Obra; Encargos Pessoal Administrativo; Energia Elétrica; Horas Extras Mão de Obra; Horas Extras Pessoal Administrativo; Hospedagem; Impostos; Internet; IPTU; Juros; Limpeza; Manutenção; Manutenção de Equipamentos; Material de Escritório; Outras Despesas; Pro Labore; Propaganda e Marketing; Rescisões Trabalhistas Mão de Obra; Rescisões Trabalhistas Pessoal Administrativo; Salário Mão de Obra; Salário Pessoal Administrativo; SERVIÇOS DE TERCEIROS; Telefone Celular; Telefone Fixo; Transporte; Vale Alimentação Mão de Obra; Vale Alimentação Pessoal Administrativo; Vale Transporte Mão de Obra; Vale Transporte Pessoal Administrativo; Viagens; Água e Esgoto.

Regra provisória para essas: nome terminado em "Mão de Obra" vai para o plano Mão de Obra; terminado em "Pessoal Administrativo" vai para Pessoal Administrativo com classificação Outros; categoria com o mesmo nome de um plano vai para esse plano. As restantes ficam marcadas como "a classificar" para o financeiro do cliente definir.

Naturezas de receita (usadas no Faturamento, cada uma ligada a uma linha de receita dos Resultados): Outras receitas, Contrato, Execução de Obras, Venda de Imóveis, Prestação de Serviços, Venda de Bens, Aluguel, Juros de Contrato, Licitação, Medição, Projetos, Reembolso, Taxa de Administração, Venda, Juros de Aplicação Financeira. Deixe a lista editável.

**5.10 Configurações e critérios de aceite do Financeiro**

- Configurações avançadas: meses para provisionamento de recorrentes; número do documento obrigatório em lançamentos; idem em pagamentos; abrir etapas e itens automaticamente ao selecionar a obra.
- Alçada de usuários: quem concilia, quem desconcilia, quem aprova Relatório Gerencial.
- Relatórios em Exportar: Recebimentos, Pagamentos, Lançamentos.
- Aceite: lançamento parcelado com rateio em duas obras gera os pagamentos certos; baixa parcial e estorno funcionam; transferência movimenta as duas contas; fluxo de caixa e resultados fecham com os extratos nas três visões (Empresa, Obra, Geral); regime de caixa e de competência dão valores coerentes.

## 6. Central de relatórios (Exportar)

Relatórios dos três menus, filtráveis por centro de custo, com favoritos, em PDF e Excel:

| Rotina | Relatórios |
| --- | --- |
| Orçamento | Sintético, Analítico, Cronograma Físico Financeiro, Cronograma, Curva ABC |
| Gestão | Insumos Orçados x Realizados, Curva ABC de Insumos, Pagamentos, Orçado x Realizado, Desempenho de custos |
| Compras | Insumos Orçados x Comprados, Extrato de compras |
| Financeiro | Recebimentos, Pagamentos, Lançamentos |
| Arquivos | Pagamentos, Outros arquivos |

## 7. Painel

Blocos do Painel alimentados por estes três menus, filtráveis por centro de custo:

- Gestão de obras: abas Em andamento, Paralisada, Finalizada; obra e cliente, evolução física (%), custo orçado, custo realizado (valor e %), saldo.
- Pagamentos em aberto e Recebimentos em aberto: total por conta bancária em quatro faixas (vencidos nos últimos 90 dias, hoje, em 7 dias, em 30 dias), com quantidade e valor.
- Pré-lançamentos pendentes e recusados.
- Notas fiscais ainda não vinculadas a lançamento.
- Gráfico de fluxo de caixa com filtros de proprietário, conta, pagos/recebidos e período.

## 8. Critérios gerais de aceite

- Os três menus aparecem com os itens e a ordem da seção 2, e cada rota abre a tela descrita.
- Fluxo 1: obra > orçamento com etapa, subetapa, composição e insumo > cronograma > solicitação com centro de custo > cotação com três fornecedores e mapa > ordem aprovada por alçada > lançamento parcelado gerado da ordem > pagamento > conciliação no extrato > custo realizado no item da obra > Curva S.
- Fluxo 2: faturamento parcelado com imposto retido > recebimento > conciliação > linha certa no Fluxo de Caixa e nos Resultados, em regime de caixa e de competência.
- Fluxo de Caixa e Resultados fecham com os extratos nas visões Empresa, Obra e Geral.
- Estorno desfaz o pagamento ou recebimento e a conciliação, com auditoria.
- Usuário sem "Visível para" em uma obra não vê a obra em nenhuma tela nem relatório (teste de RLS).

## 9. O que não pôde ser conferido na tela

Construa estes pontos pela descrição deste documento e marque no PR como "a validar com o cliente":

- Medição de Obras, Medição de Contratos e RDO: não contratados na conta do cliente.
- Composições: a conta não tem nenhuma cadastrada; a tela foi vista vazia.
- Retenções e Impostos retidos: só o nome da opção foi visto; os campos internos foram definidos aqui.
- Formulário de Novo Pré-lançamento, painel de filtros avançados de Pagamentos e Recebimentos (a lista de filtros veio de uma conferência anterior), Cobrança Fácil e emissão de NFSe (desativadas).
- Conteúdo interno de cada relatório em PDF e o layout dos arquivos de importação.
- Categorias: plano de conta e classificação conferidos para 14 delas; as demais seguem a regra provisória da item 5.9.

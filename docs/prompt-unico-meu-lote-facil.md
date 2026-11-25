# Meu Lote Fácil: lista de alterações (prompt para o Cursor)

Data: 25/11/2026. Base: conferência tela por tela do sistema em produção, comparado ao Mais Controle (Obras, Compras, Financeiro), ao LoteWin (lotes, vendas, carteira) e às anotações do cliente.

## Como trabalhar

- Repositório `aiionadmin/meulotefacil` (Next.js 15, React 19, TypeScript, Tailwind v4, shadcn/Radix, Supabase).
- Execute os blocos na ordem (A até K). Um PR por bloco. Não faça deploy.
- Cada item tem um código (ex.: C07). No PR, liste os códigos entregues e os pendentes.
- Todo dado novo nasce no Supabase, com migration, RLS e tipos gerados. Nada novo em localStorage.
- Regra de dinheiro (juros, multa, saldo, baixa, rateio) roda no servidor, com teste automatizado.
- "Igual ao Mais Controle" e "igual ao LoteWin" significam mesmas telas, campos, fluxos, status e relatórios, com a identidade visual atual do Meu Lote Fácil. Não copie marca, textos nem desenho de tela.
- O detalhe de campos e telas está nos Anexos 1 a 5, no fim deste arquivo. Cada bloco indica o anexo que o detalha.

---

## Bloco A. Sair do modo demonstração

- **A01.** Mover todos os stores (fase1, carteira, fluxo, operacoes, demo) de seed + localStorage para tabelas no Supabase.
- **A02.** Desligar em produção o login de demonstração (cookie `mlf_demo_session`) e o usuário "Admin Demo". Login só por Supabase Auth.
- **A03.** Remover de produção o botão "Restaurar demo" e a tela "Parâmetros (legado demo)"; os parâmetros passam a ser telas reais (ver J).
- **A04.** Construir a matriz de permissões por perfil e rotina (Visualizar, Inserir e Alterar, Remover), aplicada no banco (RLS) e na tela. Hoje a tela de Perfis só lista os 12 perfis.
- **A05.** Auditoria real: gravar quem, quando, rotina, ação, registro e valores antes e depois em toda criação, alteração, exclusão, baixa, estorno e aprovação.
- **A06.** Unificar os dados de exemplo em um único conjunto coerente (os mesmos clientes, contratos, lotes, obras e pagamentos em todas as telas), carregado só em ambiente de desenvolvimento.

## Bloco B. Correções do que já está no ar

- **B01.** Datas com um dia a menos: na Ficha financeira e no Financeiro, 10/07/2026 aparece como 09/07/2026 e 15/11/2026 como 14/11/2026. Tratar data sem hora como data pura, sem conversão de fuso.
- **B02.** Padronizar toda data em dd/mm/aaaa e data com hora em dd/mm/aaaa hh:mm. Hoje há "2026-07-10", "2026-11-25T12:00:00.000Z", "prazo 2026-12-01".
- **B03.** "A receber" tem três valores (Painel/Contratos/Ficha, Financeiro, Importação). Definir uma regra única por indicador e dar nomes diferentes a indicadores diferentes (ex.: "A receber de contratos" e "A receber total").
- **B04.** Mesma correção para "Em atraso" (Cobrança x Importação) e "Usuários" (3 e 4 no mesmo Painel).
- **B05.** A mesma parcela aparece "em aberto" no Financeiro e "vencida" na Ficha. O status da parcela vem de uma única função no servidor.
- **B06.** O Financeiro mostra o valor original da parcela vencida e a Cobrança mostra o atualizado. Mostrar sempre as duas colunas: valor original e valor atualizado.
- **B07.** Remover textos internos de todas as telas: "Fase N", "Fases 1–10 ativas", "§11.3", "§13.2", "§10.5", "legado demo", "(demo)", "legacy_id", "entra com o backend Supabase", "demo local".
- **B08.** Exibir status com rótulo, acento e inicial maiúscula. Hoje aparecem "em_execucao", "em aprovacao", "concluida", "disponivel", "anuncio", "indicacao", "pre_cadastro", "media".
- **B09.** Faixas da Cobrança sem formatação ("31 90", "1 30", "a vencer 5"): exibir "31 a 90 dias", "1 a 30 dias", "A vencer em 5 dias".
- **B10.** Em Compras, a descrição e o selo aparecem colados ("Tubos PVC rede águaurgente"). Separar.
- **B11.** Título da aba do navegador: usar "Nome da tela · Meu Lote Fácil" em cada rota. Hoje todas mostram o título do site institucional.
- **B12.** Subtítulo cortado na tela Núcleos ("Portfólio operacional,").
- **B13.** Menu: remover duplicados. "Efetuar venda / contratos" e "Contratos" abrem a mesma rota; "Ficha financeira" e "Caixa (receber)" também; os quadros de Cobrança e Regularização aparecem duas vezes.
- **B14.** Clientes com contrato precisam existir em Pessoas e em Clientes (hoje Ana Souza tem contrato e não está no cadastro).
- **B15.** A lista de Leads não deve mostrar quem já virou contrato como lead em etapa "cobrança" ou "carteira em dia". Lead convertido sai da lista de leads e fica visível pelo card.
- **B16.** Clicar em um card de qualquer quadro deve abrir o card (ver F01). Hoje não abre nada.
- **B17.** Paginação no servidor em todas as listas (hoje só Pessoas tem).
- **B18.** Ficha financeira: o cliente relatou travamento ao entrar. Paginar parcelas no servidor, calcular encargos no servidor só para as parcelas exibidas, mostrar carregamento e erro. Aceite: abrir em até 2 segundos com contrato de 240 parcelas, com teste automatizado.

## Bloco C. Ajustes gerais pedidos pelo cliente

Detalhe no Anexo 1.

- **C01.** Multiempresas: tabela `empresas`, `empresa_id` obrigatório em toda tabela de negócio, RLS por empresa, seletor de empresa na barra superior (com "Todas"), visibilidade de empresas e de obras no cadastro de usuário.
- **C02.** Plano de contas, categorias, naturezas, contas bancárias, numeração e parâmetros por empresa.
- **C03.** Empreendimento: campo obrigatório Modalidade (`Loteamento`, `Regularização`, `Loteamento e regularização`) no formulário, ligando e desligando abas e etapas.
- **C04.** Importar quadras e lotes por Excel: modelo .xlsx para baixar, tela de conferência com erros por linha, criar e atualizar, relatório final. Manter "Gerar lotes em massa".
- **C05.** Planta real: upload do PDF do projeto por empreendimento (folhas e versões), visualizador com zoom, modo de edição para marcar a área de cada lote sobre a planta, modo de consulta com lote colorido pelo status e clique para abrir a ficha. Substitui os quadrados atuais.
- **C06.** Quadros Jornada e Regularização só avançam: bloquear arraste para trás; retirar a coluna "Cobrança e jurídico" do caminho da Jornada; atraso vira selo no card ("Em atraso") e o caso segue no quadro de Cobrança.
- **C07.** Estados finais fora do fluxo, com motivo obrigatório: Perdido, Cancelado, Distrato. Só Administrador corrige avanço indevido, com motivo e registro.
- **C08.** Gravar em cada avanço: data, usuário e tempo na etapa anterior.
- **C09.** Lead com qualificação completa: origem e campanha, corretor, empreendimento de interesse, tipo de interesse, finalidade, faixa de valor, entrada disponível, parcela que cabe, forma de pagamento, prazo para decidir, cidade e bairro, visita (sim/não e data), melhor horário, canal preferido, objeções, observações.
- **C10.** Pontuação do lead (0 a 100) com pesos configuráveis, classificação Frio/Morno/Quente e motivo de perda obrigatório.
- **C11.** Proposta: Empreendimento obrigatório, depois Quadra e Lote em lista filtrada por disponíveis (hoje o lote é texto livre), ou serviço de regularização. Empreendimento na lista, no card e no PDF.
- **C12.** Contrato nasce da proposta aprovada, herdando cliente, lote, valores e plano.
- **C13.** Componente único de lista em todas as telas: filtros por coluna (texto, lista, período, faixa de valor, situação), filtros salvos, ordenação, colunas visíveis, "Limpar filtros".
- **C14.** Todo campo de seleção (cliente, lote, fornecedor, obra, insumo, conta, categoria) com busca por digitação.
- **C15.** Ações em lote em toda lista: editar campos em comum, mudar situação, atribuir responsável, baixar, conciliar, exportar, remover; com confirmação e auditoria.
- **C16.** Exportar em Excel e PDF em toda lista (hoje só CSV em Pessoas). Imprimir em toda lista.
- **C17.** Importar por Excel, com modelo e conferência: clientes, fornecedores, profissionais, insumos, composições, lotes, lançamentos e faturamentos.

### Kanban em todas as telas

O sistema já tem a opção Kanban/Lista nos quadros (Jornada, Cobrança, Regularização, Compras, Obras, Tarefas). **Não remova nem altere esse padrão.** Estenda para todo o sistema.

- **C18.** Toda tela de processo com status tem o alternador **Kanban | Lista**, com a escolha gravada por usuário. As duas visões usam os mesmos dados, filtros e ações em lote.
- **C19.** Acrescentar a visão Kanban onde hoje só há lista: Leads, Propostas e reservas, Contratos (por situação), Lotes (por status), Inadimplentes e acordos, Processos judiciais, Processos REURB (por fase), Documentos (por status), Boletos (por status), Pagamentos, Recebimentos, Pré-lançamentos, Notas fiscais (pendente, vinculada), Minhas tarefas.
- **C20.** Todo módulo novo desta lista já nasce com Kanban e Lista: Orçamentos (Funil de Vendas), Solicitações, Cotações, Ordens de compra (por aprovação e por status da compra), RDO (por status), Relatório Gerencial, Demandas, Importações.
- **C21.** Padrão único de quadro: colunas pelos status do módulo, contador e total em valor por coluna, card com título, pessoa, valor, prazo e selos, clique abre o detalhe (ver F01), arrastar muda o status respeitando permissão e alçada.
- **C22.** A regra "só avança" (C06) vale para Jornada e Regularização. Nos demais quadros o arraste segue as transições permitidas de cada módulo (ex.: ordem de compra só vai para "Aprovado" por quem tem alçada).
- **C23.** Cadastros sem status (Pessoas, Insumos, Composições, Plano de contas, Categorias, Listas de apoio) continuam só em lista.

## Bloco D. Obras, igual ao Mais Controle, com RDO

Hoje existe só uma lista e um painel lateral. Construir conforme o Anexo 2.

- **D01.** Obra independente de empreendimento (vínculo opcional). Remover a regra "centro de custo compartilhado por empreendimento".
- **D02.** Botão Nova Obra e formulário completo: nome, tipo, status, visível para, código, área, ART, CEI/CNO, responsável técnico e da obra, cliente, endereço, contatos, conta bancária padrão, dados para faturamento, exibir para Lançamentos/Faturamentos/Compras.
- **D03.** Lista de obras com imagem, código, obra, cliente, tipo, status, visível para; ações Editar, Duplicar, Remover.
- **D04.** Catálogo de Insumos: lista, filtros, cadastro, favoritos, histórico de preços, importar e exportar.
- **D05.** Composições: cadastro, insumos com coeficiente, custo por grupo, BDI e preço unitário.
- **D06.** Orçamento editável em árvore Etapa > Subetapa > Item (composição ou insumo), com quantidade, custo unitário, custo total, BDI, preço e trava de edição.
- **D07.** Lista de Orçamentos com status da obra e da proposta, custo e preço; configurações de BDI (dinâmico ou fixo) e arredondamento.
- **D08.** Funil de Vendas de orçamentos (kanban de propostas).
- **D09.** Aba Proposta: status, datas, responsável, condição de pagamento, desconto, gerar PDF, comentários.
- **D10.** Aba Contrato com modelos de documento.
- **D11.** Cronograma em Gantt por etapa: duração, início, fim, predecessores, caminho crítico, dias a desconsiderar; usa o Expediente das obras.
- **D12.** Cronograma físico-financeiro por período.
- **D13.** Gestão da obra: cabeçalho (evolução física, status, cronograma planejado e realizado) e Visão Geral com custos por grupo, gráficos e valor por m².
- **D14.** Gestão de Custos por etapa e item: orçado, realizado, saldo, % e evolução física editável por item; linha "custos sem apropriação"; gráfico Orçado x Realizado.
- **D15.** Curva S planejado x realizado.
- **D16.** Custo realizado vindo dos lançamentos financeiros apropriados à obra, etapa e item; classificação pela categoria; categorias "Oculta na Gestão" ficam fora.
- **D17.** Relatórios da obra: Orçamento Sintético e Analítico, Curva ABC, Insumos Orçados x Realizados, Custos por Área de Obra, Custos Realizados por Categorias, Resultado Financeiro, Pagamentos, Resumo de Pagamentos por Etapa, Desempenho de Custos.
- **D18.** Relatório Gerencial periódico com alçada de aprovação.
- **D19.** Arquivos e Anotações por obra.
- **D20.** RDO: um por obra e dia, número sequencial, status Rascunho/Enviado/Aprovado/Devolvido; blocos Cabeçalho, Clima por turno, Efetivo próprio e terceirizado, Equipamentos, Atividades por etapa e item com % acumulado, Materiais recebidos (ligados à ordem de compra), Ocorrências, Fotos, Observações, Assinaturas.
- **D21.** RDO: lista com filtros, calendário destacando dias úteis sem RDO, "Copiar do dia anterior", uso em celular com rascunho automático, PDF, relatório por período.
- **D22.** RDO aprovado atualiza a evolução física do item e a Curva S.

## Bloco E. Compras, igual ao Mais Controle

Hoje o fluxo é Solicitação e Ordem. O correto é **Solicitação > Cotação > Ordem de Compra**. Detalhe no Anexo 3.

- **E01.** Solicitação com itens (insumo ou item do orçamento, unidade, quantidade). Hoje há só "nº de itens" e "valor estimado".
- **E02.** Centro de custo obrigatório na solicitação, podendo ser uma Obra ou a Empresa (hoje a lista mostra empreendimentos e o campo não é marcado como obrigatório).
- **E03.** Lista de solicitações com as colunas Cotados, Comprados, Recebidos ("x de y") e Vínculos (números das cotações e ordens).
- **E04.** Tela de detalhe da solicitação: linha do tempo em 4 passos, Marcar recebimento, itens por etapa, previsão de entrega, arquivos, comentários.
- **E05.** Aprovação da solicitação com motivo na recusa.
- **E06.** Cotação (módulo inteiro): lista; cabeçalho com número, descrição, prioridade, necessidade, solicitante; status Em aberto, Solicitado, Enviado ao fornecedor, Respondido parcialmente, Cotado parcialmente, Cotado, Finalizado.
- **E07.** Cotação, aba Itens com "Buscar solicitação"; aba Fornecedores com contato, qualificação, local de entrega e envio por e-mail e WhatsApp.
- **E08.** Cotação, aba Mapa de Cotação: comparativo item x fornecedor, melhor compra, subtotal, desconto, frete; escolher vencedor e gerar as ordens.
- **E09.** Ordem de Compra: botão Nova e formulário com fornecedor, itens (unidade, quantidade, valor unitário), frete, outras despesas, impostos, desconto, total.
- **E10.** Ordem: situação de aprovação (Aprovado, Em aberto, Negociando, Aguardando aprovação, Negado) e status da compra (Aguardando, Comprado, Entregue Parcial, Entregue Total).
- **E11.** Ordem: aba Informações (faturamento, condição de pagamento, prazo e local de entrega, responsável pelo recebimento), Resumo da Compra e Arquivos.
- **E12.** Ordem: gerar Lançamento financeiro com parcelas pela condição de pagamento e a mesma apropriação; enviar por e-mail e WhatsApp; imprimir PDF; Saldo de Compra.
- **E13.** Alçada de aprovação por faixa de valor e centro de custo, para solicitação e ordem.
- **E14.** Configurações: número inicial de cotação e de ordem; "permitir ordem sem cotação" (padrão: não).
- **E15.** Filtros por período, centro de custo e status; relatórios Insumos Orçados x Comprados e Extrato de compras.

## Bloco F. Card único do cliente

- **F01.** Ao clicar em um card da Jornada, abrir o card do cliente com abas: Resumo, Cadastro, Conversas, Proposta, Contrato, Parcelas, Boletos, Cobrança, Jurídico, Regularização, Documentos, Histórico.
- **F02.** O mesmo card abre a partir de Cobrança, Regularização, Contratos, Ficha financeira e da busca global.
- **F03.** Linha do tempo única por cliente, com todos os eventos (lead, visita, proposta, contrato, pagamentos, contatos de cobrança, protocolos, demandas).

## Bloco G. Financeiro, igual ao Mais Controle

Hoje é uma tela-resumo. Construir conforme o Anexo 4.

- **G01.** Separar em telas: Pagamentos, Recebimentos, Pré-lançamentos, Notas Fiscais, Contas Bancárias, Transferências, Fluxo de Caixa, Resultados.
- **G02.** Plano de contas (nome, Fluxo de Caixa, grupo em Resultados) com a carga inicial do Mais Controle.
- **G03.** Categorias (nome, plano de conta, classificação em Gestão de Obra) com a carga inicial do Mais Controle.
- **G04.** Naturezas de receita editáveis.
- **G05.** Criar lançamento completo: valor, descrição, favorecido, categoria, competência, vencimento, pagador, conta, número do documento, forma de pagamento. Hoje há só favorecido, descrição, valor e conta.
- **G06.** Lançamento: apropriação por Obra ou Empresa, rateio em várias obras, etapa e item, vincular insumos.
- **G07.** Lançamento: Repetir (recorrente), Parcelar, Retenções, Arquivos, Observações, Marcar como pago.
- **G08.** Lista de Pagamentos por mês, com colunas configuráveis, totais (Pago, Em aberto, Total) e filtros avançados.
- **G09.** Pagar, baixa parcial, Estornar, histórico de pagamentos, ações em lote Pagar e Conciliar.
- **G10.** Faturamento: botão Novo e formulário (valor, cliente, natureza, competência, vencimento, centro de custo, conta, forma de recebimento, vendedor, parcelas, impostos retidos).
- **G11.** Recebimentos por mês, com Receber, Estornar, Emitir Nota Fiscal, Editar Faturamento; lista de Faturamentos com bruto, retido e líquido.
- **G12.** Parcelas de contrato aparecem em Recebimentos como origem "Contrato", somente leitura, sem duplicar receita.
- **G13.** Contas bancárias: botão Nova conta, proprietário, data e valor inicial, tipo, banco, "visível para", bloqueio financeiro.
- **G14.** Extrato por conta e conciliação por OFX e manual, com alçada de conciliar e desconciliar.
- **G15.** Transferências: campo Pago, filtros por período e situação, conciliar em lote, imprimir, exportar.
- **G16.** Fluxo de Caixa como tela: matriz plano de contas x período, visualização diária/semanal/mensal, realizado e previsto, saldo inicial.
- **G17.** Resultados como tela: demonstrativo mensal por grupo, regime de caixa ou competência.
- **G18.** Fluxo de Caixa e Resultados com três visões: Empresa, Obra e Geral.
- **G19.** Notas fiscais: Meus CNPJs (certificado, emissão, captura) e upload de XML/PDF.
- **G20.** Configurações: meses de provisionamento, número do documento obrigatório, abertura automática de etapas.

## Bloco H. Lotes, vendas e carteira, igual ao LoteWin

- **H01.** Cadastro completo do empreendimento: código, nome, quantidade de quadras e lotes, cidade, UF, CEP, área total, código do município, padrão, confrontação, matrícula (número e data), empresa administradora (razão social, CNPJ, endereço), conta corrente padrão, numeração própria, observações, recado padrão. Hoje há só código, nome e cidade.
- **H02.** Encargos por empreendimento: dias de mora, taxa de mora, dia da multa, taxa de multa.
- **H03.** Sócios por empreendimento, com percentual, e relatório dos sócios.
- **H04.** Lote: padrão, custo, confrontações (frente, fundo, direita, esquerda), observações; ações Incluir, Alterar, Excluir, Atualizar valor do m².
- **H05.** Status do lote completos: Advogado, Caucionado, Disponível, Escritura, Invadido, Jurídico, Quitado, Reservado, Vendido. Cada status com "bloqueio de venda" e "bloqueio financeiro". Alinhar a planta com a lista (hoje a planta mostra "bloqueado", que não está na lista).
- **H06.** Tabela de preços por empreendimento: % juros, % entrada, opções de parcelas, comissão, valor por m².
- **H07.** Cadastro de Planos de pagamento e Consulta de Planos (entradas, prestações, moeda de referência, moeda do resíduo, datas, séries).
- **H08.** Cadastro completo do comprador: pessoa física ou jurídica, nome, sexo, nascimento, nacionalidade, naturalidade, filiação, profissão, CPF, RG, renda, estado civil, regime; cônjuge; endereços residencial e comercial; procurador. Hoje há 7 campos.
- **H09.** Demais promitentes: mais de um comprador no mesmo contrato.
- **H10.** Venda em etapas: selecionar lote(s), comprador e promitentes, adicionais e recados, dados do lote, cópia de plano, plano de pagamento, comissão e finalizar. Venda com mais de um lote. Hoje é um formulário de 6 campos com comprador em texto livre.
- **H11.** Pré-cadastro de cliente como tela e origem da venda.
- **H12.** Comissões: cadastro, cálculo por venda, previsto, liberado e pago, por corretor.
- **H13.** Veículos de comunicação como cadastro (origem da venda), com relatório.
- **H14.** Documentos do contrato por modelo: contrato, promissórias, mala direta.
- **H15.** Ficha financeira com as colunas do LoteWin: tipo, data do pagamento, vencimento, valor, juros, multa, correção monetária, despesa bancária, número e "Prestação x / y"; rodapé com quantidade e total pago.
- **H16.** Ações da ficha: incluir e alterar parcela, alterar vencimento, pesquisar e cancelar boleto, pagamento, recado, exportar para Excel.
- **H17.** Índices (moedas) com cotação por período; parcela com valor na moeda e valor em espécie; prestações geradas por ciclo anual.
- **H18.** Correção monetária anual com mês-base, resíduos e desfazer reajuste, com histórico.
- **H19.** Operações do contrato: retomada de lote, transferência, renegociação, troca de lote, adiantamento de parcelas, alteração de plano, distrato; cada uma com tela, regra e histórico.
- **H20.** Caixa como tela própria: recebimento, tolerância de dias de mora, recibo em 1 ou 2 vias, autenticação, estorno só por administrador, fechamento de caixa.
- **H21.** Parâmetros de recebimento: multa acumulativa, não receber atuais com atrasadas, pagamento parcial, unir vendas no caixa, despesa bancária, texto do recibo.
- **H22.** Emissão de boletos com filtros (lote ou cliente, mês/ano, conta), duas grades (selecionados e excluídos), remessa CNAB real, carnê, reemissão e atualização de encargos. Retirar o rótulo "demo".
- **H23.** Baixa manual e baixa automática por arquivo de retorno, com relatório de boletos e de cancelados.
- **H24.** Despesas do empreendimento.
- **H25.** Cadastro de cartórios e controle de escrituras.
- **H26.** Relatórios financeiros: posição financeira, previsão da carteira, geral recebido, histórico da inadimplência, relatório de caixa (resumo e fechamento), parcelas adiantadas, previsão e recebimentos, vendas e recebimentos de lotes, relatório dos sócios.
- **H27.** Relatórios técnicos: cancelados, cobrança, escrituras, ficha financeira, histórico de lotes, inadimplência, lotes por status, lotes por plano, quitados, reajustes anuais, resíduos, vagos, vendidos, veículos de comunicação.
- **H28.** DIMOB, SPED Contribuições e arquivo para contabilidade gerando arquivo de verdade (hoje são três botões).

## Bloco I. Dashboards, portais e demandas

Detalhe no Anexo 5.

- **I01.** Painel "Números gerais" (operacional) e painel "Gerencial" (direção), com filtro de empresa, empreendimento, obra e período; todo número clicável abre a lista filtrada.
- **I02.** Visão única por empreendimento, em abas: Resumo, Planta, Lotes, Vendas (Propostas e Contratos), Boletos, Previsão de carteira, Inadimplência, Regularização, Demandas, Obras, Arquivos.
- **I03.** Portal do corretor (login próprio, só os próprios dados): gestão de leads, espelho de vendas com reserva, propostas, comissões, materiais.
- **I04.** Portal do cliente (login por CPF e código): contratos, parcelas, segunda via de boleto e Pix, informe anual, andamento da regularização, envio de documentos, abertura de demandas.
- **I05.** Gestão de demandas: tipos configuráveis (ligação de água, ligação de energia, marcação de lote, limpeza, autorização para construir), campos, quadro kanban, prazo, integração com card do cliente, solicitação de compra e cobrança.
- **I06.** Perfis externos Corretor e Cliente, restritos aos portais, com teste de RLS.

## Bloco J. Configurações

- **J01.** Transformar cada grupo de "Parâmetros" em tela funcional: Empresa, Encargos, Caixa, Vendas, Boletos, Reajuste, Financeiro, Compras, Obras, Aparência.
- **J02.** Usuários: visibilidade de empresas, obras e empreendimentos; usuário-chave.
- **J03.** Alçadas: acrescentar RDO, Relatório Gerencial, Solicitação de compra, desconciliar e correção de avanço de card.
- **J04.** Listas de apoio: acrescentar tipos de obra, unidades, bases de insumos e composições, tipos de retenção, solicitantes, condições de pagamento, segmentos de fornecedor, fontes e setores de cliente, tags de arquivo, motivos de perda, tipos de demanda.
- **J05.** Menu "Novo" do topo: acrescentar Faturamento, Transferência, Cotação, Ordem de compra, Obra, RDO e Demanda.

## Bloco K. Migração dos dados reais

- **K01.** Importador real para as 11 entidades da fila (listas, pessoas, empreendimentos, lotes, contratos, parcelas, recebimentos, plano de contas, financeiro, obras, compras), idempotente por identificador de origem.
- **K02.** Leitura direta do banco do LoteWin (arquivo Access .mdb) quando a cópia for entregue.
- **K03.** Conferência automática contra o painel do LoteWin de 24/11/2026: 41 empreendimentos, 12.995 lotes, 3.690 vendidos, 3.504 clientes, 3.690 contratos, 2.074 ativos, R$ 38.936.075,88 a receber, R$ 6.869.670,85 em atraso.
- **K04.** Não duplicar receita: as vendas de lote lançadas no Mais Controle como recebimentos genéricos não entram junto com as parcelas do LoteWin.

---

## Critério geral de aceite

- Nenhum texto interno, código de status ou data em formato técnico visível ao usuário.
- Cada indicador com o mesmo valor em todas as telas.
- Toda lista com filtro, paginação, exportação em Excel e PDF e ações em lote.
- Fluxo completo testado: lead qualificado > proposta com empreendimento > contrato > parcelas > boleto > baixa > recebimento no financeiro > fluxo de caixa.
- Fluxo completo testado: obra > orçamento > solicitação com centro de custo > cotação > ordem aprovada > lançamento > pagamento > custo realizado na obra > RDO aprovado atualizando a evolução física.
- Testes de RLS provando que um usuário não vê dados de outra empresa, um corretor não vê leads de outro e um cliente não vê contrato de outro.

---

# Anexos: detalhe de telas e campos

Os anexos detalham os blocos C, D, E, G e I. Onde um anexo e a lista divergirem, vale a lista.

## Anexo 1. Ajustes gerais

Você está trabalhando no repositório `aiionadmin/meulotefacil` (Next.js 15 App Router, React 19, TypeScript, Tailwind v4, shadcn/Radix, Supabase, React Hook Form + Zod, TanStack Table, dnd-kit, Recharts). Hoje o sistema é uma demonstração: os dados vêm de seeds e ficam no navegador. A especificação de referência está em `docs/especificacao.md`. Este prompt complementa a especificação e, onde houver conflito, vale este prompt.

Regras de trabalho:

- Entregue por partes, um PR por parte, na ordem deste documento. Não faça deploy.
- Todo dado novo nasce no Supabase, com migration, RLS e tipos gerados. Não crie nada novo em localStorage.
- Regra de dinheiro (juros, multa, saldo, baixa, rateio) roda no servidor, com teste automatizado.
- Mantenha a identidade visual atual do Meu Lote Fácil. "Igual ao Mais Controle" significa mesmas telas, campos, fluxos, status e relatórios, e não a cópia de marca, textos ou desenho de tela.
- Ao terminar cada parte, liste o que ficou pronto, o que ficou pendente e como testar.

**A1.1 Multiempresas**

- Tabela `empresas` (razão social, nome fantasia, CNPJ, endereço, logo, status). Toda tabela de negócio recebe `empresa_id` obrigatório, com RLS que só libera as empresas do usuário.
- Seletor de empresa na barra superior, com a opção "Todas" para quem tem acesso a mais de uma. A escolha vale para todas as telas e fica gravada por usuário.
- No cadastro de usuário: "Visibilidade das empresas" e "Visibilidade das obras".
- Plano de contas, categorias, naturezas, contas bancárias, numeração de documentos e parâmetros são por empresa. Ao criar uma empresa, copie o padrão da seção A4.9.
- Relatórios, fluxo de caixa e resultados aceitam uma empresa, várias ou o consolidado.

**A1.2 Empreendimento: modalidade, importação e planta**

- Campo obrigatório **Modalidade**: `Loteamento`, `Regularização` ou `Loteamento e regularização`. A modalidade liga e desliga abas, etapas dos quadros e campos. Empreendimento só de regularização não mostra venda de lotes; só de loteamento não mostra o quadro de regularizações.
- **Importar quadras e lotes por Excel**: botão "Importar" na aba Lotes, com download do modelo (.xlsx). Colunas do modelo: quadra, lote, área (m²), frente, fundo, lateral direita, lateral esquerda, confrontações, matrícula, inscrição municipal, preço à vista, situação, observação. Fluxo: enviar arquivo, tela de conferência com erros por linha (lote repetido, área inválida, situação desconhecida), opção de criar novos e atualizar existentes, confirmação e relatório final (criados, atualizados, recusados). Nada é gravado antes da confirmação.
- **Planta real em PDF**: upload do PDF do projeto por empreendimento (várias folhas e versões, com data e autor). A planta abre em visualizador com zoom e arraste. Modo de edição para desenhar a área de cada lote sobre a planta e ligar ao cadastro. Modo de consulta com cada lote colorido pela situação (disponível, reservado, proposta, vendido, quitado, inadimplente, bloqueado), legenda, filtro e clique no lote para abrir a ficha. Guarde o PDF original e gere imagem para exibir.

**A1.3 Quadros que só avançam**

- Nos quadros 2.1 Jornada do cliente e 2.3 Regularizações e escrituras, o card só pode ser movido para colunas à frente. Arrastar para trás é bloqueado, com aviso.
- Situações que hoje fariam o card voltar viram selos no próprio card (Em atraso, Pendência de documento, Aguardando cliente, Exigência do cartório), sem mudar de coluna. A cobrança continua no quadro de Cobrança.
- Saídas do fluxo são estados finais e não colunas anteriores: Perdido, Cancelado, Distrato. Exigem motivo.
- Só o perfil Administrador pode corrigir um avanço feito por engano, com motivo obrigatório e registro no histórico do card.
- Cada avanço grava data, usuário e tempo na etapa anterior.

**A1.4 Qualificação de leads**

Amplie o cadastro do lead com: origem e campanha, corretor responsável, empreendimento de interesse, tipo de interesse (comprar lote, regularizar imóvel, ambos), finalidade (morar, investir, construir para vender), faixa de valor pretendida, valor de entrada disponível, parcela mensal que cabe no orçamento, forma de pagamento pretendida, prazo para decidir, cidade e bairro, se já visitou o empreendimento, data da visita, melhor horário de contato, canal preferido, objeções e observações.

- Pontuação automática (0 a 100) com pesos configuráveis e classificação Frio, Morno e Quente.
- Checklist de qualificação visível no card; o lead só avança para Proposta com os campos mínimos preenchidos (configurável).
- Motivo de perda obrigatório, a partir de lista configurável.
- CPF, renda e estado civil ficam para a etapa de proposta, e não para a captação.

**A1.5 Proposta com empreendimento**

- A proposta exige Empreendimento e, em seguida, Quadra e Lote (filtrados pelo empreendimento e pela situação disponível) ou o serviço de regularização. O empreendimento aparece na lista, no card, no PDF e nos filtros.
- Fluxo de venda: Proposta (1) e depois Contrato (2). O contrato nasce da proposta aprovada, herdando cliente, lote, valores e plano de pagamento.

**A1.6 Filtros, edição em lote, importação e exportação**

Crie um componente único de lista e aplique em todas as telas de listagem:

- Busca por texto e filtros por coluna (texto, lista, período, faixa de valor, situação), com filtros salvos por usuário e botão "Limpar filtros".
- Todo campo de seleção (cliente, lote, fornecedor, obra, insumo, conta, categoria) tem busca por digitação e filtro por empresa e empreendimento.
- Paginação no servidor (10, 25, 50, 100), ordenação por coluna e escolha de colunas visíveis.
- Seleção por caixa de marcação e barra de **ações em lote**: editar campos em comum, mudar situação, atribuir responsável, baixar, conciliar, exportar, remover. Toda ação em lote mostra a quantidade afetada, pede confirmação e grava auditoria.
- **Exportar** em Excel e PDF respeitando os filtros. **Importar** por Excel, com modelo e tela de conferência, nos cadastros: clientes, fornecedores, profissionais, insumos, composições, lotes, lançamentos e faturamentos.
- Imprimir em toda lista.

**A1.7 Erro: Ficha financeira trava**

Ao entrar em Ficha financeira o sistema congela. Investigue e corrija a causa. Suspeitas a verificar primeiro: cálculo de juros e multa de todas as parcelas a cada renderização, lista sem paginação e leitura de todo o estado local. Critérios de aceite:

- A ficha abre em até 2 segundos com um contrato de 240 parcelas.
- Parcelas paginadas no servidor; encargos calculados no servidor e só para as parcelas exibidas.
- Estado de carregamento e mensagem de erro; nunca tela congelada.
- Teste automatizado que abre a ficha com volume alto de parcelas.

## Anexo 2. Obras, igual ao Mais Controle, com RDO

O módulo Obras é independente dos lotes: uma obra tem cadastro próprio e não precisa de empreendimento. O vínculo com empreendimento é um campo opcional. Hoje as telas de Obras e Orçamentos estão vazias; construa tudo abaixo.

Menu Obras: Minhas Obras, Orçamento (Lista e Funil de Vendas), Gestão, RDO. Menu Catálogo: Insumos, Composições. O centro de custo é transversal: todo registro de compras e financeiro pertence a uma Obra ou à Empresa.

**A2.1 Insumos**

- Lista: favorito (estrela), Código, Descrição, Tipo, Unidade, Grupo, Base, Custo Unitário e botão Histórico de Preços por linha.
- Filtros: busca, Base, Grupo, Tipo, Ativo/Inativo. Ações: Novo, Imprimir, Importar, Exportar, Remover selecionados.
- Cadastro: Grupo (Material, Mão de Obra, Equipamento, Outros), Código \* (sequencial sugerido), Descrição \*, Unidade \*, Tipo, Base \*, Custo, Status, Observações, Arquivos. Botões Salvar e Salvar e inserir novo.
- Histórico de preços alimentado pelas ordens de compra.

**A2.2 Composições**

- Lista: favorito, Código, Descrição, Tipo, Unidade, Base, Custo Unitário; filtros Base, Tipo, Ativo/Inativo.
- Cadastro: Código \*, Descrição \*, Unidade \*, Tipo, Base \*, Descrição detalhada, Status.
- Insumos da composição: Código, Descrição, Grupo, Unidade, Coeficiente, Custo Unitário, Custo Total.
- Totais calculados: custo unitário por grupo (Mão de Obra, Material, Equipamento, Outros), BDI (%) e preço unitário.

**A2.3 Minhas Obras**

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

**A2.4 Orçamento**

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

**A2.5 Gestão da obra**

Compara orçado e realizado por obra. Lista com Obra, Cliente e Status; filtro por status.

| Aba | Conteúdo |
| --- | --- |
| Cabeçalho | Evolução física (%), Status editável, Cliente, Cronograma planejado e realizado, atalho para o Orçamento, Exportar e Imprimir tela |
| Visão Geral | Custo orçado, realizado, saldo e evolução de custos por grupo (Mão de Obra, Material, Equipamento, Outros). Gráficos de distribuição dos custos realizados e resumo de custos, com valor por m² |
| Gestão de Custos | Por etapa e item: custo orçado, custo realizado, saldo, % realizado e evolução física editável. Linha de "custos sem apropriação". Gráfico Orçado x Realizado por etapa |
| Curva S | Avanço acumulado planejado x realizado, físico e financeiro |
| Cronograma | Gantt e tabela, alimentados pelo cronograma do orçamento |
| RDO | Diários da obra (item A2.6) |
| Arquivos | Anexos da obra |
| Relatórios | Insumos Orçados x Realizados, Curva ABC, Custos por Área de Obra, Custos Realizados por Categorias, Resultado Financeiro, Pagamentos, Resumo de Pagamentos por Etapa, Desempenho de Custos |
| Relatório Gerencial | Relatórios periódicos com Número, Período, Título e Status, sujeitos à alçada de aprovação |
| Anotações | Texto livre sobre a obra |

O custo realizado vem dos lançamentos financeiros apropriados à obra, etapa e item. A classificação por grupo vem da categoria do lançamento (seção A4.9). Categorias marcadas como "Oculta na Gestão" não entram.

**A2.6 RDO (Relatório Diário de Obras)**

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

**A2.7 Critérios de aceite de Obras**

- Criar obra, montar orçamento com etapa, subetapa, composição e insumo, e ver custo, BDI e preço corretos.
- Gerar cronograma, cronograma físico-financeiro e Curva S a partir do orçamento.
- Lançar despesa apropriada a um item e ver o realizado na Gestão de Custos.
- Criar, enviar e aprovar um RDO e ver a evolução física atualizada.

## Anexo 3. Compras, igual ao Mais Controle

O fluxo tem três etapas encadeadas, nesta ordem: **1. Solicitação, 2. Cotação, 3. Ordem de Compra**. Cada etapa guarda o vínculo com a anterior. Regra do cliente: toda solicitação tem centro de custo obrigatório (uma Obra ou a Empresa), e cotação e ordem herdam esse centro de custo.

**A3.1 Solicitação**

- Lista com abas por status e contador: Todas, Rascunho, Em aprovação, A atender, Em andamento, Concluída, Recusada.
- Colunas: Nº, Status, Descrição, Solicitante e data, Necessidade, Centro de Custo, Cotados, Comprados, Recebidos (cada um como "x de y") e Vínculos (números das cotações e ordens).
- Filtros: período, busca por número ou descrição, centro de custo, colunas visíveis, impressão.
- Nova Solicitação: Centro de custo \*, Descrição, Necessidade (receber até), Marcar como urgente (destaca na lista). Itens escolhidos do orçamento da obra (etapa e item) ou do catálogo de insumos, com quantidade.
- Detalhe: linha do tempo em 4 passos (criada, aprovada, atendida, itens recebidos) com autor e data; botão Marcar recebimento; itens agrupados por etapa do orçamento, com Status (ex.: Em cotação), Item, Unidade, Quantidade solicitada, Recebimento (x de y) e Previsão de entrega; atalho Ver Cotações; Arquivos; Comentários.
- Aprovação: a solicitação enviada vai para Em aprovação; o aprovador aprova ou recusa com motivo.
- Permissões separadas: Solicitação Própria, Solicitação de Terceiros e Atender Solicitação.

**A3.2 Cotação**

- Lista: anexo, Número, Descrição, Centro de Custo, Quantidade de itens, Fornecedores, Criação (data e autor), Necessidade. Filtros por período e status.
- Cabeçalho: Número (sequencial), Descrição, Status, Prioridade (Sim/Não), Necessidade, Solicitante, Relatórios. Resumo no topo: Itens, Fornecedores, Criação, Criado por.
- Status: Em aberto, Solicitado, Enviado ao fornecedor, Respondido parcialmente, Cotado parcialmente, Cotado, Finalizado.
- Aba Itens: agrupados por centro de custo e item do orçamento, com a solicitação de origem; Item, Descrição, Unidade, Quantidade. Botão Buscar solicitação (traz os itens de solicitações aprovadas). Observações.
- Aba Fornecedores: Fornecedor, Contato, E-mail, Telefone, Qualificação; envio do pedido de cotação por e-mail e WhatsApp; Local de entrega (endereço completo, com busca). Use os contatos marcados como "Considerar este contato em Cotações e Ordens de Compra".
- Aba Mapa de Cotação: comparativo item x fornecedor com quantidade cotada, quantidade comprada, valor do orçamento, preço de cada fornecedor e destaque da melhor compra; subtotal, desconto %, frete. Permite escolher o vencedor por item ou no total e gerar as ordens de compra.
- Aba Arquivos.
- Página pública por link, sem login, para o fornecedor preencher preços e prazo.

**A3.3 Ordem de Compra**

- Lista: Número, Fornecedor, Valor, Descrição, Centro de Custo, Criação, Aprovação, Previsão de entrega e Status da compra. Totais por situação no rodapé (Total, Aprovado, Em aberto, Negociando, Aguardando aprovação, Negado). Menu Relatórios.
- Cabeçalho: Número, Fornecedor \*, Descrição, Valor total, Criação, Criado por, Responsável pela aprovação, cotação de origem.
- Aprovação: Aprovado, Em aberto, Negociando, Aguardando aprovação, Negado.
- Status da compra: Aguardando, Comprado, Entregue Parcial, Entregue Total.
- Aba Itens: por obra (ou Empresa) e item do orçamento; Item, Descrição, Unidade, Quantidade, Valor Unitário, Valor. Botões Buscar solicitação e Saldo de Compra (orçado menos já comprado).
- Totais: + Frete, + Outras Despesas, + Impostos, - Desconto, Valor Total.
- Aba Informações: dados do fornecedor, dados para faturamento, Condição de pagamento, Prazo de entrega, Data de entrega, Local de entrega, Responsável pelo recebimento, dados do lançamento, Observações.
- Aba Resumo da Compra e aba Arquivos.
- Ações: gerar Lançamento financeiro a partir da ordem (com parcelas pela condição de pagamento e a mesma apropriação de obra, etapa e item), enviar por e-mail e WhatsApp, compartilhar, imprimir (PDF).

**A3.4 Etapas de aprovação e configurações**

- Alçada de aprovação de compras em Ajustes: aprovadores por faixa de valor e por centro de custo, para a Solicitação e para a Ordem de Compra. Ordem acima da alçada do usuário vai para Aguardando aprovação.
- Toda aprovação ou recusa grava usuário, data e motivo, e avisa o solicitante.
- Configurações: número inicial da cotação; número inicial da ordem de compra; permitir ordem de compra sem cotação. **Padrão: não permitir**, para cumprir o fluxo pedido pelo cliente. Fornecedores: CNPJ/CPF obrigatório (liga/desliga).
- Listas de apoio: Solicitantes e Condições de Pagamento.

**A3.5 Relatórios e critérios de aceite**

- Relatórios: Insumos Orçados x Comprados, Extrato de compras, Mapa de cotação em PDF.
- Aceite: criar solicitação com centro de custo, aprovar, gerar cotação com três fornecedores, escolher no mapa, gerar ordem, aprovar pela alçada, gerar o lançamento e marcar o recebimento. Os contadores "x de y" e os vínculos devem bater em todas as telas.
- Não deve ser possível salvar solicitação sem centro de custo, nem ordem sem cotação com a configuração padrão.

## Anexo 4. Financeiro, igual ao Mais Controle

O financeiro separa o título da sua baixa: **Lançamento gera Pagamentos** (parcelas a pagar) e **Faturamento gera Recebimentos** (parcelas a receber). Menu Financeiro: Pagamentos, Recebimentos, Pré-lançamentos, Notas Fiscais, Contas Bancárias, Transferências, Fluxo de Caixa, Resultados. Em Ajustes: Plano de contas, Categorias, Naturezas.

**A4.1 Pagamentos e Lançamentos**

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

**A4.2 Recebimentos e Faturamentos**

- Lista de Recebimentos por mês. Colunas: Vencimento, Status (com selo de conciliado), Valor, Cliente, Condição e Conta, Descrição e Natureza. Um recebimento pode ter mais de uma conta e forma de pagamento.
- Ações por linha: Receber, Estornar, Emitir Nota Fiscal, Editar Faturamento. Menu: Ver Faturamentos, Importar Faturamentos. Relatórios em PDF: Recebimentos, Recebimentos agrupados.
- Lista de Faturamentos: Lançamento (data), Valor Bruto, Impostos Retidos, Valor Líquido, Cliente, Descrição e Natureza.

| Grupo | Campos de Novo Faturamento |
| --- | --- |
| Principal | Valor \*, Descrição, Cliente, Natureza \*, Competência \*, Vencimento \*, Centro de Custo \*, Conta \*, Número do documento, Forma de recebimento, Vendedor |
| Opções | Parcelar Faturamento, Impostos retidos, Marcar como recebido |
| Outros | Arquivos, Observações |

**A4.3 Ligação com a carteira de lotes**

As parcelas dos contratos de lote e de regularização continuam nascendo na carteira (contrato, ficha financeira, boletos). Elas aparecem em Recebimentos como origem "Contrato", somente leitura, com link para a ficha. A baixa do boleto gera o recebimento na conta bancária. Não crie faturamento manual para a mesma parcela, para não contar a receita duas vezes.

**A4.4 Pré-lançamentos**

Despesa registrada por qualquer usuário (com foto do comprovante) que aguarda revisão do financeiro para virar lançamento. Estados: Pendente, Aprovado (vira lançamento), Recusado (volta ao remetente com motivo). Permissões separadas: os próprios e gerenciar todos.

**A4.5 Notas Fiscais**

- Notas recebidas: Emissão, Série e número, situação, Emissor e CNPJ, Valor, Lançamento (lançada ou não), Meu CNPJ. Ações: Ver lançamentos vinculados, Vincular e Desvincular lançamento, baixar PDF e XML, ações em massa.
- Nesta fase, entrada por upload de XML e PDF. Captura automática na Sefaz e emissão de NFSe ficam preparadas no modelo de dados e desligadas até a escolha do provedor.
- Meus CNPJs: CNPJ, Razão Social, Certificado Digital e validade, Emissão NFSe (liga/desliga), Captura automática (liga/desliga).

**A4.6 Contas Bancárias e Transferências**

- Lista de contas: Banco e tipo (Corrente, Poupança, Caixa/Dinheiro), Nome, Proprietário (Empresa ou Cliente), Integração bancária, Bloqueio financeiro (bloquear/desbloquear), Valor Atual (ocultável). Filtros: ativas, proprietário, banco.
- Nova Conta: Nome \*, Proprietário \*, Data inicial \*, Valor inicial \*, Tipo de conta, Banco, Conta visível para (usuários que veem extrato e saldo).
- Extrato da conta com saldo dia a dia. Conciliação por arquivo OFX e manual, com alçadas de quem concilia e de quem desconcilia. Bloqueio financeiro impede alteração de movimentos até a data do bloqueio.
- Transferências. Lista: Data, Descrição, Conta de Origem, Conta de Destino, Valor, Pago. Filtros: período, Todas, Pagas, Em Aberto, busca avançada, limpar filtros. Ação em lote: Conciliar. Botões Novo, Imprimir, Exportar para Excel.
- Nova Transferência: Data da Transferência \*, Valor \*, Marcar como Pago (Sim/Não), Conta de Origem \*, Conta de Destino \*, Descrição, Arquivos.

**A4.7 Fluxo de Caixa**

- Matriz Plano de Contas x período. Filtros: Visualização (Diário, Semanal, Mensal), Período, Tipo (Pagos e Recebidos, Previstos), Proprietário, Contas, Centro de Custo, "considerar saldo inicial de contas e transferências".
- Linhas: Saldo Inicial, Saldo Inicial de Conta, Saldo Transferência, Receitas e Despesas abertas por plano de contas, Total. Botões Visualizar Extrato e Imprimir.
- Três visões pedidas pelo cliente: **Empresa** (só o centro de custo Empresa), **Obras** (uma ou várias obras) e **Geral** (tudo somado).

**A4.8 Resultados**

- Demonstrativo mensal por plano de contas: Receita Operacional Bruta, Impostos, Receita Operacional Líquida, Despesas Variáveis, Despesas Operacionais, Resultado Financeiro, Resultado. Contas "Somente Fluxo de Caixa" não entram.
- Filtros: Período, Visualização (Regime de Caixa ou Competência), Centro de Custo. Mesmas três visões: Empresa, Obra e Geral.

**A4.9 Plano de contas e Categorias (carga inicial)**

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

**A4.10 Configurações e critérios de aceite**

- Configurações avançadas: meses para provisionamento de recorrentes; número do documento obrigatório em lançamentos; idem em pagamentos; abrir etapas e itens automaticamente ao selecionar a obra.
- Alçada de usuários: quem concilia, quem desconcilia, quem aprova Relatório Gerencial.
- Relatórios em Exportar: Recebimentos, Pagamentos, Lançamentos.
- Aceite: lançamento parcelado com rateio em duas obras gera os pagamentos certos; baixa parcial e estorno funcionam; transferência movimenta as duas contas; fluxo de caixa e resultados fecham com os extratos nas três visões (Empresa, Obra, Geral); regime de caixa e de competência dão valores coerentes.

## Anexo 5. Dashboards, portais, gestão de empreendimento e demandas

**A5.1 Dashboards**

Dois painéis, ambos com filtro de empresa, empreendimento, obra e período.

- **Números gerais** (operacional): empreendimentos, lotes por situação, clientes ativos, contratos ativos, leads do mês e por etapa, propostas em aberto, vendas do mês, a receber, vencimentos em 7 e 30 dias, inadimplência (valor e quantidade), processos de regularização por etapa, demandas abertas, obras em andamento, pagamentos e recebimentos em aberto por faixa (vencidos, hoje, 7 dias, 30 dias).
- **Gerencial** (direção): vendas por empreendimento e por corretor, conversão do funil, previsão de carteira mês a mês, KPI de inadimplência (%, valor, faixas de atraso, evolução em 12 meses), fluxo de caixa realizado e previsto, resultado por empresa e por obra, orçado x realizado e evolução física das obras, compras por situação.
- Todo número é clicável e abre a lista já filtrada. Acesso por perfil: o gerencial só para Direção e Financeiro.

**A5.2 Gestão de empreendimento (visão única)**

A tela do empreendimento reúne, em abas: Resumo, Planta (item A1.2), Lotes (gestão visual e lista), Vendas (Propostas e depois Contratos), Boletos (gerar, baixar e reemitir, individual e em lote), Previsão de carteira (recebimentos previstos por mês), Inadimplência (KPI, faixas de atraso e lista de devedores), Regularização (quando a modalidade incluir), Demandas, Obras vinculadas e Arquivos.

**A5.3 Portal do corretor**

Área separada, com login próprio, para corretores e imobiliárias. O corretor só vê os próprios dados.

- Gestão de leads: cadastrar lead com a qualificação do item A1.4, quadro por etapa, registrar contatos e agendar visita. Bloqueio de lead duplicado por telefone e CPF, com regra de quem atendeu primeiro.
- Espelho de vendas: planta e lista de lotes disponíveis por empreendimento, com preço e condições. Reserva de lote com prazo para expirar.
- Propostas: criar, acompanhar situação e baixar o PDF.
- Comissões: vendas próprias, comissão prevista, liberada e paga.
- Materiais de venda: tabela de preços, folhetos e plantas para baixar.

**A5.4 Portal do cliente**

Área separada, com login por CPF e código enviado ao celular ou e-mail. O cliente só vê os próprios contratos.

- Lotes: contratos, lote e quadra, saldo devedor, parcelas pagas e em aberto, segunda via de boleto e Pix, valor atualizado de parcela vencida, informe anual de pagamentos, contrato em PDF.
- Regularização: linha do tempo do processo (etapa atual e próximas), documentos pendentes com envio pelo portal, exigências e previsão de entrega da escritura.
- Demandas: abrir pedido (item A5.5) e acompanhar o andamento.
- Dados cadastrais: pedido de atualização, que entra como tarefa para o atendimento aprovar.

**A5.5 Gestão de demandas**

Módulo novo para pedidos operacionais ligados a lote, cliente ou empreendimento.

- Tipos configuráveis, cada um com prazo padrão, responsável padrão e checklist: Ligação de água, Ligação de energia, Marcação de lote (demarcação), Limpeza de lote, Autorização para construir, Segunda via de documento, Outros.
- Campos: Número, Tipo \*, Empresa \*, Empreendimento \*, Quadra e Lote, Cliente, Descrição, Prioridade, Responsável, Prazo, Origem (interno, portal do cliente, corretor), Custo previsto, Arquivos e fotos, Comentários.
- Quadro kanban: Aberta, Em análise, Agendada, Em execução, Concluída, Cancelada. Lista com filtros e ações em lote. Alerta de prazo vencido.
- Integrações: a demanda aparece no card do cliente e na ficha do lote; pode gerar uma Solicitação de compra com centro de custo; pode gerar cobrança ao cliente (faturamento) quando o serviço for pago.
- Relatório: demandas por tipo, tempo médio de atendimento e atrasadas por responsável.

**A5.6 Perfis de acesso**

Inclua na matriz de permissões (Visualizar, Inserir e Alterar, Remover) as rotinas novas: RDO, Aprovar RDO, Demandas, Dashboard gerencial, Importação em lote, Edição em lote, Corrigir avanço de card. Crie os perfis externos Corretor e Cliente, restritos aos portais.

**A5.7 Critérios de aceite de portais e dashboards**

- Um corretor não consegue ver lead, proposta ou comissão de outro corretor. Um cliente não consegue ver contrato de outro cliente. Teste as duas regras no banco (RLS), e não só na tela.
- Os números dos dashboards batem com as listas de origem com os mesmos filtros.
- Demanda aberta no portal do cliente aparece no quadro interno e no card do cliente.

/** Notícias reais (fontes públicas) — resumos factuais com link à matéria original. */

export type NoticiaCategoria = "ramo" | "campinas" | "geral";

export type Noticia = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: readonly string[];
  /** ISO YYYY-MM-DD — única por notícia. */
  date: string;
  categoria: NoticiaCategoria;
  /** Caminho local /noticias/... ou URL https da matéria. */
  imagem: string;
  sourceName: string;
  sourceUrl: string;
  imageCredit?: string;
};

export const noticiaCategoriaLabel: Record<NoticiaCategoria, string> = {
  ramo: "Ramo",
  campinas: "Campinas",
  geral: "Geral",
};

/**
 * 16 matérias reais com datas distintas, imagens das próprias reportagens
 * e link para a fonte. Textos resumidos (não republicação integral).
 */
export const noticias: Noticia[] = [
  {
    id: "n01",
    slug: "campinas-aprova-quatro-nucleos-reurb-um-dia",
    title:
      "Pela 1ª vez, Campinas aprova regularização fundiária de quatro núcleos em um só dia",
    excerpt:
      "Jardim Eulina, Metonópolis, Colina do Sol e Capivari: 1.013 famílias e quase 180 mil m² aprovados no Diário Oficial, com apoio do Cidade Legal.",
    date: "2024-09-22",
    categoria: "campinas",
    imagem: "/noticias/campinas-quatro-nucleos-um-dia.jpg",
    sourceName: "Jornal Edição Extra",
    sourceUrl:
      "https://jornaledicaoextra.com/2024/09/22/pela-1a-vez-campinas-aprova-regularizacao-fundiaria-de-quatro-nucleos-residenciais-em-um-so-dia/",
    imageCredit: "Rogério Capela / Jornal Edição Extra",
    body: [
      "Em setembro de 2024, Campinas publicou no Diário Oficial a aprovação inédita, em um único dia, dos planos de Regularização Fundiária Urbana (REURB) de quatro núcleos: Jardim Eulina, Jardim Metonópolis, Residencial Colina do Sol e Jardim Capivari.",
      "Somados, são 1.013 famílias (cerca de 4.052 pessoas) em 179.506,80 m². A modalidade foi REURB-S (interesse social), sem custo para os moradores, em parceria com o Programa Cidade Legal do Governo do Estado de São Paulo.",
      "Com a aprovação, a Sehab encaminhou a documentação ao cartório para abertura das matrículas individuais. Os núcleos já contavam com infraestrutura essencial; drenagem e pavimentação pendentes em parte das áreas ficaram previstas em até 60 meses.",
      "No mesmo período, a Prefeitura também entregou 140 matrículas no Núcleo Residencial Jardim Uruguai (1.148 lotes), apontado como a maior regularização de interesse social do município.",
    ],
  },
  {
    id: "n02",
    slug: "aprovado-plano-nucleo-28-de-fevereiro-ouro-verde",
    title:
      "Aprovado o Plano de Regularização Fundiária do Núcleo Residencial 28 de Fevereiro, no Ouro Verde",
    excerpt:
      "CRF nº 16 publicada no Diário Oficial: 173 lotes e cerca de 600 pessoas no caminho das matrículas em cartório.",
    date: "2024-10-31",
    categoria: "campinas",
    imagem: "/noticias/nucleo-28-de-fevereiro-ouro-verde.webp",
    sourceName: "Notícias Campinas",
    sourceUrl:
      "https://www.noticiascampinas.com.br/aprovado-o-plano-de-regularizacao-fundiaria-do-nucleo-residencial-28-de-fevereiro-no-ouro-verde/",
    body: [
      "A Secretaria Municipal de Habitação de Campinas aprovou, em 30 de outubro de 2024, o Plano de Regularização Fundiária do Núcleo Residencial 28 de Fevereiro, no distrito do Ouro Verde. A Certidão de Regularização Fundiária nº 16 saiu no Diário Oficial do dia seguinte.",
      "O núcleo tem 173 lotes em 55.205,03 m² e cerca de 600 moradores beneficiados. A documentação segue para o cartório de registro de imóveis para abertura das matrículas.",
      "A regularização ocorreu na modalidade REURB-S, com inserção em Zeis-R. Água, esgoto, energia, coleta de lixo e iluminação já existem; a Rua Antônio Rocha Batista já tem drenagem e asfalto, e as demais vias entram no cronograma após o registro.",
      "Segundo a Sehab, nos quatro anos anteriores à aprovação haviam sido regularizados 52 núcleos, beneficiando cerca de 39 mil pessoas.",
    ],
  },
  {
    id: "n03",
    slug: "campinas-projeto-piloto-cdhu-areas-risco",
    title:
      "Com 18 áreas de risco, Campinas entra em projeto-piloto de recompra de imóveis da CDHU",
    excerpt:
      "Moradias recompradas pela CDHU devem abrigar famílias que hoje vivem em pontos de deslizamento, afundamento ou inundação.",
    date: "2024-10-30",
    categoria: "campinas",
    imagem: "/noticias/campinas-cdhu-areas-risco.jpg",
    sourceName: "G1 Campinas",
    sourceUrl:
      "https://g1.globo.com/sp/campinas-regiao/noticia/2024/10/31/com-18-areas-de-risco-para-deslizamentos-campinas-entra-em-projeto-piloto-de-recompra-de-imoveis-da-cdhu.ghtml",
    imageCredit: "Reprodução/EPTV / G1",
    body: [
      "Em outubro de 2024, o g1 noticiou que Campinas passou a integrar um projeto-piloto estadual em que a CDHU recompra imóveis de mutuários que não desejam mais a unidade e destina essas casas a famílias em áreas de risco.",
      "A Prefeitura monitora 18 pontos de deslizamento, afundamento de solo ou inundação. No primeiro momento, o piloto prevê 100 moradias; na metrópole, cerca de 1,7 mil pessoas teriam interesse em transferir a titularidade, segundo o governo estadual.",
      "Capivari (região de Piracicaba) também entra no piloto. A medida dialoga com a agenda de regularização e remoção segura onde não é possível urbanizar o risco.",
      "Áreas listadas incluem Parque Oziel, Jardim Santa Mônica, Sousas e outros bairros históricos da cidade.",
    ],
  },
  {
    id: "n04",
    slug: "casa-paulista-751-matriculas-campinas",
    title:
      "Casa Paulista entrega regularização fundiária de 751 moradias em Campinas",
    excerpt:
      "Títulos em Capivari, Colina do Sol e Metonópolis, com R$ 2,9 milhões do Programa Cidade Legal.",
    date: "2025-03-20",
    categoria: "campinas",
    imagem: "/noticias/campinas-quatro-nucleos-um-dia.jpg",
    sourceName: "Habitação SP / Casa Paulista",
    sourceUrl:
      "https://www.habitacao.sp.gov.br/habitacao/noticias/casa-paulista-entrega-a-regularizacao-fundiaria-de-751-moradias-em-campinas",
    imageCredit: "Imagem da cobertura da aprovação dos núcleos (Jornal Edição Extra)",
    body: [
      "Em 20 de março de 2025, o Programa Casa Paulista entregou 751 títulos de propriedade em Campinas para os núcleos Jardim Capivari (324), Colina do Sol (332) e Residencial Jardim Metonópolis (95).",
      "O investimento informado foi de R$ 2,9 milhões via Programa Cidade Legal. As famílias passam a ser legalmente proprietárias, com acesso a crédito formal, venda e transmissão a herdeiros.",
      "Além do aporte financeiro, a SDUH prestou apoio técnico à Prefeitura em diagnóstico, topografia, projeto urbanístico, estudo ambiental e protocolo em cartório.",
      "Moradores ouvidos na cerimônia relataram esperas de décadas até segurar a matrícula — marco que encerra a irregularidade registrária desses três núcleos.",
    ],
  },
  {
    id: "n05",
    slug: "casa-paulista-2711-familias-regiao-campinas",
    title:
      "Casa Paulista regulariza 2,7 mil moradias na região de Campinas",
    excerpt:
      "Em 21/03/2025, 2.711 famílias de dez municípios receberam matrículas, com R$ 10,5 milhões do Cidade Legal.",
    date: "2025-03-22",
    categoria: "ramo",
    imagem: "/noticias/jardim-eulina-escrituras.jpg",
    sourceName: "Programa Habitacional",
    sourceUrl:
      "https://www.programahabitacional.com.br/regularizacao-fundiaria-de-27-mil-moradias-na-regiao-de-campinas-pela-casa-paulista/",
    imageCredit: "Cohab Campinas — núcleo Jardim Eulina (lote de Campinas na entrega)",
    body: [
      "No dia 21 de março de 2025, o Casa Paulista entregou matrículas a 2.711 famílias da região de Campinas, com investimento de R$ 10,5 milhões do Cidade Legal.",
      "Os municípios contemplados incluem Bragança Paulista, Campinas (262 unidades no Jardim Eulina), Cordeirópolis, Estiva Gerbi, Hortolândia (1.362 no Jardim Boa Esperança), Jarinu, Louveira, Nazaré Paulista, Piracaia e Tuiuti.",
      "Somadas às 751 matrículas entregues no dia anterior em Campinas, a semana chegou a cerca de 3,4 mil regularizações na região, com R$ 13,5 milhões investidos.",
      "O governador Tarcísio de Freitas e o secretário Marcelo Branco destacaram a meta de acelerar títulos definitivos sem custo ao morador de baixa renda.",
    ],
  },
  {
    id: "n06",
    slug: "santos-dumont-e-parque-universitario-128-titulos",
    title:
      "Prefeitura e Cohab entregam 128 títulos no Santos Dumont e Parque Universitário IV",
    excerpt:
      "Após mais de 38 anos de espera, 116 famílias do Santos Dumont e 12 do Parque Universitário IV de Viracopos receberam matrículas.",
    date: "2025-08-13",
    categoria: "campinas",
    imagem: "/noticias/santos-dumont-parque-universitario.jpg",
    sourceName: "Cohab Campinas",
    sourceUrl:
      "https://www.cohabcp.com.br/prefeitura-de-campinas-e-a-cohab-entregam-128-titulos-de-propriedade-do-nucleo-residencial-santos-dumont-e-nucleo-residencial-parque-universitario-iv-de-viracopos/",
    imageCredit: "Toninho Oliveira / Cohab Campinas",
    body: [
      "Na noite de 11 de agosto de 2025, Prefeitura e Cohab entregaram 128 matrículas: 116 no Núcleo Residencial Santos Dumont e 12 no Parque Universitário IV de Viracopos.",
      "A espera ultrapassava 38 anos. Com o registro em cartório, as famílias passam a ter propriedade formal e caminho aberto a melhorias e crédito.",
      "À época, Sehab e Cohab já contabilizavam 130 núcleos regularizados e mais de 21 mil imóveis — apontado como o maior programa de regularização em curso no Brasil.",
      "O Santos Dumont surgiu nos anos 1990; o Parque Universitário IV, nos anos 1980, com famílias remanejadas por utilidade pública do Terminal Ouro Verde.",
    ],
  },
  {
    id: "n07",
    slug: "jardim-eulina-231-matriculas-apos-45-anos",
    title:
      "Depois de 45 anos, famílias do Jardim Eulina recebem escrituras",
    excerpt:
      "Sehab entrega 231 matrículas no Núcleo Residencial Jardim Eulina; Campinas já superava 21,5 mil imóveis regularizados.",
    date: "2025-09-24",
    categoria: "campinas",
    imagem: "/noticias/jardim-eulina-escrituras.jpg",
    sourceName: "Cohab Campinas",
    sourceUrl:
      "https://www.cohabcp.com.br/depois-de-45-anos-de-espera-familias-do-jardim-eulina-recebem-escrituras-de-seus-imoveis/",
    imageCredit: "Toninho Oliveira / Cohab Campinas",
    body: [
      "Em 23 de setembro de 2025, a Sehab entregou 231 matrículas a famílias do Núcleo Residencial Jardim Eulina, na OSC Boa Amizade, encerrando mais de quatro décadas de espera.",
      "O prefeito Dário Saadi celebrou a marca de mais de 21 mil famílias beneficiadas com escrituras na gestão e a redução da fila da Cohab de cerca de 42 mil para menos de 13 mil pedidos.",
      "A ocupação remonta aos anos 1980. Com a regularização, o bairro recebeu água, esgoto, coleta de lixo, energia, iluminação e pavimentação.",
      "No balanço divulgado na ocasião, Sehab e Cohab já haviam regularizado 137 núcleos urbanos e mais de 21,5 mil imóveis em Campinas.",
    ],
  },
  {
    id: "n08",
    slug: "sao-paulo-cinco-familias-por-hora-escritura",
    title:
      "São Paulo beneficia mais de cinco famílias por hora com a escritura definitiva",
    excerpt:
      "Desde 2023, o Casa Paulista entregou 141,3 mil escrituras, com R$ 551,2 milhões investidos via Cidade Legal e CDHU.",
    date: "2026-01-05",
    categoria: "geral",
    imagem: "/noticias/sp-cinco-familias-por-hora.jpg",
    sourceName: "Agência SP",
    sourceUrl:
      "https://www.agenciasp.sp.gov.br/sao-paulo-beneficia-mais-de-cinco-familias-por-hora-com-a-escritura-definitiva-da-casa-propria/",
    imageCredit: "Agência SP / Governo do Estado de São Paulo",
    body: [
      "Em janeiro de 2026, a Agência SP divulgou que, desde janeiro de 2023, o Governo do Estado entregou 141,3 mil escrituras definitivas pelo Casa Paulista — média superior a cinco famílias por hora.",
      "O investimento acumulado chega a R$ 551,2 milhões. As frentes são o Cidade Legal (SDUH), de apoio aos municípios, e a regularização de passivo da CDHU.",
      "O Cidade Legal atua sem custo a prefeituras e moradores, com apoio técnico até o registro em cartório. Novos empreendimentos da CDHU já saem averbados.",
      "Famílias entrevistadas em Itapetinga relataram alívio ao receber o documento após anos pagando IPTU e contas sem a segurança da matrícula.",
    ],
  },
  {
    id: "n09",
    slug: "amparo-plano-regularizacao-planalto-da-serra",
    title:
      "Amparo apresenta plano preliminar para regularizar o Planalto da Serra",
    excerpt:
      "Prefeitura e SAAE reúnem-se com moradores: levantamento aponta cerca de 400 lotes; estudo técnico em até 90 dias.",
    date: "2026-03-04",
    categoria: "campinas",
    imagem: "/noticias/amparo-planalto-da-serra.jpg",
    sourceName: "Prefeitura de Amparo",
    sourceUrl:
      "https://www.amparo.sp.gov.br/noticias/prefeitura-apresenta-plano-de-trabalho-preliminar-para-regularizacao-do-planalto-da-serra/",
    imageCredit: "Prefeitura Municipal de Amparo",
    body: [
      "Em março de 2026, a Prefeitura de Amparo e o SAAE apresentaram a representantes do loteamento Planalto da Serra um plano de trabalho preliminar de regularização fundiária.",
      "O objetivo é segurança jurídica da posse, inclusão territorial e acesso progressivo à infraestrutura, alinhado a diretrizes do Ministério das Cidades.",
      "Levantamento de novembro de 2025 estimou cerca de 400 lotes. A Secretaria de Planejamento Urbano analisa desconformidades jurídicas, urbanísticas, ambientais e sociais em prazo de até 90 dias.",
      "O SAAE também prepara orientações e cadastro de novos usuários para abastecimento na região.",
    ],
  },
  {
    id: "n10",
    slug: "guia-reurb-2026-etapas-ate-o-cartorio",
    title: "REURB em 2026: do diagnóstico à matrícula individual",
    excerpt:
      "Guia técnico resume fases da Lei 13.465/2017 — da CRF ao registro no cartório — e a diferença entre REURB-S e REURB-E.",
    date: "2026-04-12",
    categoria: "ramo",
    imagem: "/noticias/reurb-guia-2026.webp",
    sourceName: "ZS Advogados",
    sourceUrl: "https://zsassociados.com/pt/blog/regularizacao-fundiaria-urbana/",
    body: [
      "A Regularização Fundiária Urbana, disciplinada pela Lei Federal 13.465/2017, organiza o caminho jurídico e urbanístico dos núcleos informais até a matrícula.",
      "Etapas típicas incluem diagnóstico, projetos, aprovação municipal com emissão da Certidão de Regularização Fundiária (CRF) e registro no Cartório de Registro de Imóveis, com abertura de matrículas individuais.",
      "REURB-S (interesse social) e REURB-E (interesse específico) diferem no público e em isenções, mas ambas visam integrar o núcleo à cidade formal.",
      "Para municípios e associações, o método reduz passivo urbano; para famílias, desbloqueia crédito, herança e valorização do imóvel.",
    ],
  },
  {
    id: "n11",
    slug: "hortolandia-titulos-jardim-primavera-cidade-legal",
    title:
      "Hortolândia: títulos do Jardim Primavera no Programa Cidade Legal",
    excerpt:
      "Cerimônia em Campinas com o governador entrega 223 títulos de legitimação fundiária a famílias do Jd. Primavera.",
    date: "2026-04-10",
    categoria: "campinas",
    imagem:
      "https://www.hortolandia.sp.gov.br/wp-content/uploads/2026/04/regularizacao.jpg",
    sourceName: "Prefeitura de Hortolândia",
    sourceUrl:
      "https://www.hortolandia.sp.gov.br/2026/04/10/entrega-de-titulos-de-legitimacao-fundiaria-para-familias-do-jd-primavera-fortalece-politica-de-habitacao-em-hortolandia/",
    imageCredit: "Prefeitura de Hortolândia",
    body: [
      "Em 10 de abril de 2026, a Prefeitura de Hortolândia destacou a entrega de 223 títulos de legitimação fundiária a famílias do Jardim Primavera, em solenidade do Programa Cidade Legal realizada em Campinas, com presença do governador Tarcísio de Freitas.",
      "O programa estadual apoia municípios com suporte técnico, segurança jurídica e infraestrutura básica em núcleos informais.",
      "Desde 2021, Hortolândia já havia entregue mais de cinco mil títulos, com meta de oito mil até 2028, segundo a divulgação municipal.",
      "A regularização abre caminho a crédito e melhorias habitacionais para famílias que aguardavam o reconhecimento formal da posse.",
    ],
  },
  {
    id: "n12",
    slug: "valinhos-maior-entrega-105-titulos-reurb",
    title:
      "Valinhos faz sua maior entrega de regularização: 105 títulos no Samaritano e Recanto das Águas",
    excerpt:
      "Após mais de 20 anos de espera, famílias recebem escrituras em cerimônia no Jardim São Marcos; município já regularizou 232 lotes.",
    date: "2026-05-23",
    categoria: "campinas",
    imagem: "/noticias/valinhos-105-titulos.jpg",
    sourceName: "Correio da Manhã / Prefeitura de Valinhos",
    sourceUrl:
      "https://www.correiodamanha.com.br/nacional/sao-paulo/campinas/regiao-de-campinas/2026/05/288294-valinhos-regulariza-105-lotes-depois-de-anos-de-espera.html",
    imageCredit: "Mayra Merlin / Prefeitura de Valinhos",
    body: [
      "No sábado 23 de maio de 2026, Valinhos entregou 105 títulos de REURB-S a famílias do Jardim Samaritano (Etapa 1, quadras A, B e D) e do Recanto das Águas, na região do Jardim São Luiz.",
      "A Prefeitura classificou a ação como a maior entrega de regularização fundiária da história do município. Em 1 ano e 5 meses, já eram 232 lotes regularizados entre REURB-S e REURB-E.",
      "Moradores relataram esperas de 15 a 27 anos com “contrato de gaveta” até segurar a escritura registrada em cartório.",
      "Novas frentes previstas incluem Vila Vitória e a segunda etapa da Fazenda Hotel São Bento.",
    ],
  },
  {
    id: "n13",
    slug: "hortolandia-mais-de-sete-mil-titulos",
    title:
      "Regularização fundiária segue como prioridade em Hortolândia: mais de 7 mil títulos",
    excerpt:
      "Meta de cerca de 10 mil entregas até 2028; cidade inaugurou cartório de registro de imóveis próprio.",
    date: "2026-07-30",
    categoria: "campinas",
    imagem:
      "https://www.hortolandia.sp.gov.br/wp-content/uploads/2026/07/REGULARIZACAO-683x1024.jpg",
    sourceName: "Prefeitura de Hortolândia",
    sourceUrl:
      "https://www.hortolandia.sp.gov.br/2026/07/30/regularizacao-fundiaria-em-hortolandia-segue-como-prioridade-da-prefeitura-para-a-populacao/",
    imageCredit: "Prefeitura de Hortolândia",
    body: [
      "Em 30 de julho de 2026, a Prefeitura de Hortolândia reforçou que a regularização fundiária continua como pilar da gestão: cerca de sete mil títulos já entregues e meta próxima de dez mil até 2028.",
      "Entregas recentes incluem aproximadamente 640 títulos no Jardim Boa Esperança e 214 no Jardim Primavera.",
      "A cidade também inaugurou seu primeiro Cartório de Registro de Imóveis (Av. Santana, 2358), reduzindo a necessidade de deslocamento a Sumaré para atos registrais.",
      "A Secretaria de Habitação mantém canais de atendimento por WhatsApp e telefone para dúvidas da população.",
    ],
  },
  {
    id: "n14",
    slug: "sao-paulo-100-mil-familias-escritura-na-mao",
    title:
      "Mais de 100 mil famílias conquistam o registro da casa própria em São Paulo",
    excerpt:
      "Programa Escritura na Mão da capital paulista: 105.457 títulos desde 2021; nova leva de 3.353 famílias em Capela do Socorro.",
    date: "2026-10-23",
    categoria: "geral",
    imagem: "/noticias/sp-100-mil-escrituras.jpg",
    sourceName: "O Globo / Prefeitura de São Paulo",
    sourceUrl:
      "https://oglobo.globo.com/conteudo-de-marca/acontece-em-sp/metropole/noticia/2026/10/23/mais-de-100-mil-familias-conquistam-o-registro-da-casa-propria-gratuitamente-em-sao-paulo.ghtml",
    imageCredit: "Divulgação / Prefeitura de São Paulo",
    body: [
      "Em 23 de outubro de 2026, a Prefeitura de São Paulo divulgou que o Programa Escritura na Mão já havia entregue 105.457 títulos gratuitos desde 2021.",
      "Mais da metade desse total (53.278) concentrou-se em 2025–2026. Em 16 de outubro, outras 3.353 famílias de 11 núcleos de Capela do Socorro receberam a documentação.",
      "Só nessa região, mais de 14 mil imóveis já haviam sido regularizados. A prefeitura identifica os núcleos e procura os moradores — não é necessário se inscrever espontaneamente.",
      "Com matrícula, o imóvel pode ser vendido, alugado formalmente e transmitido por inventário. A cidade também contratou serviços para ampliar o alcance a centenas de milhares de famílias.",
    ],
  },
  {
    id: "n15",
    slug: "cidade-legal-apoio-tecnico-municipios-paulistas",
    title:
      "Cidade Legal: como o Estado apoia municípios na REURB",
    excerpt:
      "Programa estadual oferece equipe multidisciplinar e serviços sem custo a prefeituras para regularizar núcleos urbanos.",
    date: "2025-02-06",
    categoria: "ramo",
    imagem: "/noticias/reurb-guia-2026.webp",
    sourceName: "SDUH / Habitação SP",
    sourceUrl:
      "https://www.habitacao.sp.gov.br/habitacao/institucional/a-secretaria/cidade_legal",
    imageCredit: "Ilustração temática REURB",
    body: [
      "Criado em 2007, o Programa Cidade Legal auxilia municípios paulistas a regularizar núcleos habitacionais implantados em desconformidade com a lei.",
      "O Estado disponibiliza equipe multidisciplinar para capacitação, análise e aprovação de projetos, além de contratos com consórcios especializados — sem contrapartida financeira ao município conveniado.",
      "Em 2025, a modalidade Regularização Fundiária – Cidade Legal também integrou o regulamento do Programa Bairro Paulista (Resolução SDUH nº 09/2025), com prioridade a REURB-S já conveniados e áreas com infraestrutura e sem risco.",
      "Desde a criação, o programa já atendeu centenas de municípios e centenas de milhares de famílias com segurança jurídica da posse.",
    ],
  },
  {
    id: "n16",
    slug: "valinhos-reurb-s-e-reurb-e-232-lotes",
    title:
      "Valinhos avança em REURB-S e REURB-E: 232 lotes em 17 meses",
    excerpt:
      "Além da entrega de 105 títulos, o município concluiu Country Club, São Bento do Recreio e CRF do Sítio Ponte Alta.",
    date: "2026-05-22",
    categoria: "ramo",
    imagem: "/noticias/valinhos-entrega-prefeito.jpg",
    sourceName: "Prefeitura de Valinhos",
    sourceUrl:
      "https://www.valinhos.sp.gov.br/portal/noticias/0/3/59401/prefeitura-de-valinhos-entrega-105-titulos-de-regularizacao-fundiaria-e-amplia-acesso-a-moradia-digna/",
    imageCredit: "Folha de Valinhos / Prefeitura de Valinhos",
    body: [
      "Antes da cerimônia de 23 de maio de 2026, a Prefeitura de Valinhos detalhou o avanço: em 1 ano e 5 meses, 232 lotes regularizados por REURB-S e REURB-E.",
      "Em 2025, o Country Club La Campagne (9 lotes) e a primeira etapa do São Bento do Recreio (82 lotes) foram concluídos. No Sítio Ponte Alta – Subdivisão Perseghetti (REURB-E), a CRF de 29 lotes seguiu à fase cartorial.",
      "Em 2026, Recanto das Águas (74 lotes) e a primeira etapa do Jardim Samaritano (31 lotes) somaram os 105 títulos da maior entrega municipal.",
      "A base legal citada é a Lei Federal 13.465/2017, com condução do Comitê Municipal de Regularização da Secretaria de Desenvolvimento Social e Habitação.",
    ],
  },
];

export function getNoticiaBySlug(slug: string) {
  return noticias.find((n) => n.slug === slug);
}

export function noticiasOrdenadas(categoria?: NoticiaCategoria | "todas") {
  const list =
    !categoria || categoria === "todas"
      ? [...noticias]
      : noticias.filter((n) => n.categoria === categoria);
  return list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function formatNoticiaDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(dt);
}

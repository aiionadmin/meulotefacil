/** Notícias editoriais do site institucional. */

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
  imagem: string;
};

export const noticiaCategoriaLabel: Record<NoticiaCategoria, string> = {
  ramo: "Ramo",
  campinas: "Campinas",
  geral: "Geral",
};

const img = (n: number) => `/placeholders/empreendimento-${((n % 3) + 1)}.svg`;

/**
 * Mínimo 15 conteúdos: ramo (REURB/fundiário), Campinas/região e geral.
 * Datas distintas em ordem cronológica crescente no arquivo; listagem ordena desc.
 */
export const noticias: Noticia[] = [
  {
    id: "n01",
    slug: "o-que-e-reurb-e-por-que-importa",
    title: "O que é REURB e por que importa para quem vive no lote",
    excerpt:
      "Entenda a Regularização Fundiária Urbana e como ela transforma ocupação irregular em patrimônio com escritura.",
    date: "2024-09-12",
    categoria: "ramo",
    imagem: img(1),
    body: [
      "A Regularização Fundiária Urbana (REURB) é o instrumento previsto na legislação brasileira para integrar núcleos urbanos informais à ordem jurídica e urbanística das cidades.",
      "Na prática, o processo conduz do diagnóstico da área até o registro em cartório, com abertura de matrícula individual — o documento que comprova a propriedade perante o mercado e o poder público.",
      "Para famílias e associações, isso significa segurança jurídica, acesso a crédito e valorização do imóvel. Para o município, significa cidade mais organizada e previsível.",
    ],
  },
  {
    id: "n02",
    slug: "reurb-s-e-reurb-e-diferencas",
    title: "REURB-S e REURB-E: qual a diferença na prática",
    excerpt:
      "Interesse social e interesse específico seguem caminhos técnicos distintos — e ambos chegam à matrícula.",
    date: "2024-10-03",
    categoria: "ramo",
    imagem: img(2),
    body: [
      "A legislação diferencia REURB de interesse social (REURB-S) e de interesse específico (REURB-E). A primeira atende núcleos ocupados predominantemente por população de baixa renda, com isenções e procedimentos próprios.",
      "A REURB-E cobre demais situações — incluindo loteamentos e condomínios de médio e alto padrão — sem abrir mão do rigor técnico de planta, projetos e aprovação municipal.",
      "Em ambos os casos, o destino é o mesmo: CRF (quando aplicável), aprovação e registro no Cartório de Registro de Imóveis.",
    ],
  },
  {
    id: "n03",
    slug: "campinas-avanca-em-nucleos-urbanos",
    title: "Campinas avança na regularização de núcleos urbanos",
    excerpt:
      "A região metropolitana concentra dezenas de núcleos em diferentes fases — do diagnóstico ao registro.",
    date: "2024-10-28",
    categoria: "campinas",
    imagem: img(3),
    body: [
      "Campinas e cidades vizinhas concentram uma das maiores agendas de regularização fundiária do interior paulista. Núcleos como Vila Paula, Jardim Uruguai e Vila Diva ilustram etapas distintas do mesmo caminho.",
      "O acompanhamento técnico — planta de perímetro, projetos, CRF e cartório — reduz incerteza para moradores e para a própria gestão municipal.",
      "A Meu Lote Fácil atua nessa frente desde 2005, com sede em Campinas e unidades espalhadas pela região.",
    ],
  },
  {
    id: "n04",
    slug: "matricula-individual-o-documento-que-fecha-o-ciclo",
    title: "Matrícula individual: o documento que fecha o ciclo",
    excerpt:
      "Sem matrícula, o lote permanece à margem do sistema registral. Com ela, o patrimônio ganha existência formal.",
    date: "2024-11-15",
    categoria: "ramo",
    imagem: img(1),
    body: [
      "A matrícula individual no Cartório de Registro de Imóveis é o marco final da regularização: cada lote ou unidade passa a ter identificação própria no sistema registral.",
      "Isso viabiliza transferência, financiamento e proteção contra disputas. Também facilita a cobrança justa de tributos e a prestação de serviços urbanos.",
      "Por isso o método da Meu Lote Fácil acompanha o processo até o cartório — e não apenas até a aprovação na prefeitura.",
    ],
  },
  {
    id: "n05",
    slug: "hortolandia-e-os-primeiros-nucleos-da-regiao",
    title: "Hortolândia e os primeiros núcleos da região",
    excerpt:
      "A expansão da atuação para Hortolândia marcou a consolidação da empresa além de Campinas.",
    date: "2024-12-05",
    categoria: "campinas",
    imagem: img(2),
    body: [
      "Hortolândia figura desde cedo na trajetória da Meu Lote Fácil. Os primeiros núcleos na cidade abriram espaço para uma atuação regional contínua.",
      "Cada município traz regras, fluxos e desafios próprios; a consultoria técnica adapta o método sem perder o padrão de qualidade.",
      "Hoje, Hortolândia segue no portfólio ao lado de Campinas, Valinhos e Amparo.",
    ],
  },
  {
    id: "n06",
    slug: "seguranca-juridica-e-valorizacao-do-imovel",
    title: "Segurança jurídica e valorização do imóvel",
    excerpt:
      "Escritura e matrícula não são só papel: elas mudam o valor de mercado e a tranquilidade das famílias.",
    date: "2025-01-14",
    categoria: "geral",
    imagem: img(3),
    body: [
      "Imóveis irregularizados costumam circular em um mercado paralelo, com deságio e risco. A regularização reposiciona o bem no mercado formal.",
      "Estudos e a prática de campo mostram valorização significativa após o registro — além do acesso a programas habitacionais e crédito bancário.",
      "Para o bairro, o efeito é coletivo: ruas, infraestrutura e arrecadação tendem a acompanhar a formalização.",
    ],
  },
  {
    id: "n07",
    slug: "planta-de-perimetro-e-diario-oficial",
    title: "Planta de perímetro e publicação no Diário Oficial",
    excerpt:
      "Delimitar a área com planta aprovada é etapa crítica antes dos projetos e da CRF.",
    date: "2025-02-06",
    categoria: "ramo",
    imagem: img(1),
    body: [
      "A planta de perímetro define os limites oficiais do núcleo. Depois de aprovada, a publicação no Diário Oficial dá publicidade ao ato e amarra o processo à legislação local.",
      "Erros nessa etapa geram retrabalho caro nas fases seguintes. Por isso o diagnóstico prévio e o levantamento topográfico precisam ser rigorosos.",
      "É uma das cinco etapas do método que a Meu Lote Fácil conduz em cada núcleo.",
    ],
  },
  {
    id: "n08",
    slug: "jardim-uruguai-marco-de-escala-em-campinas",
    title: "Jardim Uruguai: marco de escala em Campinas",
    excerpt:
      "Com mais de mil lotes, o núcleo exemplifica a complexidade de um REURB de grande porte.",
    date: "2025-03-03",
    categoria: "campinas",
    imagem: img(2),
    body: [
      "O Jardim Uruguai, em Campinas, consolidou-se como referência de escala: centenas de famílias em um único processo de regularização.",
      "Projetos, aprovações e registro em volume exigem coordenação entre equipe técnica, prefeitura, cartório e associação de moradores.",
      "Casos assim mostram que a regularização fundiária é infraestrutura social — não só procedimento cartorial.",
    ],
  },
  {
    id: "n09",
    slug: "como-municipios-ganham-com-consultoria-tecnica",
    title: "Como municípios ganham com consultoria técnica em REURB",
    excerpt:
      "Fluxos claros de análise e aprovação aceleram processos e reduzem passivos urbanos.",
    date: "2025-03-27",
    categoria: "ramo",
    imagem: img(3),
    body: [
      "Prefeituras enfrentam filas longas e critérios heterogêneos na análise de regularização. A consultoria técnica ajuda a padronizar métodos e prazos.",
      "Com fluxos definidos, o município ganha celeridade, segurança jurídica e previsibilidade para investidores e comunidades.",
      "A Meu Lote Fácil presta essa consultoria em paralelo à execução de planos e projetos para o setor privado e associações.",
    ],
  },
  {
    id: "n10",
    slug: "valinhos-e-a-agenda-metropolitana",
    title: "Valinhos e a agenda metropolitana de regularização",
    excerpt:
      "A cidade integra o mapa de atuação regional junto a Campinas e Hortolândia.",
    date: "2025-04-18",
    categoria: "campinas",
    imagem: img(1),
    body: [
      "Valinhos participa da mesma dinâmica metropolitana: expansão urbana, núcleos informais e demanda crescente por escritura.",
      "A articulação entre municípios vizinhos facilita o compartilhamento de boas práticas e a continuidade dos serviços técnicos.",
      "O portfólio da Meu Lote Fácil inclui núcleos em Valinhos como parte dessa atuação regional.",
    ],
  },
  {
    id: "n11",
    slug: "associacoes-de-moradores-protagonistas-do-processo",
    title: "Associações de moradores: protagonistas do processo",
    excerpt:
      "Organização comunitária acelera cadastros, assembleias e a legitimidade do plano de regularização.",
    date: "2025-05-09",
    categoria: "geral",
    imagem: img(2),
    body: [
      "Nenhum REURB avança sem a comunidade. Associações e cooperativas concentram demandas, documentos e a representação formal perante o município.",
      "Reuniões, mutirões de cadastro e comunicação clara reduzem atrito e evitam informações incompletas que travam o processo.",
      "A equipe técnica atua como parceira: traduz a linguagem jurídica e urbanística para decisões coletivas informadas.",
    ],
  },
  {
    id: "n12",
    slug: "crf-certidao-que-abre-caminho-ao-cartorio",
    title: "CRF: a certidão que abre caminho ao cartório",
    excerpt:
      "A Certidão de Regularização Fundiária formaliza a aprovação municipal do plano.",
    date: "2025-06-02",
    categoria: "ramo",
    imagem: img(3),
    body: [
      "Após a aprovação do plano pela prefeitura, a CRF (Certidão de Regularização Fundiária) documenta o enquadramento legal do núcleo.",
      "Com a CRF em mãos, o caminho ao Cartório de Registro de Imóveis fica desimpedido para o registro e a abertura das matrículas.",
      "Nos núcleos concluídos ou em registro do portfólio, a CRF é peça central da documentação oficial disponível aos interessados.",
    ],
  },
  {
    id: "n13",
    slug: "amparo-entra-no-mapa-de-atuacao-2026",
    title: "Amparo entra no mapa de atuação em 2026",
    excerpt:
      "A expansão para Amparo reforça a presença da Meu Lote Fácil no interior próximo a Campinas.",
    date: "2025-07-21",
    categoria: "campinas",
    imagem: img(1),
    body: [
      "Amparo passa a integrar formalmente a área de atuação da empresa, amplificando o alcance regional além do núcleo Campinas–Hortolândia–Valinhos.",
      "Cada nova cidade exige leitura atenta do código urbanístico local e dos cartórios da comarca.",
      "A linha do tempo institucional marca 2026 como ano de consolidação dessa expansão.",
    ],
  },
  {
    id: "n14",
    slug: "credito-habitacional-depois-da-escritura",
    title: "Crédito habitacional depois da escritura",
    excerpt:
      "Com matrícula, famílias acessam financiamento e programas que antes estavam fora de alcance.",
    date: "2025-08-14",
    categoria: "geral",
    imagem: img(2),
    body: [
      "Bancos e programas públicos exigem imóvel regularizado. Sem matrícula, o crédito habitacional simplesmente não entra na conversa.",
      "A regularização desbloqueia reformas, ampliações e a compra formal entre particulares com segurança para ambas as partes.",
      "É um dos benefícios mais citados por moradores após o registro em cartório.",
    ],
  },
  {
    id: "n15",
    slug: "projetos-ambientais-e-urbanisticos-no-reurb",
    title: "Projetos ambientais e urbanísticos no REURB",
    excerpt:
      "Além do jurídico, a regularização exige estudos técnicos que dialogam com o território.",
    date: "2025-09-08",
    categoria: "ramo",
    imagem: img(3),
    body: [
      "Projetos de drenagem, sistema viário, áreas verdes e estudos ambientais costumam integrar o pacote exigido pelas prefeituras.",
      "Ignorar essa camada técnica atrasa aprovações e pode gerar condicionantes caras no meio do caminho.",
      "A Meu Lote Fácil articula equipe multidisciplinar para entregar planos e projetos sob medida a cada núcleo.",
    ],
  },
  {
    id: "n16",
    slug: "vila-paula-novo-nucleo-em-campinas",
    title: "Vila Paula: novo núcleo em destaque em Campinas",
    excerpt:
      "O núcleo avança na agenda local de regularização com acompanhamento técnico contínuo.",
    date: "2025-10-16",
    categoria: "campinas",
    imagem: img(1),
    body: [
      "Vila Paula integra o portfólio recente em Campinas, reforçando a presença da empresa em núcleos de diferentes portes e fases.",
      "Moradores acompanham status, documentos e próximos passos com transparência — da planta à matrícula.",
      "Casos como este alimentam o mapa vivo de regularizações da região.",
    ],
  },
  {
    id: "n17",
    slug: "por-que-regularizar-agora-e-nao-depois",
    title: "Por que regularizar agora — e não depois",
    excerpt:
      "Adiar o processo aumenta custo, risco e a distância do mercado formal.",
    date: "2025-11-11",
    categoria: "geral",
    imagem: img(2),
    body: [
      "Quanto mais tempo o núcleo permanece irregular, mais complexas ficam as sobreposições de posse, as pendências documentais e as exigências municipais.",
      "Começar cedo — mesmo em fase de diagnóstico — organiza a comunidade e evita surpresas na aprovação.",
      "Falar com a equipe técnica é o primeiro passo para um plano realista de prazos e custos.",
    ],
  },
  {
    id: "n18",
    slug: "transparencia-e-acompanhamento-ate-o-registro",
    title: "Transparência e acompanhamento até o registro",
    excerpt:
      "O diferencial não é só aprovar o plano: é conduzir cada etapa até a matrícula individual.",
    date: "2026-01-20",
    categoria: "ramo",
    imagem: img(3),
    body: [
      "Muitos processos param na aprovação municipal. A Meu Lote Fácil trata o registro em cartório como parte inseparável do serviço.",
      "Comunicação clara com associações, prefeitura e cartório reduz atrito e mantém o cronograma visível para quem mora no núcleo.",
      "Essa postura — do diagnóstico ao registro — resume a atuação da empresa desde 2005 em Campinas e região.",
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

/** Dados institucionais, fonte: conteudo-novo-site.md */

export const INSTITUTIONAL = {
  name: "Meu Lote Fácil",
  fullName: "Meu Lote Fácil, Regularização Fundiária",
  slogan: "Transformando vidas, realizando sonhos!",
  sloganSecondary: "Seu lote, sua casa!",
  founded: 2005,
  foundedCity: "Campinas-SP",
  sede: {
    label: "Sede",
    address: "Rua Baguaçu, 26, Sala 313F, Loteamento Alphaville, Campinas-SP",
    mapsQuery: "Rua Baguaçu, 26, Sala 313F, Campinas-SP",
    phone: "(19) 99146-1834",
    phoneDigits: "5519991461834",
  },
  whatsappPrimary: {
    display: "(19) 99146-1834",
    digits: "5519991461834",
    defaultMessage: "Olá! Vim do site e gostaria de mais informações",
  },
  instagram: "@meulotefacil",
  instagramUrl: "https://instagram.com/meulotefacil",
  valores: ["Ética", "Respeito", "Profissionalismo"],
  atuacao: ["Campinas", "Hortolândia", "Valinhos", "Amparo"],
  missao:
    "Simplificar e viabilizar a regularização de imóveis com soluções técnicas sob medida.",
} as const;

export const STATS = {
  concluidas: 7000,
  emAndamento: 15000,
  valorizacao: 150,
  desde: 2005,
} as const;

export function whatsappUrl(
  message: string = INSTITUTIONAL.whatsappPrimary.defaultMessage,
  digits: string = INSTITUTIONAL.whatsappPrimary.digits
) {
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export const UNIDADES = [
  {
    id: "sede",
    nome: "Sede",
    endereco: "Rua Baguaçu, 26, Sala 313F, Loteamento Alphaville, Campinas-SP",
    telefone: "(19) 99146-1834",
    digits: "5519991461834",
  },
  {
    id: "matriz",
    nome: "Matriz",
    endereco: "Av. Albino José B. Oliveira, 2270, Jd. Afife, Barão Geraldo",
    telefone: "(19) 99164-5334",
    digits: "5519991645334",
  },
  {
    id: "vila-diva",
    nome: "Vila Diva",
    endereco: "Rua Augusto Grespan, 216, Vila Diva",
    telefone: "(19) 99200-0848",
    digits: "5519992000848",
  },
  {
    id: "santa-cruz",
    nome: "Santa Cruz",
    endereco: "Av. Maria Clara Machado, 57, Jd. Santa Cruz",
    telefone: "(19) 99103-6640",
    digits: "5519991036640",
  },
  {
    id: "jardim-lisa",
    nome: "Jardim Lisa",
    endereco: "R. Armando Mario Tozzi, s/n (container acima do posto de gasolina)",
    telefone: "(19) 99146-1834",
    digits: "5519991461834",
  },
  {
    id: "jardim-mafhuz",
    nome: "Jardim Mafhuz",
    endereco: "Rua Jacaúna, 2618, Jd. Ouro Verde",
    telefone: "(19) 98610-3007",
    digits: "5519986103007",
  },
] as const;

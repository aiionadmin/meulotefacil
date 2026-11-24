import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/lotes", "/clientes", "/propostas", "/contratos", "/financeiro", "/documentos", "/configuracoes", "/auth/"],
    },
    sitemap: "https://meulotefacil.com.br/sitemap.xml",
  };
}

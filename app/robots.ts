import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/processos",
        "/nucleos",
        "/documentos",
        "/protocolo",
        "/configuracoes",
        "/auth/",
      ],
    },
    sitemap: "https://meulotefacil.com.br/sitemap.xml",
  };
}

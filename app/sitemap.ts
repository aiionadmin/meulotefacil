import type { MetadataRoute } from "next";
import { empreendimentos } from "@/lib/data/empreendimentos";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://meulotefacil.com.br";
  const staticRoutes = ["", "/empreendimentos", "/simulador", "/sobre", "/contato"].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })
  );

  const empRoutes = empreendimentos.map((e) => ({
    url: `${base}/empreendimentos/${e.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...empRoutes];
}

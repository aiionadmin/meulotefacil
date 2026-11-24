import type { MetadataRoute } from "next";
import { nucleos } from "@/lib/data/nucleos";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://meulotefacil.com.br";
  const staticRoutes = [
    "",
    "/regularizacoes",
    "/consulta",
    "/servicos",
    "/servicos/consultoria",
    "/servicos/planos-e-projetos",
    "/sobre",
    "/contato",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const nucleoRoutes = nucleos.map((n) => ({
    url: `${base}/regularizacoes/${n.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...nucleoRoutes];
}

import type { Metadata } from "next";
import { ServicosCards } from "@/components/site/ServicosCards";

export const metadata: Metadata = {
  title: "Serviços",
  description:
    "Consultoria técnica para municípios e planos/projetos de regularização fundiária.",
};

export default function ServicosPage() {
  return (
    <div className="pt-16 sm:pt-20">
      <ServicosCards />
    </div>
  );
}

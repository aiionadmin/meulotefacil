import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.hortolandia.sp.gov.br",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/sobre",
        destination: "/quem-somos",
        permanent: true,
      },
      {
        source: "/regularizacoes",
        destination: "/regularizacao",
        permanent: true,
      },
      {
        source: "/consulta",
        destination: "/regularizacao",
        permanent: false,
      },
      // Réplica Mais Controle — rotas canônicas
      {
        source: "/obras/orcamentos",
        destination: "/orcamentos",
        permanent: true,
      },
      { source: "/obras/gestao", destination: "/gestao", permanent: true },
      { source: "/obras/rdo", destination: "/rdo", permanent: true },
      {
        source: "/obras/insumos",
        destination: "/catalogo/insumos",
        permanent: true,
      },
      {
        source: "/obras/composicoes",
        destination: "/catalogo/composicoes",
        permanent: true,
      },
      {
        source: "/compras",
        destination: "/compras/solicitacoes",
        permanent: false,
      },
      {
        source: "/financeiro",
        destination: "/financeiro/pagamentos",
        permanent: false,
      },
      {
        source: "/financeiro/notas",
        destination: "/financeiro/notas-fiscais",
        permanent: true,
      },
      {
        source: "/financeiro/fluxo",
        destination: "/financeiro/fluxo-de-caixa",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // HTML/páginas: não cachear 1 ano (evita VPS “não atualizou” no browser/CDN).
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/noticias/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

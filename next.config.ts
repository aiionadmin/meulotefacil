import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
    ];
  },
};

export default nextConfig;

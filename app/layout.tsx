import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { INSTITUTIONAL } from "@/lib/institutional";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://meulotefacil.com.br"),
  title: {
    default: `${INSTITUTIONAL.fullName} — ${INSTITUTIONAL.slogan}`,
    template: `%s · ${INSTITUTIONAL.name}`,
  },
  description:
    "Regularização fundiária de ponta a ponta — do diagnóstico ao registro em cartório — em Campinas e região, desde 2005. REURB-S e REURB-E.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: INSTITUTIONAL.fullName,
    title: INSTITUTIONAL.fullName,
    description: INSTITUTIONAL.slogan,
    images: [{ url: "/brand/logo-laranja.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: INSTITUTIONAL.fullName,
    description: INSTITUTIONAL.slogan,
    images: ["/brand/logo-laranja.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${montserrat.variable} font-sans antialiased`}>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: INSTITUTIONAL.fullName,
              description: INSTITUTIONAL.slogan,
              url: "https://meulotefacil.com.br",
              telephone: INSTITUTIONAL.sede.phone,
              address: {
                "@type": "PostalAddress",
                streetAddress: INSTITUTIONAL.sede.address,
                addressLocality: "Campinas",
                addressRegion: "SP",
                addressCountry: "BR",
              },
              foundingDate: String(INSTITUTIONAL.founded),
              areaServed: INSTITUTIONAL.atuacao.map((c) => ({
                "@type": "City",
                name: c,
              })),
            }),
          }}
        />
      </body>
    </html>
  );
}

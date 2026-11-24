import type { Metadata } from "next";
import { Jost } from "next/font/google";
import { INSTITUTIONAL } from "@/lib/institutional";
import "./globals.css";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["400", "500", "700", "800"],
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
      <body className={`${jost.variable} font-sans antialiased`}>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: INSTITUTIONAL.fullName,
              url: "https://meulotefacil.com.br",
              logo: "https://meulotefacil.com.br/brand/logo-laranja.png",
              description:
                "Especialistas em regularização fundiária (REURB-S e REURB-E) em Campinas e região desde 2005.",
              foundingDate: "2005",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Rua Baguaçu, 26, Sala 313F",
                addressLocality: "Campinas",
                addressRegion: "SP",
                addressCountry: "BR",
              },
              telephone: INSTITUTIONAL.whatsappPrimary.display,
              sameAs: [INSTITUTIONAL.instagramUrl],
            }),
          }}
        />
      </body>
    </html>
  );
}

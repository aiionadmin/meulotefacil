import type { Metadata } from "next";
import { Jost } from "next/font/google";
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
    default: "Meu Lote Fácil — Seu lote. Seu lugar. Do jeito fácil.",
    template: "%s · Meu Lote Fácil",
  },
  description:
    "Venda de lotes e terrenos com parcelamento acessível, documentação em dia e processo simples. Conquiste o seu lote próprio com a Meu Lote Fácil.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Meu Lote Fácil",
    title: "Meu Lote Fácil",
    description:
      "Seu lote. Seu lugar. Do jeito fácil. Parcelamento acessível e atendimento humano.",
    images: [{ url: "/brand/logo-laranja.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meu Lote Fácil",
    description: "Seu lote. Seu lugar. Do jeito fácil.",
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
              "@type": "RealEstateAgent",
              name: "Meu Lote Fácil",
              url: "https://meulotefacil.com.br",
              logo: "https://meulotefacil.com.br/brand/logo-laranja.png",
              description:
                "Venda de lotes e terrenos com parcelamento acessível e processo simples.",
              areaServed: "BR",
              address: {
                "@type": "PostalAddress",
                addressCountry: "BR",
                addressRegion: "SP",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}

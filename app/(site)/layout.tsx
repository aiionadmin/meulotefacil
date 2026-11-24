import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Preloader } from "@/components/site/Preloader";
import { LenisProvider } from "@/components/motion/LenisProvider";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { PageTransition } from "@/components/motion/PageTransition";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LenisProvider>
      <Preloader />
      <CustomCursor />
      <PageTransition />
      <Header />
      <main>{children}</main>
      <Footer />
    </LenisProvider>
  );
}

import { ComprasStoreProvider } from "@/lib/store/compras-store";

export default function CotacaoPublicaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ComprasStoreProvider>
      <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(15,81,50,0.12),transparent),linear-gradient(180deg,#f7faf7,#eef3ee)]">
        {children}
      </div>
    </ComprasStoreProvider>
  );
}

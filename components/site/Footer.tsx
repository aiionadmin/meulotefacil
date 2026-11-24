import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

function IconIg(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconFb(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" />
    </svg>
  );
}
function IconIn(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6.5 8.5A2 2 0 1 1 6.5 4.5a2 2 0 0 1 0 4zM4.8 20V10h3.4v10H4.8zM10.2 20h3.4v-5.2c0-1.4.3-2.7 2-2.7 1.6 0 1.7 1.5 1.7 2.8V20H21v-5.7c0-3-.6-5.3-4.1-5.3-1.7 0-2.8.9-3.3 1.8h-.1V10h-3.3c0 .8 0 10 0 10z" />
    </svg>
  );
}

const cols = [
  {
    title: "Navegação",
    links: [
      { href: "/empreendimentos", label: "Empreendimentos" },
      { href: "/simulador", label: "Simulador" },
      { href: "/sobre", label: "Sobre" },
      { href: "/contato", label: "Contato" },
    ],
  },
  {
    title: "Cliente",
    links: [
      { href: "/auth/login", label: "Entrar" },
      { href: "/auth/cadastro", label: "Criar conta" },
      { href: "/auth/recuperar-senha", label: "Recuperar senha" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-brand-navy-deep text-brand-cream">
      <svg
        className="pointer-events-none absolute -bottom-8 left-0 h-40 w-full text-brand-orange/10"
        viewBox="0 0 1200 160"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M0 80 Q300 20 600 80 T1200 80" fill="none" stroke="currentColor" strokeWidth="24" />
        <path d="M0 110 Q300 50 600 110 T1200 110" fill="none" stroke="currentColor" strokeWidth="18" />
        <path d="M0 140 Q300 80 600 140 T1200 140" fill="none" stroke="currentColor" strokeWidth="12" />
      </svg>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <Logo variant="mono" className="text-brand-cream" />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-cream/70">
            Facilitamos a compra do seu lote próprio com parcelamento acessível,
            documentação em dia e atendimento humano em cada etapa.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="#" aria-label="Instagram" className="rounded-full border border-brand-cream/20 p-2 hover:border-brand-orange hover:text-brand-orange">
              <IconIg className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Facebook" className="rounded-full border border-brand-cream/20 p-2 hover:border-brand-orange hover:text-brand-orange">
              <IconFb className="h-4 w-4" />
            </a>
            <a href="#" aria-label="LinkedIn" className="rounded-full border border-brand-cream/20 p-2 hover:border-brand-orange hover:text-brand-orange">
              <IconIn className="h-4 w-4" />
            </a>
          </div>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <h3 className="font-display text-sm text-brand-orange">{col.title}</h3>
            <ul className="mt-4 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-brand-cream/75 hover:text-brand-orange">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="relative border-t border-brand-cream/10 px-4 py-6 text-center text-xs text-brand-cream/50 sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} Meu Lote Fácil. Todos os direitos reservados.</p>
        <p className="mt-1">CNPJ 00.000.000/0001-00 · Placeholder</p>
      </div>
    </footer>
  );
}

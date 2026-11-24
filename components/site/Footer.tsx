import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { INSTITUTIONAL, whatsappUrl } from "@/lib/institutional";

function IconIg(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const cols = [
  {
    title: "Navegação",
    links: [
      { href: "/regularizacoes", label: "Regularizações" },
      { href: "/consulta", label: "Meu bairro" },
      { href: "/servicos", label: "Serviços" },
      { href: "/sobre", label: "Quem somos" },
      { href: "/contato", label: "Contato" },
    ],
  },
  {
    title: "Processo",
    links: [
      { href: "/auth/login", label: "Acompanhar processo" },
      { href: "/auth/cadastro", label: "Criar conta" },
      { href: "/servicos/consultoria", label: "Consultoria municipal" },
      { href: "/servicos/planos-e-projetos", label: "Planos e projetos" },
    ],
  },
];

export function Footer() {
  const wa = whatsappUrl();

  return (
    <footer className="relative overflow-hidden bg-brand-navy-deep text-brand-cream">
      <svg
        className="pointer-events-none absolute -bottom-8 left-0 h-40 w-full text-mata/15"
        viewBox="0 0 1200 160"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M0 80 Q300 20 600 80 T1200 80" fill="none" stroke="currentColor" strokeWidth="24" />
        <path d="M0 110 Q300 50 600 110 T1200 110" fill="none" stroke="currentColor" strokeWidth="18" />
        <path d="M0 140 Q300 80 600 140 T1200 140" fill="none" stroke="currentColor" strokeWidth="12" />
      </svg>

      <div className="site-container relative grid gap-10 py-16 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo variant="mono" className="text-brand-cream" />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-cream/70">
            Regularização fundiária de ponta a ponta — do diagnóstico ao registro
            em cartório — em Campinas e região, desde {INSTITUTIONAL.founded}.
          </p>
          <p className="mt-3 text-sm text-brand-cream/60">
            {INSTITUTIONAL.sede.address}
          </p>
          <p className="mt-1 text-sm">
            <a href={wa} className="text-brand-orange hover:underline" target="_blank" rel="noopener noreferrer">
              WhatsApp {INSTITUTIONAL.whatsappPrimary.display}
            </a>
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={INSTITUTIONAL.instagramUrl}
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-brand-cream/20 p-2 hover:border-brand-orange hover:text-brand-orange"
            >
              <IconIg className="h-4 w-4" />
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
        <p>
          © {new Date().getFullYear()} {INSTITUTIONAL.fullName}. Todos os direitos reservados.
        </p>
        <p className="mt-1">
          {INSTITUTIONAL.slogan} · {INSTITUTIONAL.valores.join(" · ")}
        </p>
      </div>
    </footer>
  );
}

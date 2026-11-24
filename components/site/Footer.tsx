import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { INSTITUTIONAL, whatsappUrl } from "@/lib/institutional";
import { FOOTER_COLS } from "@/lib/site-nav";

function IconIg(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Footer técnico corporativo (fallback do aceternity/footer — registry 21st auth).
 */
export function Footer() {
  const wa = whatsappUrl();

  return (
    <footer className="relative overflow-hidden border-t border-linha/20 bg-ink-deep text-paper">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-accent/50 to-transparent"
        aria-hidden
      />

      <div className="site-container relative grid gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Logo variant="mono" className="text-paper" />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-paper/65">
            Regularização fundiária de ponta a ponta — do diagnóstico ao registro
            em cartório — em Campinas e região, desde {INSTITUTIONAL.founded}.
          </p>
          <p className="mt-4 font-mono-label text-[11px] text-paper/45">
            {INSTITUTIONAL.sede.address}
          </p>
          <p className="mt-2 text-sm">
            <a
              href={wa}
              className="text-brand-accent transition-colors hover:text-paper"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp {INSTITUTIONAL.whatsappPrimary.display}
            </a>
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={INSTITUTIONAL.instagramUrl}
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm border border-paper/15 p-2 text-paper/70 transition-colors hover:border-brand-accent hover:text-brand-accent"
            >
              <IconIg className="h-4 w-4" />
            </a>
          </div>
        </div>

        {FOOTER_COLS.map((col) => (
          <div key={col.title} className="lg:col-span-3 lg:col-start-auto">
            <h3 className="font-mono-label text-[11px] text-brand-accent">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-paper/70 transition-colors hover:text-paper"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="relative border-t border-paper/10">
        <div className="site-container flex flex-col gap-2 py-6 text-xs text-paper/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {INSTITUTIONAL.fullName}. Todos os direitos
            reservados.
          </p>
          <p className="font-mono-label text-[10px]">
            {INSTITUTIONAL.valores.join(" · ")}
          </p>
        </div>
      </div>
    </footer>
  );
}

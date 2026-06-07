import Link from "next/link";

/**
 * Shared public-surface footer. Server component; drop inside a `.site` wrapper.
 * Used by the landing page and every secondary marketing page so footer content
 * never drifts. Anchor links are absolute (`/#features`) so they resolve from any page.
 */
export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--surface-3)]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="font-display text-lg font-extrabold tracking-tight text-[var(--brand-ink)]">
              HIT <span className="text-[var(--ink-faint)]">/</span> AI·DATA
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-[var(--ink-muted)]">
              A focused workspace for AI and data classes.
            </p>
          </div>
          <FooterCol title="Platform" links={[{ label: "Features", href: "/#features" }, { label: "Courses", href: "/courses" }]} />
          <FooterCol title="Company" links={[{ label: "About", href: "/about" }, { label: "Contact", href: "/contact" }]} />
          <FooterCol title="Legal" links={[{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }]} />
        </div>
        <div className="mt-14 border-t border-[var(--line)] pt-7 text-sm text-[var(--ink-muted)]">
          © 2026 HIT - AI/DATA. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="font-display text-sm font-bold text-[var(--ink)]">{title}</h3>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="press text-sm text-[var(--ink-muted)] hover:text-[var(--brand-ink)]">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

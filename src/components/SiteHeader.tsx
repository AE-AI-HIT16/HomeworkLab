import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

/**
 * Shared public-surface navigation. Server component; drop inside a `.site` wrapper.
 * The landing page keeps its own anchor-aware nav; this is for the secondary
 * marketing pages (about, contact, help, legal).
 */
export default function SiteHeader() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--surface)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="font-display text-lg font-extrabold tracking-tight text-[var(--brand-ink)]">
          HIT <span className="text-[var(--ink-faint)]">/</span> AI·DATA
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/courses" className="press text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]">Courses</Link>
          <Link href="/help" className="press text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]">Help</Link>
          <Link href="/contact" className="press text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]">Contact</Link>
        </div>
        <Link
          href="/login"
          className="press inline-flex items-center gap-1.5 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-[var(--on-brand)] hover:bg-[var(--brand-strong)]"
        >
          Get Started
          <ArrowRight size={15} weight="bold" />
        </Link>
      </div>
    </nav>
  );
}

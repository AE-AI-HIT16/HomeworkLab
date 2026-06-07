import Link from "next/link";
import { ArrowLeft, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Page not found | HIT - AI/DATA",
};

export default function NotFound() {
  return (
    <div className="site flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <div className="absolute inset-0 dot-field opacity-[0.5] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] pointer-events-none" />
      <div className="relative">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)]">
          <MagnifyingGlass size={32} weight="duotone" />
        </span>
        <p className="font-mono mt-6 text-sm font-medium uppercase tracking-[0.2em] text-[var(--brand-ink)]">
          Error 404
        </p>
        <h1 className="font-display mt-3 text-balance text-4xl font-extrabold tracking-tight text-[var(--ink)] md:text-5xl">
          We can&apos;t find that page.
        </h1>
        <p className="mx-auto mt-4 max-w-[44ch] text-lg leading-relaxed text-[var(--ink-muted)]">
          The link may be broken or the page may have moved.
        </p>
        <Link
          href="/"
          className="press mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-7 py-3.5 font-semibold text-[var(--on-brand)] hover:bg-[var(--brand-strong)]"
        >
          <ArrowLeft size={17} weight="bold" />
          Back to home
        </Link>
      </div>
    </div>
  );
}

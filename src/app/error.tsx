"use client";

import { useEffect } from "react";
import Link from "next/link";
import { WarningCircle, ArrowClockwise, House } from "@phosphor-icons/react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="site flex min-h-[100dvh] flex-col items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-8 text-center shadow-[var(--shadow-lift)]">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)]">
          <WarningCircle size={34} weight="duotone" />
        </span>
        <h1 className="font-display mt-6 text-2xl font-bold tracking-tight text-[var(--ink)]">
          Something went wrong
        </h1>
        <p className="mt-3 line-clamp-3 break-words leading-relaxed text-[var(--ink-muted)]">
          {error.message || "We couldn't load this page. Please try again."}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="press inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-7 py-3 font-semibold text-[var(--on-brand)] hover:bg-[var(--brand-strong)]"
          >
            <ArrowClockwise size={18} weight="bold" />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="press inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--surface-2)] px-7 py-3 font-semibold text-[var(--ink)] hover:border-[var(--ink-faint)]"
          >
            <House size={18} weight="bold" />
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

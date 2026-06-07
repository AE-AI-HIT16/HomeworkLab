import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Help | HIT - AI/DATA",
  description: "Answers to common access, upload, and material issues.",
};

const FAQS = [
  {
    q: "I can't log in with GitHub",
    a: "Sign-in only works once your GitHub account is enrolled in a class. If you just joined, ask your TA to add your username, then try again.",
  },
  {
    q: "My file won't upload",
    a: "Check the file type and size limit shown on the assignment. Notebooks (.ipynb), PDFs, and zipped archives are supported; very large files may need to go to Drive directly.",
  },
  {
    q: "I can't open a Drive material",
    a: "Materials are served through the platform, not raw Drive links. If a file won't open, it may be unpublished or you may not be enrolled in that course yet.",
  },
];

export default function HelpPage() {
  return (
    <div className="site flex min-h-[100dvh] flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 md:py-24">
        <Link href="/" className="press inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]">
          <ArrowLeft size={15} weight="bold" /> Back to home
        </Link>

        <h1 className="font-display mt-8 text-balance text-4xl font-extrabold tracking-tight text-[var(--ink)] md:text-5xl">
          Help center
        </h1>
        <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-[var(--ink-muted)] text-pretty">
          The issues that come up most often, and how to clear them.
        </p>

        <dl className="mt-10 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {FAQS.map((f) => (
            <div key={f.q} className="grid gap-2 py-7 md:grid-cols-[0.9fr_1.1fr] md:gap-10">
              <dt className="font-display text-lg font-semibold text-[var(--ink)]">{f.q}</dt>
              <dd className="leading-relaxed text-[var(--ink-muted)]">{f.a}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-7 shadow-[var(--shadow-card)]">
          <h2 className="font-display text-lg font-bold text-[var(--ink)]">Still stuck?</h2>
          <p className="mt-1 text-[var(--ink-muted)]">Reach the team and we&apos;ll sort it out.</p>
          <Link
            href="/contact"
            className="press mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 font-semibold text-[var(--on-brand)] hover:bg-[var(--brand-strong)]"
          >
            Contact support
            <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

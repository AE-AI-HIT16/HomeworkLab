import Link from "next/link";
import { ArrowLeft, EnvelopeSimple, GithubLogo } from "@phosphor-icons/react/dist/ssr";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Contact | HIT - AI/DATA",
  description: "Get help with access, course setup, or assignments.",
};

const SUPPORT_EMAIL = "nguyenhuyhoangqbx5@gmail.com";
const ENROLL_URL = "https://m.me/j/AbZAVqiI0kPWfa3X/?send_source=gc:copy_invite_link_c";

export default function ContactPage() {
  return (
    <div className="site flex min-h-[100dvh] flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 md:py-24">
        <Link href="/" className="press inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]">
          <ArrowLeft size={15} weight="bold" /> Back to home
        </Link>

        <h1 className="font-display mt-8 text-balance text-4xl font-extrabold tracking-tight text-[var(--ink)] md:text-5xl">
          Contact
        </h1>
        <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-[var(--ink-muted)] text-pretty">
          Questions about access, course setup, or a submission that won&apos;t go through?
          Reach the team directly.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="press group flex flex-col rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-6 shadow-[var(--shadow-card)] hover:border-[var(--brand-ink)]/35"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)]">
              <EnvelopeSimple size={22} weight="duotone" />
            </span>
            <h2 className="font-display mt-5 text-lg font-bold text-[var(--ink)]">Email support</h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">For access, setup, and submission issues.</p>
            <span className="mt-4 break-all font-mono text-sm text-[var(--brand-ink)]">{SUPPORT_EMAIL}</span>
          </a>

          <a
            href={ENROLL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="press group flex flex-col rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-6 shadow-[var(--shadow-card)] hover:border-[var(--brand-ink)]/35"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)]">
              <GithubLogo size={22} weight="duotone" />
            </span>
            <h2 className="font-display mt-5 text-lg font-bold text-[var(--ink)]">New to the class?</h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">Message your TA to get your GitHub account enrolled.</p>
            <span className="mt-4 text-sm font-semibold text-[var(--brand-ink)]">Contact your TA</span>
          </a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

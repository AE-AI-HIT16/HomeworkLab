import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Terms | HIT - AI/DATA",
  description: "Acceptable use and responsibilities for the platform.",
};

export default function TermsPage() {
  return (
    <div className="site flex min-h-[100dvh] flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 md:py-24">
        <Link href="/" className="press inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]">
          <ArrowLeft size={15} weight="bold" /> Back to home
        </Link>

        <h1 className="font-display mt-8 text-balance text-4xl font-extrabold tracking-tight text-[var(--ink)] md:text-5xl">
          Terms of use
        </h1>
        <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-[var(--ink-muted)] text-pretty">
          This platform is for educational use within authorized classes.
        </p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="font-display text-xl font-bold text-[var(--ink)]">Acceptable use</h2>
            <p className="mt-3 max-w-[65ch] leading-relaxed text-[var(--ink-muted)]">
              Access is granted to enrolled students and their instructors for coursework.
              The platform is not for storing or sharing material unrelated to your class.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-[var(--ink)]">Your responsibilities</h2>
            <p className="mt-3 max-w-[65ch] leading-relaxed text-[var(--ink-muted)]">
              You are responsible for the integrity of your submissions and the security of
              your GitHub account. Submit your own work, and keep your credentials private.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-[var(--ink)]">Enforcement</h2>
            <p className="mt-3 max-w-[65ch] leading-relaxed text-[var(--ink-muted)]">
              Misuse, unauthorized access, or plagiarism may lead to account suspension under
              your class policy. Questions go to your administrator on the{" "}
              <Link href="/contact" className="press font-semibold text-[var(--brand-ink)]">contact page</Link>.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

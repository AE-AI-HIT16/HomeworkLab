import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Privacy | HIT - AI/DATA",
  description: "What data the platform collects and how it is used.",
};

export default function PrivacyPage() {
  return (
    <div className="site flex min-h-[100dvh] flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 md:py-24">
        <Link href="/" className="press inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]">
          <ArrowLeft size={15} weight="bold" /> Back to home
        </Link>

        <h1 className="font-display mt-8 text-balance text-4xl font-extrabold tracking-tight text-[var(--ink)] md:text-5xl">
          Privacy policy
        </h1>
        <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-[var(--ink-muted)] text-pretty">
          We collect only what the class needs to run, and nothing we can&apos;t explain.
        </p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="font-display text-xl font-bold text-[var(--ink)]">What we collect</h2>
            <p className="mt-3 max-w-[65ch] leading-relaxed text-[var(--ink-muted)]">
              Your GitHub profile (name, username, email), the assignments you submit, and
              the grades and feedback attached to them. That is the full extent of it.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-[var(--ink)]">How it is used</h2>
            <p className="mt-3 max-w-[65ch] leading-relaxed text-[var(--ink-muted)]">
              Data is used to authenticate you, route your work to the right course, and show
              instructors who has submitted what. It is not sold or shared outside your class.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-[var(--ink)]">Your choices</h2>
            <p className="mt-3 max-w-[65ch] leading-relaxed text-[var(--ink-muted)]">
              For correction or removal of your data, contact your class administrator through
              the <Link href="/contact" className="press font-semibold text-[var(--brand-ink)]">contact page</Link>.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

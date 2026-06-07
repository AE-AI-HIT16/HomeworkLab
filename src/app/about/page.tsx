import Link from "next/link";
import { ArrowLeft, ArrowRight, GithubLogo, GoogleDriveLogo, Database } from "@phosphor-icons/react/dist/ssr";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "About | HIT - AI/DATA",
  description: "A focused learning workspace for AI and data classes.",
};

export default function AboutPage() {
  return (
    <div className="site flex min-h-[100dvh] flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 md:py-24">
        <Link href="/" className="press inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]">
          <ArrowLeft size={15} weight="bold" /> Back to home
        </Link>

        <h1 className="font-display mt-8 text-balance text-4xl font-extrabold tracking-tight text-[var(--ink)] md:text-5xl">
          About HIT - AI/DATA
        </h1>
        <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-[var(--ink-muted)] text-pretty">
          A focused learning workspace for AI and data classes. Students track assignments,
          submit work, and read feedback in one place, while instructors run the whole cohort
          without chasing files across chat threads.
        </p>

        <h2 className="font-display mt-14 text-xl font-bold text-[var(--ink)]">What it runs on</h2>
        <ul className="mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {[
            { Icon: GithubLogo, title: "GitHub for code", desc: "Students submit assignments straight from their repositories." },
            { Icon: GoogleDriveLogo, title: "Google Drive for files", desc: "Notebooks and documents stream directly to the class Drive." },
            { Icon: Database, title: "Google Sheets as the record", desc: "Grades and progress stay in a sheet instructors can export anytime." },
          ].map(({ Icon, title, desc }) => (
            <li key={title} className="flex items-start gap-5 py-5">
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)]">
                <Icon size={20} weight="duotone" />
              </span>
              <div>
                <h3 className="font-display font-semibold text-[var(--ink)]">{title}</h3>
                <p className="mt-1 text-[var(--ink-muted)]">{desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <Link
            href="/courses"
            className="press inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 font-semibold text-[var(--on-brand)] hover:bg-[var(--brand-strong)]"
          >
            View all tracks
            <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import {
  ArrowRight,
  ArrowUpRight,
  GithubLogo,
  GoogleDriveLogo,
  Database,
  Files,
  ChatCircleDots,
  Clock,
  Notebook,
  UploadSimple,
  SealCheck,
  GraduationCap,
  Quotes,
} from "@phosphor-icons/react/dist/ssr";

/*
  HIT - AI/DATA landing page (redesign, preserve mode).
  Dials: DESIGN_VARIANCE 7 · MOTION_INTENSITY 4 (CSS-only) · VISUAL_DENSITY 4.
  Shape lock: interactive = pill (rounded-full), surfaces/images = rounded-2xl.
  Color lock: single indigo accent (var(--brand) fills, var(--brand-ink) text/icons).
  Theme: dual-mode via .site scoped tokens (see globals.css).
  Motion: scroll-reveal (.reveal) + .press tactile feedback, both reduced-motion safe.
*/

const SIGNUP_HREF = "/login";
const SIGNUP_LABEL = "Get Started"; // one label for the signup intent, used everywhere

export default function LandingPage() {
  return (
    <div className="site min-h-[100dvh] overflow-x-hidden">
      {/* ── Navigation: single line, ≤72px ───────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--surface)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="font-display text-lg font-extrabold tracking-tight text-[var(--brand-ink)]">
            HIT <span className="text-[var(--ink-faint)]">/</span> AI·DATA
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="press text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]">Features</a>
            <a href="#instructors" className="press text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]">For instructors</a>
            <Link href="/courses" className="press text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]">Courses</Link>
          </div>
          <Link
            href={SIGNUP_HREF}
            className="press inline-flex items-center gap-1.5 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-[var(--on-brand)] hover:bg-[var(--brand-strong)]"
          >
            {SIGNUP_LABEL}
            <ArrowRight size={15} weight="bold" />
          </Link>
        </div>
      </nav>

      {/* ── Hero: asymmetric split (anti-center, VARIANCE 7) ──────────────── */}
      <section className="relative">
        <div className="absolute inset-0 dot-field opacity-[0.5] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] pointer-events-none" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 pt-20 pb-20 md:pt-24 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-28">
          <div>
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--brand-ink)]">
              For AI &amp; data classrooms
            </span>
            <h1 className="font-display mt-5 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-[var(--ink)] sm:text-5xl lg:text-6xl">
              Run your AI and data class from{" "}
              <span className="text-[var(--brand-ink)]">one workspace</span>.
            </h1>
            <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-[var(--ink-muted)]">
              Lessons, submissions, and grading stay in sync. GitHub for code,
              Google Drive for files, nothing lost in chat threads.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={SIGNUP_HREF}
                className="press inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-7 py-3.5 font-semibold text-[var(--on-brand)] shadow-[var(--shadow-card)] hover:bg-[var(--brand-strong)]"
              >
                {SIGNUP_LABEL}
                <ArrowRight size={17} weight="bold" />
              </Link>
              <Link
                href="/contact"
                className="press inline-flex items-center justify-center rounded-full border border-[var(--line-strong)] bg-[var(--surface-2)] px-7 py-3.5 font-semibold text-[var(--ink)] hover:border-[var(--ink-faint)]"
              >
                Request a demo
              </Link>
            </div>
          </div>

          {/* Real product visual: no fake browser chrome, no floating cards. */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-2 shadow-[var(--shadow-lift)]">
              <Image
                src="/landing/hero-dashboard.jpg"
                alt="HIT - AI/DATA student dashboard showing upcoming assignments and submission status"
                width={1200}
                height={850}
                priority
                sizes="(max-width: 1024px) 92vw, 46vw"
                className="h-auto w-full rounded-xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Works with: honest integration strip (real icon-library glyphs) ── */}
      <section className="border-y border-[var(--line)] bg-[var(--surface-3)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-7 px-6 py-10 md:flex-row md:justify-between">
          <p className="text-sm text-[var(--ink-muted)]">Works with the tools your class already uses</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[var(--ink)]">
            <span className="inline-flex items-center gap-2.5 font-display text-lg font-semibold">
              <GithubLogo size={26} weight="duotone" /> GitHub
            </span>
            <span className="inline-flex items-center gap-2.5 font-display text-lg font-semibold">
              <GoogleDriveLogo size={26} weight="duotone" /> Google Drive
            </span>
            <span className="inline-flex items-center gap-2.5 font-display text-lg font-semibold">
              <Database size={24} weight="duotone" /> Google Sheets
            </span>
          </div>
        </div>
      </section>

      {/* ── Problem: editorial statement + pain list (no card grid) ───────── */}
      <section className="reveal mx-auto max-w-7xl px-6 py-24 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-[var(--ink)] md:text-4xl">
              The teaching shouldn&apos;t be the hard part.
            </h2>
            <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-[var(--ink-muted)]">
              Most classes scatter their work across a dozen tabs. The result is
              the same every term: things go missing.
            </p>
          </div>
          <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {[
              { Icon: Files, title: "Files scattered across Drives", desc: "Submissions buried between personal and school Google accounts." },
              { Icon: ChatCircleDots, title: "Instructions lost in chat", desc: "Assignment details pushed up by endless Slack and Discord threads." },
              { Icon: Clock, title: "Deadlines with no home", desc: "No single view of what's due across modules and weeks." },
            ].map(({ Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-5 py-6">
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)]">
                  <Icon size={20} weight="duotone" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-[var(--ink)]">{title}</h3>
                  <p className="mt-1 text-[var(--ink-muted)]">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Features: asymmetric bento, two clear views ──────────────────── */}
      <section id="features" className="bg-[var(--surface-3)] py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="reveal max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)] md:text-4xl">
              One platform, two clear views.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[var(--ink-muted)]">
              Students see exactly what&apos;s due. Instructors see exactly who&apos;s behind.
            </p>
          </div>

          <div className="reveal mt-12 grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Students */}
            <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-8 shadow-[var(--shadow-card)] md:col-span-7 md:p-10">
              <div>
                <span className="font-mono text-xs font-medium text-[var(--brand-ink)]">For students</span>
                <h3 className="font-display mt-3 text-2xl font-bold tracking-tight text-[var(--ink)]">
                  A dashboard that tracks every deadline.
                </h3>
                <p className="mt-3 max-w-md text-[var(--ink-muted)]">
                  Submit code straight from GitHub, upload notebooks to Drive, and
                  always know what&apos;s due next.
                </p>
              </div>
              <div className="mt-8 overflow-hidden rounded-xl border border-[var(--line)]">
                <Image
                  src="/landing/student-workspace.jpg"
                  alt="Student workspace listing assignments with due dates and submission state"
                  width={900}
                  height={520}
                  sizes="(max-width: 768px) 90vw, 52vw"
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>

            {/* Instructors: brand-fill panel (color variation, not a 2nd accent) */}
            <div
              id="instructors"
              className="flex flex-col justify-between overflow-hidden rounded-2xl bg-[var(--brand)] p-8 text-[var(--on-brand)] shadow-[var(--shadow-card)] md:col-span-5 md:p-10"
            >
              <div>
                <span className="font-mono text-xs font-medium text-white/75">For instructors</span>
                <h3 className="font-display mt-3 text-2xl font-bold tracking-tight">Control at scale.</h3>
                <p className="mt-3 text-white/80">
                  Spot missing submissions at a glance and grade straight from
                  Google Drive.
                </p>
              </div>
              <div className="mt-8 flex justify-end">
                <span className="flex size-16 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/20">
                  <GraduationCap size={34} weight="duotone" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Course tracks: image-led card grid (real catalog data) ───────── */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:py-28">
        <div className="reveal mb-12 flex items-end justify-between gap-6">
          <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)] md:text-4xl">
            Tracks ready to run.
          </h2>
          <Link
            href="/courses"
            className="press hidden shrink-0 items-center gap-1.5 font-semibold text-[var(--brand-ink)] hover:gap-2.5 md:inline-flex"
          >
            View all tracks <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
        <div className="reveal grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { img: "/landing/ai-track.jpg", title: "AI Core", desc: "Foundations of AI: linear algebra, probability, and neural networks.", lessons: 8, slug: "ai-core" },
            { img: "/landing/ml-engineer.jpg", title: "AI/ML Engineer", desc: "Production ML: MLOps, model serving, and end-to-end pipelines.", lessons: 10, slug: "aiml-engineer" },
            { img: "/landing/data-engineer.jpg", title: "Data Engineer", desc: "Scalable data pipelines with Spark, Airflow, and cloud platforms.", lessons: 12, slug: "data-engineer" },
          ].map((course) => (
            <Link
              key={course.slug}
              href={`/courses/${course.slug}`}
              className="press group flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] shadow-[var(--shadow-card)] hover:border-[var(--brand-ink)]/35"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={course.img}
                  alt={`${course.title} track`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <div className="flex flex-1 flex-col p-7">
                <h3 className="font-display text-xl font-bold text-[var(--ink)]">{course.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--ink-muted)]">{course.desc}</p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="font-mono text-xs tabular-nums text-[var(--ink-faint)]">{course.lessons} lessons</span>
                  <ArrowUpRight size={18} weight="bold" className="text-[var(--brand-ink)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Workflow: connected timeline (no boxes, no step numbers) ─────── */}
      <section className="bg-[var(--surface-3)] py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="reveal font-display text-3xl font-bold tracking-tight text-[var(--ink)] md:text-4xl">
            From assignment to feedback.
          </h2>
          <div className="reveal relative mt-16 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
            <div className="absolute left-0 right-0 top-7 hidden h-px bg-[var(--line-strong)] md:block" />
            {[
              { Icon: Notebook, title: "Create", desc: "Instructors post lessons and assignments with the files and links students need." },
              { Icon: UploadSimple, title: "Submit", desc: "Students push code from GitHub or upload notebooks straight to the assignment." },
              { Icon: SealCheck, title: "Review", desc: "Instructors grade from Drive and send feedback in the same place." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="relative">
                <span className="relative z-10 flex size-14 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-2)] text-[var(--brand-ink)] shadow-[var(--shadow-card)]">
                  <Icon size={26} weight="duotone" />
                </span>
                <h3 className="font-display mt-6 text-xl font-bold text-[var(--ink)]">{title}</h3>
                <p className="mt-2 max-w-xs text-[var(--ink-muted)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials: two snippet quotes ─────────────────────────────── */}
      {/* Sample testimonials: replace with real, attributed quotes before launch. */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:py-28">
        <div className="reveal grid grid-cols-1 gap-6 md:grid-cols-2">
          {[
            {
              quote: "Everything for a cohort lives in one place now. Students stop emailing me for links, and I stop digging through Drive.",
              name: "Nguyễn Minh Khoa",
              role: "Lead Instructor, AI Core",
              img: "/landing/mentor-male.jpg",
            },
            {
              quote: "GitHub submissions just work. No more hunting for repo links in Discord the night before grading.",
              name: "Trần Thanh Hà",
              role: "Data Engineering Mentor",
              img: "/landing/mentor-female.jpg",
            },
          ].map((t) => (
            <figure
              key={t.name}
              className="flex flex-col justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-8 shadow-[var(--shadow-card)] md:p-10"
            >
              <Quotes size={28} weight="fill" className="text-[var(--brand-ink)]/40" />
              <blockquote className="mt-5 text-lg font-medium leading-relaxed text-[var(--ink)]">
                {t.quote}
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                <Image src={t.img} alt={t.name} width={48} height={48} className="size-12 rounded-full object-cover" />
                <div>
                  <div className="font-display font-semibold text-[var(--ink)]">{t.name}</div>
                  <div className="text-sm text-[var(--ink-muted)]">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── CTA band ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-24 md:pb-28">
        <div className="reveal relative overflow-hidden rounded-3xl bg-[var(--brand)] px-8 py-16 text-center text-[var(--on-brand)] md:px-16 md:py-20">
          <div className="absolute inset-0 dot-field opacity-[0.12] pointer-events-none" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              Bring your class into one workspace.
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Sign in with GitHub and set up your first assignment in minutes.
            </p>
            <Link
              href={SIGNUP_HREF}
              className="press mt-9 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-[var(--brand)] shadow-lg hover:bg-white/90"
            >
              {SIGNUP_LABEL}
              <ArrowRight size={18} weight="bold" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}

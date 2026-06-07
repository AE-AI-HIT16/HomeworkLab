import Link from "next/link";
import { auth, signOut } from "@/auth";
import { UserCircleMinus, SignOut, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";

export default async function UnauthorizedPage() {
  const session = await auth();
  const githubUsername = session?.user?.githubUsername || "[Your GitHub Username]";
  const name = session?.user?.name || "[Your Name]";

  const mailToUrl = `mailto:nguyenhuyhoangqbx5@gmail.com?subject=${encodeURIComponent(
    "Request access to HIT AI/DATA"
  )}&body=${encodeURIComponent(
    `Hello Admin,\n\nPlease add my GitHub account to the authorized list for the HIT AI/DATA system.\n\nMy information:\n- Full name: ${name}\n- GitHub username: ${githubUsername}\n\nThank you!`
  )}`;

  return (
    <div className="site flex min-h-[100dvh] flex-col">
      <header className="mx-auto w-full max-w-7xl px-6 py-6">
        <Link href="/" className="font-display text-lg font-extrabold tracking-tight text-[var(--brand-ink)]">
          HIT <span className="text-[var(--ink-faint)]">/</span> AI·DATA
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-[440px] rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-8 text-center shadow-[var(--shadow-lift)] sm:p-10">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-ink)]">
            <UserCircleMinus size={34} weight="duotone" />
          </span>

          <h1 className="font-display mt-6 text-2xl font-bold tracking-tight text-[var(--ink)]">
            Account not authorized
          </h1>
          <p className="mt-3 leading-relaxed text-[var(--ink-muted)]">
            Your GitHub account isn&apos;t on the enrolled list for this workspace yet. If you
            think this is a mistake, reach out to your instructor or the class administrator.
          </p>

          <a
            href={mailToUrl}
            className="press mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-7 py-3.5 font-semibold text-[var(--on-brand)] hover:bg-[var(--brand-strong)]"
          >
            <EnvelopeSimple size={18} weight="bold" />
            Contact admin
          </a>

          <form
            className="mt-3"
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="press inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-[var(--ink-muted)] hover:text-[var(--ink)]"
            >
              <SignOut size={16} weight="bold" />
              Sign out and try a different account
            </button>
          </form>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-7xl px-6 py-8 text-center text-sm text-[var(--ink-muted)]">
        © 2026 HIT - AI/DATA
      </footer>
    </div>
  );
}

"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { GithubLogo, CircleNotch, WarningCircle, ArrowLeft } from "@phosphor-icons/react";

interface LoginClientProps {
  accessDenied: boolean;
  deniedUser?: string;
}

const ENROLL_URL = "https://m.me/j/AbZAVqiI0kPWfa3X/?send_source=gc:copy_invite_link_c";

export default function LoginClient({ accessDenied, deniedUser }: LoginClientProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn("github", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="site flex min-h-[100dvh] flex-col">
      <div className="absolute inset-0 dot-field opacity-[0.5] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)] pointer-events-none" />

      <header className="relative z-10 mx-auto w-full max-w-7xl px-6 py-6">
        <Link href="/" className="press inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]">
          <ArrowLeft size={15} weight="bold" /> Back to home
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 pb-20">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 text-center">
            <Link href="/" className="font-display text-xl font-extrabold tracking-tight text-[var(--brand-ink)]">
              HIT <span className="text-[var(--ink-faint)]">/</span> AI·DATA
            </Link>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-8 shadow-[var(--shadow-lift)] md:p-10">
            <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--ink)]">Sign in</h1>
            <p className="mt-2 text-[var(--ink-muted)]">
              Use your GitHub account to reach your class workspace.
            </p>

            {accessDenied && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <WarningCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-300">Access restricted</p>
                  <p className="mt-0.5 text-sm text-red-700/80 dark:text-red-300/80">
                    {deniedUser
                      ? `The account "${deniedUser}" is not enrolled in this workspace.`
                      : "Your GitHub account is not enrolled yet. Ask your TA for enrollment."}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="press mt-7 flex w-full items-center justify-center gap-2.5 rounded-full bg-[var(--brand)] px-6 py-3.5 font-semibold text-[var(--on-brand)] hover:bg-[var(--brand-strong)] disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <CircleNotch size={20} weight="bold" className="animate-spin" />
                  Connecting…
                </>
              ) : (
                <>
                  <GithubLogo size={20} weight="fill" />
                  Sign in with GitHub
                </>
              )}
            </button>

            <p className="mt-6 text-center text-sm text-[var(--ink-muted)]">
              New to the class?{" "}
              <a
                href={ENROLL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="press font-semibold text-[var(--brand-ink)] hover:underline underline-offset-2"
              >
                Contact your TA
              </a>{" "}
              for enrollment.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-5 text-sm text-[var(--ink-muted)]">
            <Link href="/help" className="press hover:text-[var(--ink)]">Help</Link>
            <Link href="/privacy" className="press hover:text-[var(--ink)]">Privacy</Link>
            <Link href="/terms" className="press hover:text-[var(--ink)]">Terms</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

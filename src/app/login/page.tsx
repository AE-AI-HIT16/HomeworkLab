import { signIn } from "@/auth";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--hw-surface)] text-[var(--hw-on-surface)] selection:bg-[var(--hw-primary-fixed)]">
      {/* Background Pattern */}
      <div aria-hidden="true" className="fixed inset-0 ai-pattern pointer-events-none" />
      {/* Hero Gradient Blur */}
      <div aria-hidden="true" className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--hw-primary)]/5 rounded-full blur-[120px] pointer-events-none" />
      <div aria-hidden="true" className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--hw-primary-container)]/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="flex-grow flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--hw-primary)] rounded-lg mb-4 shadow-sm">
              <span className="material-symbols-outlined text-white text-2xl">menu_book</span>
            </div>
            <h1 className="text-[1.75rem] font-medium tracking-tight mb-2">
              Welcome to <span className="text-[var(--hw-primary)]">HIT</span> — AI/DATA
            </h1>
            <p className="text-[var(--hw-on-surface-variant)] text-sm">
              Your professional AI-integrated workspace
            </p>
          </div>

          {/* Login Card */}
          <div className="glass-panel rounded-xl shadow-[0_12px_40px_rgba(26,28,29,0.06)] p-8 border border-white/20">
            {/* GitHub Sign In (Primary Action) */}
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/dashboard" });
              }}
            >
              <div className="space-y-6">
                <button
                  type="submit"
                  className="w-full py-3 bg-[var(--hw-primary)] text-white font-medium rounded-lg hover:brightness-110 active:brightness-95 transition-all flex items-center justify-center gap-3 group"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Sign in with GitHub
                  <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
                </button>
              </div>
            </form>

            {/* Workspace Features */}
            <div className="mt-8 pt-6 border-t border-[var(--hw-surface-container-high)]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--hw-outline)] mb-4 text-center">
                Workspace Access
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--hw-surface-container-low)]">
                  <span className="material-symbols-outlined text-[var(--hw-primary)] text-lg mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
                  <div>
                    <p className="text-sm font-medium">Weekly Assignments</p>
                    <p className="text-xs text-[var(--hw-on-surface-variant)]">
                      Pull latest homework repos directly to your cloud workspace.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--hw-surface-container-low)]">
                  <span className="material-symbols-outlined text-[var(--hw-primary)] text-lg mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>track_changes</span>
                  <div>
                    <p className="text-sm font-medium">Submission Tracking</p>
                    <p className="text-xs text-[var(--hw-on-surface-variant)]">
                      Automated testing and real-time feedback on your AI models.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Get Invited Link */}
            <div className="mt-6 pt-4 border-t border-[var(--hw-surface-container-high)] text-center">
              <p className="text-sm text-[var(--hw-on-surface-variant)]">
                New to the class?{" "}
                <a className="text-[var(--hw-primary)] font-semibold hover:underline decoration-[var(--hw-primary)]/30 underline-offset-4" href="#">
                  Contact your TA
                </a>
                {" "}for enrollment.
              </p>
            </div>
          </div>

          {/* Active Students Indicator */}
          <div className="mt-8 flex justify-center items-center gap-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--hw-outline)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              8.2k active students
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center relative z-10">
        <p className="text-xs text-[var(--hw-on-surface-variant)]/60 font-medium">
          Unauthorized?{" "}
          <a className="text-[var(--hw-primary)] hover:text-[var(--hw-primary-container)] transition-colors" href="/unauthorized">
            Contact your instructor
          </a>
        </p>
        <div className="mt-4 flex justify-center gap-6">
          <span className="text-[10px] uppercase tracking-tighter font-bold text-[var(--hw-outline)] hover:text-[var(--hw-on-surface)] transition-colors cursor-pointer">Security</span>
          <span className="text-[10px] uppercase tracking-tighter font-bold text-[var(--hw-outline)] hover:text-[var(--hw-on-surface)] transition-colors cursor-pointer">Privacy</span>
          <span className="text-[10px] uppercase tracking-tighter font-bold text-[var(--hw-outline)] hover:text-[var(--hw-on-surface)] transition-colors cursor-pointer">Help Center</span>
        </div>
      </footer>
    </div>
  );
}

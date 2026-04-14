"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface LoginClientProps {
    accessDenied: boolean;
    deniedUser?: string;
}

export default function LoginClient({ accessDenied, deniedUser }: LoginClientProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async () => {
        setIsLoading(true);
        await signIn("github", { callbackUrl: "/dashboard" });
    };

    return (
        <div className="bg-[#f7f9fb] font-[Manrope,sans-serif] text-[#191c1e] min-h-screen relative overflow-hidden flex flex-col">
            {/* Background Layers */}
            <div className="fixed inset-0 z-0" style={{
                background: "radial-gradient(circle at 0% 0%, rgba(53,37,205,0.08) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(70,72,212,0.1) 0%, transparent 50%)"
            }} />
            <div className="fixed inset-0 z-0" style={{
                backgroundImage: "radial-gradient(circle, #c7c4d8 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                opacity: 0.08
            }} />

            {/* Circuit Board Background */}
            <div className="fixed inset-0 z-[-1] overflow-hidden">
                <Image
                    src="/landing/circuit-bg.jpg"
                    alt=""
                    fill
                    className="object-cover opacity-[0.03] grayscale"
                    priority
                />
            </div>

            {/* Corner Gradient Orbs */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-20">
                <div className="w-full h-full rounded-full bg-[#3525cd] blur-[120px]" />
            </div>
            <div className="fixed bottom-0 left-0 w-[400px] h-[400px] translate-y-1/2 -translate-x-1/2 pointer-events-none opacity-10">
                <div className="w-full h-full rounded-full bg-[#4648d4] blur-[100px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 w-full px-8 py-10 flex justify-center">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#4f46e5] rounded-xl flex items-center justify-center shadow-[0_12px_32px_rgba(53,37,205,0.15)]">
                        <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
                    </div>
                    <h1 className="font-[Space_Grotesk,sans-serif] font-bold text-2xl tracking-tight text-[#191c1e]">
                        HIT <span className="text-[#3525cd] opacity-60">AI/DATA</span>
                    </h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-grow flex items-center justify-center px-6 pb-20">
                <div className="w-full max-w-[480px] relative">
                    {/* Decorative Corner Brackets */}
                    <div className="absolute -top-12 -left-12 w-24 h-24 border-t border-l border-[#3525cd]/10 rounded-tl-3xl pointer-events-none" />
                    <div className="absolute -bottom-12 -right-12 w-24 h-24 border-b border-r border-[#3525cd]/10 rounded-br-3xl pointer-events-none" />

                    {/* Login Card */}
                    <div className="bg-white/70 backdrop-blur-[12px] border border-[#c7c4d8]/15 rounded-[2rem] p-10 md:p-12 shadow-[0_20px_50px_rgba(25,28,30,0.06)] overflow-hidden relative">
                        {/* Top Glow Line */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-[#3525cd]/20 to-transparent" />

                        {/* Access Denied Error */}
                        {accessDenied && (
                            <div className="mb-8 p-4 bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#ba1a1a]">gpp_maybe</span>
                                    <div>
                                        <p className="text-sm font-bold text-[#93000a]">Access Restricted</p>
                                        <p className="text-xs text-[#93000a]/80 mt-0.5">
                                            {deniedUser
                                                ? `Account "${deniedUser}" is not enrolled in this workspace.`
                                                : "Your GitHub account is not enrolled. Contact your TA for enrollment."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mb-10">
                            <h2 className="font-[Space_Grotesk,sans-serif] text-3xl font-bold tracking-tight text-[#191c1e] mb-2">Scholar AI Canvas</h2>
                            <p className="text-[#464555] font-medium text-sm">Elevate your technical research with a professional environment.</p>
                        </div>

                        {/* Action Section */}
                        <div className="space-y-6">
                            {/* GitHub Sign In */}
                            <button
                                onClick={handleSignIn}
                                disabled={isLoading}
                                className="w-full group relative flex items-center justify-center px-6 py-4 bg-[#191c1e] text-[#f7f9fb] rounded-xl font-[Inter,sans-serif] font-semibold tracking-wide transition-all hover:translate-y-[-2px] hover:shadow-[0_8px_24px_rgba(25,28,30,0.15)] active:scale-[0.98] disabled:opacity-60"
                            >
                                {isLoading ? (
                                    <span className="material-symbols-outlined text-lg animate-spin mr-3">progress_activity</span>
                                ) : (
                                    <svg className="w-6 h-6 mr-3 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                    </svg>
                                )}
                                {isLoading ? "Connecting..." : "Sign in with GitHub"}
                            </button>

                            {/* Divider */}
                            <div className="flex items-center space-x-4 py-2">
                                <div className="flex-grow h-px bg-gradient-to-r from-transparent via-[#c7c4d8]/20 to-[#c7c4d8]/20" />
                                <span className="font-[Inter] text-xs uppercase tracking-widest text-[#777587]">instructional context</span>
                                <div className="flex-grow h-px bg-gradient-to-l from-transparent via-[#c7c4d8]/20 to-[#c7c4d8]/20" />
                            </div>

                            {/* Info Cards */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-4 bg-[#f2f4f6]/50 rounded-xl border border-[#c7c4d8]/10">
                                    <span className="material-symbols-outlined text-[#3525cd] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                    <div>
                                        <p className="text-sm font-bold text-[#191c1e]">AI Synthesis Active</p>
                                        <p className="text-xs text-[#464555]">Real-time feedback on push</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-[#f2f4f6]/50 rounded-xl border border-[#c7c4d8]/10">
                                    <span className="material-symbols-outlined text-[#354484] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span>
                                    <div>
                                        <p className="text-sm font-bold text-[#191c1e]">Tracking Submissions</p>
                                        <p className="text-xs text-[#464555]">History synced to main branch</p>
                                    </div>
                                </div>
                            </div>

                            {/* Enrollment Hint */}
                            <p className="text-center text-xs text-[#464555] pt-2">
                                New to the class?{" "}
                                <a href="https://m.me/j/AbZAVqiI0kPWfa3X/?send_source=gc:copy_invite_link_c" target="_blank" rel="noopener noreferrer" className="text-[#3525cd] font-semibold hover:underline underline-offset-2">
                                    Contact your TA
                                </a>
                                {" "}for enrollment.
                            </p>
                        </div>

                        {/* Footer Links */}
                        <div className="mt-12 pt-8 border-t border-[#c7c4d8]/10 flex items-center justify-between">
                            <Link className="text-xs font-[Inter] font-semibold text-[#464555] hover:text-[#3525cd] transition-colors flex items-center" href="/help">
                                <span className="material-symbols-outlined text-[16px] mr-1.5">help_outline</span>
                                Access Help
                            </Link>
                            <div className="flex space-x-4">
                                <Link className="text-xs font-[Inter] text-[#777587] hover:text-[#191c1e] transition-colors" href="/privacy">Privacy</Link>
                                <Link className="text-xs font-[Inter] text-[#777587] hover:text-[#191c1e] transition-colors" href="/terms">Terms</Link>
                            </div>
                        </div>
                    </div>

                    {/* Technical Metadata */}
                    <div className="mt-8 flex justify-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3525cd]/40" />
                            <span className="font-[Inter] text-[10px] uppercase tracking-tighter text-[#777587]">v2.4.0 Secure Engine</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3525cd]/40" />
                            <span className="font-[Inter] text-[10px] uppercase tracking-tighter text-[#777587]">RSA 4096 Encrypted</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

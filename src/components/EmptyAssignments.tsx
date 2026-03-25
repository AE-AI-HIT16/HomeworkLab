"use client";

import Link from "next/link";

export default function EmptyAssignments() {
    return (
        <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="max-w-2xl w-full">
                {/* Status Badge */}
                <div className="mb-2">
                    <span className="inline-block px-3 py-1 bg-[var(--hw-primary-container)]/10 text-[var(--hw-primary)] font-semibold text-[10px] uppercase tracking-[0.2em] rounded-full mb-6">
                        Status: Focused
                    </span>
                </div>

                {/* Central Illustration */}
                <div className="relative w-full flex justify-center items-center mb-12">
                    {/* Subtle Blur Background */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                        <div className="w-96 h-96 bg-[var(--hw-primary)]/20 blur-[100px] rounded-full" />
                    </div>

                    {/* Main Empty State Card */}
                    <div className="relative z-10 bg-[var(--hw-surface-container-lowest)] p-8 md:p-16 rounded-[2rem] shadow-[0_12px_40px_rgba(26,28,29,0.04)] border border-[var(--hw-outline-variant)]/10 max-w-lg w-full">
                        <div className="mb-8">
                            <div className="w-32 h-32 mx-auto bg-[var(--hw-surface-container-low)] rounded-3xl flex items-center justify-center relative overflow-hidden group">
                                <span
                                    className="material-symbols-outlined text-6xl text-[var(--hw-primary)]/30 group-hover:scale-110 transition-transform duration-500"
                                    style={{ fontVariationSettings: "'wght' 200" }}
                                >
                                    menu_book
                                </span>
                                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-[var(--hw-secondary-container)]/30 text-[var(--hw-secondary)] text-[8px] font-bold uppercase rounded-md backdrop-blur-sm">
                                    Empty
                                </div>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
                            All quiet for now.
                        </h1>
                        <p className="text-[var(--hw-on-surface-variant)] leading-relaxed mb-10 max-w-xs mx-auto">
                            No assignments have been posted yet. Take this moment to organize your notes and check back soon!
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-8 py-3 bg-[var(--hw-primary)] text-white font-medium rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[var(--hw-primary)]/20"
                            >
                                Refresh Feed
                            </button>
                            <Link
                                href="/dashboard"
                                className="px-8 py-3 bg-[var(--hw-surface-container-high)] text-[var(--hw-on-surface)] font-medium rounded-lg hover:brightness-105 active:scale-95 transition-all text-center"
                            >
                                View Past Work
                            </Link>
                        </div>
                    </div>

                    {/* Decorative Element */}
                    <div className="absolute -top-12 -right-12 hidden lg:block w-48 h-64 bg-[var(--hw-surface-container-high)]/40 rounded-3xl transform rotate-12 -z-10" />
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div className="p-6 bg-[var(--hw-surface-container-low)] rounded-xl">
                        <span className="material-symbols-outlined text-[var(--hw-primary)] mb-3">auto_awesome</span>
                        <h3 className="font-semibold text-sm mb-1">AI Assistant Ready</h3>
                        <p className="text-xs text-[var(--hw-on-surface-variant)]">
                            Your workspace is synced and ready for the next task.
                        </p>
                    </div>
                    <div className="p-6 bg-[var(--hw-surface-container-low)] rounded-xl">
                        <span className="material-symbols-outlined text-[var(--hw-primary)] mb-3">schedule</span>
                        <h3 className="font-semibold text-sm mb-1">Stay Notified</h3>
                        <p className="text-xs text-[var(--hw-on-surface-variant)]">
                            We&apos;ll alert you the moment a new assignment drops.
                        </p>
                    </div>
                    <div className="p-6 bg-[var(--hw-surface-container-low)] rounded-xl">
                        <span className="material-symbols-outlined text-[var(--hw-primary)] mb-3">lightbulb</span>
                        <h3 className="font-semibold text-sm mb-1">Quick Tip</h3>
                        <p className="text-xs text-[var(--hw-on-surface-variant)]">
                            Review your syllabus in the Classroom tab while you wait.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

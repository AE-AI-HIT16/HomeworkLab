"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";
import SearchBar from "./SearchBar";

interface TopNavProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        githubUsername?: string;
    };
    role: "admin" | "student" | "guest";
    showSearch?: boolean;
}

export function TopNav({ user, role, showSearch = false }: TopNavProps) {
    const pathname = usePathname();
    const dashboardLink = "/dashboard"; // Unified dashboard for all

    const isActive = (path: string) => pathname === path;

    const linkClass = (path: string) =>
        isActive(path)
            ? "text-[var(--hw-primary)] font-semibold border-b-2 border-[var(--hw-primary)] pb-0.5"
            : "text-[var(--hw-on-surface-variant)] hover:text-[var(--hw-on-surface)] transition-colors";

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm h-16 flex items-center justify-between px-6">
            <div className="flex items-center gap-8">
                {/* Unified Branding */}
                <Link href={dashboardLink} className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-[var(--hw-primary)] rounded-lg flex items-center justify-center text-white group-hover:rotate-3 transition-transform">
                        <span className="material-symbols-outlined text-[20px]">school</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-[var(--hw-on-surface)]">
                        HIT <span className="text-[var(--hw-primary)]">AI/DATA</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-6 text-sm">
                    <Link href="/dashboard" className={linkClass("/dashboard")}>
                        Dashboard
                    </Link>
                    {role === "admin" && (
                        <Link href="/admin" className={linkClass("/admin")}>
                            Analytics
                        </Link>
                    )}
                </div>

                {showSearch && <SearchBar />}
            </div>

            <div className="flex items-center gap-4">

                <div className="h-8 w-px bg-[var(--hw-outline-variant)]/30 mx-2 hidden md:block" />

                <div className="relative group cursor-pointer inline-flex items-center">
                    {user.image ? (
                        <Image
                            src={user.image}
                            alt={user.name ?? "Avatar"}
                            width={32}
                            height={32}
                            className="rounded-full border border-slate-200"
                        />
                    ) : (
                        <div className="w-8 h-8 bg-[var(--hw-primary-fixed)] text-[var(--hw-primary)] rounded-full flex items-center justify-center font-bold text-sm">
                            {user.name?.[0] ?? "U"}
                        </div>
                    )}
                    <div className="absolute right-0 top-10 mt-2 w-52 bg-white border border-slate-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col p-2 z-[60]">
                        <div className="px-3 py-2 border-b border-slate-100 mb-2">
                            <p className="font-semibold text-sm text-slate-900">{user.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">@{user.githubUsername}</p>
                            <div className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded mt-1 ${
                                role === "guest"
                                    ? "bg-teal-50 text-teal-700"
                                    : "bg-[var(--hw-primary-fixed)] text-[var(--hw-primary)]"
                            }`}>
                                {role === "guest" ? "khách mời" : role}
                            </div>
                        </div>
                        {role === "admin" && (
                            <Link href="/admin/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-[16px]">settings</span>
                                Settings
                            </Link>
                        )}
                        <LogoutButton />
                    </div>
                </div>
            </div>
        </nav>
    );
}

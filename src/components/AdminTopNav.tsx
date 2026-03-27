import Link from "next/link";
import Image from "next/image";
import { LogoutButton } from "./LogoutButton";

export function AdminTopNav({ user }: { user: { name?: string | null, email?: string | null, image?: string | null, githubUsername?: string } }) {
    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm h-14 flex items-center justify-between px-6">
            <div className="flex items-center gap-8">
                <Link href="/admin" className="text-lg font-bold tracking-tight text-slate-900">
                    Homework<span className="text-[var(--hw-primary)]">Lab</span>
                </Link>

                <div className="hidden md:flex items-center gap-6 text-sm">
                    <Link href="/admin" className="text-[var(--hw-primary)] font-semibold border-b-2 border-[var(--hw-primary)] pb-0.5">
                        Dashboard
                    </Link>
                    <Link href="#" className="text-slate-500 hover:text-slate-900 transition-colors">
                        Analytics
                    </Link>
                    <Link href="/admin/settings" className="text-slate-500 hover:text-slate-900 transition-colors">
                        Settings
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="hidden lg:flex items-center bg-slate-100 rounded-lg px-3 py-1.5 w-64 border border-transparent focus-within:border-indigo-300 focus-within:bg-white transition-colors">
                    <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
                    <input
                        type="text"
                        placeholder="Quick search..."
                        className="bg-transparent border-none outline-none text-xs ml-2 w-full text-slate-700 placeholder:text-slate-400"
                    />
                </div>

                <Link
                    href="/admin/create-assignment"
                    className="bg-[var(--hw-primary)] text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-sm shadow-[var(--hw-primary)]/20"
                >
                    Create Assignment
                </Link>

                <button className="text-slate-500 hover:text-indigo-500 transition-colors">
                    <span className="material-symbols-outlined text-xl">notifications</span>
                </button>
                <div className="relative group cursor-pointer inline-flex items-center">
                    {user.image ? (
                        <Image
                            src={user.image}
                            alt={user.name ?? "Avatar"}
                            width={28}
                            height={28}
                            className="rounded-full border border-slate-200"
                        />
                    ) : (
                        <div className="w-7 h-7 bg-[var(--hw-primary-fixed-dim)] text-[var(--hw-primary)] rounded-full flex items-center justify-center font-bold text-xs">
                            {user.name?.[0] ?? "A"}
                        </div>
                    )}
                    <div className="absolute right-0 top-8 mt-2 w-48 bg-white border border-slate-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col p-2">
                        <div className="px-3 py-2 border-b border-slate-100 mb-2">
                            <p className="font-semibold text-sm text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">@{user.githubUsername}</p>
                        </div>
                        <LogoutButton />
                    </div>
                </div>
            </div>
        </nav>
    );
}

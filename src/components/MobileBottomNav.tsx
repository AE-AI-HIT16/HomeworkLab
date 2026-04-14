"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type MobileBottomNavVariant = "student" | "admin";

interface MobileBottomNavProps {
    variant: MobileBottomNavVariant;
}

interface NavItem {
    href: string;
    label: string;
    icon: string;
}

const studentItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/courses", label: "Courses", icon: "auto_stories" },
    { href: "/leaderboard", label: "Leaderboard", icon: "emoji_events" },
];

const adminItems: NavItem[] = [
    { href: "/admin", label: "Dashboard", icon: "dashboard" },
    { href: "/admin/students", label: "Students", icon: "groups" },
    { href: "/admin/grading", label: "Grading", icon: "grading" },
    { href: "/admin/curriculum", label: "Curriculum", icon: "menu_book" },
];

function isActive(pathname: string, href: string): boolean {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav({ variant }: MobileBottomNavProps) {
    const pathname = usePathname();
    const items = variant === "admin" ? adminItems : studentItems;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[var(--hw-surface-container-lowest)] border-t border-[var(--hw-outline-variant)]/20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] h-[72px] flex items-center justify-around px-2 z-50">
            {items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex-1 mx-1 flex flex-col items-center justify-center gap-1 h-[52px] rounded-xl transition-colors ${
                            active
                                ? "text-[var(--hw-primary)] bg-[var(--hw-primary)]/5"
                                : "text-[var(--hw-outline)]"
                        }`}
                    >
                        <span
                            className="material-symbols-outlined text-[20px]"
                            style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                        >
                            {item.icon}
                        </span>
                        <span className={`text-[9px] font-bold tracking-wider uppercase ${active ? "text-[var(--hw-primary)]" : ""}`}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}

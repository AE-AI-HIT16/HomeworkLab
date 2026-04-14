"use client";

import { signOut } from "next-auth/react";

interface LogoutButtonProps {
    className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
    return (
        <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={
                className ??
                "px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 w-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            }
        >
            <span className="material-symbols-outlined text-sm">logout</span>
            Sign Out
        </button>
    );
}
